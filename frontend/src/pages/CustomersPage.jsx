import { useState, useEffect } from 'react'
import { getCustomers, createCustomer } from '../api/endpoints'

const emptyForm = { name: '', email: '', phone: '' }

function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const res = await getCustomers()
      setCustomers(res.data)
    } catch (err) {
      setError('Failed to load customers. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createCustomer(form)
      setShowModal(false)
      loadCustomers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn" onClick={openAddModal}>+ Add Customer</button>
      </div>

      {error && !showModal && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet. Add your first customer to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Customer</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomersPage
