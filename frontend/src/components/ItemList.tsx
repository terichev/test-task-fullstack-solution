import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api/items'

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
}

function ItemList() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    // Загрузка items при монтировании
    fetchItems()

    // Polling каждые 5 секунд
    const interval = setInterval(() => {
      fetchItems()
    }, 5000)

    // Слушатель событий для обновления
    const handleUpdate = () => fetchItems()
    window.addEventListener('items-updated', handleUpdate)
  }, [])

  const fetchItems = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setItems(data.items))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price: parseFloat(price) }),
    }).then(() => {
      fetchItems()
      setName('')
      setDescription('')
      setPrice('')
    })
  }

  const handleDelete = (id: any) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => fetchItems())
  }

  const renderItem = (item: any) => {
    // Отображение описания с HTML форматированием
    return (
      <li key={item.id} style={styles.item}>
        <div>
          <div style={styles.itemName}>{item.name}</div>
          <div
            style={styles.itemDescription}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
          <div>${item.price}</div>
        </div>
        <button style={styles.deleteButton} onClick={() => handleDelete(item.id)}>
          Delete
        </button>
      </li>
    )
  }

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
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
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Add Item
        </button>
      </form>

      <ul style={styles.list}>
        {items.map((item: any) => renderItem(item))}
      </ul>
    </div>
  )
}

export default ItemList
