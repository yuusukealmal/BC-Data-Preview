import type { Ref } from "vue";
import type { ImageInfo } from "../types";

export const createImage = (imageData: ArrayBuffer, urlRef: Ref<string | null>, infoRef: Ref<ImageInfo>) => {
  const blob = new Blob([imageData], { type: "image/png" });
  urlRef.value = URL.createObjectURL(blob);

  const img = new Image();
  img.src = urlRef.value;
  img.onload = () => {
    infoRef.value = {
      width: img.width,
      height: img.height,
      size: Math.round((imageData.byteLength / 1024) * 100) / 100,
    };
  };
};
