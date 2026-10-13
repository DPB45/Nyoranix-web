import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

// One shared, short-lived copy of the (lightweight) product list. Home, Shop and
// the navbar search all need it - previously each downloaded the whole catalogue
// on its own, and the navbar search did it again after every pause in typing.
const TTL_MS = 60 * 1000;
let cache = { data: null, at: 0, promise: null };

export const peekProducts = () => cache.data;

export const invalidateProducts = () => {
  cache = { data: null, at: 0, promise: null };
};

export const fetchAllProducts = async ({ force = false } = {}) => {
  const fresh = cache.data && Date.now() - cache.at < TTL_MS;
  if (!force && fresh) return cache.data;
  if (!force && cache.promise) return cache.promise;

  cache.promise = axios
    .get(`${API_URL}/api/products`)
    .then(({ data }) => {
      const list = Array.isArray(data) ? data : data.products || [];
      cache = { data: list, at: Date.now(), promise: null };
      return list;
    })
    .catch((err) => {
      cache.promise = null;
      throw err;
    });

  return cache.promise;
};

// Compact object stored in the cart (never spread a whole product into the cart -
// that dragged images/reviews into localStorage).
// Product photos are stored as base64. Saving one per cart line in localStorage
// (about 5 MB limit) makes the cart fail to persist after a few items, so big
// inline images are NOT stored - screens look the image up by product id with
// useProductImages() instead.
const MAX_INLINE_IMAGE = 4000;
export const cartSafeImage = (img) => (img && !(img.startsWith('data:') && img.length > MAX_INLINE_IMAGE) ? img : '');

export const toCartItem = (product, quantity = 1) => ({
  id: product._id,
  name: product.name,
  price: product.price,
  image: cartSafeImage(product.images?.[0] || product.image),
  quantity,
  countInStock: product.countInStock,
});

// { productId: imageSrc } built from the shared cached catalogue
export const useProductImages = (enabled = true) => {
  const [map, setMap] = useState(() => {
    const m = {};
    (peekProducts() || []).forEach((p) => { m[p._id] = p.images?.[0] || p.image; });
    return m;
  });
  useEffect(() => {
    // `enabled=false` means "don't download the catalogue just for this": e.g. the
    // cart drawer exists on every page but only needs images when it has items.
    if (!enabled) return undefined;
    let alive = true;
    fetchAllProducts()
      .then((list) => {
        if (!alive) return;
        const m = {};
        list.forEach((p) => { m[p._id] = p.images?.[0] || p.image; });
        setMap(m);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [enabled]);
  return map;
};
