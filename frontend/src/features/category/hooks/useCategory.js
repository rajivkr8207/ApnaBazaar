import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  selectCategories,
  selectCategoryLoading,
  selectCategoryError,
  clearCategoryError,
} from '../category.slice'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../category.thunk'

const useCategory = () => {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const loading = useSelector(selectCategoryLoading)
  const error = useSelector(selectCategoryError)

  const loadCategories = () => dispatch(fetchCategories())

  const handleCreateCategory = async (categoryData) => {
    const result = await dispatch(createCategory(categoryData))
    if (createCategory.fulfilled.match(result)) {
      toast.success('Category created successfully!')
      return result.payload
    } else {
      toast.error(result.payload || 'Failed to create category')
      return null
    }
  }

  const handleUpdateCategory = async (id, categoryData) => {
    const result = await dispatch(updateCategory({ id, categoryData }))
    if (updateCategory.fulfilled.match(result)) {
      toast.success('Category updated successfully!')
      return result.payload
    } else {
      toast.error(result.payload || 'Failed to update category')
      return null
    }
  }

  const handleDeleteCategory = async (id) => {
    const result = await dispatch(deleteCategory(id))
    if (deleteCategory.fulfilled.match(result)) {
      toast.success('Category deleted successfully!')
      return true
    } else {
      toast.error(result.payload || 'Failed to delete category')
      return false
    }
  }

  const dismissError = () => dispatch(clearCategoryError())

  return {
    categories,
    loading,
    error,
    loadCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    dismissError,
  }
}

export default useCategory
