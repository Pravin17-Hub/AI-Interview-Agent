'use client';

import React, { useState } from 'react';

interface SpotlightQuestionProps {
  content: string;
  fontFamily?: string;
  isObfuscated?: boolean;
}

export function SpotlightQuestion({ content, fontFamily, isObfuscated }: SpotlightQuestionProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const maskStyle = isHovered
    ? {
        maskImage: 'linear-gradient(black, black)',
        WebkitMaskImage: 'linear-gradient(black, black)',
        maskSize: '360px 120px',
        WebkitMaskSize: '360px 120px',
        maskPosition: `${coords.x - 180}px ${coords.y - 60}px`,
        WebkitMaskPosition: `${coords.x - 180}px ${coords.y - 60}px`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat'
      }
    : {};

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        cursor: 'none', // Hide standard cursor to make flashlight feel immersive
        overflow: 'hidden',
        borderRadius: '8px',
        padding: '4px',
        background: 'rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Unblurred Spotlight Area */}
      <div 
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          pointerEvents: 'none',
          color: 'hsl(var(--text-primary))',
          fontFamily: fontFamily || 'inherit',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          zIndex: 2,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
          ...maskStyle
        }}
      >
        {content}
      </div>

      {/* Blurred Background Base */}
      <div 
        style={{
          color: 'hsl(var(--text-secondary))',
          filter: 'blur(7px)',
          userSelect: 'none',
          pointerEvents: 'none',
          fontFamily: fontFamily || 'inherit',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          opacity: 0.7
        }}
      >
        {content}
      </div>

      {/* Flashlight Mouse Tracker Rectangle */}
      {isHovered && (
        <div 
          style={{
            position: 'absolute',
            top: coords.y - 60,
            left: coords.x - 180,
            width: '360px',
            height: '120px',
            borderRadius: '8px',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: 4
          }}
        />
      )}

      {/* Security diagonal grid pattern overlay to break visual OCR algorithms */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 3,
          opacity: 0.12,
          background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 1.5px, transparent 1.5px, transparent 12px)'
        }}
      />
      
      {/* Drifting Security Watermark to identify unauthorized photographs */}
      {isHovered && (
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '10px',
            color: '#ef4444',
            opacity: 0.4,
            fontWeight: 700,
            pointerEvents: 'none',
            zIndex: 5,
            fontFamily: 'sans-serif',
            letterSpacing: '1px'
          }}
        >
          CONFIDENTIAL EXAM • DO NOT COPY
        </div>
      )}
    </div>
  );
}
