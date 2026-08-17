const Product = require('../models/product');

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

    const product = new Product({
      user: req.user._id,
      name: name || 'Sample Name',

      // === 2. PRICE DETAILS (Incl/Excl GST) ===
      price: price || 0,
      priceExclGST: priceExclGST || 0,
      gst: gst || 18,

      // === 3. IMAGES & BRAND ===
      image: image || '/images/sample.jpg',
      images: images || [], // Multiple images array
      brand: brand || 'Sample Brand',

      // === 4. CATEGORIES & STOCK ===
      category: category || 'General',
      subCategory: subCategory || '',
      countInStock: countInStock || 0,
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

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;

      // === 2. UPDATE PRICE DETAILS ===
      product.price = price || product.price;
      product.priceExclGST = priceExclGST || product.priceExclGST;
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
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
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
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please write a comment for your review' });
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
        res.status(404);
        throw new Error('Review not found');
      }

      // Check permissions
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401);
        throw new Error('Not authorized to delete this review');
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
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts: async (req, res) => {
    try {
      const filter = {};
      if (req.query.isNewArrival === 'true') filter.isNewArrival = true;
      const products = await require('../models/product').find(filter);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server Error: Could not fetch products' });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await require('../models/product').findById(req.params.id);
      if (product) res.json(product);
      else res.status(404).json({ message: 'Not found' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid product ID' });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await require('../models/product').deleteOne({ _id: req.params.id });
      res.json({ message: 'Removed' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid product ID' });
    }
  },
  createProduct,
  updateProduct,
  createProductReview,
  likeProductReview,
  deleteProductReview
};