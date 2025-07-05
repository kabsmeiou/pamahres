import { useParams, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { MessageSquare, Book, FileText, Clock } from 'react-feather';
import CourseDetailSkeleton from './CourseDetailSkeleton';
import { Material, Course } from '../types/course';
import { useQuery } from '@tanstack/react-query';
import { useCoursesApi, useMaterialsApi } from '../services/courses';
import { useState, createContext, useEffect, useContext } from 'react';
import { LayoutContext } from '../components/Layout';
import { Loader2 } from "lucide-react";

type MaterialsContextType = {
  materials: Material[] | null;
  setMaterials: React.Dispatch<React.SetStateAction<Material[] | null>>;
  setShowNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  materialsLoading: boolean;
};

// materials for sharing between components under the layout(same course)
// this is a workaround to avoid fetching materials for materials page and quizzes page
export const MaterialsContext = createContext<MaterialsContextType | null>(null); 

const CourseLayout = () => {
  const { courseId } = useParams();
  const numericCourseId = parseInt(courseId!, 10);
  const location = useLocation();

  // All hooks must be called before any conditional returns
  const context = useContext(LayoutContext) as { courses?: Course[]; isFetchingCourses?: boolean } ?? {};
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [showNavigation, setShowNavigation] = useState(true);
  
  const { getCourseById } = useCoursesApi();
  const { getMaterials } = useMaterialsApi();
  
  const courseFromState = location.state?.course;

  // if course is not found, fetch it
  const { data: courseFromQuery } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !courseFromState
  });

  const {
    data: fetchedMaterials, 
    isLoading: materialsLoading,
  } = useQuery<Material[]>({
    queryKey: ["materials", numericCourseId],
    queryFn: () => getMaterials(numericCourseId),
  })

  useEffect(() => {
    if (fetchedMaterials) {
      setMaterials(fetchedMaterials)
    }
  }, [fetchedMaterials])

  // Now we can safely do conditional logic after all hooks
  const { courses, isFetchingCourses } = context;
  const courseFromList = courses?.find(course => course.id === numericCourseId);
  
  if (isFetchingCourses) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  // redirect to an invalid url if courseId is not found in the course list
  if (!courseFromList && courseId) {
    return <Navigate to="/invalid-course" replace />;
  }

  const course = courseFromState || courseFromQuery;

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  console.log(showNavigation);
  return (
    <MaterialsContext.Provider value={{ materials, setMaterials, materialsLoading, setShowNavigation}}>
    <div className="h-max p-2 md:px-4 md:py-6 flex flex-col justify-center lg:flex-row gap-4 lg:gap-6">
      <div className={`bg-white dark:bg-surface-800 rounded-2xl shadow-soft overflow-hidden flex flex-col ${showNavigation ? 'h-fit w-full lg:w-80' : 'h-0 w-0'} transition-all duration-300`}>
        {/* Course Navigation Sidebar */}
        <div className="p-4 sm:p-6 border-b border-surface-100 dark:border-surface-700">
          {course ? (
                <>
                  <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-surface-100 break-words">{course.course_code}</h1>
                  <p className="text-surface-600 mt-2 text-xs sm:text-sm dark:text-surface-300 line-clamp-3">{course.course_description}</p>

                  {/* Last Accessed */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                    <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">Last accessed {course.last_updated_at}</span>
                  </div>
                </>
              ) : (
                <CourseDetailSkeleton />
              )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2 sm:p-4">
          <div className="flex flex-col sm:flex-col gap-1 sm:gap-2">
            <Link
              to={`/courses/${courseId}`}
              state={{ course }}
              className={`
                flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 min-w-0 text-sm sm:text-base
                ${isActive(`/courses/${courseId}`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <MessageSquare size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium truncate">Tutor</span>
            </Link>

            <Link
              to={`/courses/${courseId}/chat-history`}
              state={{ course }}
              className={`
                flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 min-w-0 text-sm sm:text-base
                ${isActive(`/courses/${courseId}/chat-history`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <MessageSquare size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium truncate">History</span>
            </Link>
            
            <Link
              to={`/courses/${courseId}/materials`}
              state={{ course }}
              className={`
                flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 min-w-0 text-sm sm:text-base
                ${isActive(`/courses/${courseId}/materials`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <Book size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-medium truncate block">Materials</span>
              </div>
            </Link>
            
            <Link
              to={`/courses/${courseId}/quizzes`}
              state={{ course }}
              className={`
                flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 min-w-0 text-sm sm:text-base
                ${isActive(`/courses/${courseId}/quizzes`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <FileText size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-medium truncate block">Quizzes</span>
              </div>
            </Link>
          </div>
        </nav>    
      </div>
      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
    </MaterialsContext.Provider>
  );
};

export default CourseLayout; 