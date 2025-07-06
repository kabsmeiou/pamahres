import { useParams, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { MessageSquare, Book, FileText, Clock, ArrowLeft } from 'react-feather';
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

  // check whether the courseId is included from the course list from dashboard
  const context = useContext(LayoutContext) as { courses?: Course[]; isFetchingCourses?: boolean } ?? {};
  const { courses, isFetchingCourses } = context;
  const courseFromList = courses?.find(course => course.id === numericCourseId);
  
  if (isFetchingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span className="text-surface-600 dark:text-surface-300">Loading course...</span>
        </div>
      </div>
    );
  }

  // redirect to an invalid url if courseId is not found in the course list
  if (!courseFromList && courseId) {
    return <Navigate to="/invalid-course" replace />;
  }

  const location = useLocation();

  const [materials, setMaterials] = useState<Material[] | null>(null);

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

  const [showNavigation, setShowNavigation] = useState(true);

  const navigationItems = [
    { 
      name: 'Tutor', 
      path: `/courses/${courseId}`,
      icon: MessageSquare,
      description: 'AI-powered course assistant'
    },
    { 
      name: 'History', 
      path: `/courses/${courseId}/chat-history`,
      icon: Clock,
      description: 'Previous conversations'
    },
    { 
      name: 'Materials', 
      path: `/courses/${courseId}/materials`,
      icon: FileText,
      description: 'Course resources and files'
    },
    { 
      name: 'Quizzes', 
      path: `/courses/${courseId}/quizzes`,
      icon: Book,
      description: 'Practice and assessments'
    },
  ];

  return (
    <MaterialsContext.Provider value={{ materials, setMaterials, materialsLoading, setShowNavigation}}>
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
        {/* Course Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 border-b border-surface-200/50 dark:border-surface-800/50">
          <div className="absolute inset-0 bg-grid-surface-100/50 dark:bg-grid-surface-800/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 font-medium rounded-lg shadow-sm border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  <span>Dashboard</span>
                </Link>
                
                {course ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Book className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                        {course.course_code}
                      </h1>
                      <p className="text-surface-600 dark:text-surface-300">
                        {course.course_name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CourseDetailSkeleton />
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            {showNavigation && (
              <div className="mt-6">
                <nav className="flex space-x-2 overflow-x-auto pb-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        state={{ course }}
                        className={`
                          flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap
                          ${active 
                            ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm border border-surface-200 dark:border-surface-800' 
                            : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-white/50 dark:hover:bg-surface-900/50'
                          }
                        `}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </MaterialsContext.Provider>
  );
};

export default CourseLayout; 