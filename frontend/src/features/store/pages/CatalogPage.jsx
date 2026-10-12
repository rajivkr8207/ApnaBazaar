import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../category/category.thunk'
import { selectCategories } from '../../category/category.slice'
import catalogService from '../services/catalog.service'
import { addToCart } from '../cart.thunk'
import { selectCartActionLoading } from '../cart.slice'
import { toast } from 'react-toastify'
import { selectIsAuthenticated } from '../../auth/auth.slice'
import { useNavigate } from 'react-router'

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart }) => {
  const price = product.price || 0
  const image = product.images?.[0]
  const hasVariants = product.variantCount > 0

  return (
    <div className="group flex flex-col rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/store/product/${product._id}`} className="block aspect-square bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-6xl opacity-20">📦</span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={`/store/product/${product._id}`}>
          <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 hover:text-violet-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.category?.name && (
          <span className="text-xs text-slate-500">{product.category.name}</span>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {hasVariants && (
              <span className="block text-[10px] text-slate-500">+{product.variantCount} variants</span>
            )}
          </div>

          {hasVariants ? (
            <Link
              to={`/store/product/${product._id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Options
            </Link>
          ) : (
            <button
              id={`add-cart-${product._id}`}
              onClick={() => onAddToCart(product._id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              + Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Catalog Page ──────────────────────────────────────────────────────────────
const CatalogPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = useSelector(selectCategories)
  const actionLoading = useSelector(selectCartActionLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const selectedCategory = searchParams.get('category') || ''
  const currentPage = Number(searchParams.get('page') || 1)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 12 }
      if (selectedCategory) params.category = selectedCategory
      if (search) params.search = search

      const { data } = await catalogService.getCatalog(params)
      const d = data?.data || data
      const items = d?.items || d?.products || (Array.isArray(d) ? d : [])
      setProducts(items)
      setPagination({
        page: d?.page ?? currentPage,
        total: d?.totalItems ?? d?.total ?? 0,
        totalPages: d?.totalPages ?? 1,
      })
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search, currentPage])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setSearchParams((prev) => {
      const np = new URLSearchParams(prev)
      if (searchInput) np.set('search', searchInput)
      else np.delete('search')
      np.set('page', '1')
      return np
    })
  }

  const handleCategory = (catId) => {
    setSearchParams((prev) => {
      const np = new URLSearchParams(prev)
      if (catId) np.set('category', catId)
      else np.delete('category')
      np.set('page', '1')
      return np
    })
  }

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to cart')
      navigate('/login')
      return
    }
    const res = await dispatch(addToCart({ productId, quantity: 1 }))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Added to cart! 🛒')
    } else {
      toast.error(res.payload || 'Could not add to cart')
    }
  }

  const handlePage = (p) => {
    setSearchParams((prev) => {
      const np = new URLSearchParams(prev)
      np.set('page', String(p))
      return np
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Explore <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Products</span>
        </h1>
        <p className="text-slate-400">Find exactly what you're looking for</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className="lg:w-60 flex-shrink-0">
          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                id="catalog-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                🔍
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wide">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategory('')}
                className={[
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  !selectedCategory
                    ? 'bg-violet-500/15 text-violet-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                ].join(' ')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategory(cat._id)}
                  className={[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedCategory === cat._id
                      ? 'bg-violet-500/15 text-violet-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                  ].join(' ')}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {/* Stats */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-400">
              {loading ? 'Loading...' : `${pagination.total} products found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium text-slate-400">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => handlePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    ←
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const p = i + 1
                    if (Math.abs(p - currentPage) > 2 && p !== 1 && p !== pagination.totalPages) return null
                    return (
                      <button
                        key={p}
                        onClick={() => handlePage(p)}
                        className={[
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          p === currentPage
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white',
                        ].join(' ')}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogPage
