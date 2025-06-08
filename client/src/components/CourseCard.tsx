import { BookOpen, ArrowRight, Delete } from "react-feather";
import { Link } from "react-router-dom";
import { Course } from "../types/course";
import DeleteConfirmation from "./DeleteConfirmation";
import { useState } from "react";
import { useCoursesApi } from "../services/courses";
import { useDeleteItem } from "../hooks/useDeleteItem";

const CourseCard = ({ 
  id, 
  course_code, 
  course_name, 
  course_description,
  last_updated_at,
  number_of_quizzes
}: Course) => {

  const { deleteCourse } = useCoursesApi();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { isDeleting, handleDelete } = useDeleteItem(
    deleteCourse,
    () => ["courses"]
  );

  // handle delete
  const handleDeleteConfirm = () => {
    if (id) {
      handleDelete(id, undefined, () => setShowDeleteConfirm(false));
    }
  };

  return (
    <div 
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden"
    >
      {/* Delete Confirmation Modal */}
      <DeleteConfirmation 
        isDeleting={isDeleting}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDelete={handleDeleteConfirm}
        itemName={course_name}
        itemType="Course"
      />
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
        <Link 
        to={`/courses/${id}`}
      state={{ course: { course_code, course_name, course_description, last_updated_at } }}className="text-primary-600 font-medium text-sm flex items-center hover:underline">
          <span className="mr-1">Enter course</span>
          <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
        </Link>
        <div className="flex items-center text-xs text-gray-500">
          <Delete 
            size={16} 
            className="cursor-pointer hover:text-red-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;