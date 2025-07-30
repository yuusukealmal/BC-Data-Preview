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

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
}
