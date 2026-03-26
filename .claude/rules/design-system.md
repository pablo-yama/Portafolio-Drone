---
description: Color palette, typography scale, and CSS design tokens for the drone portfolio
globs: ["**/*.css", "**/*.tsx", "**/*.ts"]
---

# Design System

## Color Tokens

```css
:root {
  --color-bg:          #0A0A0F;   /* Deep black with blue tint */
  --color-bg-elevated: #12121A;
  --color-text:        #F5F5F7;
  --color-text-muted:  #8A8A9A;
  --color-accent:      #00D4FF;   /* Electric cyan — primary accent */

  --gradient-hero:   linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #0A0A0F 100%);
  --gradient-accent: linear-gradient(90deg, var(--color-accent), #7B61FF);

  --glass-bg:     rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur:   blur(20px);
}
```

## Typography

Fonts (from Fontshare):
- **Headings**: `Clash Display` — variable, geometric, bold
- **Body**: `Satoshi` — variable, clean, legible
- **Monospace**: `JetBrains Mono` — for coordinates and technical specs

Responsive scale (`clamp`):
```css
--text-hero:  clamp(3.5rem, 8vw + 1rem, 10rem);
--text-h1:    clamp(2.5rem, 5vw + 1rem, 6rem);
--text-h2:    clamp(1.8rem, 3vw + 0.5rem, 3.5rem);
--text-h3:    clamp(1.2rem, 2vw + 0.5rem, 2rem);
--text-body:  clamp(1rem, 1vw + 0.5rem, 1.25rem);
--text-small: clamp(0.75rem, 0.8vw + 0.3rem, 0.9rem);
```

## Custom Cursor

- **Default**: 8px white circle with outline
- **Hover (links/buttons)**: Expands to 60px + contextual label ("Ver proyecto", "Reproducir", "Contactar")
- **Hover (images/video)**: Transforms to play or expand icon
- **Dragging**: Left/right arrow + "Arrastra" label
- Implement with GSAP `quickTo()` for smoothness
