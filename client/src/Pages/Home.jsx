import axios from 'axios'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../Redux/UserSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import moment from 'moment'

const Home = () => {
  const user = useSelector(state=> state.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const logOut = async()=> {
    const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/logout`);
    if(data.ok) {
      toast.success(data.msg);
      dispatch(logout());
      nav('/')
    }
    
  }
  return (
    <div className='flex  gap-2 h-screen bg-green-950 items-center justify-center'>
      <div className='border flex rounded-md flex-col gap-2 items-center justify-center p-2 w-[60%]'>
       <p className='text-5xl max-sm:text-3xl text-white font-bold'>WELCOME TO CERN</p>
       <p className='text-sm text-white font-medium p-1'>{moment(Date.now()).format('dddd Do MM YYYY')}</p>
        <button onClick={logOut} className='p-2 bg-emerald-600 active:bg-emerald-400 w-[50%] text-white font-semibold rounded-md'>Logout</button> 
      </div>
      
    </div>
  )
}

export default Home