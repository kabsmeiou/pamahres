import { useApiClient } from "./api";
import { Course } from "../types/course";  // Import the Course type
import { Material } from "../types/course";
import { useState } from "react";
import callApi from "../hooks/callApi";

export function useCoursesApi() {
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCourses = async () => {
      return callApi(() => api.get<Course[]>("api-courses/courses/"), setLoading, setError);
    }

    const getCourseById = async (id: string | number) => {
      return callApi(() => api.get<Course>(`api-courses/courses/${id}/`), setLoading, setError);
    }

    const createCourse = async (data: Course) => {
      return callApi(() => api.post<Course>("api-courses/courses/", data), setLoading, setError);
    }

    const deleteCourse = async (id: number | string) => {
      return callApi(() => api.delete<Course>(`api-courses/courses/${id}/`), setLoading, setError);
    }
  
    return { getCourses, getCourseById, createCourse, deleteCourse, loading, error };
}


export function useMaterialsApi() {
    const api = useApiClient();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch materials
    const getMaterials = async (id: number) => {
      return callApi(() => api.get<Material[]>(`api-courses/courses/${id}/materials/`), setLoading, setError);
    };
  
    // Create a material
    const createMaterial = async (id: number, data: Material) => {
      return callApi(() => api.post<Material>(`api-courses/courses/${id}/materials/`, data), setLoading, setError);
    };
  
    const deleteMaterial = async (id: number, courseId: number | string) => {
      return callApi(() => api.delete<Material>(`api-courses/courses/${courseId}/materials/${id}/`), setLoading, setError);
    };

    const getMaterialById = async (id: number) => {
      return callApi(() => api.get<Material>(`api-courses/materials/${id}/`), setLoading, setError);
    }

    return {
      getMaterials,
      createMaterial,
      deleteMaterial,
      getMaterialById,
      loading,
      error,
    };
  }