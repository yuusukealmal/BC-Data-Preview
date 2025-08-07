import type { HighlighterGeneric, BundledLanguage, BundledTheme } from "shiki";
import type { LineDiff } from "../../types";

const addLineNumbers = (html: string): string => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const pre = wrapper.querySelector("pre");
  const code = wrapper.querySelector("code");

  if (!pre || !code) return html;

  const lines = code.innerHTML.split(/\r?\n/);

  const numberedLines = lines
    .map((line, index) => {
      const lineNumber = index + 1;
      return `<div class="file-line">
      <span class="line-number">${lineNumber}</span>
      <span class="line-content">${line || " "}</span>
    </div>`;
    })
    .join("");

  code.innerHTML = numberedLines;

  return wrapper.innerHTML;
};

export const renderDefault = (highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null, theme: string) => {
  if (!highlighter) return "";

  const defaultContent = 'const greet = () => {\n    console.log("Hello, world!");\n};\n\ngreet();';
  try {
    return renderHtml(highlighter, defaultContent, "ts", theme);
  } catch {
    return `<pre><code>${defaultContent}</code></pre>`;
  }
};

export const renderHtml = (highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null, content: string, lang: string, theme: string) => {
  if (!highlighter) return content;

  try {
    const raw = highlighter!.codeToHtml(content, {
      lang,
      theme,
    });
    const rawWithLine = addLineNumbers(raw);
    return rawWithLine;
  } catch {
    return content;
  }
};

export const renderDiffHtml = (diffLines: LineDiff[], highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null, lang: string, theme: string) => {
  if (!highlighter) return renderDefault(highlighter, theme);

  const diffHtml = diffLines
    .map((line) => {
      const highlightedContent = highlighter.codeToHtml(line.content || " ", {
        lang: lang,
        theme: theme,
      });

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = highlightedContent;
      const codeContent = tempDiv.querySelector("code")?.innerHTML || line.content;

      const oldLineNum = line.oldLineNum ? line.oldLineNum.toString() : "";
      const newLineNum = line.newLineNum ? line.newLineNum.toString() : "";

      return `<div class="file-line diff-${line.type}">
      <span class="line-number old-line-num">${oldLineNum}</span>
      <span class="line-number new-line-num">${newLineNum}</span>
      <span class="line-content">${codeContent}</span>
    </div>`;
    })
    .join("");

  return `<pre class="diff-container"><code>${diffHtml}</code></pre>`;
};
