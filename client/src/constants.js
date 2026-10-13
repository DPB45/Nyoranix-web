// Keep in sync with server/controllers/orderController.js
export const FREE_SHIPPING_THRESHOLD = 500; // standard shipping is free ABOVE this subtotal
export const STANDARD_SHIPPING_FEE = 50;
export const EXPRESS_SHIPPING_FEE = 150;
export const GST_RATE = 0.18; // catalogue prices already INCLUDE GST

// Local placeholder images (SVG data URIs): no network request, can't go offline
// like via.placeholder.com did.
export const placeholderFor = (label = 'Nyoranix', w = 400, h = 300) => {
  const safe = String(label).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" fill="#6b7280" font-family="Arial,sans-serif" font-size="${Math.max(14, Math.round(w / 18))}" text-anchor="middle" dominant-baseline="middle">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
export const PLACEHOLDER_IMG = placeholderFor('No image', 400, 300);
