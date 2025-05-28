import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios'
import PasswordMeter from '../Components/PasswordMeter';

const RegisterPage = () => {
  const nav = useNavigate();
  
  //B224422@1b
  //Cassie$3
  const [details, setDetails] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('')
  const changes = (e)=> {
    setDetails({ ...details, [e.target.name]: e.target.value})
  }
  const submit = async(e) => {
       try {
        e.preventDefault()
        setLoading(true);
        if(!details.name || !details.email || !details.password || !details.confirm) {
          toast.warn('All fields Required');
          return;
        }
        if(details.password !== details.confirm) {
          toast.warn('Password mismatch');
          return;
        }
        const hasUpperCase = /[A-Z]/.test(details.password);
        const hasLowerCase = /[a-z]/.test(details.password);
        const hasNumber = /\d/.test(details.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(details.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          toast.warn('Use correct password format');
          return;
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/sign-up`, details);
        if (data.ok) {
          toast.success(data.msg);
          nav('/verify-email');
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
    <div className='flex h-screen bg-green-950 items-center justify-center'>
      <div className='md:w-[60%] max-md:w-[90%] bg-white border border-green-300 rounded-md p-2'>
        <div className='p-1 w-full'>
          <h1 className='text-green-700 font-bold text-2xl'>CERN</h1>
        </div>
        <div className='w-full p-1'>
          <form onSubmit={submit} className='w-full flex flex-col gap-2'>
            <input  name='name' value={details.name} onChange={changes} className='w-full bg-gray-700 p-1 border border-green-600 text-slate-50 font-medium rounded outline-green-400' type="text" placeholder='Name' />
            <input  name='email' value={details.email} onChange={changes} className='w-full bg-gray-700 p-1 border border-green-600 text-slate-50 font-medium rounded outline-green-400' type="email" placeholder='Email' />
            <input  name='password' value={details.password} onChange={changes} maxLength={10} className='w-full bg-gray-700 p-1 border border-green-600 text-slate-50 font-medium rounded outline-green-400' type="password" placeholder='Password' />
            <input  name='confirm' maxLength={10} value={details.confirm} onChange={changes} className='w-full bg-gray-700 p-1 border border-green-600 text-slate-50 font-medium rounded outline-green-400' type="password" placeholder='Confirm Password' />
            <div className='w-full p-1'>
              <PasswordMeter password={details.password}/>
            </div>
            <button className='bg-green-950 flex items-center justify-center gap-1 p-2 font-semibold text-white rounded-md active:bg-green-400' type='submit'>
              Register 
              {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-green-600 animate-spin'></span>}
            </button>
          </form>
        </div>
        <div className='w-full'>
          <div className='flex items-center p-2 justify-center'>
            <p className='text-slate-500 font-medium'>Already have an account? <span onClick={()=> nav('/')} className='text-blue-500 hover:underline cursor-pointer'>Login</span></p>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default RegisterPage