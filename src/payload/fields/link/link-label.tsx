"use client";

const RE_CAMEL = /([A-Z])/g;
const RE_FIRST_CHAR = /^./;

export function LinkLabel({ fieldName }: { fieldName: string }) {
  const formatted = fieldName
    .replace(RE_CAMEL, " $1")
    .replace(RE_FIRST_CHAR, (s) => s.toUpperCase())
    .trim();

  return <span>{formatted}</span>;
}
