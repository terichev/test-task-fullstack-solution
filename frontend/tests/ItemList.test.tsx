import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ItemList from '../src/components/ItemList'

const mockItems = [
  { id: 1, name: 'Item 1', description: 'Description 1', price: 10.99 },
  { id: 2, name: 'Item 2', description: null, price: 20.0 },
]

describe('ItemList', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockItems }),
        })
      )
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders items from API', async () => {
    render(<ItemList />)

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  it('displays item descriptions', async () => {
    render(<ItemList />)

    await waitFor(() => {
      expect(screen.getByText('Description 1')).toBeInTheDocument()
    })
  })

  it('displays item prices', async () => {
    render(<ItemList />)

    await waitFor(() => {
      expect(screen.getByText('$10.99')).toBeInTheDocument()
      expect(screen.getByText('$20.00')).toBeInTheDocument()
    })
  })

  it('has form inputs for adding items', () => {
    render(<ItemList />)

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })
})
