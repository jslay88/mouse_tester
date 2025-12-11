import './styles.css';
import { AppState, MouseButtonType, getButtonType, getButtonColor, getButtonName } from './types';

const DEFAULT_THRESHOLD = 50;

// Application state
const state: AppState = {
  mode: 'click',
  threshold: DEFAULT_THRESHOLD,
  stats: {
    left: { clicks: 0, faults: 0, fastest: null, lastClickTime: 0 },
    middle: { clicks: 0, faults: 0, fastest: null, lastClickTime: 0 },
    right: { clicks: 0, faults: 0, fastest: null, lastClickTime: 0 },
  },
  holdButton: null,
  holdStartTime: null,
};

let holdTimerInterval: number | null = null;

// DOM Elements (will be populated after render)
let elements: {
  clickModeBtn: HTMLButtonElement;
  holdModeBtn: HTMLButtonElement;
  clickView: HTMLElement;
  holdView: HTMLElement;
  thresholdSlider: HTMLInputElement;
  thresholdInput: HTMLInputElement;
  clickInstruction: HTMLElement;
  testButton: HTMLElement;
  statusLabel: HTMLElement;
  timerDisplay: HTMLElement;
  statsBoxes: Record<MouseButtonType, {
    clicks: HTMLElement;
    faults: HTMLElement;
    fastest: HTMLElement;
  }>;
};

function render(): void {
  const app = document.getElementById('app')!;
  
  app.innerHTML = `
    <!-- Header -->
    <div class="header">
      <span class="mode-label">Mode:</span>
      <button class="mode-btn active" id="click-mode-btn">Click Test</button>
      <button class="mode-btn" id="hold-mode-btn">Hold Test</button>
      <button class="help-btn" id="help-btn">?</button>
    </div>
    
    <div class="separator"></div>
    
    <!-- Click View -->
    <div id="click-view" class="view active">
      <div class="threshold-box">
        <span class="thresh-label">Fault Threshold:</span>
        <input type="range" class="thresh-slider" id="threshold-slider" 
               min="10" max="200" step="5" value="${DEFAULT_THRESHOLD}">
        <input type="text" class="thresh-entry" id="threshold-input" 
               value="${DEFAULT_THRESHOLD}" maxlength="3">
        <span class="thresh-unit">ms</span>
      </div>
      
      <div class="instruction" id="click-instruction">
        Click the button below. Double-clicks faster than ${DEFAULT_THRESHOLD}ms indicate switch failure.
      </div>
      
      <div class="test-area-container" id="test-area">
        <div class="test-button" id="test-button">
          <span class="test-button-text">CLICK HERE</span>
          <span class="test-button-subtitle">Left / Middle / Right</span>
        </div>
      </div>
      
      <div class="status" id="status-label"></div>
      
      <div class="stats-timer-container">
        <div class="stats-panel">
          <div class="stats-box">
            <div class="stats-title">Left Click</div>
            <div class="stats-value" id="left-clicks">Clicks: 0</div>
            <div class="stats-fault" id="left-faults">Faults: 0</div>
            <div class="stats-fastest" id="left-fastest">Fastest: —</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">Middle Click</div>
            <div class="stats-value" id="middle-clicks">Clicks: 0</div>
            <div class="stats-fault" id="middle-faults">Faults: 0</div>
            <div class="stats-fastest" id="middle-fastest">Fastest: —</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">Right Click</div>
            <div class="stats-value" id="right-clicks">Clicks: 0</div>
            <div class="stats-fault" id="right-faults">Faults: 0</div>
            <div class="stats-fastest" id="right-fastest">Fastest: —</div>
          </div>
        </div>
        <button class="reset-btn" id="reset-btn">Reset Statistics</button>
      </div>
    </div>
    
    <!-- Hold View -->
    <div id="hold-view" class="view">
      <div class="instruction">
        Press and hold a mouse button. The timer shows how long you can maintain the hold.
      </div>
      
      <div class="test-area-container" id="hold-test-area">
        <div class="test-button" id="hold-test-button">
          <span class="test-button-text">HOLD HERE</span>
          <span class="test-button-subtitle">Left / Middle / Right</span>
        </div>
      </div>
      
      <div class="status" id="hold-status-label">Press and hold any mouse button</div>
      
      <div class="stats-timer-container">
        <div class="timer-display" id="timer-display">0.000s</div>
      </div>
    </div>
    
    <div class="separator"></div>
    
    <!-- Tips -->
    <div class="tips-frame">
      <div class="tips-title">Quick Testing Tips</div>
      <div class="tip-text">
        • Click different areas of each button to check all contact points<br>
        • Hold button, move finger around — no extra clicks should register<br>
        • Slowly release pressure while holding — watch for false clicks<br>
        • Click the ? button for detailed testing instructions
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer">
      <span>© ${new Date().getFullYear()} jslay</span>
      <a href="https://github.com/jslay88/mouse_tester" target="_blank" rel="noopener noreferrer" class="github-link" title="View on GitHub">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
    </footer>
  `;
  
  // Cache DOM references
  elements = {
    clickModeBtn: document.getElementById('click-mode-btn') as HTMLButtonElement,
    holdModeBtn: document.getElementById('hold-mode-btn') as HTMLButtonElement,
    clickView: document.getElementById('click-view')!,
    holdView: document.getElementById('hold-view')!,
    thresholdSlider: document.getElementById('threshold-slider') as HTMLInputElement,
    thresholdInput: document.getElementById('threshold-input') as HTMLInputElement,
    clickInstruction: document.getElementById('click-instruction')!,
    testButton: document.getElementById('test-button')!,
    statusLabel: document.getElementById('status-label')!,
    timerDisplay: document.getElementById('timer-display')!,
    statsBoxes: {
      left: {
        clicks: document.getElementById('left-clicks')!,
        faults: document.getElementById('left-faults')!,
        fastest: document.getElementById('left-fastest')!,
      },
      middle: {
        clicks: document.getElementById('middle-clicks')!,
        faults: document.getElementById('middle-faults')!,
        fastest: document.getElementById('middle-fastest')!,
      },
      right: {
        clicks: document.getElementById('right-clicks')!,
        faults: document.getElementById('right-faults')!,
        fastest: document.getElementById('right-fastest')!,
      },
    },
  };
  
  setupEventListeners();
}

function setupEventListeners(): void {
  // Mode switching
  elements.clickModeBtn.addEventListener('click', () => setMode('click'));
  elements.holdModeBtn.addEventListener('click', () => setMode('hold'));
  
  // Threshold controls
  elements.thresholdSlider.addEventListener('input', (e) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setThreshold(value);
  });
  
  elements.thresholdInput.addEventListener('change', (e) => {
    let value = parseInt((e.target as HTMLInputElement).value) || DEFAULT_THRESHOLD;
    value = Math.max(10, Math.min(200, value));
    setThreshold(value);
  });
  
  // Test area events (click mode)
  const testArea = document.getElementById('test-area')!;
  testArea.addEventListener('mousedown', handleClickModePress);
  testArea.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Test area events (hold mode)
  const holdTestArea = document.getElementById('hold-test-area')!;
  holdTestArea.addEventListener('mousedown', handleHoldModePress);
  holdTestArea.addEventListener('mouseup', handleHoldModeRelease);
  holdTestArea.addEventListener('mouseleave', handleHoldModeRelease);
  holdTestArea.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Reset button
  document.getElementById('reset-btn')!.addEventListener('click', resetStats);
  
  // Help button
  document.getElementById('help-btn')!.addEventListener('click', showHelpModal);
}

function setMode(mode: 'click' | 'hold'): void {
  state.mode = mode;
  
  if (mode === 'click') {
    elements.clickModeBtn.classList.add('active');
    elements.holdModeBtn.classList.remove('active');
    elements.clickView.classList.add('active');
    elements.holdView.classList.remove('active');
    stopHoldTimer();
  } else {
    elements.holdModeBtn.classList.add('active');
    elements.clickModeBtn.classList.remove('active');
    elements.holdView.classList.add('active');
    elements.clickView.classList.remove('active');
    resetHoldState();
  }
}

function setThreshold(value: number): void {
  state.threshold = value;
  elements.thresholdSlider.value = value.toString();
  elements.thresholdInput.value = value.toString();
  elements.clickInstruction.textContent = 
    `Click the button below. Double-clicks faster than ${value}ms indicate switch failure.`;
}

function handleClickModePress(e: MouseEvent): void {
  const buttonType = getButtonType(e.button);
  if (!buttonType) return;
  
  const now = performance.now();
  const stats = state.stats[buttonType];
  const timeDiff = now - stats.lastClickTime;
  
  stats.lastClickTime = now;
  stats.clicks++;
  
  // Create ripple animation
  createRipple(e.currentTarget as HTMLElement, buttonType);
  
  // Track fastest (only after first click)
  if (stats.clicks > 1 && timeDiff > 0) {
    if (stats.fastest === null || timeDiff < stats.fastest) {
      stats.fastest = timeDiff;
    }
  }
  
  // Check for fault
  if (timeDiff < state.threshold && timeDiff > 0 && stats.clicks > 1) {
    stats.faults++;
    elements.statusLabel.className = 'status fault';
    elements.statusLabel.textContent = 
      `⚠ FAULT DETECTED! ${getButtonName(buttonType)} double-click in ${timeDiff.toFixed(1)}ms`;
  } else {
    elements.statusLabel.className = 'status ok';
    elements.statusLabel.textContent = 
      `${getButtonName(buttonType)} click registered (${timeDiff.toFixed(1)}ms since last)`;
  }
  
  updateStatsDisplay();
}

function createRipple(container: HTMLElement, buttonType: MouseButtonType): void {
  const ripple = document.createElement('div');
  ripple.className = `ripple ${buttonType}`;
  
  // Position is handled by CSS (left: 50%, top: 50%, transform: translate(-50%, -50%))
  container.appendChild(ripple);
  
  // Remove after animation
  setTimeout(() => ripple.remove(), 600);
}

function handleHoldModePress(e: MouseEvent): void {
  if (state.holdButton !== null) return;
  
  const buttonType = getButtonType(e.button);
  if (!buttonType) return;
  
  state.holdButton = buttonType;
  state.holdStartTime = performance.now();
  
  const holdButton = document.getElementById('hold-test-button')!;
  holdButton.classList.add('holding');
  holdButton.style.setProperty('--hold-color', getButtonColor(buttonType));
  
  const holdStatus = document.getElementById('hold-status-label')!;
  holdStatus.className = 'status holding';
  holdStatus.textContent = `Holding ${getButtonName(buttonType)} button...`;
  
  startHoldTimer();
}

function handleHoldModeRelease(e: MouseEvent): void {
  const buttonType = getButtonType(e.button);
  if (buttonType !== state.holdButton) return;
  
  stopHoldTimer();
  
  const holdButton = document.getElementById('hold-test-button')!;
  holdButton.classList.remove('holding');
  
  const duration = state.holdStartTime ? (performance.now() - state.holdStartTime) / 1000 : 0;
  
  const holdStatus = document.getElementById('hold-status-label')!;
  holdStatus.className = 'status ok';
  holdStatus.textContent = `${getButtonName(buttonType!)} held for ${duration.toFixed(3)} seconds`;
  
  state.holdButton = null;
  state.holdStartTime = null;
}

function startHoldTimer(): void {
  holdTimerInterval = window.setInterval(() => {
    if (state.holdStartTime) {
      const elapsed = (performance.now() - state.holdStartTime) / 1000;
      elements.timerDisplay.textContent = `${elapsed.toFixed(3)}s`;
    }
  }, 10);
}

function stopHoldTimer(): void {
  if (holdTimerInterval !== null) {
    clearInterval(holdTimerInterval);
    holdTimerInterval = null;
  }
}

function resetHoldState(): void {
  stopHoldTimer();
  state.holdButton = null;
  state.holdStartTime = null;
  elements.timerDisplay.textContent = '0.000s';
  
  const holdButton = document.getElementById('hold-test-button');
  if (holdButton) holdButton.classList.remove('holding');
  
  const holdStatus = document.getElementById('hold-status-label');
  if (holdStatus) {
    holdStatus.className = 'status';
    holdStatus.textContent = 'Press and hold any mouse button';
  }
}

function updateStatsDisplay(): void {
  for (const type of ['left', 'middle', 'right'] as MouseButtonType[]) {
    const stats = state.stats[type];
    const box = elements.statsBoxes[type];
    
    box.clicks.textContent = `Clicks: ${stats.clicks}`;
    box.faults.textContent = `Faults: ${stats.faults}`;
    box.fastest.textContent = `Fastest: ${stats.fastest ? stats.fastest.toFixed(1) + 'ms' : '—'}`;
  }
}

function resetStats(): void {
  for (const type of ['left', 'middle', 'right'] as MouseButtonType[]) {
    state.stats[type] = { clicks: 0, faults: 0, fastest: null, lastClickTime: 0 };
  }
  updateStatsDisplay();
  elements.statusLabel.className = 'status';
  elements.statusLabel.textContent = 'Statistics reset';
}

function showHelpModal(): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">How to Test Your Mouse Switches</div>
      
      <div class="modal-section">Click Test — Detecting Switch Bounce</div>
      <div class="modal-text">
        Switch bounce occurs when worn contacts cause multiple signals from a single click.
      </div>
      <div class="modal-text">
        1. Click on all areas of each button — a healthy switch registers exactly one click.<br>
        2. Test with varying pressure — faults may only appear at certain pressures.<br>
        3. Press and hold, then move finger — no additional clicks should register.<br>
        4. Slowly release pressure — watch for false double-clicks during release.
      </div>
      
      <div class="modal-section">Hold Test — Detecting Contact Issues</div>
      <div class="modal-text">
        This mode tests whether the switch can maintain consistent contact.
      </div>
      <div class="modal-text">
        1. Hold each button for at least 5 seconds — the timer should count smoothly.<br>
        2. Hold while moving finger — timer should keep counting without stops.<br>
        3. Gradually reduce pressure while holding — see how light you can press.
      </div>
      
      <div class="modal-section">Understanding the Threshold</div>
      <div class="modal-text">
        • 50ms (default): Conservative, catches obvious hardware faults.<br>
        • 30-50ms: Catches most switch bounce issues.<br>
        • 70-100ms: More sensitive, may flag fast clickers.<br><br>
        The fastest human double-clicks are typically 80-100ms.
      </div>
      
      <button class="modal-close" id="modal-close">Close</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || (e.target as HTMLElement).id === 'modal-close') {
      overlay.remove();
    }
  });
}

// Initialize
render();
