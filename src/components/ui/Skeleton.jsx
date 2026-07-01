import React from 'react';
import './skeleton.css';

export default function Skeleton({ width, height, borderRadius = '8px', style = {}, className = '' }) {
  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius: borderRadius,
        ...style 
      }} 
    />
  );
}
