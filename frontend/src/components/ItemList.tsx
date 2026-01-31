import { useState, useEffect, FormEvent } from 'react'

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/items`
  : 'http://localhost:8000/api/items'

interface Item {
  id: number
  name: string
  description: string | null
  price: number | null
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    padding: '15px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemDescription: {
    color: '#666',
    fontSize: '14px',
  },
  error: {
    color: '#dc3545',
    padding: '10px',
    marginBottom: '10px',
    background: '#f8d7da',
    borderRadius: '4px',
  },
}

function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()

    const interval = setInterval(() => {
      fetchItems()
    }, 5000)

    const handleUpdate = () => fetchItems()
    window.addEventListener('items-updated', handleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('items-updated', handleUpdate)
    }
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL)
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }
      const data = await res.json()
      setItems(data.items)
      setError(null)
    } catch (err) {
      setError('Failed to load items')
      console.error('Fetch error:', err)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          price: price ? parseFloat(price) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to create item')
      }

      fetchItems()
      setName('')
      setDescription('')
      setPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete item')
      }
      fetchItems()
    } catch (err) {
      setError('Failed to delete item')
    }
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Add Item
        </button>
      </form>

      <ul style={styles.list}>
        {items.map((item) => (
          <li key={item.id} style={styles.item}>
            <div>
              <div style={styles.itemName}>{item.name}</div>
              {item.description && (
                <div style={styles.itemDescription}>{item.description}</div>
              )}
              {item.price !== null && <div>${item.price.toFixed(2)}</div>}
            </div>
            <button
              style={styles.deleteButton}
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ItemList
