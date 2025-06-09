import { RoundedSkeleton, CircularSkeleton, TextSkeleton, CardSkeleton } from './Skeleton';

type MaterialCardSkeletonProps = {
  className?: string;
};

/**
 * A specialized skeleton component that exactly matches the MaterialCard layout
 */
const MaterialCardSkeleton = ({ className = '' }: MaterialCardSkeletonProps) => {
  return (
    <CardSkeleton className={className}>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          {/* File icon placeholder */}
          <div className="flex-shrink-0 p-2 sm:p-3 bg-blue-50 rounded-lg mb-2 sm:mb-0">
            <RoundedSkeleton width={22} height={22} className="bg-blue-200" />
          </div>
          <div className="flex-1 min-w-0 w-full">
            {/* File name and type */}
            <div>
              <TextSkeleton width={120} height={18} className="sm:w-[240px] sm:h-[28px]" />
              <div className="flex items-center gap-1.5 mt-1">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={80} height={12} className="sm:w-[180px] sm:h-[18px]" />
              </div>
            </div>
            {/* File metadata */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={60} height={10} className="sm:w-[100px] sm:h-[14px]" />
              </div>
              <div className="flex items-center gap-1.5">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={50} height={10} className="sm:w-[80px] sm:h-[14px]" />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row sm:flex-col items-end sm:items-center gap-2 ml-0 sm:ml-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
            <RoundedSkeleton width={70} height={24} className="sm:w-[110px] sm:h-[30px] bg-primary-50" />
            <CircularSkeleton width={28} height={28} className="sm:w-[32px] sm:h-[32px]" />
          </div>
        </div>
      </div>
      {/* View PDF button section */}
      <div className="border-t border-gray-100 p-2 sm:p-3 bg-gray-50 flex justify-end">
        <RoundedSkeleton width={70} height={24} className="sm:w-[110px] sm:h-[30px] bg-blue-50" />
      </div>
    </CardSkeleton>
  );
};

export default MaterialCardSkeleton;