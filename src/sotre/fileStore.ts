import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";

import { type CountryCode, type FileType, type FileInfo, type List, type LabeledFile, type FileStatus, FILE_TYPE_LIST } from "../types";
import { aesECBDecrypt } from "../utils/crypto/decrypt";
import { getFileHash } from "../utils/crypto/md5Hash";

export const useFileStore = defineStore("useFileStore", () => {
  // state
  const selectedCC = ref<CountryCode>();
  const selectedVersion = ref<string>();
  const selectedComparedVersion = ref<string>();
  const selectedFileType = ref<FileType>(FILE_TYPE_LIST[0]);
  const keyWordValue = ref<string>("");
  const selectedDiffType = ref<FileStatus>("normal");
  const selectedFile = ref<FileInfo>();

  // buffer
  const listBuffer = ref<ArrayBuffer>();
  const packBuffer = ref<ArrayBuffer>();
  const comparedListBuffer = ref<ArrayBuffer>();
  const comparedPackBuffer = ref<ArrayBuffer>();

  // decrypted list
  const list = ref<List | null>(null);
  const comparedList = ref<List | null>(null);
  const mergedList = ref<LabeledFile[]>([]);

  // lazy load
  const visibleItems = ref<LabeledFile[]>([]);
  const currentPage = ref(0);
  const isLoading = ref(false);
  const itemsPerPage = 50;

  // md5 hash
  const fileHashCache = new Map<string, string>();
  const comparedFileHashCache = new Map<string, string>();

  // computed
  const filterListFiles = computed(() => {
    let filtered = mergedList.value || [];

    if (keyWordValue.value) {
      filtered = filtered.filter((file) => file.info.name.includes(keyWordValue.value));
    }

    if (selectedDiffType.value !== "normal") {
      filtered = filtered.filter((file) => file.label === selectedDiffType.value);
    }

    return filtered;
  });

  const loadData = async () => {
    try {
      const fileBase = `/${selectedCC.value}/${selectedVersion.value}/${selectedFileType.value}`;

      const listFile = await fetch(`${fileBase}.list`);
      const packFile = await fetch(`${fileBase}.pack`);

      const listContentType = listFile.headers.get("content-type");
      const packContentType = packFile.headers.get("content-type");

      if (listContentType?.includes("text/html") || packContentType?.includes("text/html")) {
        throw new Error("Files not found");
      }

      listBuffer.value = await listFile.arrayBuffer();
      packBuffer.value = await packFile.arrayBuffer();

      decryptList();
    } catch (error) {
      listBuffer.value = undefined;
      packBuffer.value = undefined;
      console.error("Failed to Load File:", error);
    }
  };

  const loadComparedData = async () => {
    if (!selectedComparedVersion.value) {
      comparedListBuffer.value = undefined;
      comparedPackBuffer.value = undefined;
      return;
    }

    try {
      const comparedFileBase = `/${selectedCC.value}/${selectedComparedVersion.value}/${selectedFileType.value}`;

      const comparedListFile = await fetch(`${comparedFileBase}.list`);
      const comparedPackFile = await fetch(`${comparedFileBase}.pack`);

      const comparedListContentType = comparedListFile.headers.get("content-type");
      const comparedPackContentType = comparedPackFile.headers.get("content-type");

      if (comparedListContentType?.includes("text/html") || comparedPackContentType?.includes("text/html")) {
        throw new Error("Files not found");
      }

      comparedListBuffer.value = await comparedListFile.arrayBuffer();
      comparedPackBuffer.value = await comparedPackFile.arrayBuffer();

      decryptComparedList();
    } catch (error) {
      comparedListBuffer.value = undefined;
      comparedPackBuffer.value = undefined;
      console.error("Failed to Load File:", error);
    }
  };

  const decryptList = () => {
    const rawData = listBuffer.value ? aesECBDecrypt(listBuffer.value) : "";
    list.value = {
      files: rawData
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
  };

  const decryptComparedList = () => {
    const rawData = comparedListBuffer.value ? aesECBDecrypt(comparedListBuffer.value) : "";
    comparedList.value = {
      files: rawData
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
  };

  const calcFileStatus = async (fileName: string, currentFile?: FileInfo, comparedFile?: FileInfo): Promise<FileStatus> => {
    if (!currentFile && !comparedFile) throw new Error("No File");
    if (!currentFile) return "add";
    if (!comparedFile) return "delete";

    try {
      let currentHash = fileHashCache.get(fileName);
      let comparedHash = comparedFileHashCache.get(fileName);

      if (!currentHash && packBuffer.value) {
        currentHash = await getFileHash(packBuffer.value, currentFile);
        fileHashCache.set(fileName, currentHash);
      }

      if (!comparedHash && comparedPackBuffer.value) {
        comparedHash = await getFileHash(comparedPackBuffer.value, comparedFile);
        comparedFileHashCache.set(fileName, comparedHash);
      }

      if (currentHash && comparedHash) {
        return currentHash === comparedHash ? "normal" : "modify";
      }
    } catch (error) {
      console.error(`Error when clac ${fileName} Md5:`, error);
    }

    return "normal";
  };

  const mergeList = async () => {
    const listFiles = list.value?.files || [];
    const comparedFiles = comparedList.value?.files || [];

    fileHashCache.clear();
    comparedFileHashCache.clear();
    resetLazyLoading();

    if (comparedFiles.length === 0) {
      mergedList.value = listFiles.map((file) => ({ info: file, label: "normal" }));
      return;
    }

    if (listFiles.length === 0) {
      mergedList.value = comparedFiles.map((file) => ({ info: file, label: "add" }));
      return;
    }

    const aMap = new Map(listFiles.map((item) => [item.name, item]));
    const bMap = new Map(comparedFiles.map((item) => [item.name, item]));
    const fileNames = [...new Set([...aMap.keys(), ...bMap.keys()])];

    mergedList.value = fileNames.map((name) => {
      const [aItem, bItem] = [aMap.get(name), bMap.get(name)];
      return { info: (aItem || bItem)!, label: "normal" };
    });

    const statusList = await Promise.all(
      fileNames.map((name) => {
        const aItem = aMap.get(name);
        const bItem = bMap.get(name);
        return calcFileStatus(name, aItem, bItem);
      }),
    );

    mergedList.value = fileNames.map((name, i) => {
      const info = aMap.get(name) || bMap.get(name);
      return {
        info: info!,
        label: statusList[i],
      };
    });
  };

  const resetLazyLoading = () => {
    currentPage.value = 0;
    visibleItems.value = [];
    loadItems();
  };

  const loadItems = () => {
    if (isLoading.value) return;

    isLoading.value = true;
    const startIndex = currentPage.value * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newItems = filterListFiles.value.slice(startIndex, endIndex);

    if (newItems.length > 0) {
      visibleItems.value.push(...newItems);
      currentPage.value++;
    }

    isLoading.value = false;
  };

  const setSelectedFile = (file: FileInfo) => {
    selectedFile.value = file;
  };

  watch(filterListFiles, () => {
    currentPage.value = 0;
    visibleItems.value = [];
    loadItems();
  });

  watch(selectedVersion, async () => {
    await loadData();
  });

  watch(selectedComparedVersion, async () => {
    await loadComparedData();
  });

  watch([list, comparedList], async () => {
    await mergeList();
  });

  watch(selectedFileType, async () => {
    await loadData();
    await loadComparedData();
  });

  watch(keyWordValue, () => {
    resetLazyLoading();
  });

  watch(selectedDiffType, () => {
    resetLazyLoading();
  });

  return {
    selectedCC,
    selectedVersion,
    selectedComparedVersion,
    selectedFileType,
    keyWordValue,
    selectedDiffType,
    selectedFile,
    packBuffer,
    visibleItems,
    isLoading,

    filterListFiles,

    loadItems,
    setSelectedFile,
  };
});
