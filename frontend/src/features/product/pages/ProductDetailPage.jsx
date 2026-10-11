import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import useProduct from '../hooks/useProduct'
import VariantModal from '../components/VariantModal'
import StockModal from '../components/StockModal'
import Button from '../../../components/common/Button'

const ProductDetailPage = () => {
  const { id } = useParams()
  const {
    currentProduct,
    loading,
    variantLoading,
    loadProductById,
    loadVariants,
    loadStock,
    handleDeleteVariant,
  } = useProduct()

  const [variants, setVariants] = useState([])
  const [baseStock, setBaseStock] = useState(null)
  const [variantModalOpen, setVariantModalOpen] = useState(false)
  const [stockModalTarget, setStockModalTarget] = useState(null) // { product, variant? }

  useEffect(() => {
    if (id) {
      loadProductById(id).then((res) => {
        const prod = res.payload?.data || res.payload
        if (prod) {
          // Load variants
          loadVariants(id).then((vRes) => {
            setVariants(vRes.payload?.variants || [])
          })
          // Load base stock
          loadStock(id, null).then((sRes) => {
            setBaseStock(sRes.payload?.stock || null)
          })
        }
      })
    }
  }, [id])

  const refreshVariantsAndStock = () => {
    if (id) {
      loadVariants(id).then((vRes) => setVariants(vRes.payload?.variants || []))
      loadStock(id, null).then((sRes) => setBaseStock(sRes.payload?.stock || null))
    }
  }

  if (loading && !currentProduct) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading product details...</p>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
        <p className="text-slate-300 font-semibold mb-4">Product not found</p>
        <Link to="/products">
          <Button variant="outline" size="sm">
            ← Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="text-xs font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Product Catalog
        </Link>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${
            currentProduct.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
          }`}
        >
          {currentProduct.status || 'Active'}
        </span>
      </div>

      {/* Main Product Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {currentProduct.category?.name || 'Category'}
              </span>
              {currentProduct.brand && (
                <span className="text-xs text-slate-400 font-medium">
                  by {currentProduct.brand}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              {currentProduct.name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              SKU: {currentProduct.sku || 'N/A'} • ID: {currentProduct._id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-semibold">Base Price</p>
              <p className="text-2xl font-extrabold text-cyan-300">₹{currentProduct.price}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockModalTarget({ product: currentProduct })}
              className="flex items-center gap-1.5 ml-2"
            >
              <span>📦</span> Manage Base Stock
            </Button>
          </div>
        </div>

        {/* Base Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-500 font-semibold uppercase">Base Stock Count</span>
            <p className="text-xl font-bold text-slate-200 mt-1">
              {baseStock?.quantity ?? '0'} units
            </p>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-2 inline-block ${
                baseStock?.stockStatus === 'in_stock'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              {baseStock?.stockStatus?.replace('_', ' ') || 'untracked'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Variants</span>
            <p className="text-xl font-bold text-slate-200 mt-1">{variants.length}</p>
            <p className="text-xs text-slate-500 mt-1">Variations like Size, Color</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-xs text-slate-500 font-semibold uppercase">Product Description</span>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {currentProduct.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Product Variants Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h2 className="text-lg font-bold text-slate-100">Product Variants</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add individual SKU variations (e.g. Size M, Color Red) with specific stock and pricing
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setVariantModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0"
          >
            <span>＋</span> Add Variant
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-2">No variants created for this product yet.</p>
            <p className="text-xs text-slate-500 mb-4">
              Add variants if your product comes in different sizes, colors, or configurations.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVariantModalOpen(true)}
            >
              + Create First Variant
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Variant SKU</th>
                  <th className="py-3 px-4">Attributes</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {variants.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {v.sku}
                    </td>
                    <td className="py-3.5 px-4">
                      {v.attributes && Object.keys(v.attributes).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(v.attributes).map(([key, val]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300"
                            >
                              <strong className="text-slate-400 font-medium">{key}:</strong> {val}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-300">
                      ₹{v.price || currentProduct.price}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setStockModalTarget({ product: currentProduct, variant: v })}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors"
                      >
                        📦 Stock
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete variant ${v.sku}?`)) {
                            await handleDeleteVariant(currentProduct._id, v._id)
                            refreshVariantsAndStock()
                          }
                        }}
                        className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <VariantModal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        product={currentProduct}
        onCreated={() => refreshVariantsAndStock()}
      />

      <StockModal
        isOpen={Boolean(stockModalTarget)}
        onClose={() => setStockModalTarget(null)}
        product={stockModalTarget?.product}
        variant={stockModalTarget?.variant}
        onUpdated={() => refreshVariantsAndStock()}
      />
    </div>
  )
}

export default ProductDetailPage
