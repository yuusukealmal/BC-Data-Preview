export type countryCode = "JP" | "TW" | "EN" | "KR";

export interface fileInfo {
  name: string;
  start: number;
  offset: number;
}

export interface List {
  files: fileInfo[];
}

export type fileType = "DataLocal" | "DownloadLocal" | "ImageDataLocal" | "ImageLocal" | "MapLocal" | "NumberLocal" | "resLocal" | "UnitLocal";
