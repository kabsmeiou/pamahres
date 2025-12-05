"use client"

import React, { useState, useContext } from "react" // Added useState import
import { useMaterialsApi } from "../../services/courses"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import supabase from "../../lib/supabase"

import CourseHeader from "../CourseView/CourseHeader"
import MaterialList from "../../components/MaterialList"
import MaterialListSkeleton from "../../components/MaterialListSkeleton"

import type { Material } from "../../types/course"
import { MaterialsContext } from "../../components/CourseLayout"

const Materials = () => {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false) // Added uploading state
  const { courseId } = useParams<{ courseId: string }>()
  const numericCourseId = Number.parseInt(courseId ?? '', 10)

  const { createMaterial } = useMaterialsApi()

  // a state dictionary for pdf files
  const [pdfFiles, setPdfFiles] = useState<Record<string, { file: File; url: string }>>({})

  const context = useContext(MaterialsContext)
  if (!context) throw new Error("MaterialsContext not found")
  const { materials, setMaterials, materialsLoading } = context

  const validateFilename = (fileName: string) => {
    // replace all spaces with underscores
    let sanitizedFileName = fileName.replace(/\s+/g, "_")
    // replace all special characters with underscores
    sanitizedFileName = sanitizedFileName.replace(/[^a-zA-Z0-9_]/g, "_")
    // replace all multiple underscores with a single underscore
    sanitizedFileName = sanitizedFileName.replace(/\_+/g, "_")
    return sanitizedFileName
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Set uploading state to true
    setIsUploading(true)

    const date = new Date().toISOString().split(".")[0]
    const fileName = file.name // "test_content.pdf"

    const fileNameWithoutExtension = fileName.replace(/\.pdf$/, "") // Strips the ".pdf" extension
    const filePath = `${date}_${validateFilename(fileNameWithoutExtension)}`

    try {
      const { data, error } = await supabase.storage.from("materials-all").upload(filePath, file)

      // if the file is uploaded successfully, create a url for the file so it can be viewed immediately
      if (!error && data) {
        const url = URL.createObjectURL(file); // Makes it viewable immediately
        setPdfFiles(prev => ({
          ...prev,
          [fileNameWithoutExtension]: { file, url },
        }));
      } else {
        console.error('Upload failed:', error);
      }

      if (error) {
        console.error("Error uploading file:", error)
        throw error
      } else {
        const newMaterial: Material = {
          material_file_url: filePath,
          file_name: fileNameWithoutExtension,
          file_size: file.size,
          file_type: file.type,
        }
        
        await createMaterial(numericCourseId, newMaterial)
        
        // update context materials immediately after the user uploads
        setMaterials(prev => (prev ? [...prev, newMaterial] : [newMaterial]));

        // keep loading state active until query refetch completes
        await queryClient.invalidateQueries({
          queryKey: ["materials", numericCourseId],
        })
      }
    } catch (error) {
      console.error("Error during upload process:", error)
    } finally {
      // Set uploading state back to false when done
      setIsUploading(false)
    }
  }

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border border-primary-200/50 dark:border-primary-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-600 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Course Materials</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Upload and manage your learning resources</p>
          </div>
        </div>
    
        <div className="mt-4">
          <CourseHeader isUploading={isUploading} handleFileUpload={handleFileUpload} />
        </div>
      </div>

      {/* Materials Content */}
      <div className="bg-white dark:bg-gray-800">
        <div className="p-6">
          {materialsLoading ? (
            <div>
              <MaterialListSkeleton count={3} />
            </div>
          ) : materials && materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No materials yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first PDF to get started with this course.</p>
            </div>
          ) : (
            <MaterialList 
              materials={materials ?? []} 
              pdfFiles={pdfFiles}
              setPdfFiles={setPdfFiles}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Materials
