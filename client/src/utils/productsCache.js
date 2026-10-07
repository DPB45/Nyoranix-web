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
export const toCartItem = (product, quantity = 1) => ({
  id: product._id,
  name: product.name,
  price: product.price,
  image: product.images?.[0] || product.image,
  quantity,
  countInStock: product.countInStock,
});
