import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  selectProducts,
  selectPagination,
  selectCurrentProduct,
  selectProductLoading,
  selectVariantLoading,
  selectStockLoading,
  selectProductError,
  clearProductError,
  setCurrentProduct,
} from '../product.slice'
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchVariants,
  createVariant,
  deleteVariant,
  fetchProductStock,
  upsertStock,
} from '../product.thunk'

const useProduct = () => {
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const pagination = useSelector(selectPagination)
  const currentProduct = useSelector(selectCurrentProduct)
  const loading = useSelector(selectProductLoading)
  const variantLoading = useSelector(selectVariantLoading)
  const stockLoading = useSelector(selectStockLoading)
  const error = useSelector(selectProductError)

  const loadProducts = (params) => dispatch(fetchProducts(params))

  const loadProductById = (id) => dispatch(fetchProductById(id))

  const handleCreateProduct = async (productData) => {
    const result = await dispatch(createProduct(productData))
    if (createProduct.fulfilled.match(result)) {
      toast.success('Product created successfully!')
      return result.payload?.data || result.payload
    } else {
      toast.error(result.payload || 'Failed to create product')
      return null
    }
  }

  const handleUpdateProduct = async (id, productData) => {
    const result = await dispatch(updateProduct({ id, productData }))
    if (updateProduct.fulfilled.match(result)) {
      toast.success('Product updated successfully!')
      return result.payload?.data || result.payload
    } else {
      toast.error(result.payload || 'Failed to update product')
      return null
    }
  }

  const handleDeleteProduct = async (id) => {
    const result = await dispatch(deleteProduct(id))
    if (deleteProduct.fulfilled.match(result)) {
      toast.success('Product deleted successfully!')
      return true
    } else {
      toast.error(result.payload || 'Failed to delete product')
      return false
    }
  }

  const loadVariants = (productId) => dispatch(fetchVariants(productId))

  const handleCreateVariant = async (productId, variantData) => {
    const result = await dispatch(createVariant({ productId, variantData }))
    if (createVariant.fulfilled.match(result)) {
      toast.success('Variant added successfully!')
      return result.payload?.variant
    } else {
      toast.error(result.payload || 'Failed to create variant')
      return null
    }
  }

  const handleDeleteVariant = async (productId, variantId) => {
    const result = await dispatch(deleteVariant({ productId, variantId }))
    if (deleteVariant.fulfilled.match(result)) {
      toast.success('Variant deleted!')
      return true
    } else {
      toast.error(result.payload || 'Failed to delete variant')
      return false
    }
  }

  const loadStock = (productId, variantId) =>
    dispatch(fetchProductStock({ productId, variantId }))

  const handleUpsertStock = async (productId, variantId, stockData) => {
    const result = await dispatch(upsertStock({ productId, variantId, stockData }))
    if (upsertStock.fulfilled.match(result)) {
      toast.success('Stock updated successfully!')
      return result.payload?.stock
    } else {
      toast.error(result.payload || 'Failed to update stock')
      return null
    }
  }

  const dismissError = () => dispatch(clearProductError())
  const selectProduct = (prod) => dispatch(setCurrentProduct(prod))

  return {
    products,
    pagination,
    currentProduct,
    loading,
    variantLoading,
    stockLoading,
    error,
    loadProducts,
    loadProductById,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    loadVariants,
    handleCreateVariant,
    handleDeleteVariant,
    loadStock,
    handleUpsertStock,
    dismissError,
    selectProduct,
  }
}

export default useProduct
