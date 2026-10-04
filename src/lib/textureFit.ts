import * as THREE from "three";

/**
 * Crop a texture to COVER a plane of the given aspect ratio (width / height),
 * the WebGL equivalent of CSS `object-fit: cover`. Without this, a texture is
 * stretched to fill its plane — fine for the seed SVGs (authored at the card's
 * ratio) but it distorts real photos of any other shape.
 *
 * Centers the crop, so a centred subject stays centred. Also applies the sRGB
 * colour space and anisotropic filtering the cards expect. Safe to call every
 * render: it only touches offset/repeat (applied via the texture matrix each
 * frame) and never forces a GPU re-upload.
 */
export function coverFit(texture: THREE.Texture, planeAspect: number): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

  const img = texture.image as { width?: number; height?: number } | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  if (!w || !h) {
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    return texture;
  }

  const imgAspect = w / h;
  if (imgAspect > planeAspect) {
    // Image is wider than the plane — crop the sides.
    const r = planeAspect / imgAspect;
    texture.repeat.set(r, 1);
    texture.offset.set((1 - r) / 2, 0);
  } else {
    // Image is taller than the plane — crop top and bottom.
    const r = imgAspect / planeAspect;
    texture.repeat.set(1, r);
    texture.offset.set(0, (1 - r) / 2);
  }
  return texture;
}
