# Logo Usage Guidelines

## File Naming Convention

Rename your logo files to follow this structure:

```
seraphonix-logo-[variant]-[color]-[size].[format]

Examples:
- seraphonix-logo-full-color-500px.png
- seraphonix-logo-icon-white-256px.png
- seraphonix-logo-horizontal-dark.svg
```

## Variants

### 1. Full Logo (Horizontal)
```
◉ SERAPHONIX STUDIOS
```
- Use for: Headers, main branding, large displays
- Minimum width: 200px
- Clear space: Equal to "◉" height on all sides

### 2. Icon Only
```
◉
```
- Use for: Favicons, app icons, avatars, small spaces
- Minimum size: 24x24px
- Always maintain aspect ratio

### 3. Stacked/Vertical
```
    ◉
SERAPHONIX
 STUDIOS
```
- Use for: Square spaces, social media profiles
- Minimum width: 150px

## Color Variants

### Full Color (Primary)
- ◉ : Cyan (#00D4FF)
- Text: White on dark, Black on light
- Use on: Primary backgrounds

### White
- ◉ : White with cyan glow
- Text: White
- Use on: Dark backgrounds, overlays

### Dark/Black
- ◉ : Black
- Text: Black
- Use on: Light backgrounds, print materials

### Monochrome
- Single color version
- Use for: Single-color printing, embossing, engraving

## Minimum Sizes

| Variant | Digital | Print |
|---------|---------|-------|
| Full Logo | 150px wide | 1.5 inches |
| Icon Only | 24x24px | 0.25 inches |
| Compact | 100px wide | 1 inch |

## Clear Space

Maintain clear space around the logo equal to the height of the "◉" symbol:

```
    [clear space]
[clear] ◉ SERAPHONIX [clear]
    [clear space]
```

## What NOT To Do

❌ **Don't:**
- Stretch or distort the logo
- Change the colors outside the approved palette
- Add effects (drop shadows, outlines, bevels) beyond the specified glow
- Place on busy backgrounds without contrast
- Rotate or tilt the logo
- Change the font (always use Orbitron)
- Crop the logo

✅ **Do:**
- Use approved color combinations
- Maintain aspect ratio
- Ensure high contrast with background
- Use the glow effect sparingly and consistently
- Keep sufficient clear space

## Background Guidelines

### On Dark Backgrounds (#050508, #0A0A0F)
- Use: Full color or White variant
- Glow: Can use cyan glow on ◉

### On Light Backgrounds (#FFFFFF, #F5F5F5)
- Use: Dark/Black variant
- No glow effect

### On Images/Gradients
- Use: White or Dark variant with sufficient contrast
- Add subtle backdrop blur if needed

## Download Formats

### For Web
- **SVG**: Primary format for scalability
- **PNG**: 500px, 1000px widths (transparent background)
- **ICO**: Favicon (32x32, 64x64)

### For Print
- **PDF**: Vector format for print
- **EPS**: For professional printing
- **PNG**: 300 DPI, minimum 2000px wide

### For Social Media
- **Profile**: 400x400px (icon only, centered)
- **Cover**: 1500x500px (full logo, left-aligned)
- **Avatar**: 170x170px (icon only)

## Implementation Examples

### Website Header
```html
<img src="seraphonix-logo-full-color.svg" 
     alt="Seraphonix Studios" 
     width="200" 
     style="filter: drop-shadow(0 0 10px rgba(0,212,255,0.5));">
```

### Favicon
```html
<link rel="icon" type="image/svg+xml" href="seraphonix-logo-icon.svg">
```

### Dark Mode App Icon
```css
.app-icon {
  background: #050508;
  padding: 20px;
  border-radius: 12px;
}
.app-icon img {
  filter: drop-shadow(0 0 15px rgba(0,212,255,0.8));
}
```

---

*For questions about logo usage: brand@seraphonix.com*
