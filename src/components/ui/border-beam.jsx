import React from 'react';

export const BorderBeam = ({
  className = '',
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}) => {
  return (
    <>
      <style>
        {`
          @keyframes border-beam-spin {
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div 
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: borderWidth,
          pointerEvents: 'none',
          background: 'linear-gradient(white, white) padding-box, transparent border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box',
          WebkitMask: 'linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size,
            height: size,
            background: `conic-gradient(from ${anchor}deg at 50% 50%, transparent 45%, ${colorFrom}, ${colorTo} 55%, transparent 100%)`,
            transformOrigin: '0 0',
            marginTop: -size/2,
            marginLeft: -size/2,
            animation: `border-beam-spin ${duration}s linear infinite`,
            animationDelay: `-${delay}s`
          }}
        />
      </div>
    </>
  );
};

export default BorderBeam;
