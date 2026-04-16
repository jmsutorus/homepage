# Design System Document
 
## 1. Overview & Creative North Star: "The Earthbound Editorial"
This design system rejects the clinical coldness of modern SaaS interfaces in favor of a "High-End Editorial" experience. The Creative North Star is **The Earthbound Editorial**: a philosophy that treats digital interfaces like a premium tactile publication. 
 
We achieve "Kinetic Harmony" by balancing the heavy, authoritative weight of Forest Green (`primary`) against the airy, expansive nature of Cream (`background`). By utilizing intentional asymmetry, overlapping containers, and a complete rejection of traditional borders, we create a layout that feels organic, rhythmic, and meticulously curated.
 
---
 
## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in nature but executed with architectural precision. 
 
### Color Roles
*   **Primary (`#061b0e`):** Our Deep Forest Green. Used for headers, high-impact typography, and grounding elements. It provides the "ink" on our digital paper.
*   **Secondary (`#9f402d`):** The Terracotta accent. Used sparingly for calls-to-action (CTAs) and interactive highlights to draw the eye with warmth.
*   **Neutral Surfaces (`#faf9f6` to `#e3e2e0`):** A sophisticated range of creams and off-whites that form the "paper" of the interface.
 
### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or cards. 
Boundaries must be defined solely through background color shifts or tonal nesting. To separate a section, transition from `surface` to `surface-container-low`. To emphasize a card, place a `surface-container-lowest` element on a `surface-container` background.
 
### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
*   **Base Layer:** `surface` (`#faf9f6`).
*   **Nested Content:** Use `surface-container` tiers to create depth. A `surface-container-highest` navigation bar should feel like it is sitting "under" or "over" the main content without needing a stroke to define its edge.
 
### The "Glass & Gradient" Rule
To elevate the experience beyond flat design:
*   **Glassmorphism:** For floating modals or navigation overlays, use `surface` at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Use subtle linear gradients for primary buttons (e.g., `primary` to `primary_container`) to add a "soulful" three-dimensional quality.
 
---
 
## 3. Typography: Lexend Editorial
We use **Lexend** exclusively. Its variable-width nature allows for a clean, modern aesthetic that remains highly legible.
 
*   **Display (lg/md/sm):** Use for hero moments. Set with tight letter-spacing (-0.02em) and `primary` color to command attention.
*   **Headline (lg/md/sm):** Reserved for section headers. These should often sit asymmetrically on the grid to break the "template" feel.
*   **Body (lg/md):** Our workhorse. Use `on_surface_variant` (`#434843`) for long-form text to reduce eye strain against the cream background.
*   **Labels:** Use `label-md` in uppercase with increased letter-spacing (+0.05em) when paired with terracotta (`secondary`) for a premium "tag" look.
 
---
 
## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Tonal Layering** to convey importance.
 
*   **The Layering Principle:** Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f4f3f1) background to create a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a FAB or Menu), use a shadow color derived from `on_surface` at 4% opacity with a blur radius of at least `32px`.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at 15% opacity. Never use 100% opaque lines.
 
---
 
## 5. Components: Tactile & Kinetic
All components inherit the **Roundedness Scale** (Default: `0.5rem` / `8px`) to maintain the "Kinetic Harmony" feel.
 
### Buttons
*   **Primary:** Background: `secondary` (#9f402d); Text: `on_secondary` (#ffffff). Use `md` or `lg` roundedness. 
*   **Secondary:** Background: `primary_fixed`; Text: `on_primary_fixed`. This creates a soft green-on-green look that feels high-end.
*   **Tertiary:** No background. Text: `secondary`. Use for low-emphasis actions.
 
### Input Fields
*   **Styling:** Use `surface_container_low` as the fill. No border. 
*   **States:** On focus, the background shifts to `surface_container_high` with a subtle 2px bottom-indicator in `secondary`.
 
### Cards & Lists
*   **Forbid dividers.** Use `1.5rem` to `2rem` of vertical whitespace (the Spacing Scale) to separate list items. 
*   **Interactive Cards:** Should slightly scale up (1.02x) on hover rather than changing shadow depth, maintaining the "kinetic" feel.
 
### Chips
*   **Filter Chips:** Use `tertiary_fixed` with `on_tertiary_fixed` text. The muted olive/khaki tones provide a sophisticated alternative to gray.
 
---
 
## 6. Do's and Don'ts
 
### Do:
*   **Embrace Whitespace:** Use generous margins (at least `2rem` on mobile, `4rem+` on desktop) to let the typography breathe.
*   **Asymmetric Layouts:** Place image containers slightly off-center or overlapping background color blocks to create an editorial rhythm.
*   **Tonal Consistency:** Always check that text color (`on_surface`) maintains a 4.5:1 ratio against the chosen `surface-container` for accessibility.
 
### Don't:
*   **No Pure Black:** Never use `#000000`. Use `primary` or `on_surface` for dark elements.
*   **No Hard Borders:** Avoid 1px solid lines at all costs. They break the organic flow of the "Kinetic Harmony."
*   **No Default Shadows:** Avoid the standard "Material Design" shadow look. Stick to tonal shifts or ultra-diffused ambient glows.