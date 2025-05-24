// useDeleteItem.ts
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useDeleteItem<T>(
  deleteFn: (id: number, courseId: number | string) => Promise<T>,
  queryKey: (courseId?: number | string) => (string | number)[]
) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async (
    id: number,
    courseId: number | string,
    onAfterDelete?: () => void
  ) => {
    try {
      setIsDeleting(true)
      await deleteFn(id, courseId)
      await queryClient.invalidateQueries({ queryKey: queryKey(courseId) })
      onAfterDelete?.()
    } catch (error) {
      console.error("Error deleting item:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return { isDeleting, handleDelete }
}