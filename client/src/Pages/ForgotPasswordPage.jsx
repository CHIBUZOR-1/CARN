import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { FcAddRow } from 'react-icons/fc';
import { IoMdArrowDropleft } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)
  const nav = useNavigate();
	const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/forgot-password`, { email });
      if(data.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
		
	};

  return (
    <div className='flex h-screen bg-green-950 items-center justify-center'>
      <div className='md:w-[50%] max-md:w-[80%] p-2'>
        <div className='w-full bg-white p-1'>
          <h1 className='font-medium text-center text-emerald-500 text-xl'>Forgot Password</h1>
          {
            !isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <p className='text-gray-500 mb-6 text-center '>Enter your email address <span className='max-sm:hidden'>and we'll send you a link to reset your password.</span></p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className='bg-gray-700 w-full p-1 rounded-md outline-emerald-500 border border-emerald-600 font-medium text-slate-50' placeholder='email' type="email" name="email" id="" />
                <div  className='w-full flex items-center justify-center py-1'>
                  <button type='submit' disabled={loading} className='bg-green-950 p-1 w-[80%] rounded-md flex items-center gap-1 justify-center text-white font-semibold'>
                    Submit
                    {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-green-600 animate-spin'></span>}
                  </button>
                </div>
              </form>
            ) : (
              <div className='flex items-center justify-center'>
                <p className='text-gray-400 mb-6'>If an account exists for {email}, you will receive a password reset link shortly.</p>
              </div>
            )
          }
        </div>
        <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
          <Link to={"/"} className='text-sm text-green-400 hover:underline flex items-center'>
            <IoMdArrowDropleft className='h-4 w-4 mr-2' /> Back to Login
          </Link>
        </div>
      </div>
      
    </div>
  )
}

export default ForgotPasswordPage