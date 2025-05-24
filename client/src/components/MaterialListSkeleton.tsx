import MaterialCardSkeleton from './MaterialCardSkeleton';

type MaterialListSkeletonProps = {
  count?: number;
  className?: string;
};

/**
 * Shows multiple material card skeletons in a list format
 */
const MaterialListSkeleton = ({ count = 3, className = '' }: MaterialListSkeletonProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array(count).fill(0).map((_, index) => (
        <MaterialCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default MaterialListSkeleton; 