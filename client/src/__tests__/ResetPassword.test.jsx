import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPassword from '../Pages/ResetPassword'
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
const mockedUseParams = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ token: 'mocked-token' }),
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

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input fields and button', () => {
    renderWithProviders(<ResetPassword />)
    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
  })

  it('shows warning if password format is incorrect', async () => {
    renderWithProviders(<ResetPassword />)
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'short')
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'short')
    await userEvent.click(screen.getByRole('button', { name: /change/i }))
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('Use correct password format')
    })
  })

  it('shows warning if passwords do not match', async () => {
    renderWithProviders(<ResetPassword />)
    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'Mismatch1!')
    await userEvent.click(screen.getByRole('button', { name: /change/i }))
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('Passwords do not match')
    })
  })

  it('submits form and navigates if successful', async () => {
    axios.post.mockResolvedValue({
      data: {
        ok: true,
        msg: 'Password changed successfully',
      },
    })

    renderWithProviders(<ResetPassword />)

    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
    await userEvent.click(screen.getByRole('button', { name: /change/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reset-password/mocked-token'),
        {
          password: 'Password1!',
          confirmPassword: 'Password1!',
        }
      )
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully')
    })
  })

  it('shows error toast on API failure', async () => {
    axios.post.mockRejectedValue({
      response: { data: { msg: 'Invalid or expired token' } },
    })

    renderWithProviders(<ResetPassword />)

    await userEvent.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
    await userEvent.click(screen.getByRole('button', { name: /change/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid or expired token')
    })
  })
  
  it('disables button and shows spinner while loading', async () => {
        // Mock axios to delay resolution
        let resolvePromise
        axios.post.mockImplementation(
            () =>
            new Promise((resolve) => {
                resolvePromise = resolve
            })
        )

        renderWithProviders(<ResetPassword />)

        await userEvent.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
        await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
        const button = screen.getByRole('button', { name: /change/i })

        await userEvent.click(button)

        // Check if button is disabled
        expect(button).toBeDisabled()

        // Spinner should appear
        expect(screen.getByRole('status')).toBeInTheDocument()

        // Resolve the mocked axios request
        resolvePromise({ data: { ok: true, msg: 'Done' } })

        // Wait for spinner to disappear
        await waitFor(() => {
            expect(button).not.toBeDisabled()
        })
    })
})