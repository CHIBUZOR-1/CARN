import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailVerification from '../Pages/EmailVerification'
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

describe('EmailVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 6 input boxes', () => {
    renderWithProviders(<EmailVerification />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBe(6)
  })

  it('submits and navigates on valid verification code', async () => {
    axios.post.mockResolvedValue({
      data: {
        ok: true,
        msg: 'Verification successful',
      },
    })

    renderWithProviders(<EmailVerification />)

    const inputs = screen.getAllByRole('textbox')
    const code = '123456'
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], code[i])
    }

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/verify-email'),
        { verificationCode: '123456' }
      )
      expect(toast.success).toHaveBeenCalledWith('Verification successful')
      expect(mockedNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast on failed verification', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { msg: 'Invalid verification code' },
      },
    })

    renderWithProviders(<EmailVerification />)

    const inputs = screen.getAllByRole('textbox')
    const code = '654321'
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], code[i])
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid verification code')
    })
  })
})