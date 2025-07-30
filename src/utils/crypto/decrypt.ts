import * as CryptoJS from "crypto-js";

import type { CountryCode, FileInfo } from "../../types/index";
import { ECBKey, CBCKey } from "../../config/config";

const crop = (buffer: ArrayBuffer, info: FileInfo) => {
  return buffer.slice(info.start, info.start + info.offset);
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

export const aesECBDecrypt = (buffer: ArrayBuffer) => {
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
  // console.log(dataArray);
  return dataArray;
};

export const aesCBCDecrypt = (cc: CountryCode, folder: string, info: FileInfo, buffer: ArrayBuffer) => {
  const IGNORE_FORMATS = ["imgcut", "maanim", "mamodel"];
  const format = info.name.split(".").pop()!;

  const cropBuffer = crop(buffer, info);
  if (folder === "ImageDataLocal" && IGNORE_FORMATS.includes(format)) {
    const dataArray = new TextDecoder("utf-8").decode(crop(buffer, info));

    return dataArray;
  }

  const key = CBCKey[cc].KEY;
  const iv = CBCKey[cc].IV;

  const cipher = CryptoJS.lib.WordArray.create(cropBuffer);
  const params = CryptoJS.lib.CipherParams.create({
    ciphertext: cipher,
  });

  const data = CryptoJS.AES.decrypt(params, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: iv,
  });

  const array = new Uint8Array(data.sigBytes);
  for (let i = 0; i < data.sigBytes; i++) {
    array[i] = (data.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  const dataArray = deletePadding(array);

  if (info.name.endsWith(".png")) {
    return dataArray;
  } else {
    const dataString = new TextDecoder("utf-8").decode(dataArray);
    // console.log(dataString);
    return dataString;
  }
};
