import { useApiClient } from "./api";
import { Course } from "../types/course";  // Import the Course type
import { Material } from "../types/course";
import { useState } from "react";

export function useCoursesApi() {
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Course[]>("api-courses/courses/");
        console.log(response.data);
        return response.data;
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        throw err;
      } finally {
        setLoading(false);
      }
    }

    const getCourseById = async (id: string | number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Course>(`api-courses/courses/${id}/`);
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Something went wrong');
            throw err;
        }
    }

    const createCourse = async (data: Course) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<Course>("api-courses/courses/", data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
    }
  
    return { getCourses, getCourseById, createCourse, loading, error };
}


export function useMaterialsApi() {
    const api = useApiClient();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch materials
    const getMaterials = async (id: number) => {
      setLoading(true);
      setError(null); // Clear previous errors
  
      try {
        const response = await api.get<Material[]>(`api-courses/courses/${id}/materials/`);
        setLoading(false);
        return response.data; // Return the materials
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Something went wrong');
        throw err; // Rethrow the error if needed
      }
    };
  
    // Create a material
    const createMaterial = async (id: number, data: Material) => {
      setLoading(true);
      setError(null); // Clear previous errors
  
      try {
        const response = await api.post<Material>(`api-courses/courses/${id}/materials/`, data);
        setLoading(false);
        return response; // Return the created material
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Something went wrong');
        throw err; // Rethrow the error if needed
      }
    };
  
    const deleteMaterial = async (id: number, courseId: number | string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.delete<Material>(`api-courses/courses/${courseId}/materials/${id}/`);
            return response; // Return the deleted material
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            throw err; // Rethrow the error if needed
        } finally {
            setLoading(false);
        }
    };

    const getMaterialById = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Material>(`api-courses/materials/${id}/`);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
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