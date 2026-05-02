/**
 * Nzuzo Logo - Standalone SVG Export
 * 
 * This file contains the logo in pure SVG format for easy export
 * and use in design tools, documentation, or other applications.
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Nzuzo Pay Logo - Full Color Version
 * Use this on dark backgrounds
 */
export function NzuzoLogoFullColor({ size = 100, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M50 10 L20 25 L20 50 C20 70 35 85 50 90 C65 85 80 70 80 50 L80 25 Z"
        fill="url(#shieldGradient)"
        stroke="url(#borderGradient)"
        strokeWidth="2"
      />
      
      {/* Encrypted data blocks - Row 1 (Green) */}
      <rect x="35" y="35" width="5" height="5" fill="#10b981" opacity="0.8" rx="1" />
      <rect x="45" y="35" width="5" height="5" fill="#10b981" opacity="0.6" rx="1" />
      <rect x="55" y="35" width="5" height="5" fill="#10b981" opacity="0.9" rx="1" />
      
      {/* Row 2 (Blue) */}
      <rect x="35" y="45" width="5" height="5" fill="#3b82f6" opacity="0.7" rx="1" />
      <rect x="45" y="45" width="5" height="5" fill="#3b82f6" opacity="0.8" rx="1" />
      <rect x="55" y="45" width="5" height="5" fill="#3b82f6" opacity="0.6" rx="1" />
      
      {/* Row 3 (Purple) */}
      <rect x="35" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.9" rx="1" />
      <rect x="45" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.7" rx="1" />
      <rect x="55" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.8" rx="1" />

      {/* Keyhole */}
      <circle cx="50" cy="68" r="5" fill="#1f2937" opacity="0.3" />
      <path d="M48 73 L52 73 L51 78 L49 78 Z" fill="#1f2937" opacity="0.3" />

      {/* Gradients */}
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#764ba2" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f093fb" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Nzuzo Pay Logo - Monochrome Version
 * Use this when color is not available
 */
export function NzuzoLogoMonochrome({ size = 100, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 10 L20 25 L20 50 C20 70 35 85 50 90 C65 85 80 70 80 50 L80 25 Z"
        fill="white"
        fillOpacity="0.1"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.8"
      />
      
      {/* Data blocks - all same color */}
      <rect x="35" y="35" width="5" height="5" fill="white" opacity="0.8" rx="1" />
      <rect x="45" y="35" width="5" height="5" fill="white" opacity="0.6" rx="1" />
      <rect x="55" y="35" width="5" height="5" fill="white" opacity="0.9" rx="1" />
      <rect x="35" y="45" width="5" height="5" fill="white" opacity="0.7" rx="1" />
      <rect x="45" y="45" width="5" height="5" fill="white" opacity="0.8" rx="1" />
      <rect x="55" y="45" width="5" height="5" fill="white" opacity="0.6" rx="1" />
      <rect x="35" y="55" width="5" height="5" fill="white" opacity="0.9" rx="1" />
      <rect x="45" y="55" width="5" height="5" fill="white" opacity="0.7" rx="1" />
      <rect x="55" y="55" width="5" height="5" fill="white" opacity="0.8" rx="1" />

      <circle cx="50" cy="68" r="5" fill="white" opacity="0.3" />
      <path d="M48 73 L52 73 L51 78 L49 78 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

/**
 * Nzuzo Pay Logo - Icon Only (Simplified)
 * Use for favicons and very small sizes
 */
export function NzuzoLogoIcon({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 10 L20 25 L20 50 C20 70 35 85 50 90 C65 85 80 70 80 50 L80 25 Z"
        fill="url(#iconGradient)"
        stroke="url(#iconBorder)"
        strokeWidth="3"
      />
      
      {/* Simplified data representation - single gradient block */}
      <rect x="35" y="40" width="25" height="20" fill="url(#dataGradient)" opacity="0.6" rx="2" />
      
      <circle cx="50" cy="68" r="5" fill="#1f2937" opacity="0.4" />
      <path d="M48 73 L52 73 L51 78 L49 78 Z" fill="#1f2937" opacity="0.4" />

      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="iconBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Export as standalone SVG file content
 */
export const NzuzoLogoSVG = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Shield outline -->
  <path d="M50 10 L20 25 L20 50 C20 70 35 85 50 90 C65 85 80 70 80 50 L80 25 Z" fill="url(#shieldGradient)" stroke="url(#borderGradient)" stroke-width="2"/>
  
  <!-- Encrypted data blocks - Row 1 (Green) -->
  <rect x="35" y="35" width="5" height="5" fill="#10b981" opacity="0.8" rx="1"/>
  <rect x="45" y="35" width="5" height="5" fill="#10b981" opacity="0.6" rx="1"/>
  <rect x="55" y="35" width="5" height="5" fill="#10b981" opacity="0.9" rx="1"/>
  
  <!-- Row 2 (Blue) -->
  <rect x="35" y="45" width="5" height="5" fill="#3b82f6" opacity="0.7" rx="1"/>
  <rect x="45" y="45" width="5" height="5" fill="#3b82f6" opacity="0.8" rx="1"/>
  <rect x="55" y="45" width="5" height="5" fill="#3b82f6" opacity="0.6" rx="1"/>
  
  <!-- Row 3 (Purple) -->
  <rect x="35" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.9" rx="1"/>
  <rect x="45" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.7" rx="1"/>
  <rect x="55" y="55" width="5" height="5" fill="#8b5cf6" opacity="0.8" rx="1"/>

  <!-- Keyhole -->
  <circle cx="50" cy="68" r="5" fill="#1f2937" opacity="0.3"/>
  <path d="M48 73 L52 73 L51 78 L49 78 Z" fill="#1f2937" opacity="0.3"/>

  <!-- Gradients -->
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#764ba2" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#f093fb" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#764ba2" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
</svg>
`;

/**
 * Component to download logo as SVG file
 */
export function DownloadLogoButton() {
  const downloadSVG = () => {
    const blob = new Blob([NzuzoLogoSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nzuzo-pay-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadSVG}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
    >
      Download Logo SVG
    </button>
  );
}