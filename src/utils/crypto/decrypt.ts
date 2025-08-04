import * as CryptoJS from "crypto-js";

import type { CountryCode, FileInfo, List } from "../../types/index";
import { ECBKey, CBCKey } from "../../config/config";
import { useFileStore } from "../../store/fileStore";

export const crop = (buffer: ArrayBuffer, info: FileInfo) => {
  return buffer.slice(info.start, info.start + info.offset);
};

const aesCBCDecrypt = (cc: CountryCode, buffer: ArrayBuffer) => {
  const key = CBCKey[cc].KEY;
  const iv = CBCKey[cc].IV;

  const cipher = CryptoJS.lib.WordArray.create(buffer);
  const params = CryptoJS.lib.CipherParams.create({
    ciphertext: cipher,
  });

  return CryptoJS.AES.decrypt(params, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: iv,
  });
};

const deletePadding = (packRes: Uint8Array): Uint8Array => {
  const paddingMap = new Map([
    [0x00, 1],
    [0x01, 1],
    [0x02, 2],
    [0x03, 3],
    [0x04, 4],
    [0x05, 5],
    [0x06, 6],
    [0x07, 7],
    [0x08, 8],
    [0x09, 9],
    [0x0a, 10],
    [0x0b, 11],
    [0x0c, 12],
    [0x0d, 13],
    [0x0e, 14],
    [0x0f, 15],
    [0x10, 16],
  ]);

  const paddingCount = paddingMap.get(packRes[packRes.length - 1]) || 0;
  return paddingCount > 0 ? packRes.slice(0, -paddingCount) : packRes;
};

type comparedType = string | Uint8Array | null;
const compareData = (lhs: comparedType, rhs: comparedType) => {
  if (lhs === null || rhs === null) return lhs === rhs;

  if (typeof lhs === "string" && typeof rhs === "string") {
    return lhs === rhs;
  }

  if (lhs instanceof Uint8Array && rhs instanceof Uint8Array) {
    return lhs.length === rhs.length && lhs.every((val, i) => val === rhs[i]);
  }

  return false;
};

export const getList = (buffer: ArrayBuffer) => {
  const key = ECBKey.LIST_KEY;

  const ciphter = CryptoJS.lib.WordArray.create(buffer);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphter,
  });

  const data = CryptoJS.AES.decrypt(cipherParams, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  const dataArray = data.toString(CryptoJS.enc.Utf8);
  return dataArray;
};

const getPack = (list?: List | null, pack?: ArrayBuffer) => {
  const fileStore = useFileStore();

  const cc = fileStore.selectedCC!;

  const IGNORE_FORMATS = ["imgcut", "maanim", "mamodel"];

  const fileInfo = list?.files.find((f) => f.name === fileStore.selectedFile!.name);
  if (fileInfo && pack) {
    const cropBuffer = crop(pack, fileInfo);

    if (fileStore.selectedFileType === "ImageDataLocal" && IGNORE_FORMATS.includes(fileInfo.name)) {
      return new TextDecoder("utf-8").decode(cropBuffer);
    } else {
      const data = aesCBCDecrypt(cc, cropBuffer);

      const array = new Uint8Array(data.sigBytes);
      for (let i = 0; i < data.sigBytes; i++) {
        array[i] = (data.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      const dataArray = deletePadding(array);

      if (fileInfo.name.endsWith(".png")) {
        return dataArray;
      } else {
        return new TextDecoder("utf-8").decode(dataArray);
      }
    }
  }
  return null;
};

export const getData = () => {
  const fileStore = useFileStore();

  let mainData: comparedType = null;
  let comparedData: comparedType = null;

  if (fileStore.packBuffer) mainData = getPack(fileStore.list, fileStore.packBuffer);
  if (fileStore.comparedPackBuffer) comparedData = getPack(fileStore.comparedList, fileStore.comparedPackBuffer);

  const same = compareData(mainData, comparedData);
  if (fileStore.selectedFile!.name.endsWith(".png")) {
    return { type: "image", same, data: { data: mainData, comparedData } };
  } else {
    return { type: "string", same, data: { data: mainData, comparedData } };
  }
};
