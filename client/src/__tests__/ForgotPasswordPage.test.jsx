import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '../Pages/ForgotPasswordPage'
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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input and submit button', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('submits email and shows success message if request succeeds', async () => {
    axios.post.mockResolvedValue({ data: { ok: true } })

    renderWithProviders(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/forgot-password'),
        { email: 'user@example.com' }
      )
      expect(
        screen.getByText(/if an account exists for user@example.com/i)
      ).toBeInTheDocument()
    })
  })

  it('shows error toast if request fails', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { msg: 'User not found' },
      },
    })

    renderWithProviders(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await userEvent.type(emailInput, 'missing@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User not found')
    })
  })
})