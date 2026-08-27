import React from 'react';
import { Helmet } from 'react-helmet-async';

// TODO: replace with your real custom domain once set up - this is the
// single source of truth other files (ProductDetailsPage's JSON-LD,
// App.jsx's LocalBusiness schema, the sitemap generator) should import
// from rather than hardcoding their own copy of the domain.
export const SITE_URL = 'https://nyoranix-web-eta.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.jpg`;

// Product images are currently stored as base64 data URIs (data:image/...),
// not real hosted URLs - see the fuller explanation given alongside this
// fix. Social platforms (WhatsApp/Facebook/Twitter) fetch og:image via an
// HTTP request to the URL in the tag, so a data URI there just fails
// silently with no preview image at all. Until product images move to real
// image hosting, fall back to the site logo (a real hosted file) rather
// than shipping a URL that can never work.
const resolveOgImage = (image) => {
  if (!image || image.startsWith('data:')) {
    return DEFAULT_OG_IMAGE;
  }
  return image;
};

const Meta = ({
  title = 'Nyoranix | Electronic Components, Sensors & Robotics Kits',
  description = 'Premium electronic components, sensors, and robotics kits.',
  keywords = 'electronics, robotics, arduino, sensors, iot, diy',
  image = DEFAULT_OG_IMAGE,
  path = '', // e.g. '/shop' or '/product/abc123' - leave empty for homepage
  noindex = false, // set true on cart/checkout/account/admin pages
}) => {
  const canonicalUrl = `${SITE_URL}${path}`;
  const resolvedImage = resolveOgImage(image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Social Media Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
    </Helmet>
  );
};

export default Meta;