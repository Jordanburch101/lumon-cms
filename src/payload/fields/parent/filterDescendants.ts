import type { FilterOptionsProps, Where } from "payload";

export function filterDescendants({ id }: FilterOptionsProps): Where | boolean {
  if (!id) {
    return true;
  }
  return { id: { not_equals: id } };
}
