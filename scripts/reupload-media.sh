#!/bin/bash
# Re-upload all media from public/ through Payload's optimization pipeline
# Then reattach to the Home page

set -euo pipefail

BASE="${NEXT_PUBLIC_SERVER_URL:-http://localhost:3000}"
EMAIL="${PAYLOAD_ADMIN_EMAIL:-jordanburch.dev@gmail.com}"
PASSWORD="${PAYLOAD_ADMIN_PASSWORD:-meta1234}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC="$SCRIPT_DIR/../public"

# Login to get token
TOKEN=$(curl -s "$BASE/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
process.stdout.write(d.token);
")

AUTH="Authorization: JWT $TOKEN"

echo "=== Step 1: Delete all existing media ==="
MEDIA_IDS=$(curl -s "$BASE/api/media?limit=100" -H "$AUTH" | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.docs.forEach(m => console.log(m.id));
")

for id in $MEDIA_IDS; do
  echo "  Deleting media $id..."
  curl -s -X DELETE "$BASE/api/media/$id" -H "$AUTH" > /dev/null
done
echo "  Done."

echo ""
echo "=== Step 2: Upload all media from public/ ==="

# Helper: upload a file with explicit mime type
upload() {
  local file="$1"
  local alt="$2"
  local mime="$3"
  local result
  result=$(curl -s --max-time 120 -X POST "$BASE/api/media" \
    -H "$AUTH" \
    -F "file=@${file};type=${mime}" \
    -F "_payload={\"alt\":\"${alt}\"};type=application/json")
  local new_id
  new_id=$(echo "$result" | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
if (d.doc) console.log(d.doc.id);
else { console.error('Upload failed:', JSON.stringify(d.errors || d)); process.exit(1); }
")
  echo "$new_id"
}

# Videos
echo "  Uploading hero-vid-new.mp4..."
ID_HERO_VID=$(upload "$PUBLIC/hero-vid-new.mp4" "Hero background video" "video/mp4")
echo "    → id=$ID_HERO_VID"

echo "  Uploading hero-vid.mp4..."
ID_HERO_VID2=$(upload "$PUBLIC/hero-vid.mp4" "Macrodata refinement process" "video/mp4")
echo "    → id=$ID_HERO_VID2"

echo "  Uploading split-vid-building.mp4..."
ID_SPLIT_BUILDING=$(upload "$PUBLIC/split-vid-building.mp4" "The Perpetuity Wing" "video/mp4")
echo "    → id=$ID_SPLIT_BUILDING"

echo "  Uploading split-vid-hana.mp4..."
ID_SPLIT_HANA=$(upload "$PUBLIC/split-vid-hana.mp4" "Lumon employee benefits" "video/mp4")
echo "    → id=$ID_SPLIT_HANA"

echo "  Uploading cinematic-cta-vid.mp4..."
ID_CTA_VID=$(upload "$PUBLIC/cinematic-cta-vid.mp4" "Cinematic CTA background video" "video/mp4")
echo "    → id=$ID_CTA_VID"

echo "  Uploading bento-vid.mp4..."
ID_BENTO_VID=$(upload "$PUBLIC/bento-vid.mp4" "Bento background video" "video/mp4")
echo "    → id=$ID_BENTO_VID"

# Images
echo "  Uploading hero-bg.jpg..."
ID_HERO_BG=$(upload "$PUBLIC/hero-bg.jpg" "Hero background image" "image/jpeg")
echo "    → id=$ID_HERO_BG"

echo "  Uploading gallery/elevator-descent.jpg..."
ID_ELEVATOR=$(upload "$PUBLIC/gallery/elevator-descent.jpg" "Mark Scout in the elevator descending to the severed floor" "image/jpeg")
echo "    → id=$ID_ELEVATOR"

echo "  Uploading gallery/break-room-session.jpg..."
ID_BREAKROOM=$(upload "$PUBLIC/gallery/break-room-session.jpg" "A woman reading the break room statement" "image/jpeg")
echo "    → id=$ID_BREAKROOM"

echo "  Uploading gallery/the-you-you-are.jpg..."
ID_YOUYOUARE=$(upload "$PUBLIC/gallery/the-you-you-are.jpg" "Irving holding The You You Are" "image/jpeg")
echo "    → id=$ID_YOUYOUARE"

echo "  Uploading gallery/macrodata-refinement.jpg..."
ID_MACRODATA=$(upload "$PUBLIC/gallery/macrodata-refinement.jpg" "Helly at her desk in MDR" "image/jpeg")
echo "    → id=$ID_MACRODATA"

echo "  Uploading gallery/mdr-team.jpg..."
ID_MDRTEAM=$(upload "$PUBLIC/gallery/mdr-team.jpg" "The MDR team gathered together" "image/jpeg")
echo "    → id=$ID_MDRTEAM"

echo "  Uploading gallery/helly-portrait.jpg..."
ID_HELLYPORT=$(upload "$PUBLIC/gallery/helly-portrait.jpg" "Helly peering over a cubicle divider" "image/jpeg")
echo "    → id=$ID_HELLYPORT"

# Testimonials
echo "  Uploading testimonials/cobel.jpg..."
ID_COBEL=$(upload "$PUBLIC/testimonials/cobel.jpg" "Harmony Cobel" "image/jpeg")
echo "    → id=$ID_COBEL"

echo "  Uploading testimonials/milchick.png..."
ID_MILCHICK=$(upload "$PUBLIC/testimonials/milchick.png" "Seth Milchick" "image/png")
echo "    → id=$ID_MILCHICK"

echo "  Uploading testimonials/kier.webp..."
ID_KIER=$(upload "$PUBLIC/testimonials/kier.webp" "Kier Eagan" "image/webp")
echo "    → id=$ID_KIER"

echo "  Uploading testimonials/mark.png..."
ID_MARK=$(upload "$PUBLIC/testimonials/mark.png" "Mark S." "image/png")
echo "    → id=$ID_MARK"

echo "  Uploading testimonials/helly.jpg..."
ID_HELLY=$(upload "$PUBLIC/testimonials/helly.jpg" "Helly R." "image/jpeg")
echo "    → id=$ID_HELLY"

echo "  Uploading testimonials/irving.webp..."
ID_IRVING=$(upload "$PUBLIC/testimonials/irving.webp" "Irving B." "image/webp")
echo "    → id=$ID_IRVING"

echo "  Uploading testimonials/dylan.webp..."
ID_DYLAN=$(upload "$PUBLIC/testimonials/dylan.webp" "Dylan G." "image/webp")
echo "    → id=$ID_DYLAN"

# SVGs & logos
echo "  Uploading lumon-logo.svg..."
ID_LOGO=$(upload "$PUBLIC/lumon-logo.svg" "Lumon Industries logo" "image/svg+xml")
echo "    → id=$ID_LOGO"

echo "  Uploading icons/nextjs.svg..."
ID_NEXTJS=$(upload "$PUBLIC/icons/nextjs.svg" "Next.js logo" "image/svg+xml")
echo "    → id=$ID_NEXTJS"

echo "  Uploading icons/payload.svg..."
ID_PAYLOAD_LOGO=$(upload "$PUBLIC/icons/payload.svg" "Payload CMS logo" "image/svg+xml")
echo "    → id=$ID_PAYLOAD_LOGO"

echo "  Uploading icons/react.svg..."
ID_REACT=$(upload "$PUBLIC/icons/react.svg" "React logo" "image/svg+xml")
echo "    → id=$ID_REACT"

echo "  Uploading icons/tailwind.svg..."
ID_TAILWIND=$(upload "$PUBLIC/icons/tailwind.svg" "Tailwind CSS logo" "image/svg+xml")
echo "    → id=$ID_TAILWIND"

echo "  Uploading icons/typescript.svg..."
ID_TYPESCRIPT=$(upload "$PUBLIC/icons/typescript.svg" "TypeScript logo" "image/svg+xml")
echo "    → id=$ID_TYPESCRIPT"

echo "  Uploading icons/vercel.svg..."
ID_VERCEL=$(upload "$PUBLIC/icons/vercel.svg" "Vercel logo" "image/svg+xml")
echo "    → id=$ID_VERCEL"

echo ""
echo "=== All uploads complete ==="

# Save mapping
cat > /tmp/media-ids.env << ENVEOF
HERO_VID=$ID_HERO_VID
HERO_VID2=$ID_HERO_VID2
SPLIT_BUILDING=$ID_SPLIT_BUILDING
SPLIT_HANA=$ID_SPLIT_HANA
CTA_VID=$ID_CTA_VID
BENTO_VID=$ID_BENTO_VID
HERO_BG=$ID_HERO_BG
ELEVATOR=$ID_ELEVATOR
BREAKROOM=$ID_BREAKROOM
YOUYOUARE=$ID_YOUYOUARE
MACRODATA=$ID_MACRODATA
MDRTEAM=$ID_MDRTEAM
HELLYPORT=$ID_HELLYPORT
COBEL=$ID_COBEL
MILCHICK=$ID_MILCHICK
KIER=$ID_KIER
MARK=$ID_MARK
HELLY=$ID_HELLY
IRVING=$ID_IRVING
DYLAN=$ID_DYLAN
LOGO=$ID_LOGO
ENVEOF

echo "=== ID Mapping ==="
cat /tmp/media-ids.env
echo ""
echo "Done! Ready for page update."
