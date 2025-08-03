import { useRoute } from "vue-router";

import { router } from "../router";
import type { CountryCode, FileType } from "../types";
import { useFileStore } from "../sotre/fileStore";

export const initDataByQuery = () => {
  const route = useRoute();
  const fileStore = useFileStore();

  const { cc, version, compared, type, file } = route.query;

  fileStore.selectedCC = cc as CountryCode;
  fileStore.selectedVersion = version as string;
  fileStore.selectedComparedVersion = compared as string;
  fileStore.selectedFileType = (type as FileType) ?? "DataLocal";

  setTimeout(() => {
    const retryTarget = fileStore.filterListFiles.find((f) => f.info.name === file);
    if (retryTarget) {
      fileStore.setSelectedFile(retryTarget.info);
    }
  }, 1000);
};

export const setQuery = () => {
  const fileStore = useFileStore();

  const query: Record<string, string> = {};
  if (fileStore.selectedCC) {
    query.cc = fileStore.selectedCC;
  }
  if (fileStore.selectedVersion) {
    query.version = fileStore.selectedVersion;
  }
  if (fileStore.selectedComparedVersion) {
    query.compared = fileStore.selectedComparedVersion;
  }
  if (fileStore.selectedFileType) {
    query.type = fileStore.selectedFileType;
  }
  if (fileStore.selectedFile) {
    query.file = fileStore.selectedFile.name;
  }

  router.push({ query });
};
