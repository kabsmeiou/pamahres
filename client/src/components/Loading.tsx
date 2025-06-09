import Skeleton from '@mui/material/Skeleton';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  count?: number;
  type?: 'default' | 'course' | 'quiz' | 'material';
}

export const Loading = ({ 
  size = 'medium', 
  message, 
  variant = 'rounded',
  count = 3,
  type = 'default'
}: LoadingProps) => {
  // Default skeleton based on size
  const defaultSkeleton = () => {
    // Define sizes based on the size prop
    const sizeMap = {
      small: { width: 150, height: 100 },
      medium: { width: 250, height: 150 },
      large: { width: 350, height: 200 }
    };

    const { width, height } = sizeMap[size];

    return (
      <div className="flex flex-col space-y-4 py-6 w-full">
        {message && (
          <p className="text-gray-500 text-sm font-medium mb-2">{message}</p>
        )}
        
        {/* Render multiple skeletons based on count */}
        {Array(count).fill(0).map((_, index) => (
          <Skeleton 
            key={index}
            variant={variant} 
            width={width} 
            height={height}
            animation="pulse"
            className="mb-4"
          />
        ))}
      </div>
    );
  };

  // Course Card Skeleton
  const courseSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Card Header */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <Skeleton variant="text" width={120} height={28} />
                      <Skeleton variant="text" width={180} height={24} style={{ marginTop: 8 }} />
                    </div>
                    <Skeleton variant="rounded" width={60} height={24} />
                  </div>
                  <Skeleton variant="text" width="90%" height={40} style={{ marginTop: 12 }} />
                </div>
              </div>
            </div>
            
            {/* Card Footer */}
            <div className="mt-auto px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={100} height={20} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Quiz Card Skeleton
  const quizSkeleton = () => {
    return (
      <div className="space-y-4">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-grow space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Skeleton variant="rounded" width={32} height={32} className="sm:w-[36px] sm:h-[36px]" />
                    <div>
                      <Skeleton variant="text" width={140} height={22} className="sm:w-[200px] sm:h-[28px]" />
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                        <Skeleton variant="text" width={70} height={16} className="sm:w-[100px] sm:h-[20px]" />
                        <Skeleton variant="text" width={90} height={16} className="sm:w-[120px] sm:h-[20px]" />
                      </div>
                    </div>
                  </div>
                  <Skeleton variant="text" width={100} height={12} className="sm:w-[150px] sm:h-[16px] mt-3" />
                </div>
                <div className="flex flex-col gap-3 sm:gap-4 items-end w-full sm:w-auto mt-3 sm:mt-0">
                  {/* Score display */}
                  <div className="flex items-center gap-2">
                    <Skeleton variant="text" width={40} height={18} className="sm:w-[70px] sm:h-[24px]" />
                    <Skeleton variant="circular" width={28} height={28} className="sm:w-[32px] sm:h-[32px]" />
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Skeleton variant="rounded" width={60} height={28} className="sm:w-[100px] sm:h-[36px]" />
                    <Skeleton variant="rounded" width={60} height={28} className="sm:w-[100px] sm:h-[36px]" />
                    <Skeleton variant="circular" width={28} height={28} className="sm:w-[36px] sm:h-[36px]" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton variant="text" width="100%" height={6} />
          </div>
        ))}
      </div>
    );
  };

  // Material Card Skeleton
  const materialSkeleton = () => {
    return (
      <div className="space-y-4 w-full">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* File icon placeholder */}
                <div className="flex-shrink-0">
                  <Skeleton variant="rounded" width={48} height={48} />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* File name and type */}
                  <div>
                    <Skeleton variant="text" width={240} height={28} />
                    <div className="flex items-center gap-1.5 mt-1">
                      <Skeleton variant="circular" width={14} height={14} />
                      <Skeleton variant="text" width={180} height={18} />
                    </div>
                  </div>
                  
                  {/* File metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Skeleton variant="circular" width={14} height={14} />
                      <Skeleton variant="text" width={100} height={14} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Skeleton variant="circular" width={14} height={14} />
                      <Skeleton variant="text" width={80} height={14} />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
                  <Skeleton variant="rounded" width={110} height={30} />
                  <Skeleton variant="circular" width={32} height={32} />
                </div>
              </div>
            </div>
            
            {/* View PDF button section */}
            <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end">
              <Skeleton variant="rounded" width={110} height={30} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Return the appropriate skeleton based on type
  switch (type) {
    case 'course':
      return courseSkeleton();
    case 'quiz':
      return quizSkeleton();
    case 'material':
      return materialSkeleton();
    default:
      return defaultSkeleton();
  }
};

export default Loading;

