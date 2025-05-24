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
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* File icon placeholder */}
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
            <RoundedSkeleton width={22} height={22} className="bg-blue-200" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* File name and type */}
            <div>
              <TextSkeleton width={240} height={28} />
              <div className="flex items-center gap-1.5 mt-1">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={180} height={18} />
              </div>
            </div>
            
            {/* File metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={100} height={14} />
              </div>
              <div className="flex items-center gap-1.5">
                <CircularSkeleton width={14} height={14} />
                <TextSkeleton width={80} height={14} />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
            <RoundedSkeleton width={110} height={30} className="bg-primary-50" />
            <CircularSkeleton width={32} height={32} />
          </div>
        </div>
      </div>
      
      {/* View PDF button section */}
      <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end">
        <RoundedSkeleton width={110} height={30} className="bg-blue-50" />
      </div>
    </CardSkeleton>
  );
};

export default MaterialCardSkeleton; 