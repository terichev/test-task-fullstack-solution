import ItemList from './components/ItemList'

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
}

function App() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Items Manager</h1>
      </header>
      <main>
        <ItemList />
      </main>
    </div>
  )
}

export default App
