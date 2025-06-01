import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { setUser } from '../Redux/UserSlice';
import axios from 'axios';
import Plan from '../Components/Plan';

const LoginPage = () => {
  const nav = useNavigate();
  const dispatch = useDispatch()
  const [details, setDetails] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('')
  const changes = ({target})=> {
    setDetails({ ...details, [target.name]: target.value})
  }
  const submit = async(e) => {
     try {
      e.preventDefault()
      setLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/sign-in`, details);
      if (data.ok) {
        toast.success(data.msg);
        dispatch(setUser(data.user));
        nav('/home');
      } 
    } catch (error) {
      console.log(error.response)
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
  }
  console.log(details)
  return (
    <Plan title={"CARN - Sign In"}>
      <div className='flex h-screen bg-green-950 items-center justify-center'>
        <div className='md:w-[60%] max-md:w-[90%] bg-white border border-green-300 rounded-md p-2'>
          <div className='p-1 w-full'>
            <h1 className='text-green-950 font-bold text-2xl'>CERN</h1>
          </div>
          <div className='w-full p-1'>
            <form onSubmit={submit} className='w-full flex flex-col gap-2'>
              <input required name='email' value={details.email} onChange={changes} className='w-full p-1 border border-green-600 bg-gray-700  text-slate-50 font-medium rounded outline-green-400' type="email" placeholder='Email' />
              <input required name='password' value={details.password} onChange={changes} maxLength={10} className='w-full p-1 border bg-gray-700  border-slate-text-slate-50 text-green-600 font-medium rounded outline-green-400' type="password" placeholder='Password' />
              <button className='bg-green-950 flex items-center justify-center gap-1 p-2 font-semibold text-white rounded-md active:bg-green-400' type='submit'>
                Login
                {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-green-600 animate-spin'></span>}
              </button>
            </form>
          </div>
          <div className='w-full'>
            <div className='flex p-2'>
              <p onClick={()=> nav('/forgot-password')} className='ml-auto text-blue-500 font-medium hover:underline cursor-pointer'>Forgot Password</p>
            </div>
            <div className='flex items-center p-2 justify-center'>
              <p className='text-slate-500 font-medium'>Don't have an account? <span onClick={()=> nav('/register')} className='text-blue-500 hover:underline cursor-pointer'>Sign up</span></p>
            </div>
          </div>
          
        </div>
      </div>
    </Plan>
  )
}

export default LoginPage