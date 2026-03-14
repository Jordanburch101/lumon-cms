import type { BlockFieldMap } from "@/payload/lib/field-map/types";

export interface GroupEditorProps {
  anchorEl: HTMLElement;
  blockIndex: number;
  currentValues: Record<string, unknown>;
  fieldPath: string;
  fields: BlockFieldMap;
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
