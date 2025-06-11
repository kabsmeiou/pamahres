import MuiSkeleton from '@mui/material/Skeleton';
import { ReactNode } from 'react';

type SkeletonProps = {
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
  className?: string;
  children?: ReactNode;
};

// Specialized skeleton components
export const TextSkeleton = ({ 
  width = 200, 
  height = 20,
  className = '',
  ...props 
}: SkeletonProps) => (
  <MuiSkeleton
    variant="text"
    width={width}
    height={height}
    className={className}
    {...props}
  />
);

export const RoundedSkeleton = ({
  width = 200,
  height = 100,
  className = '',
  ...props
}: SkeletonProps) => (
  <MuiSkeleton
    variant="rounded"
    width={width}
    height={height}
    className={className}
    {...props}
  />
);

export const CircularSkeleton = ({
  width = 40,
  height = 40,
  className = '',
  ...props
}: SkeletonProps) => (
  <MuiSkeleton
    variant="circular"
    width={width}
    height={height}
    className={className}
    {...props}
  />
);

export const CardSkeleton = ({ 
  className = '', 
  children 
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={`bg-white dark:bg-surface-800 rounded-xl border border-gray-100 dark:border-surface-700 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const AvatarWithTextSkeleton = ({
  avatarSize = 40,
  lines = 2,
  lineWidths = [200, 150],
}: {
  avatarSize?: number;
  lines?: number;
  lineWidths?: (number | string)[];
}) => {
  return (
    <div className="flex items-start gap-3">
      <CircularSkeleton width={avatarSize} height={avatarSize} />
      <div className="space-y-2">
        {Array(lines).fill(0).map((_, i) => (
          <TextSkeleton 
            key={i} 
            width={i < lineWidths.length ? lineWidths[i] : '100%'} 
            height={i === 0 ? 24 : 16} 
          />
        ))}
      </div>
    </div>
  );
};

export const IconWithTextSkeleton = ({
  iconSize = 40,
  lines = 2,
  lineWidths = [200, 150],
}: {
  iconSize?: number;
  lines?: number;
  lineWidths?: (number | string)[];
}) => {
  return (
    <div className="flex items-start gap-3">
      <RoundedSkeleton width={iconSize} height={iconSize} />
      <div className="space-y-2">
        {Array(lines).fill(0).map((_, i) => (
          <TextSkeleton 
            key={i} 
            width={i < lineWidths.length ? lineWidths[i] : '100%'} 
            height={i === 0 ? 24 : 16} 
          />
        ))}
      </div>
    </div>
  );
};

// Default export of the MUI Skeleton for general use
const Skeleton = MuiSkeleton;
export default Skeleton;