---
name: shadcn-date-picker-task
description: Replace native HTML date input with shadcn DatePicker in block editor dialog and future date fields
type: project
---

Use shadcn DatePicker component instead of native HTML `<input type="date">` for date fields in the block editor dialog (`block-editor-dialog.tsx` FieldInput case "date").

**Why:** The native date picker looks out of place with the rest of the UI and doesn't match the design language. User explicitly requested shadcn date picker after seeing the native browser datepicker in the Published At field of the Latest Articles block editor.

**How to apply:** Install/add shadcn calendar + date-picker components, then replace the `case "date"` in `FieldInput` with a proper `DatePicker` using `Popover` + `Calendar` from shadcn. Also apply to any future date field editors.
