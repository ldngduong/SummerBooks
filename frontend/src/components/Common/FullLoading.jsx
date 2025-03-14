import React from 'react'

const FullLoading = () => {
  return (
        <div className="my-4 flex space-x-2 justify-center items-center h-screen w-full">
            <div className="h-8 w-8 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-8 w-8 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-8 w-8 bg-gray-600 rounded-full animate-bounce" />
        </div>
  )
}

export default FullLoading