import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../Pages/LoginPage'
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

describe('LoginPage', ()=> {
  beforeEach(() => {
    axios.post.mockReset();
    mockedNavigate.mockReset();
  });
  it('renders login form inputs and button', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  it('shows error toast on failed login', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { msg: 'User not found' },
      },
    });

    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User not found');
    });
  });
  it('logs in successfully and navigates to /home', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        ok: true,
        msg: 'Login successful',
        user: { id: '1', name: 'John' },
      },
    });

    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Login successful');
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });
  it('navigates to forgot-password and register pages when clicked', async() => {
    renderWithProviders(<LoginPage />);
    await userEvent.click(screen.getByText(/forgot password/i));
    expect(mockedNavigate).toHaveBeenCalledWith('/forgot-password');

    await userEvent.click(screen.getByText(/sign up/i));
    expect(mockedNavigate).toHaveBeenCalledWith('/register');
  });
})