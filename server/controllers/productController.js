const Product = require('../models/product');

// Money fields: undefined/null/'' = "not provided". Anything else must be a real
// finite number >= 0 (so " ", "abc", true, {} are rejected, and 0 is valid).
const num = (v) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'string') {
    if (v === '') return undefined;
    if (v.trim() === '') return NaN;
    return Number(v);
  }
  return typeof v === 'number' ? v : NaN;
};
const badNum = (n) => n !== undefined && (!Number.isFinite(n) || n < 0);
// Stable order for paginated requests so ?page= never repeats or skips products
// (unpaginated requests keep the original natural order)
const SORT = { createdAt: -1, _id: 1 };
// Stock: whole number >= 0 (negative / fractional / non-numeric input is clamped)
const stockInt = (v) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(1000000, Math.max(0, n)) : 0; // "1e999" used to become Infinity
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // === 1. DESTRUCTURE ALL NEW FIELDS (10-Point Format) ===
    const {
      name,
      price,
      priceExclGST,
      gst,
      description,
      shortDescription,
      image,
      images,
      brand,
      category,
      subCategory,
      countInStock,
      features,
      specifications,
      otherSpecifications,
      isNewArrival
    } = req.body;

    if (badNum(num(price)) || badNum(num(priceExclGST))) {
      return res.status(400).json({ message: 'Price must be a number that is 0 or more' });
    }

    const product = new Product({
      user: req.user._id,
      name: name || 'Sample Name',

      // === 2. PRICE DETAILS (Incl/Excl GST) ===
      price: num(price) ?? 0,
      priceExclGST: num(priceExclGST) ?? 0,
      gst: gst || 18,

      // === 3. IMAGES & BRAND ===
      image: image || '/images/sample.jpg',
      images: images || [], // Multiple images array
      brand: brand || 'Sample Brand',

      // === 4. CATEGORIES & STOCK ===
      category: category || 'General',
      subCategory: subCategory || '',
      countInStock: stockInt(countInStock),
      isNewArrival: !!isNewArrival,

      // === 5. DESCRIPTIONS ===
      description: description || 'Description',
      shortDescription: shortDescription || '',

      // === 6. FEATURES & SPECS (Tables) ===
      features: features || [],
      specifications: specifications || [],
      otherSpecifications: otherSpecifications || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    // === 1. DESTRUCTURE ALL NEW FIELDS ===
    const {
      name, price, priceExclGST, gst, description, shortDescription,
      image, images, brand, category, subCategory,
      countInStock, features, specifications, otherSpecifications, isNewArrival
    } = req.body;

    if (badNum(num(price)) || badNum(num(priceExclGST))) {
      return res.status(400).json({ message: 'Price must be a number that is 0 or more' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;

      // === 2. UPDATE PRICE DETAILS ===
      // 0 is a valid price, so test for "provided" rather than truthiness
      product.price = num(price) ?? product.price;
      product.priceExclGST = num(priceExclGST) ?? product.priceExclGST;
      product.gst = gst || product.gst;

      // === 3. UPDATE DESCRIPTIONS ===
      product.description = description || product.description;
      product.shortDescription = shortDescription || product.shortDescription;

      // === 4. UPDATE IMAGES & DETAILS ===
      product.image = image || product.image;
      product.images = images || product.images;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      // Use !== undefined here, not ||  - `0` is a legitimate "out of stock"
      // value but is falsy, so `0 || product.countInStock` would silently
      // keep the old stock number instead of actually zeroing it out.
      product.countInStock = countInStock !== undefined ? stockInt(countInStock) : product.countInStock;
      // Same reasoning for the New Arrival flag - `false` is falsy, so `||`
      // would make it impossible to ever un-tag a product.
      product.isNewArrival = isNewArrival !== undefined ? !!isNewArrival : product.isNewArrival;

      // === 5. UPDATE ARRAYS/TABLES ===
      product.features = features || product.features;
      product.specifications = specifications || product.specifications;
      product.otherSpecifications = otherSpecifications || product.otherSpecifications;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new review or update existing
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Please write a comment for your review' });
    }
    // 17 reviews of 900 KB each used to push a product past MongoDB's 16 MB limit
    if (comment.trim().length > 1000) {
      return res.status(400).json({ message: 'Reviews can be up to 1000 characters' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        alreadyReviewed.rating = numRating;
        alreadyReviewed.comment = comment.trim();
      } else {
        const review = {
          name: req.user.name,
          rating: numRating,
          comment: comment.trim(),
          user: req.user._id,
          likes: []
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
      }

      const avg = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
      product.rating = Math.round(avg * 10) / 10; // one decimal place - avoids values like 4.333333333333335

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error adding review' });
  }
};

// @desc    Like a review
// @route   PUT /api/products/:id/reviews/:reviewId/like
// @access  Private
const likeProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = product.reviews.id(req.params.reviewId);

      if (review) {
        const alreadyLiked = review.likes.includes(req.user._id);
        if (alreadyLiked) {
          review.likes = review.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
          review.likes.push(req.user._id);
        }
        await product.save();
        res.status(200).json(product.reviews);
      } else {
        res.status(404).json({ message: 'Review not found' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = product.reviews.find(r => r._id.toString() === req.params.reviewId.toString());

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check permissions
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      }

      product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId.toString());

      product.numReviews = product.reviews.length;
      if (product.reviews.length > 0) {
        const avg = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        product.rating = Math.round(avg * 10) / 10;
      } else {
        product.rating = 0;
      }

      await product.save();
      res.json({ message: 'Review Removed' });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts: async (req, res) => {
    try {
      const filter = {};
      if (req.query.isNewArrival === 'true') filter.isNewArrival = true;

      // The storefront list (home, shop, search) only needs card data. Product
      // images are base64, so sending every image, review and spec table for the
      // whole catalogue made this response huge. The admin panel asks for
      // ?full=true to get everything (it needs it for the edit form).
      // Optional pagination: ?limit=24&page=2 (limit capped at 100). The total
      // matching count is returned in the X-Total-Count header; the body stays a
      // plain array so existing callers keep working. Without ?limit the whole
      // list is returned, as before.
      let skip = 0;
      let limit = 0;
      if (req.query.limit !== undefined) {
        limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 24));
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        skip = (page - 1) * limit;
        res.set('X-Total-Count', String(await Product.countDocuments(filter)));
      }

      if (req.query.full === 'true') {
        return res.json(await Product.find(filter).sort(limit ? SORT : {}).skip(skip).limit(limit));
      }
      const products = await Product.find(filter)
        .sort(limit ? SORT : {})
        .select({ reviews: 0, description: 0, features: 0, specifications: 0, otherSpecifications: 0, images: { $slice: 1 } })
        .skip(skip)
        .limit(limit)
        .lean();
      // `image` duplicates images[0] for most products - send it only when images is empty
      products.forEach((p) => { if (p.images && p.images.length) delete p.image; });
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) res.json(product);
      else res.status(404).json({ message: 'Not found' });
    } catch (error) {
      // Most common cause: a malformed :id (not a valid ObjectId) throws a
      // CastError here. Without this catch, that error is an unhandled
      // rejection - Express 4 never routes it to the error middleware, so
      // the request just hangs instead of returning a clean 404/400.
      console.error(error);
      res.status(404).json({ message: 'Product not found' });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const deleted = await Product.deleteOne({ _id: req.params.id });
      if (deleted.deletedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Removed' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Invalid product id' });
    }
  },
  createProduct,
  updateProduct,
  createProductReview,
  likeProductReview,
  deleteProductReview
};