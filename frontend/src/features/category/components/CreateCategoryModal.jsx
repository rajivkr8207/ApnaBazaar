import { useForm } from 'react-hook-form'
import useCategory from '../hooks/useCategory'
import Button from '../../../components/common/Button'
import InputField from '../../../components/common/Inputfield'

const CreateCategoryModal = ({ isOpen, onClose, onCreated }) => {
  const { categories, handleCreateCategory, loading } = useCategory()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentCategory: '',
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data) => {
    if (!data.name.trim()) return

    const payload = { name: data.name.trim() }
    if (data.slug.trim()) payload.slug = data.slug.trim()
    if (data.description.trim()) payload.description = data.description.trim()
    if (data.parentCategory) payload.parentCategory = data.parentCategory

    const result = await handleCreateCategory(payload)
    if (result) {
      reset()
      if (onCreated) onCreated(result.data || result)
      onClose()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
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
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            id="category-name"
            label="Category Name *"
            placeholder="e.g. Footwear, Electronics"
            error={errors.name?.message}
            {...register('name', {
              required: 'Category name is required',
              onChange: (e) => {
                // Auto-generate slug from name only if slug is currently empty
                const currentSlug = watch('slug')
                if (!currentSlug) {
                  setValue(
                    'slug',
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, ''),
                  )
                }
              },
            })}
          />

          <InputField
            id="category-slug"
            label="Category Slug (Optional)"
            placeholder="e.g. footwear"
            error={errors.slug?.message}
            {...register('slug')}
          />

          {/* Parent category select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Parent Category (Optional)
            </label>
            <select
              {...register('parentCategory')}
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
              rows={3}
              placeholder="Short description of this category..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none placeholder:text-slate-600"
              {...register('description')}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handleClose}
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
