import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";

import { type CountryCode, type FileType, type FileInfo, type List, type LabeledFile, type FileStatus, FILE_TYPE_LIST } from "../types";
import { getList } from "../utils/crypto/decrypt";
import { getFileHash } from "../utils/crypto/md5Hash";
import { setQuery } from "../utils/routeController";

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
  const packBuffer = ref<ArrayBuffer>();
  const comparedPackBuffer = ref<ArrayBuffer>();

  // decrypted list
  const list = ref<List | null>(null);
  const comparedList = ref<List | null>(null);
  const mergedList = ref<LabeledFile[]>([]);

  // lazy load
  const visibleItems = ref<LabeledFile[]>([]);
  const currentPage = ref(0);
  const isLoading = ref(false);
  const PAGE_SIZE = 50;

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

  const loadFileData = async (version: string) => {
    const fileBase = `/${selectedCC.value}/${version}/${selectedFileType.value}`;

    try {
      const [listResponse, packResponse] = await Promise.all([fetch(`${fileBase}.list`), fetch(`${fileBase}.pack`)]);

      const listContentType = listResponse.headers.get("content-type");
      const packContentType = packResponse.headers.get("content-type");

      if (listContentType?.includes("text/html") || packContentType?.includes("text/html")) {
        throw new Error("Files not found");
      }
      return { list: await listResponse.arrayBuffer(), pack: await packResponse.arrayBuffer() };
    } catch {
      return { list: undefined, pack: undefined };
    }
  };

  const loadData = async () => {
    if (!selectedVersion.value) return;
    const result = await loadFileData(selectedVersion.value);
    list.value = decryptFileList(result.list);
    packBuffer.value = result.pack;
  };

  const loadComparedData = async () => {
    if (!selectedComparedVersion.value) {
      comparedPackBuffer.value = undefined;
      return;
    }
    const result = await loadFileData(selectedComparedVersion.value);
    comparedList.value = decryptFileList(result.list);
    comparedPackBuffer.value = result.pack;
  };

  const decryptFileList = (buffer: ArrayBuffer | undefined): List => {
    const rawData = buffer ? getList(buffer) : "";
    return {
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
        currentHash = getFileHash(packBuffer.value, currentFile);
        fileHashCache.set(fileName, currentHash);
      }

      if (!comparedHash && comparedPackBuffer.value) {
        comparedHash = getFileHash(comparedPackBuffer.value, comparedFile);
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
    const startIndex = currentPage.value * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
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

  watch(selectedVersion, async () => {
    await loadData();
  });

  watch(selectedComparedVersion, async () => {
    await loadComparedData();
  });

  watch(selectedFileType, async () => {
    await loadData();
    await loadComparedData();
  });

  watch([list, comparedList], async () => {
    await mergeList();
  });

  watch(filterListFiles, () => {
    resetLazyLoading();
  });
  watch([selectedCC, selectedVersion, selectedComparedVersion, selectedFileType, selectedFile], setQuery);

  return {
    selectedCC,
    selectedVersion,
    selectedComparedVersion,
    selectedFileType,
    keyWordValue,
    selectedDiffType,
    selectedFile,
    list,
    comparedList,
    packBuffer,
    comparedPackBuffer,
    visibleItems,
    isLoading,

    filterListFiles,

    loadItems,
    setSelectedFile,
  };
});
