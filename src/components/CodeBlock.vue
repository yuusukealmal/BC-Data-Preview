<script setup lang="ts">
import { type Ref, ref, watch, onUnmounted, inject, computed } from "vue";

import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from "shiki";

import { countDiffLines } from "../utils/diff/lineCount";
import { renderDefault, renderDiffHtml, renderHtml } from "../utils/diff/diffCreator";
import { langs } from "../utils/diff/lang";

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
      highlightedHtml.value!.innerHTML = renderDiffHtml(diffLines, highlighter, props.lang, currentTheme.value);
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
  <div ref="highlightedHtml" class="code-wrapper" />
</template>

<style>
.code-wrapper {
  font-size: 14px;
}

.code-wrapper pre {
  overflow-x: auto;
}

.code-wrapper code {
  background: transparent;
  padding: 0;
  font-family: inherit;
}

.code-wrapper .diff-line-number {
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

.code-wrapper .diff-line {
  display: flex;
  min-height: 1.5em;
  line-height: 1.5em;
}

.code-wrapper .diff-line.diff-added {
  background-color: var(--diff-line-add-background);
}
.code-wrapper .diff-line.diff-added .line-content::before {
  content: "+ ";
  color: var(--diff-before-mark-color);
  font-weight: bold;
  opacity: 0.7;
}

.code-wrapper .diff-line.diff-removed {
  background-color: var(--diff-line-remove-background);
}
.code-wrapper .diff-line.diff-removed .line-content::before {
  content: "- ";
  color: var(--diff-before-mark-color);
  font-weight: bold;
  opacity: 0.7;
}

.code-wrapper .diff-line.diff-unchanged {
  background-color: transparent;
}
.code-wrapper .diff-line.diff-unchanged .line-content::before {
  content: "  ";
}
</style>
