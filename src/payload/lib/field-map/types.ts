/** Descriptor for a single editable field. */
export interface FieldDescriptor {
  hasMany?: boolean;
  localized?: boolean;
  max?: number;
  maxLength?: number;
  // number
  min?: number;
  // text / textarea
  minLength?: number;
  // select / radio
  options?: { label: string; value: string }[];
  // upload / relationship
  relationTo?: string | string[];
  required?: boolean;
  type:
    | "text"
    | "textarea"
    | "email"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "point"
    | "code"
    | "json"
    | "upload"
    | "relationship";
}

/** Descriptor for an array field containing nested fields. */
export interface ArrayFieldDescriptor {
  fields: BlockFieldMap;
  maxRows?: number;
  minRows?: number;
  type: "array";
}

/** Descriptor for a composite field group (e.g., link) that is edited as a unit. */
export interface GroupFieldDescriptor {
  fields: BlockFieldMap;
  groupType: string;
  type: "group";
}

/** A single entry in a block's field map — either a leaf field or a nested array. */
export type FieldEntry =
  | FieldDescriptor
  | ArrayFieldDescriptor
  | GroupFieldDescriptor;

/** Map of field paths → descriptors for a single block type. */
export type BlockFieldMap = Record<string, FieldEntry>;

/** Top-level field map: block slug → its field map. */
export type FieldMap = Record<string, BlockFieldMap>;

/** Metadata for a block type (used by the block picker). */
export interface BlockMeta {
  label: string;
  slug: string;
}

/** Map of block slug → metadata. */
export type BlockMetaMap = Record<string, BlockMeta>;
