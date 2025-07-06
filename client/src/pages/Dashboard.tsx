import { Course } from "../types/course";
import { PlusCircle, Search, TrendingUp, Calendar, BookOpen, Clock } from "react-feather";
import { Link } from "react-router-dom";
import EmptyFallback from "../components/EmptyFallback";
import Loading from "../components/Loading";
import CourseList from "./CourseView/CourseList";
import { LayoutContext } from "../components/Layout";
import { useContext, useState, useEffect, useRef } from "react";
// use pamahres from assets
import Pamahres from "../assets/pamahres.png"; // Assuming this is the correct path to the image

const debounceDelay = 300;

const Dashboard = () => {
  const context = (useContext(LayoutContext) ?? {}) as {
    courses?: Course[];
    isFetchingCourses?: boolean;
    setShowToast?: (show: boolean) => void;
  };

  const { courses, isFetchingCourses } = context;
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (courses) {
      setCurrentCourses(courses);
    }
  }, [courses]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      const term = searchTerm.toLowerCase().trim();

      if (!term) {
        setCurrentCourses(courses || []);
        return;
      }

      const filtered = courses?.filter(course =>
        course.course_name?.toLowerCase().includes(term) ||
        course.course_code?.toLowerCase().includes(term)
      ) || [];

      setCurrentCourses(filtered);
    }, debounceDelay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const currentDate = new Date();
  const greeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="absolute inset-0 bg-grid-surface-100/50 dark:bg-grid-surface-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center lg:text-left flex md:justify-between items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-100/80 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium">
                <Calendar size={14} />
                <span>
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long", 
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white tracking-tight leading-tight">
                  {greeting()}!
                </h1>
                <p className="text-lg lg:text-xl text-surface-600 dark:text-surface-300 max-w-2xl leading-relaxed font-medium">
                  Ready to continue your learning journey? Let's dive into your courses and discover something new today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:justify-center md:justify-normal">
                <Link 
                  to="/create-course" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <PlusCircle size={20} />
                  <span>Create New Course</span>
                </Link>
                
                {courses && courses.length > 0 && (
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 font-medium rounded-xl shadow-sm border border-surface-200 dark:border-surface-800">
                    <BookOpen size={18} />
                    <span>{courses.length} course{courses.length !== 1 ? 's' : ''} available</span>
                  </div>
                )}
              </div>
            </div>
            {/* place the png here */}
            <div className="w-0 md:w-fit">
              <img src={Pamahres} alt="Pamahres Logo" className="mx-auto w-96" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-8">
          

          {/* Courses Section */}
          <div className="space-y-6">
            {/* Section Header with Search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
                  Your Learning Hub
                </h2>
                <p className="text-surface-600 dark:text-surface-300 font-medium leading-relaxed">
                  Manage your courses and track your progress
                </p>
              </div>
              
              {/* Search */}
              <div className="relative max-w-md w-full lg:w-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400 dark:text-surface-500" />
                <input
                  onChange={handleSearch}
                  autoComplete="off"
                  type="search"
                  placeholder="Search your courses..."
                  value={searchTerm}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 shadow-sm"
                />
                {searchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-md">
                      {currentCourses.length} of {courses?.length || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Courses Content */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/50 dark:border-surface-800/50 shadow-sm overflow-hidden">
              <div className="p-6 lg:p-8">
                {isFetchingCourses ? (
                  <div className="space-y-4">
                    <Loading type="course" count={3} />
                  </div>
                ) : courses && currentCourses.length > 0 ? (
                  <CourseList courses={currentCourses} />
                ) : searchTerm ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-surface-400 dark:text-surface-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                      No courses found
                    </h3>
                    <p className="text-surface-500 dark:text-surface-400">
                      Try adjusting your search terms or create a new course
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <EmptyFallback 
                      message="Your learning journey starts here"
                      actionText="Create your first course"
                      actionLink="/create-course"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
