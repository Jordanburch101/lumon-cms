/** Descriptor for a single editable field. */
export interface FieldDescriptor {
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
  required?: boolean;
  hasMany?: boolean;
  localized?: boolean;
  // number
  min?: number;
  max?: number;
  // text / textarea
  minLength?: number;
  maxLength?: number;
  // select / radio
  options?: { label: string; value: string }[];
  // upload / relationship
  relationTo?: string | string[];
}

/** Descriptor for an array field containing nested fields. */
export interface ArrayFieldDescriptor {
  type: "array";
  minRows?: number;
  maxRows?: number;
  fields: BlockFieldMap;
}

/** A single entry in a block's field map — either a leaf field or a nested array. */
export type FieldEntry = FieldDescriptor | ArrayFieldDescriptor;

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
