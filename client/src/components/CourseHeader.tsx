import { Loader, Upload, FileText, Book } from "react-feather";

const CourseHeader = ({
  isUploading, 
  handleFileUpload
}: {
  isUploading: boolean, 
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0 hidden sm:flex">
            <Book size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
            <p className="mt-1.5 text-gray-600">Manage your PDF documents and generate quizzes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg flex items-center gap-2 animate-pulse">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
          
          <label
            className={`
              inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200
              ${isUploading 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
              }`}
          >
            <Upload size={18} className="flex-shrink-0" />
            <span>{isUploading ? "Please wait..." : "Upload PDF"}</span>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading} 
            />
          </label>
        </div>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gray-100 my-6"></div>
      
      {/* File upload tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700 flex items-start gap-3">
        <FileText size={20} className="flex-shrink-0 text-blue-500 mt-0.5" />
        <div>
          <p className="font-medium">Upload PDF documents to get started</p>
          <p className="mt-1 text-blue-600">Supported file types: PDF. Maximum file size: 10MB.</p>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
