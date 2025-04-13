import React from 'react';
import Skeleton from '../ui/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Skeleton height={16} width={80 + Math.random() * 40} />
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array(rows)
            .fill(0)
            .map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array(columns)
                  .fill(0)
                  .map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <Skeleton 
                        height={16} 
                        width={colIndex === 0 ? 150 : 80 + Math.random() * 60} 
                      />
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
