// Shrinks an image file in the browser BEFORE it is stored. Product and banner
// photos are saved as base64 inside MongoDB and sent to every visitor, so a raw
// 4 MB phone photo made the product list (and the whole home page) huge, and a
// product with a few of them could not even be saved (Mongo's 16 MB document limit).
//
//  maxSize: longest side in pixels, quality: JPEG quality 0-1.
// GIF/SVG are returned untouched (canvas would flatten animation / rasterise vectors).
const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
  });

export const compressImage = async (file, { maxSize = 1200, quality = 0.82 } = {}) => {
  if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Please choose an image file');
  const original = await readAsDataURL(file);
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    // These are stored as-is (no resizing possible), so cap their size
    if (file.size > 1.5 * 1024 * 1024) throw new Error('GIF/SVG files must be under 1.5 MB');
    return original;
  }

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('That file is not a valid image'));
    i.src = original;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  // JPEG has no transparency: paint white first or transparent PNG areas turn black
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const out = canvas.toDataURL('image/jpeg', quality);
  // never make a small, already-optimised file bigger
  return out.length < original.length ? out : original;
};
