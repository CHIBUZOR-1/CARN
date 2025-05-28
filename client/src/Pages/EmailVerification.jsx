import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmailVerification = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const [loading, setLoading] = useState(false)
	const nav = useNavigate();

    const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		setLoading(true)
		try {
			const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/verify-email`, { verificationCode });
			if(data.ok) {
				toast.success(data.msg);
				nav("/");
			}
			
		} catch (error) {
			console.log(error);
			toast.error(error.response.data.msg)
		} finally {
			setLoading(false)
		}
	};
	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);
	const cate = code.join("");
	console.log(code)
	console.log(cate)

  return (
    <div className='h-screen bg-green-950 flex items-center justify-center'>
        <div className='bg-white rounded-md border border-emerald-500 p-2 md:w-[50%] max-md:w-[80%]'>
            <div className='w-full'>
              <h1 className='text-center bg-gradient-to-r font-bold from-green-500 to-emerald-600 text-transparent bg-clip-text'>VERIFY EMAIL</h1>
              <p className='text-center max-sm:text-xs text-gray-400 mb-6'>Enter the 6-digit code sent to your email address.</p>  
            </div>
            
            <div className='w-full'>
                <form onSubmit={handleSubmit} className='flex w-full flex-col gap-1 items-center p-1 justify-center'>
                    <div className='flex justify-center gap-2'>
                        {code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type='text'
								maxLength='6'
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className='md:w-12 md:h-12 max-sm:text-sm max-sm:w-8 max-sm:h-8 max-md:w-10 max-md:h-10 text-center max-sm:p-1 text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
							/>
						))}
                    </div>
					<button disabled={loading} type='submit' className={` ${ !loading && 'hidden'} w-full flex items-center gap-1 justify-center p-2`}>
						<span className='text-emerald-500 font-medium'>verifying...</span>{loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-green-600 animate-spin'></span>}
					</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default EmailVerification