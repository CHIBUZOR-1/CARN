import { useState } from 'react'
import LoginPage from './Pages/LoginPage'
import Home from './Pages/Home'
import RegisterPage from './Pages/RegisterPage'
import ForgotPasswordPage from './Pages/ForgotPasswordPage'
import NotFound from './Pages/NotFound'
import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './Components/ScrollToTop'
import { ToastContainer } from 'react-toastify'
import EmailVerification from './Pages/EmailVerification'
import { useSelector } from 'react-redux'
import ResetPassword from './Pages/ResetPassword'

function App() {
  const user = useSelector(state=> state.user);
  console.log(user)

  return (
    <>
      <ToastContainer className='max-sm:flex max-sm:w-full px-1 max-sm:justify-center font-semibold' />
      <ScrollToTop/>
      <Routes>
        <Route path='/' element={user?._id ? <Navigate to="/home" /> : <LoginPage />}/>
        <Route path='/home' element={!user?._id ? <Navigate to="/" /> : <Home />}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
        <Route path='/verify-email' element={<EmailVerification/>}/>
        <Route path='/reset-password/:token' element={<ResetPassword/>}/>
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </>
  )
}

export default App
