import { useState } from 'react'
import useProduct from '../hooks/useProduct'
import Button from '../../../components/common/Button'
import InputField from '../../../components/common/Inputfield'

const VariantModal = ({ isOpen, onClose, product, onCreated }) => {
  const { handleCreateVariant, handleUpsertStock, variantLoading } = useProduct()
  const [formData, setFormData] = useState({
    sku: '',
    price: '',
    currency: 'INR',
    initialStock: '10',
  })

  // Dynamic attributes list
  const [attributes, setAttributes] = useState([
    { key: 'Size', value: '' },
    { key: 'Color', value: '' },
  ])

  if (!isOpen || !product) return null

  const handleAttrChange = (index, field, value) => {
    setAttributes((prev) => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const addAttrRow = () => {
    setAttributes((prev) => [...prev, { key: '', value: '' }])
  }

  const removeAttrRow = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanSku = formData.sku.trim().toUpperCase()
    if (!cleanSku) return

    // Build attributes object
    const attrsObj = {}
    attributes.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        attrsObj[key.trim()] = value.trim()
      }
    })

    const payload = {
      sku: cleanSku,
      currency: formData.currency || 'INR',
      attributes: attrsObj,
    }

    if (formData.price) {
      payload.price = Number(formData.price)
    }

    const created = await handleCreateVariant(product._id, payload)
    if (created) {
      const variantObj = created?._id ? created : created?.data || created
      const variantId = variantObj?._id

      // If initial stock was provided, upsert stock for this variant
      if (formData.initialStock !== '' && variantId) {
        const qty = Number(formData.initialStock)
        await handleUpsertStock(product._id, variantId, {
          quantity: qty,
          stockStatus: qty > 0 ? 'in_stock' : 'out_of_stock',
        })
      }

      setFormData({ sku: '', price: '', currency: 'INR', initialStock: '10' })
      if (onCreated) onCreated(variantObj || created)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Add Product Variant</h2>
              <p className="text-xs text-slate-500">For product: {product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="variant-sku"
            label="Variant SKU *"
            name="sku"
            value={formData.sku}
            onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
            placeholder="e.g. SNITCH-TEE-BLK-L"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="variant-price"
              label="Price (Optional)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
              placeholder={`Default: ₹${product.price}`}
            />

            <InputField
              id="variant-stock"
              label="Initial Stock Quantity"
              type="number"
              min="0"
              value={formData.initialStock}
              onChange={(e) => setFormData((p) => ({ ...p, initialStock: e.target.value }))}
              placeholder="10"
            />
          </div>

          {/* Dynamic Variant Attributes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Variant Attributes (Size, Color, etc.)
              </label>
              <button
                type="button"
                onClick={addAttrRow}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                + Add Attribute
              </button>
            </div>

            <div className="space-y-2">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Size"
                    value={attr.key}
                    onChange={(e) => handleAttrChange(idx, 'key', e.target.value)}
                    className="w-1/3 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:border-violet-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="e.g. XL"
                    value={attr.value}
                    onChange={(e) => handleAttrChange(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs focus:border-violet-500 outline-none"
                  />
                  {attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttrRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              loading={variantLoading}
            >
              Create Variant
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VariantModal
