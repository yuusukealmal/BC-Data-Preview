import * as CryptoJS from "crypto-js";

export const ECBKey = {
  LIST_KEY: CryptoJS.enc.Utf8.parse("b484857901742afc"),
  PACK_KEY: CryptoJS.enc.Utf8.parse("89a0f99078419c28"),
};

export const CBCKey = {
  JP: {
    KEY: CryptoJS.enc.Utf8.parse("d754868de89d717fa9e7b06da45ae9e3"),
    IV: CryptoJS.enc.Utf8.parse("40b2131a9f388ad4e5002a98118f6128"),
  },
  TW: {
    KEY: CryptoJS.enc.Hex.parse("313d9858a7fb939def1d7d859629087d"),
    IV: CryptoJS.enc.Hex.parse("0e3743eb53bf5944d1ae7e10c2e54bdf"),
  },
  EN: {
    KEY: CryptoJS.enc.Utf8.parse("0ad39e4aeaf55aa717feb1825edef521"),
    IV: CryptoJS.enc.Utf8.parse("d1d7e708091941d90cdf8aa5f30bb0c2"),
  },
  KR: {
    KEY: CryptoJS.enc.Utf8.parse("bea585eb993216ef4dcb88b625c3df98"),
    IV: CryptoJS.enc.Utf8.parse("9b13c2121d39f1353a125fed98696649"),
  },
};
