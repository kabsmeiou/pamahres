// useDeleteItem.ts
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useDeleteItem<T>(
  deleteFn: (courseId: number | string, id?: number) => Promise<T>,
  queryKey: (courseId?: number | string) => (string | number)[]
) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = async (
    courseId: number | string,
    id?: number,
    onAfterDelete?: () => void
  ) => {
    try {
      setIsDeleting(true)
      await deleteFn(courseId, id)
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