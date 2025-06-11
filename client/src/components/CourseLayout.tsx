import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { MessageSquare, Book, FileText, Clock } from 'react-feather';
import CourseDetailSkeleton from './CourseDetailSkeleton';
import { Material } from '../types/course';
import { useQuery } from '@tanstack/react-query';
import { useCoursesApi, useMaterialsApi } from '../services/courses';
import { useState, createContext, useEffect } from 'react';

type MaterialsContextType = {
  materials: Material[] | null;
  setMaterials: React.Dispatch<React.SetStateAction<Material[] | null>>;
  materialsLoading: boolean;
};

export const MaterialsContext = createContext<MaterialsContextType | null>(null); 

const CourseLayout = () => {
  // materials for sharing between components under the layout(same course)
  // this is a workaround to avoid fetching materials for materials page and quizzes page
  const [materials, setMaterials] = useState<Material[] | null>(null);

  const { courseId } = useParams();
  const numericCourseId = parseInt(courseId!, 10);

  const location = useLocation();

  const { getCourseById } = useCoursesApi();
  const { getMaterials } = useMaterialsApi();
  
  const courseFromState = location.state?.course;

  // if course is not found, fetch it
  const { data: courseFromQuery, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !courseFromState
  });

  const course = courseFromState || courseFromQuery;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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

  return (
    <MaterialsContext.Provider value={{ materials, setMaterials, materialsLoading }}>
    <div className="h-max flex flex-col lg:flex-row gap-6">
      <div className="lg:w-80 h-fit bg-white dark:bg-surface-800 rounded-2xl shadow-soft overflow-hidden flex flex-col">
        {/* Course Navigation Sidebar */}
        <div className="p-6 border-b border-surface-100 dark:border-surface-700">
          {course ? (
                <>
                  <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">{course.course_code}</h1>
                  <p className="text-surface-600 mt-2 text-sm dark:text-surface-300">{course.course_description}</p>

                  {/* Last Accessed */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-surface-500 dark:text-surface-400">
                    <Clock size={14} />
                    <span>Last accessed {course.last_updated_at}</span>
                  </div>
                </>
              ) : (
                <CourseDetailSkeleton />
              )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 sm:p-4 p-2">
          <div className="sm:flex-col flex sm:text-base text-sm">
            <Link
              to={`/courses/${courseId}`}
              state={{ course }}
              className={`
                flex items-center sm:gap-3 gap-2 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive(`/courses/${courseId}`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <MessageSquare size={20} />
              <span className="font-medium">AI Chat</span>
            </Link>
            
            <Link
              to={`/courses/${courseId}/materials`}
              state={{ course }}
              className={`
                flex items-center sm:gap-3 gap-2 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive(`/courses/${courseId}/materials`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <Book size={20} />
              <div>
                <span className="font-medium">Materials</span>
              </div>
            </Link>
            
            <Link
              to={`/courses/${courseId}/quizzes`}
              state={{ course }}
              className={`
                flex items-center sm:gap-3 gap-2 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive(`/courses/${courseId}/quizzes`) 
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900 dark:text-primary-300 dark:shadow-none' 
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 dark:hover:text-surface-100'
                }
              `}
            >
              <FileText size={20} />
              <div>
                <span className="font-medium">Quizzes</span>
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