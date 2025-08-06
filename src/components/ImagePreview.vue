@ -0,0 +1,64 @@
<script setup lang="ts">
import { computed, type PropType } from "vue";
import { useFileStore } from "../store/fileStore";
import type { PreviewImage } from "../types";

const props = defineProps({
  previewImage: {
    type: Object as PropType<PreviewImage>,
    required: true,
  },
  comparedPreviewImage: {
    type: Object as PropType<PreviewImage>,
    required: true,
  },
});

const fileStore = useFileStore();
const fileInfo = computed(() => fileStore.selectedFile);
console.log(props.previewImage);
console.log(props.comparedPreviewImage);
</script>

<template>
  <div class="image-wrapper">
    <div v-if="previewImage.url">
      <img :src="previewImage.url" :alt="fileInfo!.name" />
      <span>W: {{ previewImage.info.width }}px | H: {{ previewImage.info.height }}px | Size: {{ previewImage.info.size }} Kib</span>
    </div>
    <div v-if="comparedPreviewImage.url">
      <img :src="comparedPreviewImage.url" :alt="fileInfo!.name" />
      <span>W: {{ comparedPreviewImage.info.width }}px | H: {{ comparedPreviewImage.info.height }}px | Size: {{ comparedPreviewImage.info.size }} Kib</span>
    </div>
  </div>
</template>

<style scoped>
.image-wrapper {
  & {
    height: 100%;
    display: flex;
    overflow: hidden;
  }

  div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  span {
    margin-top: 0.5em;
    opacity: 0.3;
  }

  img {
    border: 1px solid rgba(255, 0, 0, 0.5);
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}
</style>
