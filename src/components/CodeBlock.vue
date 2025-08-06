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
    default: "ts",
  },
});

const isDark = inject<Ref<boolean>>("isDark");
const currentTheme = computed(() => (isDark!.value ? "github-dark" : "github-light"));

const highlightedHtml = ref("");
let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

const highlight = async () => {
  highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: langs,
  });
  try {
    if (!props.preview && !props.comparedPreview) {
      highlightedHtml.value = renderDefault(highlighter, props.lang, currentTheme.value);
    }
    if (props.preview && props.comparedPreview) {
      const diffLines = countDiffLines(props.preview, props.comparedPreview);
      highlightedHtml.value = renderDiffHtml(diffLines, highlighter, props.lang, currentTheme.value);
    } else if (props.preview) {
      highlightedHtml.value = renderHtml(highlighter, props.preview, props.lang, currentTheme.value);
    } else {
      highlightedHtml.value = renderHtml(highlighter, props.comparedPreview, props.lang, currentTheme.value);
    }
  } catch (error) {
    console.log("Display Code", error);
    highlightedHtml.value = renderDefault(highlighter, props.lang, currentTheme.value);
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
  <div class="code-wrapper" v-html="highlightedHtml" />
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

.code-wrapper .line-number {
  width: 3em;
  padding: 0 8px;
  text-align: right;
  color: #7d8590;
  user-select: none;
}

.code-wrapper .line-content {
  padding: 0 16px;
  flex: 1;
  white-space: pre;
}

.code-wrapper {
  &.old-line-num {
    background-color: #21262d;
    border-right: 1px solid #30363d;
  }

  &.new-line-num {
    background-color: #161b22;
    border-right: 1px solid #30363d;
  }
}

.code-wrapper .diff-line {
  & {
    display: flex;
    min-height: 1.5em;
    line-height: 1.5em;
  }

  &.diff-added {
    & {
      background-color: #0d4429;
    }

    &.line-content::before {
      content: "+ ";
      color: #238636;
      font-weight: bold;
    }
  }

  &.diff-removed {
    & {
      background-color: #5a1e1e;
    }

    &.line-content::before {
      content: "- ";
      color: #da3633;
      font-weight: bold;
    }
  }

  &.diff-unchanged {
    background-color: transparent;
  }
}
</style>
