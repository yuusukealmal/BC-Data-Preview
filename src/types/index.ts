export type countryCode = "JP" | "TW" | "EN" | "KR";

export interface fileInfo {
  name: string;
  start: number;
  offset: number;
}

export interface List {
  name: string;
  files: fileInfo[];
}
