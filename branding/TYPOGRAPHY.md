# Typography Guide

## Font Families

### Primary: Orbitron
Geometric sans-serif with futuristic tech aesthetic
- **Designer**: Matt McInerney
- **Foundry**: The League of Movable Type
- **Weights**: 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black)
- **Usage**: Headers, UI elements, navigation, branding text

#### CSS Import
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');
```

#### Font Stack
```css
font-family: 'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Secondary: Rajdhani
Clean, technical, highly readable at all sizes
- **Designer**: Indian Type Foundry
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Usage**: Body text, descriptions, data display, paragraphs

#### CSS Import
```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
```

#### Font Stack
```css
font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

---

## Type Scale

### Display (Orbitron 900)
```css
.display-1 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 48px;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: var(--seraph-cyan);
  text-shadow: 0 0 30px var(--seraph-cyan-glow);
}
/* Use for: Hero titles, main page headers */
```

### Headings

#### H1 (32px, Orbitron 700)
```css
h1 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 32px;
  letter-spacing: 3px;
  line-height: 1.2;
}
/* Use for: Page titles, major section headers */
```

#### H2 (24px, Orbitron 700)
```css
h2 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 2px;
  line-height: 1.3;
}
/* Use for: Section headers, window titles */
```

#### H3 (20px, Orbitron 500)
```css
h3 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  font-size: 20px;
  letter-spacing: 2px;
  line-height: 1.4;
}
/* Use for: Subsections, card titles */
```

#### H4 (18px, Orbitron 500)
```css
h4 {
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 1px;
  line-height: 1.4;
}
/* Use for: Feature titles, list headers */
```

### Body Text (Rajdhani)

#### Large (18px, Rajdhani 400)
```css
.body-large {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.6;
  letter-spacing: 0.5px;
}
/* Use for: Lead paragraphs, important descriptions */
```

#### Regular (16px, Rajdhani 400)
```css
body {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.3px;
}
/* Use for: Standard body text */
```

#### Small (14px, Rajdhani 300)
```css
.body-small {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 300;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.2px;
}
/* Use for: Captions, metadata, secondary text */
```

### UI Text (Orbitron)

#### Labels (14px, Orbitron 500)
```css
.ui-label {
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
/* Use for: Button labels, navigation items, tags */
```

#### Data/Stats (16px, Orbitron 600)
```css
.data-value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
}
/* Use for: Numbers, statistics, coordinates */
```

#### Tiny (12px, Orbitron 400)
```css
.ui-tiny {
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
/* Use for: Status badges, timestamps, small labels */
```

---

## Letter Spacing Guidelines

| Size | Letter Spacing | Usage |
|------|---------------|-------|
| 48px+ | 6px | Hero titles |
| 32px | 3px | H1 headers |
| 24px | 2px | H2 headers |
| 18-20px | 1-2px | H3-H4, UI |
| 16px | 0.3-0.5px | Body text |
| 14px | 1-2px | Small UI, uppercase |
| 12px | 1px | Tiny text, badges |

---

## Text Colors

### Primary Text
```css
.text-primary {
  color: #FFFFFF;
}
```

### Secondary Text
```css
.text-secondary {
  color: rgba(255, 255, 255, 0.7);
}
```

### Muted Text
```css
.text-muted {
  color: rgba(255, 255, 255, 0.5);
}
```

### Accent Text (Cyan)
```css
.text-accent {
  color: #00D4FF;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
```

### Gold Text (Special)
```css
.text-gold {
  color: #FFB800;
  text-shadow: 0 0 10px rgba(255, 184, 0, 0.3);
}
```

---

## Line Heights

- **Headings**: 1.2 - 1.4
- **Body Text**: 1.5 - 1.7
- **UI Elements**: 1.0 - 1.2
- **Data/Numbers**: 1.0

---

## Examples in Use

### Window Title
```css
.window-title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--seraph-cyan);
}
```

### Node Label
```css
.node-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--seraph-cyan);
  text-shadow: 0 0 10px var(--seraph-cyan-glow);
}
```

### Story/Lore Text
```css
.lore-text {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
}
```

---

## Performance Tips

1. **Preload Critical Fonts**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

2. **Font Display**
```css
@font-face {
  font-family: 'Orbitron';
  font-display: swap; /* Ensures text is visible immediately */
}
```

3. **Subset Fonts** (if self-hosting)
- Only include weights you use (400, 500, 700, 900)
- Consider subsetting to Latin characters only if that's all you need

4. **Fallback Stack**
Always provide fallback fonts in case Google Fonts fails to load.

---

## Download Fonts

### Google Fonts (Recommended)
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Self-Hosted (For offline use)
Download from:
- Orbitron: https://github.com/theleagueof/orbitron
- Rajdhani: https://github.com/itfoundry/rajdhani

---

*For typography questions: brand@seraphonix.com*
