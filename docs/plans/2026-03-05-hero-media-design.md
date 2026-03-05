# Hero Media Detection Design

## Context

The hero section currently hardcodes a static image background. Payload CMS media fields will return either a video (`.mp4`) or an image URL. The hero needs to detect and render the correct element without requiring an explicit type flag.

## Goal

Update the hero to accept any media URL and auto-detect whether to render a `<video>` or `<Image>` based on file extension.

## Detection Logic

A small inline utility checks the `src` string for video extensions (`.mp4`, `.webm`, `.ogg`). Returns `"video"` or `"image"`. Defined in `hero.tsx` — no separate file since it's only used there.

```ts
function getMediaType(src: string): "video" | "image" {
  return /\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image";
}
```

## Rendering

- **Video:** `<video>` with `autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover"`
- **Image:** existing `<Image fill priority className="object-cover">` — unchanged
- Gradient overlay is shared — no changes needed

## hero-data.ts

Replace hardcoded `/hero-bg.jpg` with a `mediaSrc` field pointing to whichever asset is active. Currently set to `/hero-vid.mp4` to exercise the video path.

## File Changes

- Modify: `src/components/layout/hero/hero-data.ts` — add `mediaSrc` field
- Modify: `src/components/layout/hero/hero.tsx` — add detection utility, conditional render

## Out of Scope

- Poster image for video fallback
- Payload CMS integration (future)
- Multiple media sources / srcset for video
