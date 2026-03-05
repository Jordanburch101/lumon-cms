# Split Media Section Design

## Overview
Alternating 50/50 media + text rows after the bento. Three rows with a zigzag layout (media-left, media-right, media-left). Each row can use an image or autoplay muted video. Copy is written as fictional Lumon Industries content for client demo purposes.

## Layout
- Full-width section, consistent vertical padding
- Each row: media (50%) + text block (50%) with headline, body, optional CTA
- Rows alternate which side the media is on
- Mobile: stacks vertically — media on top, text below (no alternating)
- Media supports `<Image>` (Next.js) and `<video>` (autoplay, muted, loop)

## Data

### Row 1 (media left, video)
- **Headline:** "Refining the work you were designed to do"
- **Body:** "At Lumon, every detail of the severed floor is calibrated for focus. Our proprietary macrodata refinement process ensures your innies deliver results your outties can be proud of."
- **CTA:** "Learn more" -> /about

### Row 2 (media right, image)
- **Headline:** "The Perpetuity Wing awaits"
- **Body:** "Nine floors. Nine founders. A legacy preserved in wax and wonder. Every Lumon employee deserves to walk the halls that started it all."
- **CTA:** "Take the tour" -> /heritage

### Row 3 (media left, video)
- **Headline:** "Your outie loves the benefits"
- **Body:** "Competitive compensation. Wellness sessions with Ms. Casey. Waffle parties for top performers. Lumon takes care of its people — all of them."
- **CTA:** "View careers" -> /careers

## Components
- `src/components/layout/split-media/split-media.tsx` — section with rows
- `src/components/layout/split-media/split-media-data.ts` — row content data

## Animation
Each row fades in with a slight slide from the media side using `motion/react` + `useInView`.

## File structure
```
src/components/layout/split-media/
  split-media.tsx
  split-media-data.ts
```
