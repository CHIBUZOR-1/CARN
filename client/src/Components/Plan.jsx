import React from 'react'
import { Helmet } from 'react-helmet-async';

const Plan = ({children, title, description}) => {
  return (
    <div>
        <Helmet>
            <meta charset="UTF-8"/>
            <meta name="author" content="AMAECHI HENRY CHIBUZOR"/>
            <meta name="description" content={description}/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="robots" content="index, follow"/>
            <title>{title}</title>
        </Helmet>
        <main className='h-screen'>
            {children}
        </main>
    </div>
  )
}

export default Plan