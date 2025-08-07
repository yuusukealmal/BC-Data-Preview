import type { DiffCounts } from "../../types";

export const countDiffLines = (text: string, comparedText: string) => {
  const lines = text.split("\n");
  const comparedLines = comparedText.split("\n");

  const diff: DiffCounts = {
    total: {
      added: 0,
      removed: 0,
    },
    lines: [],
  };
  const max = Math.max(lines.length, comparedLines.length);

  for (let i = 0; i < max; i++) {
    const content = lines[i] || "";
    const comparedContent = comparedLines[i] || "";

    if (content === comparedContent) {
      diff.lines.push({ type: "unchanged", content: content, oldLineNum: i + 1, newLineNum: i + 1 });
    } else if (lines[i] === undefined) {
      diff.total.added++;
      diff.lines.push({ type: "added", content: comparedContent, oldLineNum: null, newLineNum: i + 1 });
    } else if (comparedLines[i] === undefined) {
      diff.total.removed++;
      diff.lines.push({ type: "removed", content: content, oldLineNum: i + 1, newLineNum: null });
    } else {
      diff.total.removed++;
      diff.total.added++;
      diff.lines.push({ type: "removed", content: content, oldLineNum: i + 1, newLineNum: null });
      diff.lines.push({ type: "added", content: comparedContent, oldLineNum: null, newLineNum: i + 1 });
    }
  }

  return diff;
};
