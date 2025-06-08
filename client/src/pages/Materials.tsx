"use client"

import React, { useState, useContext } from "react" // Added useState import
import { useMaterialsApi } from "../services/courses"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import supabase from "../lib/supabase"

import CourseHeader from "../components/CourseHeader"
import MaterialList from "../components/MaterialList"
import EmptyFallback from "../components/EmptyFallback"
import MaterialListSkeleton from "../components/MaterialListSkeleton"

import type { Material } from "../types/course"
import { MaterialsContext } from "../components/CourseLayout"

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <CourseHeader isUploading={isUploading} handleFileUpload={handleFileUpload} />
        <div className="mt-6">
          {materialsLoading ? (
            <div className="p-4">
              <MaterialListSkeleton count={1} />
            </div>
          ) : materials && materials.length === 0 ? (
            <div className="py-6">
              <EmptyFallback />
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
      {/* <div className="flex items-center justify-between">
        {isUploading && (
          <div className="flex items-center text-primary-600 text-sm font-medium">
            <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Uploading...
          </div>
        )}
      </div> */}

    </div>
  )
}

export default Materials
