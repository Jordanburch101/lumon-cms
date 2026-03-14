"use client";

const RE_CAMEL = /([A-Z])/g;
const RE_FIRST_CHAR = /^./;

export default function LinkLabel({ fieldName }: { fieldName: string }) {
  const formatted = fieldName
    .replace(RE_CAMEL, " $1")
    .replace(RE_FIRST_CHAR, (s) => s.toUpperCase())
    .trim();

  return (
    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>{formatted}</span>
  );
}
