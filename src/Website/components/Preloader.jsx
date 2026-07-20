import React from 'react';

export const Preloader = () => {
  return (
    <div className="preloader-container">
      <div className="preloader-wrapper">
        {/* Animated Circle Background */}
        <div className="preloader-circle-outer"></div>
        <div className="preloader-circle-middle"></div>
        
        {/* Logo */}
        <img 
          src="/NGO logo.jpeg" 
          alt="Savitram Foundation Logo" 
          className="preloader-logo-image"
          decoding="async"
          width="120"
          height="120"
        />
      </div>
      
      {/* Loading Text */}
      <div className="preloader-loading-text">
        <span className="preloader-dot"></span>
        <span className="preloader-dot"></span>
        <span className="preloader-dot"></span>
      </div>
    </div>
  );
};

export default Preloader;
