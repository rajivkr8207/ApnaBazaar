import { useEffect, useState } from 'react'
import useCategory from '../hooks/useCategory'
import CreateCategoryModal from '../components/CreateCategoryModal'
import Button from '../../../components/common/Button'

const CategoryList = () => {
  const { categories, loading, loadCategories, handleDeleteCategory } = useCategory()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <h1 className="text-2xl font-bold text-slate-100">Category Management</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Browse, manage, and create product categories for your store
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 shrink-0"
        >
          <span>＋</span> Create Category
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: <strong className="text-slate-200">{categories.length}</strong> categories
        </span>
      </div>

      {/* Categories Grid / List */}
      {loading && categories.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-3xl mx-auto mb-3">
            🏷️
          </div>
          <h3 className="text-lg font-bold text-slate-200">No categories found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            {search ? 'No categories matched your search.' : 'Get started by creating your first product category.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-sm">
                      🏷️
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-100 group-hover:text-violet-300 transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">/{category.slug || '—'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      category.isActive !== false
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {category.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {category.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>ID: <code className="text-slate-400 font-mono">{category._id?.slice(-6)}</code></span>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-800"
                  title="Delete category"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadCategories()}
      />
    </div>
  )
}

export default CategoryList
