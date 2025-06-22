import { useCoursesApi } from "../services/courses";
import { Course } from "../types/course";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "react-feather";
import { Link } from "react-router-dom";
import EmptyFallback from "../components/EmptyFallback";
import Loading from "../components/Loading";
import CourseList from "./CourseView/CourseList";



const Dashboard = () => {
  const { getCourses } = useCoursesApi();

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-900/80 rounded-2xl p-6 md:p-8 shadow-sm border border-surface-100/60 dark:border-surface-700/40">
        <div className="max-w-3xl relative overflow-hidden">          
          <h1 className="text-2xl md:text-3xl font-bold text-surface-800 dark:text-surface-100">
            Your Learning<span className="text-primary-600 dark:text-primary-400"> Dashboard</span>
          </h1>
          <p className="mt-3 text-surface-600 dark:text-surface-300 max-w-2xl">
            Access all your courses, track your progress, and continue your learning journey.
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100">Your Courses</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage and access your learning materials</p>
          </div>
          
          <Link 
            to="/create-course" 
            className="text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-600 dark:to-primary-500 dark:hover:from-primary-500 dark:hover:to-primary-400 flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
          >
            <PlusCircle size={16} />
            <span>Create Course</span>
          </Link>
        </div>
        
        {/* Filter Tabs - Enhanced design */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-surface-100/70 dark:bg-surface-800/60 p-1 rounded-xl shadow-sm">
            <button className="px-6 py-2.5 text-sm font-medium rounded-lg bg-white dark:bg-surface-700 shadow-sm text-surface-800 dark:text-surface-100 border border-surface-100 dark:border-surface-600/40 transition-all">
              All
            </button>
            <button className="px-6 py-2.5 text-sm font-medium rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-800 dark:hover:text-surface-100 transition-all">
              Favorites
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search courses..."
                className="py-2.5 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 w-full md:w-64 transition-all focus:w-72"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button className="p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="min-h-[300px]">
          {isLoading ? (
            <Loading type="course" count={3} />
          ) : courses && courses.length > 0 ? (
            <CourseList courses={courses} />
          ) : (
            <div className="rounded-2xl border border-surface-100/60 dark:border-surface-700/40 bg-white dark:bg-surface-800/50 p-8 shadow-sm">
              <EmptyFallback 
                message="You haven't created any courses yet"
                actionText="Create your first course"
                actionLink="/create-course"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
