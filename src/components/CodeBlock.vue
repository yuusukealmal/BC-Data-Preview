<script setup lang="ts">
import { type Ref, ref, watch, onUnmounted, inject, computed } from "vue";

import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from "shiki";

import { countDiffLines } from "../utils/diff/lineCount";
import { renderDefault, renderDiffHtml, renderHtml } from "../utils/diff/diffCreator";
import { langs } from "../utils/diff/lang";
import { useFileStore } from "../store/fileStore";

const props = defineProps({
  preview: {
    type: String,
    required: true,
  },
  comparedPreview: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    required: true,
  },
});

const isDark = inject<Ref<boolean>>("isDark");
const currentTheme = computed(() => (isDark!.value ? "github-dark" : "github-light"));

const highlightedHtml = ref<HTMLDivElement | null>(null);
const diffAddCount = ref<HTMLSpanElement | null>(null);
const diffRemoveCount = ref<HTMLSpanElement | null>(null);

const fileStore = useFileStore();
const fileInfo = computed(() => fileStore.selectedFile);

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

const highlight = async () => {
  if (!highlightedHtml.value) return;

  highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: langs,
  });
  try {
    if (!props.preview && !props.comparedPreview) {
      highlightedHtml.value!.innerHTML = renderDefault(highlighter, currentTheme.value);
    }
    if (props.preview && props.comparedPreview) {
      const diffLines = countDiffLines(props.preview, props.comparedPreview);
      highlightedHtml.value!.innerHTML = renderDiffHtml(diffLines.lines, highlighter, props.lang, currentTheme.value);
      diffAddCount.value!.innerText = `+${diffLines.total.added}`;
      diffRemoveCount.value!.innerText = `-${diffLines.total.removed}`;
    } else if (props.preview) {
      highlightedHtml.value!.innerHTML = renderHtml(highlighter, props.preview, props.lang, currentTheme.value);
    } else {
      highlightedHtml.value!.innerHTML = renderHtml(highlighter, props.comparedPreview, props.lang, currentTheme.value);
    }
  } catch (error) {
    console.log("Display Code", error);
    highlightedHtml.value!.innerHTML = renderDefault(highlighter, currentTheme.value);
  }
};

onUnmounted(() => {
  if (highlighter) {
    highlighter.dispose();
    highlighter = null;
  }
});

watch(
  () => [props.preview, props.comparedPreview, props.lang, currentTheme.value],
  async () => {
    if (highlighter !== null) {
      highlighter.dispose();
      highlighter = null;
    }
    await highlight();
  },
  { immediate: true },
);
</script>

<template>
  <div class="codeblock-container">
    <div class="counter-wrapper">
      <span class="file-name">{{ fileInfo?.name }}</span>
      <span class="diff-add-count" ref="diffAddCount"></span>
      <span class="diff-remove-count" ref="diffRemoveCount"></span>
    </div>
    <div ref="highlightedHtml" class="code-wrapper" />
  </div>
</template>

<style>
.codeblock-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.counter-wrapper {
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  border: 1px solid var(--border-color);
}

.counter-wrapper span {
  margin-right: 12px;
}
.counter-wrapper .file-name {
  opacity: 0.7;
}
.counter-wrapper .diff-add-count {
  color: var(--diff-line-count-add-color);
}
.counter-wrapper .diff-remove-count {
  color: var(--diff-line-count-remove-color);
}

.code-wrapper {
  font-size: 14px;
  overflow: auto;
}

.code-wrapper pre {
  overflow-x: auto;
}

.code-wrapper code {
  background: transparent;
  padding: 0;
  font-family: inherit;
}

.code-wrapper .line-number {
  width: 3em;
  padding: 0 8px;
  text-align: right;
  color: var(--diff-line-number);
  user-select: none;
  flex-shrink: 0;
}

.code-wrapper .line-content {
  padding: 0 16px;
  flex: 1;
  white-space: pre;
}

.code-wrapper .old-line-num {
  background-color: var(--old-diff-line-number-background);
  border-right: 1px solid #30363d;
}
.code-wrapper .new-line-num {
  background-color: var(--new-diff-line-number-background);
  border-right: 1px solid #30363d;
}

.code-wrapper .file-line {
  display: flex;
  min-height: 1.5em;
  line-height: 1.5em;
}

.code-wrapper .file-line.diff-added {
  background-color: var(--diff-line-add-background);
}
.code-wrapper .file-line.diff-added .line-content::before {
  content: "+ ";
  color: var(--diff-before-mark-color);
  opacity: 0.7;
}

.code-wrapper .file-line.diff-removed {
  background-color: var(--diff-line-remove-background);
}
.code-wrapper .file-line.diff-removed .line-content::before {
  content: "- ";
  color: var(--diff-before-mark-color);
  opacity: 0.7;
}

.code-wrapper .file-line.diff-unchanged {
  background-color: transparent;
}
.code-wrapper .file-line.diff-unchanged .line-content::before {
  content: "  ";
}
</style>
