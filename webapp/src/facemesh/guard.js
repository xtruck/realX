// Step S5: the "Virtual face" label must stay readable on screen while a photo is drawn, or the photo is paused.
//
// `labelProblem` is pure (a description of the label in, a reason or "" out) so node can test it. `readLabel` collects
// that description from the page: whether the label exists, is shown, is opaque enough, is big enough, is inside the window
// and is the thing on top at its own position (nothing covers it). Numbers and booleans only: it never touches a picture.
//
// What this is and is not: it keeps an honest page honest and makes hiding the label a visible failure instead of a silent
// one. It does not stop someone who edits the page's own code; a label that cannot be removed from the pixels realX sends
// out is the job of the output stage (step S7), see docs/FACEMESH.md.

export const LABEL = "Virtual face";
const MIN_OPACITY = 0.6, MIN_WIDTH = 120, MIN_HEIGHT = 14, MIN_FONT_PX = 11;

/** "" when the label is fine, else a short reason. `info` is what readLabel returns; `view` is { width, height } of the window. */
export function labelProblem(info, view) {
  if (!info || !info.present) return `the "${LABEL}" label is missing`;
  if (info.hidden || info.display === "none" || info.visibility === "hidden" || info.visibility === "collapse") return `the "${LABEL}" label is hidden`;
  if (!(info.opacity >= MIN_OPACITY)) return `the "${LABEL}" label is see-through`;
  if (typeof info.text !== "string" || !info.text.includes(LABEL)) return `the label no longer says "${LABEL}"`;
  const r = info.rect;
  if (!r || !(r.width >= MIN_WIDTH) || !(r.height >= MIN_HEIGHT)) return `the "${LABEL}" label is too small`;
  if (!(info.fontPx >= MIN_FONT_PX)) return `the "${LABEL}" label's text is too small`;
  if (view && (r.left < 0 || r.top < 0 || r.right > view.width || r.bottom > view.height)) return `the "${LABEL}" label is outside the window`;
  if (info.covered) return `something covers the "${LABEL}" label`;
  return "";
}

/** The label element's state, gathered from the page. `doc` and `win` are document and window (or stand-ins in a test). */
export function readLabel(doc, win, el) {
  if (!el || !el.isConnected) return { present: false };
  let opacity = 1, display = "", visibility = "visible", hidden = false;
  for (let node = el; node && node.nodeType === 1; node = node.parentElement) {   // the label and everything above it
    const style = win.getComputedStyle(node);
    opacity *= Number(style.opacity);
    if (style.display === "none") display = "none";
    if (style.visibility !== "visible" && node === el) visibility = style.visibility;
    if (node.hidden) hidden = true;
  }
  const rect = el.getBoundingClientRect();
  const style = win.getComputedStyle(el);
  const covered = !([[0.5, 0.5], [0.1, 0.5], [0.9, 0.5]].every(([fx, fy]) => {   // three points along the label: it must be on top of each
    const top = doc.elementFromPoint(rect.left + rect.width * fx, rect.top + rect.height * fy);
    return top === el || (top && el.contains(top));
  }));
  return {
    present: true, hidden, display, visibility, opacity, text: el.textContent, fontPx: parseFloat(style.fontSize) || 0, covered,
    rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
  };
}
