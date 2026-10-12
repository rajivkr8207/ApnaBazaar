import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../cart.thunk'
import { selectCartActionLoading } from '../cart.slice'
import { selectIsAuthenticated } from '../../auth/auth.slice'
import catalogService from '../services/catalog.service'
import productService from '../../product/services/product.service'
import { toast } from 'react-toastify'

const StarRating = ({ count = 5 }) => (
  <div className="flex gap-0.5">
    {[...Array(count)].map((_, i) => (
      <span key={i} className={i < 4 ? 'text-yellow-400' : 'text-slate-600'}>★</span>
    ))}
  </div>
)

const ProductDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const actionLoading = useSelector(selectCartActionLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Try public catalog endpoint first
        const { data } = await catalogService.getCatalog({ limit: 1 })
        // We need the product detail — use public catalog listing and filter
        // Actually fetch by catalog with a targeted request
        // Since catalog doesn't have /:id public, try the direct product endpoint
        // (customer is authenticated, so it will work for buyer role)
        const prodResp = await productService.getProductById(id)
        const p = prodResp.data?.data || prodResp.data
        setProduct(p)

        // Fetch variants
        try {
          const varResp = await productService.getVariants(id)
          const vd = varResp.data?.data || varResp.data
          const list = Array.isArray(vd) ? vd : vd?.items || []
          setVariants(list)
        } catch {
          setVariants([])
        }
      } catch (err) {
        toast.error('Failed to load product')
        navigate('/store/catalog')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to cart')
      navigate('/login')
      return
    }
    const res = await dispatch(addToCart({
      productId: id,
      variantId: selectedVariant?._id || null,
      quantity,
    }))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Added to cart! 🛒')
    } else {
      toast.error(res.payload || 'Could not add to cart')
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in first')
      navigate('/login')
      return
    }
    const res = await dispatch(addToCart({
      productId: id,
      variantId: selectedVariant?._id || null,
      quantity,
    }))
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/store/cart')
    } else {
      toast.error(res.payload || 'Could not process')
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square rounded-3xl bg-slate-800" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-800 rounded-xl" />
          <div className="h-4 bg-slate-800 rounded-xl w-2/3" />
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!product) return null

  const displayPrice = selectedVariant?.price > 0 ? selectedVariant.price : product.price
  const displayImages = selectedVariant?.images?.length ? selectedVariant.images : product.images || []

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <a href="/store" className="hover:text-slate-300 transition-colors">Home</a>
        <span>/</span>
        <a href="/store/catalog" className="hover:text-slate-300 transition-colors">Shop</a>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image Gallery ── */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 overflow-hidden border border-slate-700 shadow-2xl">
            {displayImages[selectedImage] ? (
              <img
                src={displayImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">📦</span>
              </div>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={[
                    'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                    selectedImage === i ? 'border-violet-500' : 'border-slate-700 hover:border-slate-500',
                  ].join(' ')}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-5">
          {product.category?.name && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 w-fit">
              🏷️ {product.category.name}
            </span>
          )}

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <StarRating />
              <span className="text-xs text-slate-500">(4.2 • 128 reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ₹{Number(displayPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-green-400 font-medium">✓ In Stock</span>
          </div>

          {product.description && (
            <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4">
              {product.description}
            </p>
          )}

          {/* ── Variant Selector ── */}
          {variants.length > 0 && (
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">
                Select Variant
                {selectedVariant && (
                  <span className="ml-2 text-violet-400 font-normal">— {selectedVariant.name || selectedVariant.sku}</span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v._id}
                    id={`variant-${v._id}`}
                    onClick={() => setSelectedVariant(selectedVariant?._id === v._id ? null : v)}
                    className={[
                      'px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200',
                      selectedVariant?._id === v._id
                        ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-violet-300',
                    ].join(' ')}
                  >
                    {v.name || v.sku || `Option ${v._id.slice(-4)}`}
                    {v.price > 0 && v.price !== product.price && (
                      <span className="ml-1.5 text-xs opacity-75">₹{Number(v.price).toLocaleString('en-IN')}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Quantity ── */}
          <div className="flex items-center gap-4 border-t border-slate-800 pt-4">
            <span className="text-sm font-bold text-slate-300">Quantity</span>
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl border border-slate-700 p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center text-white font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* ── CTA Buttons ── */}
          <div className="flex gap-3 pt-2">
            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={actionLoading}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-slate-800 border border-violet-500/40 hover:bg-slate-700 hover:border-violet-400/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? '⏳ Adding...' : '🛒 Add to Cart'}
            </button>
            <button
              id="buy-now-btn"
              onClick={handleBuyNow}
              disabled={actionLoading}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 pt-2">
            {['🚚 Free Delivery', '↩️ Easy Returns', '🔒 Secure Payment'].map((badge) => (
              <span key={badge} className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-400">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
