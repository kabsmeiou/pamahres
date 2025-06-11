import { TextSkeleton, RoundedSkeleton } from './Skeleton';

type CourseDetailSkeletonProps = {
  className?: string;
};

/**
 * A skeleton loader for course details in the sidebar
 * Matches the structure in CourseLayout
 */
const CourseDetailSkeleton = ({ className = '' }: CourseDetailSkeletonProps) => {
  return (
    <div className={`p-6 border-b border-surface-100 dark:border-surface-700 ${className}`}>
      <TextSkeleton width={150} height={32} />
      <TextSkeleton width={250} height={20} className="mt-2" />
      
      {/* Last accessed */}
      <div className="flex items-center gap-2 mt-4">
        <RoundedSkeleton width={16} height={16} />
        <TextSkeleton width={180} height={16} />
      </div>
    </div>
  );
};

export default CourseDetailSkeleton;