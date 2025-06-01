import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../Pages/Home'
import { Provider } from 'react-redux'
import { store } from '../Redux/store'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HelmetProvider } from 'react-helmet-async'
import { describe, vi } from 'vitest'

vi.mock('axios')
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

const renderWithProviders = (ui) => {
  return render(
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    </HelmetProvider>
  )
}

describe('Home', () => {
  it('renders welcome message and logout button', () => {
    renderWithProviders(<Home />)

    expect(screen.getByText(/welcome to cern/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('logs out user on button click', async () => {
    axios.get.mockResolvedValueOnce({ data: { ok: true, msg: 'Logged out' } })

    renderWithProviders(<Home />)

    const button = screen.getByRole('button', { name: /logout/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${import.meta.env.VITE_API_URL}/api/user/logout`)
      expect(toast.success).toHaveBeenCalledWith('Logged out')
      expect(mockedNavigate).toHaveBeenCalledWith('/')
    })
  })
})