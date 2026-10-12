import { useState, useEffect } from 'react'
import useProduct from '../hooks/useProduct'
import useCategory from '../../category/hooks/useCategory'
import CreateCategoryModal from '../../category/components/CreateCategoryModal'
import Button from '../../../components/common/Button'
import InputField from '../../../components/common/Inputfield'

const CreateProductModal = ({ isOpen, onClose, onCreated }) => {
  const { handleCreateProduct, handleUpsertStock, loading } = useProduct()
  const { categories, loadCategories } = useCategory()
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    sku: '',
    brand: '',
    description: '',
    initialStock: '25',
    status: 'published',
  })

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category || !form.price) return

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      status: form.status,
    }

    if (form.sku.trim()) payload.sku = form.sku.trim()
    if (form.brand.trim()) payload.brand = form.brand.trim()
    if (form.description.trim()) payload.description = form.description.trim()

    const created = await handleCreateProduct(payload)
    if (created) {
      // Set initial base product stock if provided
      if (form.initialStock !== '') {
        const qty = Number(form.initialStock)
        await handleUpsertStock(created._id, null, {
          quantity: qty,
          stockStatus: qty > 0 ? 'in_stock' : 'out_of_stock',
        })
      }

      setForm({
        name: '',
        category: '',
        price: '',
        sku: '',
        brand: '',
        description: '',
        initialStock: '25',
        status: 'published',
      })
      if (onCreated) onCreated(created)
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-scale-up max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                🛍️
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Add New Product</h2>
                <p className="text-xs text-slate-500">Create a product and assign inventory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="product-name"
              label="Product Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Slim Fit Denim Shirt"
              required
            />

            {/* Category selection + quick create */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>＋</span> New Category
                </button>
              </div>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                id="product-price"
                label="Price (₹) *"
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="999.00"
                required
              />

              <InputField
                id="product-sku"
                label="Base SKU (Optional)"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. SHIRT-001"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                id="product-brand"
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. ApnaBazaar Essentials"
              />

              <InputField
                id="product-stock"
                label="Initial Stock Quantity"
                type="number"
                min="0"
                name="initialStock"
                value={form.initialStock}
                onChange={handleChange}
                placeholder="25"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Publish Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
              >
                <option value="published">Published (Live in catalog)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed description of the product..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={loading}
              >
                Create Product
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreated={(newCat) => {
          loadCategories()
          if (newCat?._id) {
            setForm((p) => ({ ...p, category: newCat._id }))
          }
        }}
      />
    </>
  )
}

export default CreateProductModal
