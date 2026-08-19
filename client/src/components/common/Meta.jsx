import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({
  title = 'Welcome to Nyoranix',
  description = 'Premium electronic components, sensors, and robotics kits.',
  keywords = 'electronics, robotics, arduino, sensors, iot, diy',
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Social Media Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default Meta;