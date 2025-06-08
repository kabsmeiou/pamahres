import { useCoursesApi } from "../services/courses";
import { Course } from "../types/course";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "react-feather";
import { Link } from "react-router-dom";

import { NAME_PLACEHOLDER } from "../components/dummies";

import EmptyFallback from "../components/EmptyFallback";
import Loading from "../components/Loading";
import CourseList from "../components/CourseList";

const Dashboard = () => {
  const { getCourses } = useCoursesApi();

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 shadow-sm border border-primary-200">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, <span className="text-primary-600">{NAME_PLACEHOLDER}</span>!</h1>
          <p className="mt-3 text-gray-600 md:text-lg">Pick up where you left off or start something new.</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Link 
              to="/create-course" 
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <PlusCircle size={18} />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Courses</h2>
          <Link 
            to="/create-course" 
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <PlusCircle size={16} />
            <span>Add Course</span>
          </Link>
        </div>
        
        {isLoading ? (
          <Loading type="course" count={3} />
        ) : courses && courses.length > 0 ? (
          <CourseList courses={courses} />
        ) : (
          <EmptyFallback />
        )}
      </div>
    </div>
  );
};

export default Dashboard;