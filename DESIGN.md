---
name: Professional Communications System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7b6b'
  outline-variant: '#bbcbb9'
  surface-tint: '#006d2f'
  primary: '#006d2f'
  on-primary: '#ffffff'
  primary-container: '#25d366'
  on-primary-container: '#005523'
  inverse-primary: '#3de273'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#8cf1e1'
  on-secondary-container: '#006f64'
  tertiary: '#00668a'
  on-tertiary: '#ffffff'
  tertiary-container: '#48c4ff'
  on-tertiary-container: '#004f6c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#66ff8e'
  primary-fixed-dim: '#3de273'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005322'
  secondary-fixed: '#8ff4e3'
  secondary-fixed-dim: '#72d8c8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7cd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-background: '#F8FAFC'
  surface-border: '#E2E8F0'
  text-primary: '#0F172A'
  status-new: '#3B82F6'
  status-contacted: '#8B5CF6'
  status-responded: '#F59E0B'
  status-converted: '#22C55E'
  status-closed: '#64748B'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
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
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for a high-utility B2B SaaS environment, specifically tailored for WhatsApp campaign management. The brand personality is **trustworthy, efficient, and transparent**, ensuring that admins feel in control of high-volume communication flows.

The visual direction follows a **Corporate / Modern** style. It prioritizes clarity over decorative elements, using generous whitespace and a rigorous grid to manage complex data density. By utilizing the familiar "WhatsApp Green" within a sophisticated, neutral frame, the design system bridges the gap between a consumer messaging tool and a professional enterprise dashboard. The emotional response should be one of "calm productivity"—where critical lead statuses and campaign metrics are immediately legible without cognitive overload.

## Colors

This design system utilizes a high-clarity light mode as its foundation. The color palette is led by **WhatsApp Green (#25D366)**, used strategically for primary actions and brand presence. 

A range of "Slate" neutrals manages the UI structure, ensuring that the primary green remains an actionable signal rather than an overwhelming wash. Status colors are distinct and mapped to the lead lifecycle:
- **Primary Green:** Primary buttons, "Sent" indicators, and active brand moments.
- **Secondary Teal:** Secondary actions and navigation highlights.
- **Functional Accents:** Vibrant blues, purples, and ambers are reserved for lead status badges (New, Contacted, Responded) to ensure quick visual scanning of the lead table.
- **Backgrounds:** A crisp white surface is layered over a soft slate background to create clear containment for data modules.

## Typography

The design system relies exclusively on **Inter** to deliver a systematic, utilitarian aesthetic. Inter's tall x-height and excellent legibility at small sizes make it ideal for data-heavy tables and complex chat interfaces.

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter-spacing for a compact, professional look on dashboard titles.
- **Body Text:** The standard 14px size is optimized for the "Lead List" and "Activity Logs" to maintain high information density without sacrificing readability.
- **Labels:** Uppercase styles with increased letter-spacing are used for table headers and status badge text to differentiate them from interactive data.
- **Numerical Data:** Inter’s tabular numeric features should be enabled for all lead counts and analytics charts to ensure columns of numbers align perfectly.

## Layout & Spacing

The layout model is a **fixed-fluid hybrid**. The sidebar remains fixed at 260px for consistent navigation access, while the main content area utilizes a fluid 12-column grid that caps at 1440px to prevent excessive line lengths on ultra-wide monitors.

A strict **8px spacing scale** governs the rhythm of the UI.
- **Margins & Padding:** Dashboard widgets and cards use 24px internal padding.
- **Gaps:** Elements within cards (like lead details or call logs) use 16px (2 units) or 8px (1 unit) spacing to maintain clear relationships.
- **Responsiveness:** On tablet devices, the sidebar collapses into a hamburger menu, and the 12-column grid reflows to a 4-column stack. On mobile, margins are reduced to 16px to maximize screen real estate for the conversation thread.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Low-contrast outlines** to define hierarchy. In a SaaS dashboard, heavy shadows create visual noise; therefore, depth is communicated through surface color shifts.

- **Background Layer:** The lowest layer is the Slate-50 (#F8FAFC) page background.
- **Surface Layer:** White (#FFFFFF) is used for cards, tables, and the main navigation sidebar. These surfaces are defined by a 1px Slate-200 border.
- **Overlay Layer:** Modals and dropdowns use a soft ambient shadow (10% opacity black, 12px blur) to appear physically lifted above the data grid.
- **Interactive Depth:** Buttons use a subtle 1px bottom-border "press" effect rather than shadows to maintain the clean, modern aesthetic.

## Shapes

The shape language is **Rounded**, strike a balance between friendly accessibility and professional structure. 

- **Containers:** Dashboard cards and lead detail panels use a 0.5rem (8px) radius. 
- **Interactive Elements:** Buttons and input fields follow the same 8px radius to ensure a cohesive look.
- **Badges:** Status badges for "Business Type" and "Lead Status" use a slightly more pronounced rounded-lg (16px) or full pill-shape to distinguish them as non-button interactive elements.
- **Selection States:** Highlighted rows in the lead table use a 4px (Soft) radius for a more refined, precise selection indicator.

## Components

### Buttons
- **Primary:** Solid WhatsApp Green with white text. Used for "Send Message" and "Initiate Call."
- **Secondary:** Transparent background with a 1px Slate-300 border. Used for "Edit Lead" and "Cancel."

### Status Badges & Chips
- **Lead Status:** High-contrast background colors with dark text (e.g., Light Green background for "Converted").
- **Business Type:** Neutral grey backgrounds with dark text to avoid competing with lead status indicators.

### Data Tables
- **Header:** Slate-50 background, uppercase labels, 1px bottom border.
- **Row:** White background, subtle hover state change (Slate-50). High vertical density (48px row height).

### Input Fields
- **Default:** White background, 1px Slate-200 border. 
- **Focus:** 1px Primary Green border with a soft green outer glow.

### Conversation UI
- **Outbound:** WhatsApp Green bubbles with white text, aligned to the right.
- **Inbound:** Light Slate-100 bubbles with dark text, aligned to the left.
- **Timestamps:** 11px label-sm text aligned outside the bubbles.

### Analytics Cards
- Feature a "Sparkline" or simple "Big Number" display. Use thin 1px borders and 24px padding to separate metric groups clearly.