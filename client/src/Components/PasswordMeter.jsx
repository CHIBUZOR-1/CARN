import React from 'react'
import { IoIosCheckmark } from "react-icons/io";
import { FcCancel } from "react-icons/fc";

const PasswordCriteria = ({password}) => {
    const criteria = [
        { label: 'At least 6 characters', met: password.length >= 6 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password)},
        { label: 'Contains a number', met: /\d/.test(password) },
        { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ]
  return (
    <div>
        {
            criteria.map((c)=> (
                <div key={c.label} className='flex gap-1 items-center text-sm'>
                    {
                        c.met ? (
                            <IoIosCheckmark className='text-green-500' />
                        ) : (
                            <FcCancel />
                        )
                    }
                    <span className={`${c.met ? 'text-green-600': 'text-gray-400'} font-medium`}>{c.label}</span>
                </div>
            ))
        }
    </div>
  )
}

const PasswordMeter = ({password}) => {
    const getStrength= (pass)=> {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
        if (pass.match(/\d/)) strength++;
        if (pass.match(/[^a-zA-z\d]/)) strength++;
        return strength;
    }
    const strength = getStrength(password);

    const getColor= (strength)=> {
        if (strength === 0) return 'bg-red-500';
        if (strength === 1) return 'bg-red-400';
        if (strength === 2) return 'bg-yellow-500';
        if (strength === 3) return 'bg-yellow-400';
        return 'bg-green-500';
    }

    const getStrengthText= (strength)=> {
        if (strength === 0) return 'Very Weak';
        if (strength === 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        return 'Strong';
    }
  return (
    <div className='w-full'>
        <div className='flex justify-between items-center p-1'>
            <span className='text-xs font-medium text-slate-400'>Password Strength</span>
            <span className='text-xs font-medium text-slate-400'>{getStrengthText(strength)}</span>
        </div>
        <div className='flex gap-1 p-1'>
            {
                [...Array(4)].map((_, idx) => (
                    <div key={idx} className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${ idx < strength ? getColor(strength) : 'bg-gray-400'}`}/>
                ))
            }
        </div>
        <PasswordCriteria password={password}/>
    </div>
  )
}

export default PasswordMeter
