import { useApiClient } from "./api";
import { Course } from "../types/course";  // Import the Course type
import { Material } from "../types/course";
import { useState } from "react";
import callApi from "../lib/apiHelper";

export function useCoursesApi() {
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCourses = async () => {
      return callApi(() => api.get<Course[]>("courses/"), setLoading, setError);
    }

    const getCourseById = async (id: string | number) => {
      return callApi(() => api.get<Course>(`courses/${id}/`), setLoading, setError);
    }

    const createCourse = async (data: Course) => {
      return callApi(() => api.post<Course>("courses/", data), setLoading, setError);
    }

    const deleteCourse = async (id: number | string) => {
      return callApi(() => api.delete<Course>(`courses/${id}/`), setLoading, setError);
    }
  
    return { getCourses, getCourseById, createCourse, deleteCourse, loading, error };
}


export function useMaterialsApi() {
    const api = useApiClient();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch materials
    const getMaterials = async (id: number) => {
      return callApi(() => api.get<Material[]>(`courses/${id}/materials/`), setLoading, setError);
    };
  
    // Create a material
    const createMaterial = async (id: number, data: Material) => {
      return callApi(() => api.post<Material>(`courses/${id}/materials/`, data), setLoading, setError);
    };
  
    const deleteMaterial = async (courseId: number | string, id: number) => {
      return callApi(() => api.delete<Material>(`courses/${courseId}/materials/${id}/`), setLoading, setError);
    };

    const getMaterialById = async (id: number) => {
      return callApi(() => api.get<Material>(`materials/${id}/`), setLoading, setError);
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