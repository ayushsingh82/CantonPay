'use client';

import { motion } from 'motion/react';

interface NzuzoLogoProps {
  size?: number;
  animated?: boolean;
}

export function NzuzoLogo({ size = 48, animated = true }: NzuzoLogoProps) {
  const LogoWrapper = animated ? motion.div : 'div';
  const LogoPath = animated ? motion.path : 'path';

  return (
    <LogoWrapper
      className="nzuzo-logo"
      style={{ width: size, height: size, display: 'inline-block' }}
      {...(animated && {
        initial: { opacity: 0, scale: 0.8, rotate: -10 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        transition: { duration: 0.8, ease: 'easeOut' }
      })}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer shield/lock shape representing security */}
        <LogoPath
          d="M50 10 L20 25 L20 50 C20 70 35 85 50 90 C65 85 80 70 80 50 L80 25 Z"
          fill="url(#gradient1)"
          stroke="url(#gradient2)"
          strokeWidth="2"
          {...(animated && {
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: 1, opacity: 1 },
            transition: { duration: 1.2, ease: 'easeInOut' }
          })}
        />
        
        {/* Inner encrypted data representation - Binary blocks */}
        <LogoPath
          d="M35 35 L40 35 L40 40 L35 40 Z"
          fill="#10b981"
          opacity="0.8"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.8 },
            transition: { delay: 0.3, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M45 35 L50 35 L50 40 L45 40 Z"
          fill="#10b981"
          opacity="0.6"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.6 },
            transition: { delay: 0.4, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M55 35 L60 35 L60 40 L55 40 Z"
          fill="#10b981"
          opacity="0.9"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.9 },
            transition: { delay: 0.5, duration: 0.4 }
          })}
        />
        
        {/* Second row */}
        <LogoPath
          d="M35 45 L40 45 L40 50 L35 50 Z"
          fill="#3b82f6"
          opacity="0.7"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.7 },
            transition: { delay: 0.6, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M45 45 L50 45 L50 50 L45 50 Z"
          fill="#3b82f6"
          opacity="0.8"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.8 },
            transition: { delay: 0.7, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M55 45 L60 45 L60 50 L55 50 Z"
          fill="#3b82f6"
          opacity="0.6"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.6 },
            transition: { delay: 0.8, duration: 0.4 }
          })}
        />

        {/* Third row */}
        <LogoPath
          d="M35 55 L40 55 L40 60 L35 60 Z"
          fill="#8b5cf6"
          opacity="0.9"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.9 },
            transition: { delay: 0.9, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M45 55 L50 55 L50 60 L45 60 Z"
          fill="#8b5cf6"
          opacity="0.7"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.7 },
            transition: { delay: 1.0, duration: 0.4 }
          })}
        />
        <LogoPath
          d="M55 55 L60 55 L60 60 L55 60 Z"
          fill="#8b5cf6"
          opacity="0.8"
          {...(animated && {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 0.8 },
            transition: { delay: 1.1, duration: 0.4 }
          })}
        />

        {/* Keyhole symbol in center representing access control */}
        <circle
          cx="50"
          cy="68"
          r="5"
          fill="#1f2937"
          opacity="0.3"
        />
        <LogoPath
          d="M48 73 L52 73 L51 78 L49 78 Z"
          fill="#1f2937"
          opacity="0.3"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#764ba2" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f093fb" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </LogoWrapper>
  );
}