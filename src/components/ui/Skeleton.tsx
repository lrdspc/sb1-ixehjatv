import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  count?: number;
}

export default function Skeleton({
  className = '',
  height = '1rem',
  width = '100%',
  borderRadius = '0.25rem',
  count = 1
}: SkeletonProps) {
  const skeletonStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    borderRadius
  };

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-gray-200 ${className}`}
            style={skeletonStyle}
            role="status"
            aria-label="Loading..."
          />
        ))}
    </>
  );
}
