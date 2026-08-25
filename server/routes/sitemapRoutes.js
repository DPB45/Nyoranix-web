const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// TODO: replace with your real production domain once set up (must match
// the SITE_URL in client/src/components/common/Meta.jsx).
const SITE_URL = 'https://nyoranix-web-eta.vercel.app';

// @desc    Generate sitemap.xml dynamically from the current product list
// @route   GET /sitemap.xml
// @access  Public
router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}).select('_id updatedAt');

    const staticPages = [
      { loc: '/', priority: '1.0' },
      { loc: '/shop', priority: '0.9' },
      { loc: '/about', priority: '0.6' },
      { loc: '/solutions', priority: '0.6' },
      { loc: '/blog', priority: '0.5' },
      { loc: '/contact', priority: '0.5' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${SITE_URL}${page.loc}</loc>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    for (const product of products) {
      const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : undefined;
      xml += `  <url>\n    <loc>${SITE_URL}/product/${product._id}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n  </url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.status(500).send('Could not generate sitemap');
  }
});

module.exports = router;
