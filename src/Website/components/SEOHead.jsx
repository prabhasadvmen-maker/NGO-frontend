import { useEffect } from 'react';

export const SEOHead = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | SAVITRAM FOUNDATION` : 'SAVITRAM FOUNDATION | Humanitarian NGO India';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'SAVITRAM FOUNDATION is a world-class humanitarian non-governmental organization in India dedicated to healthcare, education, women empowerment, and child welfare.';
  }, [title, description]);

  return null;
};

export default SEOHead;
