import { useState, useEffect } from 'react'
import useProduct from '../hooks/useProduct'
import Button from '../../../components/common/Button'
import InputField from '../../../components/common/Inputfield'

const StockModal = ({ isOpen, onClose, product, variant, onUpdated }) => {
  const { handleUpsertStock, loadStock, stockLoading } = useProduct()
  const [quantity, setQuantity] = useState(0)
  const [stockStatus, setStockStatus] = useState('in_stock')

  useEffect(() => {
    if (isOpen && product) {
      loadStock(product._id, variant?._id).then((res) => {
        const stockData = res.payload?.stock
        if (stockData) {
          setQuantity(stockData.quantity ?? 0)
          setStockStatus(stockData.stockStatus || 'in_stock')
        } else {
          setQuantity(0)
          setStockStatus('in_stock')
        }
      })
    }
  }, [isOpen, product, variant])

  if (!isOpen || !product) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await handleUpsertStock(product._id, variant?._id || null, {
      quantity: Number(quantity),
      stockStatus,
    })
    if (result) {
      if (onUpdated) onUpdated(result)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              📦
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Manage Stock</h2>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">
                {variant ? `Variant: ${variant.sku}` : product.name}
              </p>
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
            id="stock-quantity"
            label="Stock Quantity *"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value) || 0)
              setQuantity(val)
              if (val === 0) setStockStatus('out_of_stock')
              else if (val <= 5) setStockStatus('low_stock')
              else setStockStatus('in_stock')
            }}
            placeholder="0"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stock Status
            </label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            >
              <option value="in_stock">In Stock (Available)</option>
              <option value="low_stock">Low Stock (Running out)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              This will update the live inventory count and customer purchasing availability.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3">
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
              loading={stockLoading}
            >
              Save Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockModal
