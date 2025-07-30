<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import Prism from "prismjs";
// theme
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";

// line number
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

const props = defineProps({
  code: {
    type: String,
    default: `const main = () => {
  console.log('Hello World!');
}`,
  },
  language: {
    type: String,
    default: "ts",
  },
});

const codeBlock = ref<HTMLElement | null>(null);
const codes = ref();

const highLight = () => {
  if (codeBlock.value) {
    codeBlock.value.textContent = props.code;
    Prism.highlightElement(codeBlock.value);
  }
};

onMounted(() => highLight());
watch(() => props.code, highLight);
</script>

<template>
  <pre class="language-ts line-numbers"><code ref="codeBlock">{{codes}}</code></pre>
</template>

<style scoped>
pre {
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>
