import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoursesApi } from '../services/courses';
import { Book, ArrowLeft } from 'react-feather';
  
const CreateCourse = () => {
  const { createCourse } = useCoursesApi();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    course_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      // Navigate to the new course (using a mock ID for now)
      navigate('/');
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Course</h1>
          <p className="mt-1 text-gray-600">Set up a new course for your study materials</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
      </div>
      
      {/* Course Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Book size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Course Details</h2>
            <p className="text-sm text-gray-500">All fields are required</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, course_code: e.target.value }))}
                  placeholder="e.g., CS101"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">A unique identifier for your course</p>
              </div>
              <div>
                <label htmlFor="course_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  id="course_name"
                  value={formData.course_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, course_name: e.target.value }))}
                  placeholder="e.g., Data Structures and Algorithms"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The full name of the course</p>
              </div>
            </div>
            <div>
              <label htmlFor="course_description" className="block text-sm font-medium text-gray-700 mb-1">
                Course Description
              </label>
              <textarea
                id="course_description"
                value={formData.course_description}
                onChange={(e) => setFormData(prev => ({ ...prev, course_description: e.target.value }))}
                placeholder="Describe what this course is about..."
                rows={4}
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Provide a brief description of what students will learn</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse; 