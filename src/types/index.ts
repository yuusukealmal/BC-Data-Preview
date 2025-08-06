export type CountryCode = "JP" | "TW" | "EN" | "KR";

export interface FileInfo {
  name: string;
  start: number;
  offset: number;
}

export interface List {
  files: FileInfo[];
}

export type FileType = "DataLocal" | "DownloadLocal" | "ImageDataLocal" | "ImageLocal" | "MapLocal" | "NumberLocal" | "resLocal" | "UnitLocal";
export const FILE_TYPE_LIST: FileType[] = ["DataLocal", "DownloadLocal", "ImageDataLocal", "ImageLocal", "MapLocal", "NumberLocal", "resLocal", "UnitLocal"] as const;

export interface PreviewImage {
  url: string | null;
  info: ImageInfo;
}
export interface ImageInfo {
  width: number;
  height: number;
  size: number;
}

export type FileStatus = "normal" | "delete" | "add" | "modify";
export const FILE_STATUS: FileStatus[] = ["normal", "delete", "add", "modify"] as const;
export type LabeledFile = {
  info: FileInfo;
  label: FileStatus;
};
