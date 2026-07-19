---
name: Sedjati Scoring System
colors:
  surface: '#f5faf8'
  surface-dim: '#d6dbd9'
  surface-bright: '#f5faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefed'
  surface-container-high: '#e4e9e7'
  surface-container-highest: '#dee4e1'
  on-surface: '#171d1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2f0'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f5faf8'
  on-background: '#171d1c'
  surface-variant: '#dee4e1'
typography:
  display-score:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-numeric:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-max-width: 1440px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for high-stakes, real-time data entry and performance monitoring. The brand personality is clinical, efficient, and objective—moving away from marketing fluff toward a "tool-first" mentality. The emotional response should be one of focused calm and professional reliability.

The visual style is **Corporate Modern with a Minimalist lean**. It prioritizes clarity through generous whitespace, fine-lined borders, and a restricted color palette. By avoiding heavy shadows and gradients, the UI remains performant and reduces cognitive load during fast-paced scoring sessions. The aesthetic emphasizes a "digital workspace" feel where the data is the hero.

## Colors
The palette is built on a foundation of neutral grays to ensure that functional accents carry maximum weight. 

- **Primary (Teal):** Reserved exclusively for constructive actions, final submissions, and primary navigation states. It represents progress and confirmation.
- **Secondary (Amber):** A celebratory accent used sparingly for high-achievement indicators, such as 1st place badges or leaderboard "gold" status. 
- **Neutrals:** The background uses a cool-toned gray to recede behind white surface cards. Borders use a light gray to define structure without creating visual clutter.
- **Typography:** Uses Slate/Gray shades to establish a clear hierarchy, ensuring secondary labels don't compete with primary data points.

## Typography
The typography system uses **Geist** for headlines and large data displays due to its technical, clean-cut aesthetic. **Inter** is utilized for body text and labels to maintain high legibility in dense interfaces.

**Tabular Alignment:** All numeric data—including scores, rankings, and timers—must use `font-variant-numeric: tabular-nums`. This ensures that columns of numbers align perfectly for quick visual scanning and comparison. Labels should use uppercase styling with slight tracking to differentiate them from interactive data.

## Layout & Spacing
This design system utilizes a **Fixed Sidebar + Fluid Content** model. 

- **Sidebar:** Positioned on the left, it remains fixed during scroll to provide constant access to competition rounds and global settings. 
- **Content Area:** Content lives within a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors. 
- **Grid:** A 12-column grid is used for dashboard layouts, while scoring forms utilize a single-column centered track (approx. 800px) to minimize eye travel.
- **Rhythm:** A strict 8px-based spacing system ensures vertical rhythm across cards and list items.

## Elevation & Depth
The system uses **Tonal Layers** rather than shadows to define depth. This "Flat Plus" approach keeps the UI feeling lightweight and fast.

1.  **Level 0 (Background):** `#F9FAFB` – The canvas.
2.  **Level 1 (Surfaces):** `#FFFFFF` – Primary cards and containers. Defined by a 1px border of `#E5E7EB`.
3.  **Level 2 (Interaction):** Active states use the Primary Teal color or a subtle light gray fill (`#F1F5F9`) to indicate hover.

Shadows are restricted to transient elements only (e.g., dropdown menus or tooltips), using a very soft, highly diffused 10% opacity black with 0px offset.

## Shapes
The shape language is controlled and systematic. A standard **8px radius** (Rounded) is applied to all primary containers, input fields, and buttons. 

- **Cards/Inputs:** 8px (`rounded-md`).
- **Badges/Tags:** 100px (Pill) to distinguish status indicators from clickable buttons.
- **Selection Indicators:** Vertical bars (4px width) are used on the left side of active sidebar items to indicate focus without relying solely on color.

## Components
- **Statistic Cards:** Features a `label-md` at the top, a `display-score` value in the center, and a subtle trend or rank indicator at the bottom. Background is always white with a 1px border.
- **Data Tables:** Minimal cell padding (12px vertical). Headers are `label-md` with `#475569` text. Alternating row colors are avoided; use thin dividers instead.
- **Scoring Sliders:** Custom Teal track with a white circular handle. Value labels should update in real-time above the handle using tabular numbers.
- **Horizontal Stepper:** Round-based navigation. Completed rounds use a teal checkmark; current round uses a teal border with bold text; upcoming rounds use gray outlines.
- **Sidebar Navigation:** Icons should be simple 20px strokes. Active states use a light Teal background (`#F0FDFA`) and a bold teal left-accent border.
- **Buttons:** Primary buttons are solid Teal (`#0D9488`) with white text. Secondary buttons use a white fill with the standard `#E5E7EB` border.