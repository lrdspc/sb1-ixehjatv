import React from 'react';
import Skeleton from '../ui/Skeleton';
import CardSkeleton from './CardSkeleton';

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={36} width={80} className="mb-2" />
            <Skeleton height={16} width="60%" />
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="bg-white rounded-lg shadow p-4">
        <Skeleton height={24} width={200} className="mb-4" />
        <Skeleton height={250} borderRadius="0.5rem" className="mb-2" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <Skeleton height={24} width={200} className="mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3 border-b last:border-0">
              <Skeleton height={20} width="90%" className="mb-2" />
              <div className="flex justify-between">
                <Skeleton height={16} width={120} />
                <Skeleton height={16} width={80} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Skeleton height={24} width={150} className="mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3 border-b last:border-0">
              <div className="flex items-center">
                <Skeleton height={40} width={40} borderRadius="9999px" className="mr-3" />
                <div className="flex-1">
                  <Skeleton height={18} width="70%" className="mb-1" />
                  <Skeleton height={14} width="50%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
