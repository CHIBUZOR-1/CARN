import { render, screen } from '@testing-library/react'
import NotFound from '../Pages/NotFound'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import userReducer from '../Redux/UserSlice'
import { describe } from 'vitest'

const renderWithProviders = (ui, { preloadedState } = {}) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState,
  })

  return render(
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    </HelmetProvider>
  )
}

describe('NotFound page', () => {
  it('renders and links to "/" if user is not logged in', () => {
    renderWithProviders(<NotFound />, {
      preloadedState: { user: null },
    })

    expect(screen.getByText(/404/i)).toBeInTheDocument()
    expect(screen.getByText(/oops ! page not found/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /go back/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders and links to "/home" if user is logged in', () => {
    renderWithProviders(<NotFound />, {
      preloadedState: { user: { name: 'John Doe', email: 'john@example.com' } },
    })

    const link = screen.getByRole('link', { name: /go back/i })
    expect(link).toHaveAttribute('href', '/home')
  })
})