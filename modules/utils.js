import { GAME_CONFIG } from "./config.js";

export function drawImageWithRatio(p, img, x, y, size = GAME_CONFIG.CELL_SIZE) {
  if (img.width < img.height) {
    const ratio = img.width / img.height;
    p.image(img, x + size / 2 - (size / 2) * ratio, y, size * ratio, size);
  } else if (img.width > img.height) {
    const ratio = img.height / img.width;
    p.image(img, x, y + size / 2 - (size / 2) * ratio, size, size * ratio);
  } else {
    p.image(img, x, y, size, size);
  }
}
