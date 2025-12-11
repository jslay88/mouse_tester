# Mouse Switch Tester

A web-based diagnostic tool to test mouse switches for common hardware failures:
- **Inadvertent double-clicks** (switch bounce/chatter)
- **Hold release issues** (switch not maintaining contact)

🌐 **[Try it online](https://yourusername.github.io/mouse-switch-tester/)**

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Click Test Mode**: Detects suspiciously fast double-clicks indicating switch bounce
- **Hold Test Mode**: Tests if switches can maintain consistent contact
- **Adjustable Threshold**: 10-200ms sensitivity range
- **Per-Button Statistics**: Track clicks, faults, and fastest times for each button
- **Visual Feedback**: Ripple animations and color-coded button indicators
- **Cross-Platform**: Works on any device with a modern browser

## Quick Start

### Online

Visit the [live demo](https://yourusername.github.io/mouse-switch-tester/) — no installation required.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### GitHub Pages

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

Or set up GitHub Actions for automatic deployment on push.

### Other Platforms

The `dist/` folder after `npm run build` contains static files that can be hosted anywhere:
- Netlify
- Vercel
- Cloudflare Pages
- Any static file server

## Testing Modes

### Click Test Mode

Tests for inadvertent double-clicks caused by failing switches.

- Adjust the **threshold slider** (10-200ms) to control sensitivity
- Default 50ms catches obvious hardware faults
- Lower values are more strict, higher values more lenient

### Hold Test Mode

Tests switch ability to maintain contact during a held click.

- Timer counts up while you hold
- Watch for unexpected stops indicating switch release

## How to Test Your Mouse

### Click Test Procedure

1. **Click different areas of each button**  
   Press various spots on left, right, and middle buttons. A healthy switch registers exactly one click regardless of where you press.

2. **Test with varying pressure**  
   Click with light, medium, and firm pressure. Faults may only appear at certain pressures.

3. **Press and hold, then move finger**  
   Hold the button and slide your finger around while maintaining pressure. No additional clicks should register.

4. **Slowly release pressure**  
   Press firmly, then very gradually release until it clicks up. Watch for false double-clicks during release.

### Hold Test Procedure

1. **Basic hold test**  
   Hold each button 5+ seconds. Timer should count smoothly without jumps.

2. **Hold while moving finger**  
   Move your finger around while holding. Timer should keep counting.

3. **Gradual pressure test**  
   Reduce pressure gradually while holding to find minimum activation force.

## Understanding the Threshold

| Threshold | Sensitivity | Best For |
|-----------|-------------|----------|
| 30-50ms | Conservative | Catching obvious faults |
| 50-70ms | Moderate | General testing |
| 70-100ms | Sensitive | Subtle issues |
| 100-150ms | Very sensitive | Investigating borderline cases |

**Reference:** Fastest human double-clicks are ~80-100ms. Under 50ms is almost certainly a hardware fault.

## Common Mouse Switch Issues

| Symptom | Likely Cause |
|---------|--------------|
| Random double-clicks | Switch oxidation or worn contacts |
| Can't drag reliably | Switch not maintaining closed contact |
| Intermittent clicks | Dirty or damaged switch mechanism |
| Location-dependent behavior | Worn contact points on button surface |

## Technical Details

- Built with TypeScript and Vite
- Uses `performance.now()` for sub-millisecond timing accuracy
- No external runtime dependencies
- Works offline (PWA-ready static files)
- ~15KB gzipped

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Any modern browser with ES2020 support

## License

MIT
