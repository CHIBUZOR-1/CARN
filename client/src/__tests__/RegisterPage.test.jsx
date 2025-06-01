import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../Pages/RegisterPage'
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

describe('RegisterPage', () => {
  it('renders input fields and register button', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows warning when fields are empty', async () => {
    renderWithProviders(<RegisterPage />);
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(toast.warn).toHaveBeenCalledWith('All fields Required');
  });

  it('shows warning when passwords do not match', async () => {
    renderWithProviders(<RegisterPage />);
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'Mismatch');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(toast.warn).toHaveBeenCalledWith('Password mismatch');
  });

  it('shows warning when password format is invalid', async () => {
    renderWithProviders(<RegisterPage />);
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password'); // no uppercase, number, special
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(toast.warn).toHaveBeenCalledWith('Use correct password format');
  });

  it('submits successfully and navigates', async () => {
    axios.post.mockResolvedValueOnce({
      data: { ok: true, msg: 'Registered successfully' },
    });

    renderWithProviders(<RegisterPage />);
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Registered successfully');
      expect(mockedNavigate).toHaveBeenCalledWith('/verify-email');
    });
  });
});
