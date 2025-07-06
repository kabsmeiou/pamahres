import { BookOpen, ArrowRight, Delete } from "react-feather";
import { Link } from "react-router-dom";
import { Course } from "../../types/course";
import ActionConfirmation from "../../components/ActionConfirmation";
import { useState } from "react";
import { useCoursesApi } from "../../services/courses";
import { useDeleteItem } from "../../hooks/useDeleteItem";

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
      className="group bg-white dark:bg-surface-800 rounded-xl border border-surface-200/60 dark:border-surface-700/40 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden hover:border-primary-200 dark:hover:border-primary-700/50 transform hover:-translate-y-1"
    >
      {/* Delete Confirmation Modal */}
      <ActionConfirmation
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        headerMessage="Delete Course"
        bodyMessage="Are you sure you want to delete this course?"
        action="delete"
        confirmButtonText="Delete"
        confirmButtonColor="red"
      />

      {/* Card Header - Course Identifier with gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-700 dark:to-primary-500 px-5 py-3 flex justify-between items-center">
        <h3 className="text-base font-semibold text-white">
          {course_code}
        </h3>
        {/* Quiz count badge */}
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-surface-800/90 text-primary-700 dark:text-primary-300 shadow-sm backdrop-blur-sm">
            {number_of_quizzes && number_of_quizzes > 0 
              ? `${number_of_quizzes} ${number_of_quizzes === 1 ? 'Quiz' : 'Quizzes'}` 
              : 'No Quizzes'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-surface-800 dark:text-surface-200 mb-3 font-semibold md:text-lg group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {course_name}
            </p>
            
            {/* Description */}
            <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-3">
              {course_description || "No description provided for this course."}
            </p>
            
            {/* Last updated timestamp with prettier design */}
            <div className="mt-4 flex items-center text-xs text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/30 rounded-full py-1 px-2.5 w-fit">
              <svg className="w-3.5 h-3.5 mr-1.5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated {last_updated_at ? new Date(last_updated_at).toLocaleDateString("en-US", {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'recently'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer with improved styling */}
      <div className="px-5 py-4 border-t border-surface-100 dark:border-surface-700/50 bg-surface-50/70 dark:bg-surface-800/50 flex items-center justify-between backdrop-blur-sm">
        <Link 
        to={`/pamahres/courses/${id}`}
        state={{ course: { course_code, course_name, course_description, last_updated_at } }}
        className="text-primary-600 dark:text-primary-400 font-medium text-sm flex items-center group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
          <span className="mr-1">Enter course</span>
          <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1.5" />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 dark:text-surface-500 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:shadow-sm"
          aria-label="Delete course"
        >
          <Delete size={16} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
