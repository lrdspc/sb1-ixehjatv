import React from 'react';
import Skeleton from '../ui/Skeleton';

export default function CardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Skeleton height={24} width="60%" className="mb-4" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} width="80%" className="mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton height={32} width={80} borderRadius="0.375rem" />
        <Skeleton height={20} width={100} />
      </div>
    </div>
  );
}
