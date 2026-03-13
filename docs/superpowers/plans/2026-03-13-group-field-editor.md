# Group Field Editor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generic group field editor system to the frontend editor, with a link editor popover as the first implementation — enabling editors to click a CMS link on the page and edit all its fields (type, url/reference, newTab, appearance) in a compact popover.

**Architecture:** The field map generator emits a `GroupFieldDescriptor` (instead of flattening) for Payload groups tagged with `custom.groupType`. The edit runtime scans `[data-field-group]` DOM elements, activates inline label editing, and dispatches `edit:open-group-editor` events. A registry maps group type strings to editor components, keeping the system extensible. The link editor popover is the first registered editor.

**Tech Stack:** Next.js 16 (App Router), React 19, Payload CMS 3.x, shadcn (Popover, Command/Combobox, Switch, Select), Tailwind CSS v4, Bun (test runner + package manager)

**Spec:** `docs/superpowers/specs/2026-03-13-group-field-editor-design.md`

---

## Chunk 1: Type System & Field Map Generator

### Task 1: Add GroupFieldDescriptor to field-map types

**Files:**
- Modify: `src/payload/lib/field-map/types.ts`
- Modify: `src/payload/lib/field-map/types.test.ts`

- [ ] **Step 1: Write the test for GroupFieldDescriptor**

Add a test to `types.test.ts` that verifies the type system accepts `GroupFieldDescriptor` entries in a `BlockFieldMap`:

Append to the existing `types.test.ts` file (merge the new imports with existing ones):

```ts
// Add these imports to the existing import block:
// import type { ..., GroupFieldDescriptor } from "./types";

describe("GroupFieldDescriptor", () => {
  it("is a valid FieldEntry in a BlockFieldMap", () => {
    const group: GroupFieldDescriptor = {
      type: "group",
      groupType: "link",
      fields: {
        label: { type: "text" },
        url: { type: "text" },
        reference: { type: "relationship", relationTo: ["pages"] },
        newTab: { type: "checkbox" },
      },
    };

    const map: BlockFieldMap = {
      title: { type: "text", required: true },
      primaryCta: group,
    };

    const entry: FieldEntry = map.primaryCta;
    expect(entry.type).toBe("group");
    // Discriminated union narrows to GroupFieldDescriptor when type === "group"
    if (entry.type === "group") {
      expect(entry.groupType).toBe("link");
      expect(Object.keys(entry.fields)).toEqual([
        "label",
        "url",
        "reference",
        "newTab",
      ]);
    }
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (GroupFieldDescriptor not defined)**

```bash
bun test src/payload/lib/field-map/types.test.ts
```

Expected: TypeScript compilation error — `GroupFieldDescriptor` not exported.

- [ ] **Step 3: Add GroupFieldDescriptor type and update FieldEntry union**

In `src/payload/lib/field-map/types.ts`, add after `ArrayFieldDescriptor`:

```ts
/** Descriptor for a composite field group (e.g., link) that is edited as a unit. */
export interface GroupFieldDescriptor {
  type: "group";
  groupType: string;
  fields: BlockFieldMap;  // nested fields — uses BlockFieldMap for consistency with ArrayFieldDescriptor
}
```

Update the `FieldEntry` union:

```ts
export type FieldEntry = FieldDescriptor | ArrayFieldDescriptor | GroupFieldDescriptor;
```

- [ ] **Step 4: Run test — expect PASS**

```bash
bun test src/payload/lib/field-map/types.test.ts
```

- [ ] **Step 5: Lint check**

```bash
bun check
```

Fix any issues with `bun fix` if needed.

- [ ] **Step 6: Commit**

```bash
git add src/payload/lib/field-map/types.ts src/payload/lib/field-map/types.test.ts
git commit -m "feat(field-map): add GroupFieldDescriptor type for composite field groups"
```

---

### Task 2: Update field map generator to emit GroupFieldDescriptor for tagged groups

**Files:**
- Modify: `src/payload/lib/field-map/generate.ts`
- Modify: `src/payload/lib/field-map/generate.test.ts`

**Context:**
- The `processNamedField` function (line 146-163 of `generate.ts`) currently flattens all groups with `Object.assign(map, walkFields(field.fields, \`${key}.\`))`.
- We need to check for `custom.groupType` on group fields. If present, emit a `GroupFieldDescriptor` instead of flattening. If absent, continue flattening as before.
- The `GroupFieldDescriptor.fields` should use `walkFields` to produce the nested field map, but WITHOUT a dot-prefix (since the fields are nested, not flattened).

- [ ] **Step 1: Write the failing test**

Add to `generate.test.ts`:

```ts
const LinkGroupBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "headline", type: "text", required: true },
    {
      name: "primaryCta",
      type: "group",
      custom: { groupType: "link" },
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Internal", value: "internal" },
            { label: "External", value: "external" },
          ],
        },
        { name: "label", type: "text", required: true },
        { name: "url", type: "text" },
        {
          name: "reference",
          type: "relationship",
          relationTo: ["pages"],
        },
        { name: "newTab", type: "checkbox" },
        {
          name: "buttonVariant",
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Outline", value: "outline" },
          ],
        },
      ],
    },
  ],
};

const PlainGroupBlock: Block = {
  slug: "plain",
  labels: { singular: "Plain", plural: "Plain" },
  fields: [
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};
```

And the test cases:

```ts
describe("group with custom.groupType", () => {
  it("emits GroupFieldDescriptor instead of flattening", () => {
    const result = introspectBlock(LinkGroupBlock);
    const primaryCta = result.fields.primaryCta;
    expect(primaryCta).toBeDefined();
    expect(primaryCta.type).toBe("group");
    if (primaryCta.type === "group") {
      expect(primaryCta.groupType).toBe("link");
      expect(primaryCta.fields.label).toEqual({ type: "text", required: true });
      expect(primaryCta.fields.url).toEqual({ type: "text" });
      expect(primaryCta.fields.reference).toEqual({
        type: "relationship",
        relationTo: ["pages"],
      });
      expect(primaryCta.fields.newTab).toEqual({ type: "checkbox" });
      expect(primaryCta.fields.type).toEqual({
        type: "select",
        options: [
          { label: "Internal", value: "internal" },
          { label: "External", value: "external" },
        ],
      });
      expect(primaryCta.fields.buttonVariant).toEqual({
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Outline", value: "outline" },
        ],
      });
    }
    // Flattened keys should NOT exist
    expect(result.fields["primaryCta.label"]).toBeUndefined();
    expect(result.fields["primaryCta.url"]).toBeUndefined();
  });

  it("still flattens groups WITHOUT custom.groupType", () => {
    const result = introspectBlock(PlainGroupBlock);
    // Flattened as before
    expect(result.fields["cta.label"]).toEqual({ type: "text" });
    expect(result.fields["cta.href"]).toEqual({ type: "text" });
    // No group entry
    expect(result.fields.cta).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```

Expected: `primaryCta` is undefined (currently flattened to `primaryCta.label`, `primaryCta.url`, etc.)

- [ ] **Step 3: Implement the group detection in processNamedField**

In `generate.ts`, add the import for `GroupFieldDescriptor`:

```ts
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  BlockMeta,
  BlockMetaMap,
  FieldDescriptor,
  FieldMap,
  GroupFieldDescriptor,
} from "./types";
```

Modify `processNamedField` to check for `custom.groupType` before flattening:

```ts
function processNamedField(
  field: Field,
  key: string,
  map: BlockFieldMap
): void {
  if (field.type === "group") {
    // Tagged groups emit a GroupFieldDescriptor instead of flattening
    const groupType =
      "custom" in field &&
      field.custom &&
      typeof field.custom === "object" &&
      "groupType" in field.custom
        ? (field.custom as { groupType: string }).groupType
        : null;

    if (groupType) {
      map[key] = {
        type: "group",
        groupType,
        fields: walkFields(field.fields),
      } satisfies GroupFieldDescriptor;
      return;
    }

    Object.assign(map, walkFields(field.fields, `${key}.`));
    return;
  }
  if (field.type === "array") {
    map[key] = buildArrayDescriptor(field);
    return;
  }
  const desc = extractDescriptor(field);
  if (desc) {
    map[key] = desc;
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```

- [ ] **Step 5: Run ALL existing tests to check for regressions**

```bash
bun test
```

All existing tests should still pass. The existing `GroupBlock` test verifies that plain groups (without `custom.groupType`) still flatten correctly.

- [ ] **Step 6: Lint check**

```bash
bun check
```

- [ ] **Step 7: Commit**

```bash
git add src/payload/lib/field-map/generate.ts src/payload/lib/field-map/generate.test.ts
git commit -m "feat(field-map): emit GroupFieldDescriptor for groups with custom.groupType"
```

---

### Task 3: Add custom.groupType to the link() field function

**Files:**
- Modify: `src/payload/fields/link/link.ts`

**Context:**
- The `link()` function returns a `GroupField` object (line 167-181). We need to add `custom: { groupType: "link" }` to the returned object.

- [ ] **Step 1: Write a test that the link() function includes custom.groupType**

Add to `generate.test.ts` (this serves as an integration test with the real `link()` function):

```ts
import { link } from "@/payload/fields/link/link";

describe("link() field with custom.groupType", () => {
  it("produces a GroupFieldDescriptor when introspected", () => {
    const linkField = link({ name: "cta" });
    const testBlock: Block = {
      slug: "test-link",
      labels: { singular: "Test", plural: "Tests" },
      fields: [linkField],
    };
    const result = introspectBlock(testBlock);
    const cta = result.fields.cta;
    expect(cta).toBeDefined();
    expect(cta.type).toBe("group");
    if (cta.type === "group") {
      expect(cta.groupType).toBe("link");
      expect(cta.fields.label).toBeDefined();
      expect(cta.fields.url).toBeDefined();
      expect(cta.fields.newTab).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```

Expected: FAIL — `cta` is undefined (group gets flattened) or `cta.type` is not `"group"` (no `custom.groupType` on the link field yet).

- [ ] **Step 3: Add custom property to the returned GroupField**

In `link.ts`, modify the return statement to include `custom`:

```ts
return {
  name,
  type: "group",
  label,
  custom: { groupType: "link" },
  admin: {
    components: {
      Label: {
        path: "@/payload/fields/link/link-label",
        clientProps: { fieldName: label || name },
      },
    },
  },
  fields,
};
```

- [ ] **Step 4: Run test — expect PASS**

```bash
bun test src/payload/lib/field-map/generate.test.ts
```

- [ ] **Step 5: Lint check**

```bash
bun check
```

- [ ] **Step 6: Commit**

```bash
git add src/payload/fields/link/link.ts src/payload/lib/field-map/generate.test.ts
git commit -m "feat(link): add custom.groupType for field map group detection"
```

---

## Chunk 2: Infrastructure (Registry, CMSLink Props, Edit Runtime, Orchestrator)

### Task 4: Create group editor registry

**Files:**
- Create: `src/components/features/frontend-editor/group-editor-registry.ts`
- Create: `src/components/features/frontend-editor/group-editor-registry.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from "bun:test";
import {
  getGroupEditor,
  registerGroupEditor,
} from "./group-editor-registry";

describe("group-editor-registry", () => {
  it("returns null for unregistered type", () => {
    expect(getGroupEditor("nonexistent")).toBeNull();
  });

  it("registers and retrieves a group editor component", () => {
    const MockEditor = () => null;
    registerGroupEditor("test-type", MockEditor as any);
    expect(getGroupEditor("test-type")).toBe(MockEditor);
  });

  it("overwrites registration for the same type", () => {
    const Editor1 = () => null;
    const Editor2 = () => null;
    registerGroupEditor("overwrite", Editor1 as any);
    registerGroupEditor("overwrite", Editor2 as any);
    expect(getGroupEditor("overwrite")).toBe(Editor2);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
bun test src/components/features/frontend-editor/group-editor-registry.test.ts
```

Expected: Module not found.

- [ ] **Step 3: Implement the registry**

```ts
import type { BlockFieldMap } from "@/payload/lib/field-map/types";

export interface GroupEditorProps {
  blockIndex: number;
  fieldPath: string;
  fields: BlockFieldMap;
  currentValues: Record<string, unknown>;
  anchorEl: HTMLElement;
  onClose: () => void;
}

type GroupEditorComponent = React.ComponentType<GroupEditorProps>;

const registry = new Map<string, GroupEditorComponent>();

export function registerGroupEditor(
  type: string,
  component: GroupEditorComponent
): void {
  registry.set(type, component);
}

export function getGroupEditor(type: string): GroupEditorComponent | null {
  return registry.get(type) ?? null;
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
bun test src/components/features/frontend-editor/group-editor-registry.test.ts
```

- [ ] **Step 5: Lint and commit**

```bash
bun check
git add src/components/features/frontend-editor/group-editor-registry.ts src/components/features/frontend-editor/group-editor-registry.test.ts
git commit -m "feat(frontend-editor): add group editor registry for composite field editing"
```

---

### Task 5: Update CMSLink to accept and spread data-field-group props

**Files:**
- Modify: `src/components/ui/cms-link.tsx`

**Context:**
- `CMSLink` currently destructures `{ link, className, children }`.
- We need to accept `data-field-group` and `data-field-group-type` and spread them onto the **inner link element** (the `<a>` or `<Link>`), NOT the `<Button>` wrapper.
- Use rest-spread to collect any extra props and pass them through.

- [ ] **Step 1: Update CMSLinkProps and component to pass through rest props**

Update the interface to accept `data-*` attributes without extending `AnchorHTMLAttributes` (which conflicts with Next.js `Link` prop types):

```tsx
interface CMSLinkProps {
  link?: CMSLinkData | null
  className?: string
  children?: ReactNode
  [key: `data-${string}`]: string | undefined
}
```

Update the component signature to collect rest props:

```tsx
export function CMSLink({ link, className, children, ...rest }: CMSLinkProps) {
```

Then spread `{...rest}` onto the inner `<LinkEl>` in all three rendering paths:

**Button appearance:**
```tsx
<Button asChild className={className} size={...} variant={...}>
  <LinkEl {...hrefProp} {...linkProps} {...rest}>
    {content}
  </LinkEl>
</Button>
```

**Link appearance:**
```tsx
<LinkEl className={cn(...)} {...hrefProp} {...linkProps} {...rest}>
  {content}
  {/* arrow icon */}
</LinkEl>
```

**No appearance:**
```tsx
<LinkEl className={className} {...hrefProp} {...linkProps} {...rest}>
  {content}
</LinkEl>
```

- [ ] **Step 2: Lint check**

```bash
bun check
```

- [ ] **Step 3: Build check**

```bash
bun build
```

Ensures no type errors from the prop changes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/cms-link.tsx
git commit -m "feat(cms-link): accept and spread data-field-group attributes for frontend editor"
```

---

### Task 6: Create authenticated pages search API route

**Files:**
- Create: `src/app/(frontend)/api/pages/search/route.ts`

**Context:**
- Follow the existing auth pattern from `src/app/(frontend)/api/admin/collections/route.ts` (lines 14-24).
- Import `linkableCollections` from `@/payload/fields/link/linkable-collections`.
- Search by title field across all linkable collections.
- Return `{ id, title, slug, collection }[]`.

- [ ] **Step 1: Create the route handler**

```ts
import config from "@payload-config";
import { connection } from "next/server";
import { getPayload } from "payload";
import { linkableCollections } from "@/payload/fields/link/linkable-collections";

export async function GET(request: Request) {
  await connection();

  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    const allResults = await Promise.all(
      linkableCollections.map(async (slug) => {
        const { docs } = await payload.find({
          collection: slug,
          where: query ? { title: { contains: query } } : {},
          limit: 20,
          depth: 0,
          select: { title: true, slug: true },
        });
        return docs.map((doc) => ({
          id: doc.id as number,
          title: ((doc as Record<string, unknown>).title as string) ?? `Untitled (${doc.id})`,
          slug: ((doc as Record<string, unknown>).slug as string) ?? "",
          collection: slug,
        }));
      })
    );

    const results = allResults.flat().slice(0, 20);

    return Response.json(results);
  } catch (err) {
    console.error("[pages/search] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Lint check**

```bash
bun check
```

- [ ] **Step 3: Build check**

```bash
bun build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(frontend\)/api/pages/search/route.ts
git commit -m "feat(api): add authenticated pages search endpoint for link editor combobox"
```

---

### Task 7: Update edit runtime to scan for group field elements

**Files:**
- Modify: `src/components/features/frontend-editor/edit-runtime.tsx`

**Context:**
- The existing `scan()` function (line 96-126) iterates over `[data-field]` elements. We add a second pass for `[data-field-group]` elements.
- For group elements:
  1. Find `blockIndex` from nearest `[data-block-index]` ancestor (same as existing pattern).
  2. Look up the group descriptor from `fieldMap` (it will be a `GroupFieldDescriptor` with `type: "group"`).
  3. Activate inline contentEditable on the label text — wrap the text node in a `<span>` and use `activateTextEditor` on it, mapped to `{groupName}.label`.
  4. Add an edit icon overlay on hover. Clicking the icon dispatches `edit:open-group-editor`.
- Import `GroupFieldDescriptor` from types.
- The runtime needs access to edit mode state (blocks) to populate `currentValues` in the event. It already has access to `editMode` via `useEditMode()`.

- [ ] **Step 1: Add GroupFieldDescriptor import and group scanning**

Add to the imports:

```ts
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
  GroupFieldDescriptor,
} from "@/payload/lib/field-map/types";
import { getFieldValue } from "./edit-mode-data";
```

Note: `getFieldValue` is already used by the orchestrator but needs to be imported in the runtime too for reading current group values.

Inside `scan()`, after the existing `[data-field]` loop, add a second loop for `[data-field-group]`:

```ts
// --- Group field elements ---
const groupElements = container.querySelectorAll<HTMLElement>("[data-field-group]");

for (const el of groupElements) {
  const fieldPath = el.dataset.fieldGroup;
  const groupType = el.dataset.fieldGroupType;
  if (!(fieldPath && groupType)) continue;

  const blockContainer = el.closest<HTMLElement>("[data-block-index]");
  if (!blockContainer) continue;

  const blockIndex = Number(blockContainer.dataset.blockIndex);
  const blockType = blockContainer.dataset.blockType;
  if (!(blockType && blockType in fieldMap)) continue;

  const entry = fieldMap[blockType as keyof typeof fieldMap][fieldPath];
  if (!entry || entry.type !== "group") continue;

  const groupDescriptor = entry as GroupFieldDescriptor;

  // Add hover indicator
  el.classList.add("editable-field");
  const fieldLabel = humanizeFieldPath(fieldPath);
  el.setAttribute("data-field-label", fieldLabel);

  // Inline label editing: wrap only TEXT_NODE children in a span (preserves icons and other elements)
  const labelSpan = document.createElement("span");
  const textNodes: Text[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      textNodes.push(node as Text);
    }
  }
  if (textNodes.length > 0) {
    // Replace first text node with the editable span
    labelSpan.textContent = textNodes[0].textContent;
    textNodes[0].replaceWith(labelSpan);
    // Remove any additional text nodes
    for (let t = 1; t < textNodes.length; t++) {
      textNodes[t].remove();
    }
  } else {
    // Fallback: no text nodes found, prepend span
    labelSpan.textContent = el.textContent;
    el.prepend(labelSpan);
  }

  const labelCleanup = activateTextEditor(
    labelSpan,
    blockIndex,
    `${fieldPath}.label`,
    updateField
  );

  // Create edit icon overlay
  const editIcon = document.createElement("button");
  editIcon.className = "group-edit-icon";
  editIcon.setAttribute("aria-label", `Edit ${fieldLabel}`);
  editIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  el.style.position = "relative";
  el.appendChild(editIcon);

  const handleEditClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();

    // Read current values from edit mode state using getFieldValue for nested path support
    const blocks = editMode?.state.blocks ?? [];
    const block = blocks[blockIndex] as Record<string, unknown> | undefined;
    const currentValues = block
      ? (getFieldValue(block, fieldPath) as Record<string, unknown>) ?? {}
      : {};

    el.dispatchEvent(
      new CustomEvent("edit:open-group-editor", {
        bubbles: true,
        detail: {
          blockIndex,
          fieldPath,
          groupType,
          fields: groupDescriptor.fields,
          currentValues,
          anchorEl: el,
        },
      })
    );
  };

  editIcon.addEventListener("click", handleEditClick);

  cleanups.current.push(() => {
    el.classList.remove("editable-field");
    el.removeAttribute("data-field-label");
    el.style.position = "";
    // Restore: replace the span with a text node (preserves sibling elements like icons)
    const restoredText = document.createTextNode(labelSpan.textContent ?? "");
    labelSpan.replaceWith(restoredText);
    editIcon.remove();
    labelCleanup();
  });
}
```

- [ ] **Step 2: Add CSS for the edit icon overlay**

In `src/app/globals.css`, add styles for the group edit icon (within the frontend editor section if one exists, otherwise at the end):

```css
/* Group field edit icon — uses oklch color space (project convention) */
.group-edit-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--background);
  color: var(--muted-foreground);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.group-edit-icon:hover {
  color: var(--foreground);
  border-color: var(--foreground);
}

.editable-field:hover .group-edit-icon {
  display: flex;
}
```

- [ ] **Step 3: Lint check**

```bash
bun check
```

- [ ] **Step 4: Build check**

```bash
bun build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/edit-runtime.tsx src/app/globals.css
git commit -m "feat(edit-runtime): scan [data-field-group] elements with inline label editing and edit icon"
```

---

### Task 8: Update field editor orchestrator to handle group editor events

**Files:**
- Modify: `src/components/features/frontend-editor/field-editor-orchestrator.tsx`

**Context:**
- The orchestrator (line 41-113) currently listens for `edit:open-popover` and `edit:open-upload`. We add a third listener for `edit:open-group-editor`.
- When received, look up the group editor component from the registry. If found, render it. If not, fall back to opening the block editor dialog.

- [ ] **Step 1: Add group editor state and event listener**

Add imports:

```ts
import type { FieldDescriptor } from "@/payload/lib/field-map/types";
import { getGroupEditor, type GroupEditorProps } from "./group-editor-registry";
```

Add state interface and state:

```ts
interface GroupEditorState {
  blockIndex: number;
  fieldPath: string;
  groupType: string;
  fields: Record<string, FieldDescriptor>;
  currentValues: Record<string, unknown>;
  anchorElement: HTMLElement;
}
```

In the `FieldEditorOrchestrator` component, add:

```ts
const [groupEditor, setGroupEditor] = useState<GroupEditorState | null>(null);
```

In the `useEffect`, add the event listener after the existing ones:

```ts
const handleGroupEditor = (e: Event) => {
  const detail = (e as CustomEvent).detail;
  setGroupEditor({
    blockIndex: detail.blockIndex,
    fieldPath: detail.fieldPath,
    groupType: detail.groupType,
    fields: detail.fields,
    currentValues: detail.currentValues,
    anchorElement: detail.anchorEl as HTMLElement,
  });
};

overlay.addEventListener("edit:open-group-editor", handleGroupEditor);
```

And in the cleanup:

```ts
overlay.removeEventListener("edit:open-group-editor", handleGroupEditor);
```

- [ ] **Step 2: Render the group editor component from registry**

In the JSX return, add after the upload editor:

```tsx
{groupEditor && (
  <GroupEditorRenderer
    onClose={() => setGroupEditor(null)}
    onUpdateField={handleUpdateField}
    state={groupEditor}
  />
)}
```

Add the `GroupEditorRenderer` component:

```tsx
function GroupEditorRenderer({
  state,
  onUpdateField,
  onClose,
}: {
  state: GroupEditorState;
  onUpdateField: (blockIndex: number, fieldPath: string, value: unknown) => void;
  onClose: () => void;
}) {
  const EditorComponent = getGroupEditor(state.groupType);

  if (!EditorComponent) {
    // Fallback: no registered editor — show a minimal popover directing to the block editor dialog.
    // A future improvement could open the block editor dialog filtered to this group's fields.
    return (
      <Popover open onOpenChange={(open) => { if (!open) onClose(); }}>
        <PopoverAnchor virtualRef={{ current: state.anchorElement }} />
        <PopoverContent className="w-48 p-3">
          <p className="text-muted-foreground text-xs">
            Use the block editor to edit this field group.
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <EditorComponent
      blockIndex={state.blockIndex}
      fieldPath={state.fieldPath}
      fields={state.fields}
      currentValues={state.currentValues}
      anchorEl={state.anchorElement}
      onClose={onClose}
    />
  );
}
```

- [ ] **Step 3: Lint check**

```bash
bun check
```

- [ ] **Step 4: Build check**

```bash
bun build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/features/frontend-editor/field-editor-orchestrator.tsx
git commit -m "feat(orchestrator): listen for edit:open-group-editor and dispatch to registry"
```

---

## Chunk 3: Link Editor Popover & Block Integration

### Task 9: Create the link editor popover component

**Files:**
- Create: `src/components/features/frontend-editor/group-editors/link-editor-popover.tsx`

**Context:**
- Compact stacked popover (~320px) with: header, type segmented toggle, url input / page combobox, newTab switch, divider, appearance fields (schema-aware).
- Uses shadcn Popover, Select, Switch, Input, Command (for combobox).
- Registers itself via `registerGroupEditor("link", LinkEditorPopover)`.
- Calls `updateField(blockIndex, fieldPath, value)` via edit mode context for each field change.

**Dependencies needed:** Check if shadcn `Command` component is installed (needed for searchable combobox). If not, install it.

- [ ] **Step 1: Check if shadcn Command component exists**

```bash
ls src/components/ui/command.tsx 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

If missing, install it:

```bash
bunx shadcn@latest add command
```

- [ ] **Step 2: Create the link editor popover**

Create `src/components/features/frontend-editor/group-editors/link-editor-popover.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/core/lib/utils";
import type { FieldDescriptor } from "@/payload/lib/field-map/types";
import {
  registerGroupEditor,
  type GroupEditorProps,
} from "../group-editor-registry";
import { useEditModeRequired } from "../use-edit-mode";

// --- Types ---

interface PageResult {
  id: number;
  title: string;
  slug: string;
  collection: string;
}

// --- Helpers ---

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md bg-muted p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PillSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "flex-1 rounded px-2 py-1.5 text-center text-[11px] font-medium border transition-colors",
              value === opt.value
                ? "border-border bg-muted text-foreground"
                : "border-transparent bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PageCombobox({
  value,
  onChange,
}: {
  value: { relationTo: string; value: number } | null;
  onChange: (ref: { relationTo: string; value: number } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<PageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchPages = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/pages/search?q=${encodeURIComponent(q)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages("");
    return () => clearTimeout(debounceRef.current);
  }, [fetchPages]);

  const handleSearch = (q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPages(q), 300);
  };

  const selectedPage = pages.find(
    (p) => p.id === value?.value && p.collection === value?.relationTo
  );

  return (
    <div>
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Page
      </div>
      <Command className="rounded-md border" shouldFilter={false}>
        <CommandInput
          className="h-8 text-xs"
          placeholder={selectedPage?.title ?? "Search pages..."}
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList className="max-h-32">
          <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
            {loading ? "Searching..." : "No pages found"}
          </CommandEmpty>
          {pages.map((page) => (
            <CommandItem
              key={`${page.collection}-${page.id}`}
              value={`${page.collection}-${page.id}`}
              onSelect={() => {
                onChange({ relationTo: page.collection, value: page.id });
                setQuery("");
              }}
              className="text-xs"
            >
              <span className="truncate">{page.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                /{page.slug}
              </span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      {value && (
        <button
          type="button"
          className="mt-1 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
        >
          Clear selection
        </button>
      )}
    </div>
  );
}

// --- Main Component ---

function LinkEditorPopover({
  blockIndex,
  fieldPath,
  fields,
  currentValues,
  anchorEl,
  onClose,
}: GroupEditorProps) {
  const { actions } = useEditModeRequired();
  const anchorRef = useRef<HTMLElement>(anchorEl);

  // Local state initialized from currentValues — avoids stale reads when user edits fields.
  // Each setter calls both local state update AND updateField for edit mode context.
  const [linkType, setLinkType] = useState((currentValues.type as string) ?? "external");
  const [url, setUrl] = useState((currentValues.url as string) ?? "");
  const [newTab, setNewTab] = useState((currentValues.newTab as boolean) ?? false);
  const [reference, setReference] = useState(
    currentValues.reference as { relationTo: string; value: number } | null
  );
  const [appearanceType, setAppearanceType] = useState(
    (currentValues.appearanceType as string) ?? ""
  );
  const [buttonVariant, setButtonVariant] = useState(
    (currentValues.buttonVariant as string) ?? ""
  );
  const [buttonSize, setButtonSize] = useState(
    (currentValues.buttonSize as string) ?? ""
  );
  const [linkVariant, setLinkVariant] = useState(
    (currentValues.linkVariant as string) ?? ""
  );

  const update = useCallback(
    (subField: string, value: unknown) => {
      actions.updateField(blockIndex, `${fieldPath}.${subField}`, value);
    },
    [actions, blockIndex, fieldPath]
  );

  // Appearance fields — only render if they exist in the field descriptors
  const hasAppearance =
    "buttonVariant" in fields ||
    "buttonSize" in fields ||
    "linkVariant" in fields;

  return (
    <Popover open onOpenChange={(open) => { if (!open) onClose(); }}>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Edit Link
          </span>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Type toggle */}
          <SegmentedToggle
            options={[
              { label: "External", value: "external" },
              { label: "Internal", value: "internal" },
            ]}
            value={linkType}
            onChange={(v) => { setLinkType(v); update("type", v); }}
          />

          {/* Destination field — switches based on type */}
          {linkType === "external" ? (
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                URL
              </div>
              <Input
                className="h-8 text-xs"
                defaultValue={url}
                placeholder="https://..."
                onBlur={(e) => { setUrl(e.target.value); update("url", e.target.value); }}
              />
            </div>
          ) : (
            <PageCombobox
              value={reference}
              onChange={(ref) => { setReference(ref); update("reference", ref); }}
            />
          )}

          {/* New Tab */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Open in new tab</span>
            <Switch
              checked={newTab}
              onCheckedChange={(v) => { setNewTab(v); update("newTab", v); }}
            />
          </div>

          {/* Appearance section — only if configured */}
          {hasAppearance && (
            <>
              <div className="border-t" />

              {fields.appearanceType && (
                <SegmentedToggle
                  options={
                    (fields.appearanceType as FieldDescriptor).options ?? []
                  }
                  value={appearanceType}
                  onChange={(v) => { setAppearanceType(v); update("appearanceType", v); }}
                />
              )}

              {fields.buttonVariant &&
                appearanceType === "button" && (
                  <PillSelector
                    label="Variant"
                    options={
                      (fields.buttonVariant as FieldDescriptor).options ?? []
                    }
                    value={buttonVariant}
                    onChange={(v) => { setButtonVariant(v); update("buttonVariant", v); }}
                  />
                )}

              {fields.buttonSize &&
                appearanceType === "button" && (
                  <PillSelector
                    label="Size"
                    options={
                      (fields.buttonSize as FieldDescriptor).options ?? []
                    }
                    value={buttonSize}
                    onChange={(v) => { setButtonSize(v); update("buttonSize", v); }}
                  />
                )}

              {fields.linkVariant &&
                appearanceType === "link" && (
                  <PillSelector
                    label="Variant"
                    options={
                      (fields.linkVariant as FieldDescriptor).options ?? []
                    }
                    value={linkVariant}
                    onChange={(v) => { setLinkVariant(v); update("linkVariant", v); }}
                  />
                )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Register in the group editor registry
registerGroupEditor("link", LinkEditorPopover);

export { LinkEditorPopover };
```

- [ ] **Step 3: Create barrel import to ensure registration runs**

Create `src/components/features/frontend-editor/group-editors/index.ts`:

```ts
// Import all group editors to ensure their registerGroupEditor() side effects run.
import "./link-editor-popover";
```

- [ ] **Step 4: Import the barrel in the orchestrator**

Add to the top of `field-editor-orchestrator.tsx`:

```ts
import "./group-editors";
```

- [ ] **Step 5: Lint check**

```bash
bun check
```

- [ ] **Step 6: Build check**

```bash
bun build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/features/frontend-editor/group-editors/ src/components/features/frontend-editor/field-editor-orchestrator.tsx
git commit -m "feat(frontend-editor): add link editor popover with type toggle, page combobox, and appearance controls"
```

---

### Task 10: Wire up block components with data-field-group props

**Prerequisite:** Task 5 must be complete (CMSLink accepts `data-*` props via rest-spread). Verify by checking that `CMSLinkProps` in `src/components/ui/cms-link.tsx` includes the `[key: \`data-${string}\`]` index signature.

**Files:**
- Modify: `src/components/blocks/hero/hero.tsx`
- Modify: `src/components/blocks/cinematic-cta/cinematic-cta.tsx`
- Modify: `src/components/blocks/pricing/pricing-card.tsx`
- Modify: `src/components/blocks/split-media/split-media.tsx`
- Modify: `src/components/blocks/faq/faq.tsx`

**Context:**
- Each block that uses `<CMSLink>` needs to pass `data-field-group` and `data-field-group-type="link"` so the edit runtime can detect and bind to these elements.
- The `data-field-group` value must match the field path in the block schema (e.g., `primaryCta`, `secondaryCta`, `cta`).
- For arrays (pricing tiers, split-media rows), the path includes the array index: `tiers.{i}.cta`, `rows.{i}.cta`.

- [ ] **Step 1: Update Hero block**

In `hero.tsx`, add to both CMSLink components:

```tsx
<CMSLink
  link={primaryCta}
  className="bg-white text-black hover:bg-white/90"
  data-field-group="primaryCta"
  data-field-group-type="link"
/>
<CMSLink
  link={secondaryCta}
  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
  data-field-group="secondaryCta"
  data-field-group-type="link"
/>
```

- [ ] **Step 2: Update CinematicCta block**

```tsx
<CMSLink
  className="mt-6 bg-white text-black hover:bg-white/90"
  link={cta}
  data-field-group="cta"
  data-field-group-type="link"
/>
```

- [ ] **Step 3: Update Pricing block**

In `pricing-card.tsx`, the CTA is inside a tier array item. The `data-field-group` needs the array path. The component receives `index` as a prop (or the tier index). Add:

```tsx
<CMSLink
  className={cn("w-full", rec && "bg-primary-foreground text-primary hover:bg-primary-foreground/90")}
  link={tier.cta}
  data-field-group={`tiers.${tierIndex}.cta`}
  data-field-group-type="link"
/>
```

Note: verify the component's props to determine how `tierIndex` is available. If the component receives `index` prop, use that. If it maps tiers in the parent, pass the index down.

- [ ] **Step 4: Update SplitMedia block**

```tsx
<CMSLink
  className="group text-foreground"
  link={row.cta}
  data-field-group={`rows.${rowIndex}.cta`}
  data-field-group-type="link"
/>
```

- [ ] **Step 5: Update Faq block**

```tsx
<CMSLink
  className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70"
  link={cta}
  data-field-group="cta"
  data-field-group-type="link"
/>
```

- [ ] **Step 6: Lint check**

```bash
bun check
```

- [ ] **Step 7: Build check**

```bash
bun build
```

- [ ] **Step 8: Run all tests**

```bash
bun test
```

Ensure no regressions across the entire test suite.

- [ ] **Step 9: Commit**

```bash
git add src/components/blocks/
git commit -m "feat(blocks): add data-field-group attributes to CMSLink instances for frontend editor"
```

---

### Task 11: Regenerate field map and verify end-to-end

**Files:**
- Modify: `src/generated/field-map.ts` (auto-generated)

**Context:**
- The field map is generated from block schemas. After adding `custom: { groupType: "link" }` to `link.ts`, the generated field map should now contain `GroupFieldDescriptor` entries for all link fields.
- Check how the field map is generated — look for a script or build step.

- [ ] **Step 1: Regenerate the field map**

```bash
bun generate:field-map
```

This runs `scripts/generate-field-map.ts`, which imports all block schemas, calls `introspectBlocks()`, and writes the output to `src/generated/field-map.ts`.

- [ ] **Step 2: Verify the generated field map contains group descriptors**

Read the generated file and confirm that link fields appear as `{ type: "group", groupType: "link", fields: { ... } }` instead of flattened dot-paths.

- [ ] **Step 3: Full build verification**

```bash
bun build
```

- [ ] **Step 4: Run all tests**

```bash
bun test
```

- [ ] **Step 5: Lint check**

```bash
bun check
```

- [ ] **Step 6: Commit (if field map changed)**

```bash
git add src/generated/field-map.ts
git commit -m "chore: regenerate field map with GroupFieldDescriptor for link fields"
```
