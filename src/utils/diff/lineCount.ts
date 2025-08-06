import type { FileDiffLines } from "../../types";

export const countDiffLines = (text: string, comparedText: string) => {
  const lines = text.split("\n");
  const comparedLines = comparedText.split("\n");

  const diff: FileDiffLines[] = [];
  const max = Math.max(lines.length, comparedLines.length);

  for (let i = 0; i < max; i++) {
    const content = lines[i] || "";
    const comparedContent = comparedLines[i] || "";

    if (content === comparedContent) {
      diff.push({ type: "unchanged", content: content, oldLineNum: i + 1, newLineNum: i + 1 });
    } else if (lines[i] === undefined) {
      diff.push({ type: "added", content: comparedContent, oldLineNum: null, newLineNum: i + 1 });
    } else if (comparedLines[i] === undefined) {
      diff.push({ type: "removed", content: content, oldLineNum: i + 1, newLineNum: null });
    } else {
      diff.push({ type: "removed", content: content, oldLineNum: i + 1, newLineNum: null });
      diff.push({ type: "added", content: comparedContent, oldLineNum: null, newLineNum: i + 1 });
    }
  }

  return diff;
};
