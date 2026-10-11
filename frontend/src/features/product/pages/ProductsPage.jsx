import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import useProduct from '../hooks/useProduct'
import useCategory from '../../category/hooks/useCategory'
import CreateProductModal from '../components/CreateProductModal'
import CreateCategoryModal from '../../category/components/CreateCategoryModal'
import StockModal from '../components/StockModal'
import Button from '../../../components/common/Button'

const ProductsPage = () => {
  const { products, loading, loadProducts, handleDeleteProduct } = useProduct()
  const { categories, loadCategories } = useCategory()

  const [createProductOpen, setCreateProductOpen] = useState(false)
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [stockModalTarget, setStockModalTarget] = useState(null)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      !selectedCategory ||
      p.category?._id === selectedCategory ||
      p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <h1 className="text-2xl font-bold text-slate-100">Product Catalog</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage your items, customize variations, and track warehouse stock
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setCreateCategoryOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>🏷️</span> New Category
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateProductOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>＋</span> Add Product
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by product name, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
            />
            <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium self-end sm:self-center">
          Showing: <strong className="text-slate-200">{filteredProducts.length}</strong> products
        </span>
      </div>

      {/* Product List / Cards */}
      {loading && products.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-3xl mx-auto mb-3">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-200">No products found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            {search || selectedCategory
              ? 'Try modifying your search query or category filter.'
              : 'Add your first product with customized variants and live stock tracking.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setCreateProductOpen(true)}>
            + Add First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const categoryName =
              categories.find((c) => c._id === (product.category?._id || product.category))?.name ||
              product.category?.name ||
              'General'

            return (
              <div
                key={product._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                      {categoryName}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        product.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {product.status || 'Active'}
                    </span>
                  </div>

                  {/* Title & SKU */}
                  <Link
                    to={`/products/${product._id}`}
                    className="font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 block"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                    <span>SKU: {product.sku || 'N/A'}</span>
                    {product.brand && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">{product.brand}</span>
                      </>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price & Action Section */}
                <div className="pt-4 mt-5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Price</span>
                      <p className="text-xl font-black text-cyan-300">₹{product.price}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStockModalTarget({ product })}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
                        title="Update Base Stock"
                      >
                        <span>📦</span> Stock
                      </button>
                      <Link
                        to={`/products/${product._id}`}
                        className="px-2.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-medium border border-violet-500/30 transition-colors flex items-center gap-1"
                      >
                        <span>✨</span> Variants
                      </Link>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/40">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-violet-400 hover:text-cyan-400 font-medium transition-colors"
                    >
                      View Details →
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                          await handleDeleteProduct(product._id)
                          loadProducts()
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <CreateProductModal
        isOpen={createProductOpen}
        onClose={() => setCreateProductOpen(false)}
        onCreated={() => loadProducts()}
      />

      <CreateCategoryModal
        isOpen={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onCreated={() => loadCategories()}
      />

      <StockModal
        isOpen={Boolean(stockModalTarget)}
        onClose={() => setStockModalTarget(null)}
        product={stockModalTarget?.product}
        onUpdated={() => loadProducts()}
      />
    </div>
  )
}

export default ProductsPage
