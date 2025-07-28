<script setup lang="ts">
import { ref, type PropType, watch } from "vue";
import type { countryCode, List, fileType } from "../types/index";
import { aesCBCDecrypt, aesECBDecrypt } from "../utils/crypto/decrypt";

const props = defineProps({
  cc: {
    type: String as PropType<countryCode>,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
});

const fileTypesList: fileType[] = ["DataLocal", "DownloadLocal", "ImageDataLocal", "ImageLocal", "MapLocal", "NumberLocal", "resLocal", "UnitLocal"] as const;

const selectedFileType = ref<fileType>(fileTypesList[0]);
const list = ref<List | null>(null);
const pack = ref<ArrayBuffer | null>(null);
const selectedFile = ref<string | null>(null);
const previewContent = ref<string | null>(null);
const previewImageUrl = ref<string | null>(null);

const loadData = async () => {
  if (!selectedFileType.value || !props.cc || !props.version) {
    list.value = null;
    return;
  }

  const listFile = await fetch(`/${props.cc}/${props.version}/${selectedFileType.value}.list`);
  const listResult = aesECBDecrypt(await listFile.arrayBuffer());

  list.value = {
    files: listResult
      .split("\n")
      .slice(1, -1)
      .map((item) => {
        const [name, start, offset] = item.split(",");
        return {
          name,
          start: Number(start),
          offset: Number(offset),
        };
      }),
  };

  const packFile = await fetch(`/${props.cc}/${props.version}/${selectedFileType.value}.pack`);
  pack.value = await packFile.arrayBuffer();
};

const selectFile = (idx: number) => {
  if (!list.value || !list.value.files || list.value.files.length === 0) {
    console.warn("No files available");
    return;
  }

  const file = list.value.files[idx];
  selectedFile.value = file.name;

  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
    previewImageUrl.value = null;
  }

  console.log("Selected CC:", props.cc);

  if (!pack.value) {
    console.warn("Pack data not available");
    previewContent.value = "Pack 數據未載入";
    return;
  }

  try {
    const data = aesCBCDecrypt(props.cc, file, pack.value);

    if (file.name.endsWith(".png")) {
      const blob = new Blob([data], { type: "image/png" });
      previewImageUrl.value = URL.createObjectURL(blob);
      previewContent.value = null;
    } else {
      previewContent.value = data as string;
      previewImageUrl.value = null;
    }
  } catch (error) {
    console.error("Error decrypting file:", error);
    previewContent.value = "解密文件時發生錯誤";
  }
};

watch([selectedFileType, () => props.cc, () => props.version], loadData, { immediate: true });
</script>

<template>
  <div class="file-type-selector select-wrapper">
    <span>文件類型：</span>
    <select v-model="selectedFileType">
      <option v-for="fileType in fileTypesList" :key="fileType" :value="fileType">
        {{ fileType }}
      </option>
    </select>
  </div>
  <div class="wrapper">
    <section>
      <div class="header">
        <h3>文件列表</h3>
        <span class="detail-info">{{ list?.files?.length || 0 }} 個文件</span>
      </div>
      <div class="file-list">
        <div v-for="(file, idx) in list.files" v-if="list?.files?.length" :key="file.name" class="file-item" :class="{ active: selectedFile === file.name }" @click="selectFile(idx)">
          <div>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-info">起始位置: {{ file.start }} | 大小: {{ file.offset }}</div>
          </div>
        </div>
        <div v-else class="no-files">
          <p>沒有可用的文件</p>
        </div>
      </div>
    </section>

    <section>
      <div class="header">
        <h3>文件預覽</h3>
        <span v-if="selectedFile" class="detail-info">當前選擇: {{ selectedFile }}</span>
      </div>
      <div class="preview-content">
        <div v-if="selectedFile" class="preview">
          <div class="preview-body">
            <div v-if="previewImageUrl" class="image-preview">
              <img :src="previewImageUrl" :alt="selectedFile" />
            </div>
            <div v-else>
              <pre>{{ previewContent }}</pre>
            </div>
          </div>
        </div>
        <div v-else class="no-files">
          <p>未選擇文件</p>
        </div>
      </div>
    </section>
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

.wrapper {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
}

section {
  width: 50%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  box-sizing: border-box;
  overflow: hidden;
}

.header {
  display: flex;
  border: 2px solid var(--border-color);
  padding: 8px 18px;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.header h3 {
  color: var(--text-primary);
  font-size: 20px;
}

.detail-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 12px;
  font-size: 16px;
  font-weight: 500;
}

.no-files {
  flex: 1;
  height: 100%;
  display: flex;
  padding: 24px;
  justify-content: center;
  align-items: center;
  color: var(--text-muted);
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.file-item {
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-primary);
}

.file-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color-light);
  transform: translateX(6px);
  box-shadow: var(--shadow-md);
}

.file-item.active {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-accent);
}

.file-name {
  margin-bottom: 0.3rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary);
  overflow: hidden;
}

.file-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 
to remove
*/
.preview-body {
  padding: 24px;
  border-radius: 10px;
  min-height: 300px;
  font-size: 14px;
  line-height: 1.6;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
}

.preview-body pre {
  color: var(--text-primary);
  background: var(--bg-code);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: "Courier New", monospace;
  border: 1px solid var(--border-color);
}

.preview-content {
  flex: 1;
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 1rem;
  overflow: auto;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.image-preview {
  justify-content: center;
  align-items: center;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}

/*
@media (max-width: 768px) {
  .manager {
    flex-direction: column;
  }

  .sidebar,
  .preview-section {
    width: 100%;
  }

  .sidebar {
    border-right: none;
    border-bottom: 2px solid var(--border-color);
  }
}
*/
</style>
