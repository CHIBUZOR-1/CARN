import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordMeter from '../Components/PasswordMeter';

const ResetPassword = () => {
	const { token } = useParams();
	//Fcassie$3
  const [auth, setAuth] = useState({
    password: '',
    confirmPassword: ''
  });
  const nav = useNavigate()
  const  [loading, setLoading] = useState(false)
  const change = (e) => {
	setAuth({ ...auth, [e.target.name]: e.target.value})
  }
  const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true)
		const hasUpperCase = /[A-Z]/.test(auth.password);
		const hasLowerCase = /[a-z]/.test(auth.password);
		const hasNumber = /\d/.test(auth.password);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(auth.password);
		
		if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
			toast.warn('Use correct password format');
			return;
		}
		if (auth.password !== auth.confirmPassword) {
			toast.warn("Passwords do not match");
			return;
		}
		try {
			const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/reset-password/${token}`, auth);
			if(data.ok) {
				toast.success(data.msg);
				setTimeout(() => {
					nav("/");
				}, 2000);
			}

			
		} catch (error) {
			console.error(error);
			toast.error(error.response.data.msg);
		} finally {
			setLoading(false)
		}
	};
  return (
    <div className='w-full h-screen flex items-center justify-center bg-green-950'>
		<div className='bg-white p-1 rounded-md border border-emerald-500  flex-col gap-1 items-center justify-center md:w-[50%] max-md:w-[80%]'>
			<h2 className='text-center text-emerald-600 font-semibold text-xl'>Reset Password</h2>
			<form onSubmit={handleSubmit} className='w-full flex-col pt-2 flex gap-1'>
				<input maxLength={10} name='password' value={auth.password} onChange={change} type="password" placeholder='New password' className='bg-gray-700 text-white font-medium w-full p-1 rounded-md border border-emerald-500 outline-emerald-500' />
				<input maxLength={10} name='confirmPassword' value={auth.confirmPassword} onChange={change} type="password" placeholder='Confirm password' className='bg-gray-700 text-white font-medium w-full p-1 rounded-md border border-emerald-500 outline-emerald-500' />
				<div className='w-full p-1'>
					<PasswordMeter password={auth.password}/>
				</div>
				<div  className='w-full flex items-center justify-center py-1'>
                  <button type='submit' disabled={loading} className='bg-green-950 p-1 w-[80%] rounded-md flex items-center gap-1 justify-center text-white font-semibold'>
                    Change
                    {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-green-600 animate-spin'></span>}
                  </button>
                </div>
			</form>
		</div>
	</div>
  )
}

export default ResetPassword