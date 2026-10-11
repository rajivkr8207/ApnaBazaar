import { useState } from 'react'
import useCategory from '../hooks/useCategory'
import Button from '../../../components/common/Button'
import InputField from '../../../components/common/Inputfield'

const CreateCategoryModal = ({ isOpen, onClose, onCreated }) => {
  const { categories, handleCreateCategory, loading } = useCategory()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    parentCategory: '',
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'name' && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const payload = {
      name: formData.name.trim(),
    }
    if (formData.slug.trim()) payload.slug = formData.slug.trim()
    if (formData.description.trim()) payload.description = formData.description.trim()
    if (formData.parentCategory) payload.parentCategory = formData.parentCategory

    const result = await handleCreateCategory(payload)
    if (result) {
      setFormData({ name: '', description: '', slug: '', parentCategory: '' })
      if (onCreated) onCreated(result.data || result)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              🏷️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Create Category</h2>
              <p className="text-xs text-slate-500">Organize your products with categories</p>
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
            id="category-name"
            label="Category Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Footwear, Electronics"
            required
          />

          <InputField
            id="category-slug"
            label="Category Slug (Optional)"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g. footwear"
          />

          {/* Parent category select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Parent Category (Optional)
            </label>
            <select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            >
              <option value="">None (Top-Level Category)</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of this category..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Action buttons */}
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
              loading={loading}
            >
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCategoryModal
