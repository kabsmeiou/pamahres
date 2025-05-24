import { MessageSquare, BookOpen, Clock, ArrowRight } from "react-feather";
import { Link } from "react-router-dom";
import { Course } from "../types/course";

const CourseCard = ({ 
  id, 
  course_code, 
  course_name, 
  course_description,
  last_updated_at,
  number_of_quizzes
}: Course) => {
  return (
    <Link 
      to={`/courses/${id}`}
      state={{ course: { course_code, course_name, course_description, last_updated_at } }}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
            <BookOpen size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {course_code}
                </h3>
                <p className="text-gray-600 mt-1 font-medium">
                  {course_name}
                </p>
              </div>
              {/* Quiz count badge */}
              <div className="ml-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                  {number_of_quizzes && number_of_quizzes > 0 
                    ? `${number_of_quizzes} ${number_of_quizzes === 1 ? 'Quiz' : 'Quizzes'}` 
                    : 'No Quizzes'}
                </span>
              </div>
            </div>
            
            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">
              {course_description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="mt-auto px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={14} className="mr-1.5" />
          <span>
            {last_updated_at ? `Updated ${last_updated_at}` : 'Recently added'}
          </span>
        </div>
        <div className="text-primary-600 font-medium text-sm flex items-center">
          <span className="mr-1">Enter course</span>
          <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;