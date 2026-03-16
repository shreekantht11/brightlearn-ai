

# Landing Page Redesign Plan

Inspired by the reference image: soft pastel purple/blue theme, clean hero with decorative shapes, large expressive typography, and a light airy feel.

## Key Design Changes

### Hero Section
- **Light pastel background** instead of the current dark gradient — soft lavender/blue gradient with white
- **Large expressive typography**: "Let's **E-learning** at your home" style headline with mixed weights (thin + extra bold)
- **Right side**: Decorative abstract shape frame (CSS clip-path / border-radius blob) containing a gradient illustration area, replacing the dark "Learning Workspace" card
- **Floating decorative elements**: Small geometric shapes (triangles, circles) with soft shadows floating around the hero
- **Rounded pill CTA buttons**: "Apply now" (filled primary) + "Read More" (outlined) style
- **Social icons row** at bottom-left of hero

### Visual Style Updates
- Softer color palette: pastel purple `hsl(234, 80%, 92%)` backgrounds, white cards
- More organic shapes: blob borders, rounded decorative frames
- Lighter shadows and borders throughout
- Keep existing sections (stats, features, courses, testimonials, CTA) but apply the softer aesthetic

### Files to Modify
1. **`src/pages/Index.tsx`** — Complete hero redesign, softer section styling
2. **`src/index.css`** — Add blob/shape utilities and pastel background classes

### Sections Preserved (with style refresh)
- Stats strip — softer card styling
- Features — pastel icon backgrounds, softer borders
- Popular Courses — unchanged structure, lighter styling
- Testimonials — softer cards
- CTA — pastel gradient instead of dark
- Footer — unchanged

