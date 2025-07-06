import { Loader, Upload, FileText } from "react-feather";

const CourseHeader = ({
  isUploading, 
  handleFileUpload
}: {
  isUploading: boolean, 
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
          
          <label
            className={`
              inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isUploading 
                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                : "bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-800 cursor-pointer shadow-sm hover:shadow-md"
              }`}
          >
            <Upload size={16} className="flex-shrink-0" />
            <span>{isUploading ? "Uploading..." : "Upload PDF"}</span>
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
      
      {/* File upload tips */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Upload PDF documents to get started</p>
            <p className="mt-1 text-blue-700 dark:text-blue-300">Supported formats: PDF • Maximum size: 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
