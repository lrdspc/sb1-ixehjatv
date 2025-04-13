import React, { Suspense, lazy, ComponentType } from 'react';
import Skeleton from './ui/Skeleton';

interface LazyLoadProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

// Default loading component
const DefaultLoading = () => (
  <div className="p-6">
    <Skeleton height={24} width="50%" className="mb-6" />
    <Skeleton height={16} className="mb-2" />
    <Skeleton height={16} className="mb-2" />
    <Skeleton height={16} width="75%" className="mb-4" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Skeleton height={120} borderRadius="0.5rem" />
      <Skeleton height={120} borderRadius="0.5rem" />
    </div>
    
    <Skeleton height={16} className="mb-2" />
    <Skeleton height={16} className="mb-2" />
    <Skeleton height={16} width="60%" />
  </div>
);

export default function LazyLoad({ component, fallback = <DefaultLoading /> }: LazyLoadProps) {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}
