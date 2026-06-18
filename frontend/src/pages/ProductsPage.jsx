import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/endpoints'

const emptyForm = { sku: '', name: '', description: '', price: '', stock_quantity: '' }

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await getProducts()
      setProducts(res.data)
    } catch (err) {
      setError('Failed to load products. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setShowModal(true)
  }

  function openEditModal(product) {
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity
    })
    setEditingId(product.id)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity)
      }
      if (editingId) {
        // Edit mode: SKU update nahi karte, baaki fields hi bhejte hain
        const { sku, ...updatePayload } = payload
        await updateProduct(editingId, updatePayload)
      } else {
        await createProduct(payload)
      }
      setShowModal(false)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn" onClick={openAddModal}>+ Add Product</button>
      </div>

      {error && !showModal && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products yet. Add your first product to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>₹{p.price.toLocaleString()}</td>
                <td className={p.stock_quantity < 5 ? 'stock-low' : ''}>
                  {p.stock_quantity} {p.stock_quantity < 5 && '⚠️'}
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => openEditModal(p)} style={{ marginRight: 8 }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>SKU</label>
                <input
                  required
                  disabled={!!editingId}
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. PROD-001"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">{editingId ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
