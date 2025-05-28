import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className=' flex h-screen bg-green-950 flex-col items-center pt-8'>
        <h1 className=' font-semibold text-8xl text-red-300'>404</h1>
        <h2 className='text-yellow-100'>oops ! Page Not Found</h2>
        <Link to="/" className=' m-3 p-3 border text-yellow-100 border-solid active:bg-black active:text-white'>Go Back</Link>
     </div>
  )
}

export default NotFound