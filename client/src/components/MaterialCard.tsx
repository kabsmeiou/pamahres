"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"

import type { Material } from "../types/course"
import { FileText, Download, Plus, Trash2, Loader, Calendar, File } from "react-feather"

import supabase from "../lib/supabase"

import { useMaterialsApi } from "../services/courses"

import { useDeleteItem } from "../hooks/useDeleteItem"
import DeleteConfirmation from "./DeleteConfirmation"

import QuizForm from "../pages/QuizPage/QuizForm"

const MaterialCard = ({
  material,
  pdfFiles,
  setPdfFiles,
}: {
  material: Material;
  pdfFiles: Record<string, { file: File; url: string }>;
  setPdfFiles: React.Dispatch<React.SetStateAction<Record<string, { file: File; url: string }>>>;
}) => {
  const { deleteMaterial, getMaterialById } = useMaterialsApi()
  const { courseId } = useParams<{ courseId: string }>()

  const numericCourseId = Number.parseInt(courseId!, 10)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)
  const [isOpeningPDF, setIsOpeningPDF] = useState<boolean>(false)

  const [showQuizForm, setShowQuizForm] = useState<boolean>(false)

  const { isDeleting, handleDelete } = useDeleteItem(
    deleteMaterial as (courseId: number | string, id?: number) => Promise<Material>,
    (courseId) => ["materials", courseId ?? ""]
  )

  const handleDeleteConfirm = () => {
    handleDelete(numericCourseId, material.id!, () => setShowDeleteConfirm(false));
    // delete this instance
  };

  // Format file size to a readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };
  
  const handleViewPDF = async (file_name: string, id: number) => {
    setIsOpeningPDF(true)
    const fileData = pdfFiles[`${file_name}`]; // get via file_name

    if (fileData) {
      // Option 1: Open in a new tab
      window.open(fileData.url, "_blank")
      setIsOpeningPDF(false)
    } else {
      console.log("File not found in memory. Fetching from Supabase.")
      const response = await getMaterialById(id)
      const file_url: string = response.material_file_url
      try {
        // use supabase to fetch the file
        const { data, error } = await supabase.storage.from('materials-all').download(file_url)
        if (error) {
          console.error('Error fetching file:', error)
        } else {
          const url = URL.createObjectURL(data)
          window.open(url, '_blank')
          // remember the file by storing it in the pdfFiles state so next time it can be opened from memory
          // ts dumb
          setPdfFiles(prev => ({
            ...prev,
            [file_name]: { file: data as File, url },
          }))
        }
      } catch (error) {
        console.error('Error fetching file:', error)
      } finally {
        setIsOpeningPDF(false)
      }
    }
  }

  const formattedSize = material.file_size ? formatFileSize(material.file_size) : "Unknown size";

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-full"
    >
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          {/* File icon */}
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mb-2 sm:mb-0">
            <FileText size={22} />
          </div>

          <div className="flex-1 min-w-0 w-full">
            {/* File name and type */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                {material.file_name}
              </h3>
              <p className="mt-1 text-gray-500 text-xs sm:text-sm flex items-center gap-1.5">
                <File size={14} className="text-gray-400" />
                <span>{material.file_type || 'application/pdf'}</span>
              </p>
            </div>

            {/* File metadata */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
              {material.uploaded_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{material.uploaded_at}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Download size={14} className="text-gray-400" />
                <span>{formattedSize}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row sm:flex-col items-end sm:items-center gap-2 ml-0 sm:ml-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setShowQuizForm(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-xs sm:text-sm font-medium"
            >
              <Plus size={16} className="flex-shrink-0" />
              <span>New Quiz</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className={`p-2 rounded-lg transition-colors ${
                isDeleting 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
              aria-label="Delete material"
              title="Delete material"
            >
              {isDeleting ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* View PDF button */}
      <div 
        onClick={() => {
          handleViewPDF(material.file_name!, material.id!)
        }}
        className="border-t border-gray-100 p-2 sm:p-3 bg-gray-50 flex justify-end cursor-pointer"
      >
        <div
          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1.5 px-2 sm:px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FileText size={14} />
          <span className="text-xs sm:text-sm">{isOpeningPDF ? 'Opening...' : 'View PDF'}</span>
        </div>
      </div>

      <DeleteConfirmation
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isDeleting={isDeleting}
        handleDelete={handleDeleteConfirm}
        itemName={material.file_name}
        itemType="Material"
      />

      <QuizForm 
        isOpen={showQuizForm}
        onClose={() => setShowQuizForm(false)}
        materialQuiz={{
          materialId: material.id!,
          file_name: material.file_name!
        }}
      />
    </div>
  )
}

export default MaterialCard
