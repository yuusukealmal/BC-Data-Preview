<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { FILE_TYPE_LIST, type FileType } from "../types";

defineProps({
  selectedFileType: {
    type: Object as PropType<FileType>,
    required: true,
  },
  keyWord: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:selectedFileType", "update:keyWord"]);

const selectedFileType = ref<FileType>(FILE_TYPE_LIST[0]);
const keyWord = ref<string>("");

watch(selectedFileType, (newFileType) => {
  emit("update:selectedFileType", newFileType);
});

watch(keyWord, (newKeyWord) => {
  emit("update:keyWord", newKeyWord);
});
</script>

<template>
  <div class="file-type-selector select-wrapper">
    <span>文件類型：</span>
    <select v-model="selectedFileType">
      <option v-for="fileType in FILE_TYPE_LIST" :key="fileType" :value="fileType">
        {{ fileType }}
      </option>
    </select>
    <span>篩選: </span>
    <input v-model="keyWord" type="text" />
  </div>
</template>

<style scoped>
.file-type-selector {
  padding: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
