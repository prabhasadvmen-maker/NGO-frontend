import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const SEOHead = ({ 
  title, 
  description, 
  canonicalUrl, 
  ogType = 'website', 
  ogImage, 
  jsonLd,
  noindex = false
}) => {
  const location = useLocation();
  const currentOrigin = 'https://savitramfoundation.org';
  const currentPath = location.pathname;
  const canonical = canonicalUrl || `${currentOrigin}${currentPath}`;
  
  const siteTitle = title ? `${title} | SAVITRAM FOUNDATION` : 'SAVITRAM FOUNDATION | Humanitarian NGO India';
  const siteDesc = description || 'SAVITRAM FOUNDATION is a world-class humanitarian non-governmental organization in India dedicated to healthcare, education, women empowerment, and child welfare.';
  
  // Resolve absolute image URL
  const absoluteImageUrl = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${currentOrigin}${ogImage}`)
    : `${currentOrigin}/NGO logo.jpeg`;

  // Default Organization & NGO Schema for the homepage
  const defaultOrgSchema = currentPath === '/' ? {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    'name': 'SAVITRAM FOUNDATION',
    'alternateName': 'Savitram Foundation NGO',
    'url': currentOrigin,
    'logo': `${currentOrigin}/NGO logo.jpeg`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-8860036008',
      'contactType': 'customer support',
      'areaServed': 'IN',
      'availableLanguage': 'English'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'A-13, GRAPHIX 2 SECTOR 62, UPPER GROUND FLOOR',
      'addressLocality': 'Noida',
      'addressRegion': 'Uttar Pradesh',
      'postalCode': '201301',
      'addressCountry': 'IN'
    }
  } : null;

  // Default WebSite Schema for the homepage
  const defaultWebsiteSchema = currentPath === '/' ? {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'SAVITRAM FOUNDATION',
    'url': currentOrigin
  } : null;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      <link rel="canonical" href={canonical} />

      {/* Robots Indexing */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:site_name" content="SAVITRAM FOUNDATION" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Injected structured JSON-LD data */}
      {defaultOrgSchema && (
        <script type="application/ld+json">
          {JSON.stringify(defaultOrgSchema)}
        </script>
      )}
      {defaultWebsiteSchema && (
        <script type="application/ld+json">
          {JSON.stringify(defaultWebsiteSchema)}
        </script>
      )}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
