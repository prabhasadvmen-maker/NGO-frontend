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
  noindex = false,
  schemaType
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

  // Default schemas
  const schemas = [];

  // NGO / Organization Schema
  if (currentPath === '/' || schemaType === 'NGO' || schemaType === 'Organization') {
    schemas.push({
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
    });
  }

  // WebSite Schema
  if (currentPath === '/' || schemaType === 'WebSite') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'SAVITRAM FOUNDATION',
      'url': currentOrigin
    });
  }

  // ContactPage Schema
  if (schemaType === 'ContactPage' || currentPath === '/contact') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': title || 'Contact SAVITRAM FOUNDATION',
      'url': canonical,
      'description': siteDesc
    });
  }

  // DonatePage / DonateAction Schema
  if (schemaType === 'DonatePage' || currentPath === '/donate') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': title || 'Donate and Support SAVITRAM FOUNDATION',
      'url': canonical,
      'potentialAction': {
        '@type': 'DonateAction',
        'recipient': {
          '@type': 'NGO',
          'name': 'SAVITRAM FOUNDATION',
          'url': currentOrigin
        }
      }
    });
  }

  // Custom passed jsonLd schemas
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      schemas.push(...jsonLd);
    } else {
      schemas.push(jsonLd);
    }
  }

  return (
    <Helmet htmlAttributes={{ lang: 'en' }}>
      {/* Primary HTML Meta Tags */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1B5E20" />
      
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
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
