import * as CryptoJS from "crypto-js";
import type { FileInfo } from "../../types";

import { crop } from "./decrypt";

const md5 = (buffer: ArrayBuffer) => {
  const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(buffer));
  return hash.toString(CryptoJS.enc.Hex);
};

const getFileHash = (packBuffer: ArrayBuffer, fileInfo: FileInfo) => {
  const fileData = crop(packBuffer, fileInfo);
  return md5(fileData);
};

export { md5, getFileHash };
