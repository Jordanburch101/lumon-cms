/**
 * Activates contentEditable on a DOM element for inline text editing.
 * Syncs to edit mode state on blur.
 */
export function activateTextEditor(
  element: HTMLElement,
  blockIndex: number,
  fieldPath: string,
  onUpdate: (blockIndex: number, path: string, value: string) => void
): () => void {
  element.contentEditable = "true";
  element.style.cursor = "text";
  element.style.outline = "none";

  const handleBlur = () => {
    const value = element.textContent ?? "";
    onUpdate(blockIndex, fieldPath, value);
  };

  element.addEventListener("blur", handleBlur);

  return () => {
    element.contentEditable = "false";
    element.style.cursor = "";
    element.removeEventListener("blur", handleBlur);
  };
}
