import React from 'react'

const Loading = () => {
  return (
        <div className="my-4 flex space-x-2 justify-center items-center w-full">
            <div className="h-8 w-8 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-8 w-8 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-8 w-8 bg-amber-600 rounded-full animate-bounce" />
        </div>
  )
}

export default Loading