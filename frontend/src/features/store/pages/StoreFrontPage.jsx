import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../category/category.thunk'
import { selectCategories, selectCategoryLoading } from '../../category/category.slice'
import catalogService from '../services/catalog.service'

const HeroSection = () => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-slate-900 to-cyan-900 p-10 md:p-16 mb-12 border border-violet-500/20 shadow-2xl">
    {/* Decorative blobs */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

    <div className="relative z-10 max-w-xl">
      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-4">
        🎉 Biggest Sale of the Year
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
        Discover <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Amazing</span> Products
      </h1>
      <p className="text-slate-400 text-lg mb-8 leading-relaxed">
        Shop from thousands of curated products. Fast delivery, best prices, trusted sellers.
      </p>
      <Link
        to="/store/catalog"
        id="hero-shop-now-btn"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-300 shadow-xl shadow-violet-500/30 hover:scale-105"
      >
        Shop Now <span>→</span>
      </Link>
    </div>
  </div>
)

const CategoryCard = ({ category }) => (
  <Link
    to={`/store/catalog?category=${category._id}`}
    className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
      🏷️
    </div>
    <span className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors text-center">
      {category.name}
    </span>
    {category.description && (
      <span className="text-xs text-slate-500 mt-1 text-center line-clamp-1">
        {category.description}
      </span>
    )}
  </Link>
)

const FeaturedProductCard = ({ product }) => {
  const price = product.price || 0
  const image = product.images?.[0]

  return (
    <Link
      to={`/store/product/${product._id}`}
      className="group flex flex-col rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-5xl opacity-30">📦</span>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 group-hover:text-violet-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1">{product.category?.name || ''}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

const StoreFrontPage = () => {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const catLoading = useSelector(selectCategoryLoading)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [prodLoading, setProdLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await catalogService.getCatalog({ limit: 8 })
        const d = data?.data || data
        const items = d?.items || d?.products || (Array.isArray(d) ? d : [])
        setFeaturedProducts(items)
      } catch {
        setFeaturedProducts([])
      } finally {
        setProdLoading(false)
      }
    }
    loadFeatured()
  }, [])

  return (
    <div className="animate-fade-up">
      <HeroSection />

      {/* Categories */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Shop by <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Category</span>
          </h2>
          <Link to="/store/catalog" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View all →
          </Link>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-slate-500 text-sm">No categories available</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Featured <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Products</span>
          </h2>
          <Link to="/store/catalog" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            See all →
          </Link>
        </div>

        {prodLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">🛒</p>
            <p>No products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {featuredProducts.map((p) => (
              <FeaturedProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default StoreFrontPage
