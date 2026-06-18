import { useState, useEffect } from 'react'
import { getOrders, createOrder } from '../api/endpoints'
import { getProducts } from '../api/endpoints'
import { getCustomers } from '../api/endpoints'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        getOrders(), getProducts(), getCustomers()
      ])
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
      setCustomers(customersRes.data)
    } catch (err) {
      setError('Failed to load data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setCustomerId('')
    setItems([{ product_id: '', quantity: 1 }])
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  function addItemRow() {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  function removeItemRow(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index, field, value) {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  function getProductStock(productId) {
    const p = products.find(p => p.id === parseInt(productId))
    return p ? p.stock_quantity : null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        customer_id: parseInt(customerId),
        items: items
          .filter(i => i.product_id)
          .map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      }
      if (payload.items.length === 0) {
        setError('Add at least one product to the order')
        return
      }
      await createOrder(payload)
      setShowModal(false)
      setSuccess('Order created successfully!')
      loadAll()
    } catch (err) {
      // Yahan backend ka detailed error message dikhayenge
      // jaise "Insufficient stock for product X"
      setError(err.response?.data?.detail || 'Failed to create order')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn" onClick={openAddModal}>+ Create Order</button>
      </div>

      {success && <div className="success-banner">{success}</div>}
      {error && !showModal && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const customer = customers.find(c => c.id === o.customer_id)
              return (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{customer ? customer.name : `Customer ${o.customer_id}`}</td>
                  <td>{o.items.length} item(s)</td>
                  <td>₹{o.total_amount.toLocaleString()}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
            <h2>Create Order</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select required value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <label style={{ fontSize: 13, fontWeight: 500, color: '#444', display: 'block', marginBottom: 6 }}>
                Order Items
              </label>
              {items.map((item, idx) => {
                const stock = getProductStock(item.product_id)
                const exceedsStock = stock !== null && parseInt(item.quantity) > stock
                return (
                  <div key={idx}>
                    <div className="order-item-row">
                      <select
                        required
                        value={item.product_id}
                        onChange={e => updateItem(idx, 'product_id', e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                        ))}
                      </select>
                      <input
                        required
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      />
                      {items.length > 1 && (
                        <button type="button" className="btn btn-danger" onClick={() => removeItemRow(idx)}>×</button>
                      )}
                    </div>
                    {exceedsStock && (
                      <p style={{ color: '#b91c1c', fontSize: 12, marginTop: -4, marginBottom: 8 }}>
                        Only {stock} in stock
                      </p>
                    )}
                  </div>
                )
              })}
              <button type="button" className="btn btn-secondary" onClick={addItemRow} style={{ marginTop: 8 }}>
                + Add another item
              </button>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
