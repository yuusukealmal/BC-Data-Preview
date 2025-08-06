import type { Ref } from "vue";
import type { PreviewImage } from "../types";

export const createImage = (imageData: ArrayBuffer, imageRef: Ref<PreviewImage>) => {
  if (!imageData) {
    return;
  }

  const blob = new Blob([imageData], { type: "image/png" });
  imageRef.value.url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = imageRef.value.url;
  img.onload = () => {
    imageRef.value.info = {
      width: img.width,
      height: img.height,
      size: Math.round((imageData.byteLength / 1024) * 100) / 100,
    };
  };
};
