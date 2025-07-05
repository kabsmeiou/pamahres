import { Loader, Upload, FileText, Book } from "react-feather";

const MaterialHeader = ({
  isUploading, 
  handleFileUpload
}: {
  isUploading: boolean, 
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg flex-shrink-0 hidden sm:flex">
            <Book size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Study Materials</h1>
            <p className="mt-1.5 text-gray-600 dark:text-gray-400">Manage your PDF documents and generate quizzes</p>
          </div>
        </div>
      {/* File upload tips */}
      <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
        <FileText size={20} className="flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
        <div>
          <p className="font-medium">Upload PDF documents to get started</p>
          <p className="mt-1 text-blue-600 dark:text-blue-400">Supported file types: PDF. Maximum file size: 10MB.</p>
        </div>
      </div>
        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-lg flex items-center gap-2 animate-pulse">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          )}
          
          <label
            className={`
              inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200
              ${isUploading 
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                : "bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-800 cursor-pointer"
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
      <div className="h-px bg-gray-100 dark:bg-gray-700 my-6"></div>
    </div>
  );
};

export default MaterialHeader;
