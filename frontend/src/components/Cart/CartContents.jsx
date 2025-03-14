import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateCartItemQuantity } from '../../redux/slices/cartSlice'

const CartContents = ({cart, userId, guestId}) => {
  const dispatch = useDispatch()
  
  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >=1){
        dispatch(updateCartItemQuantity({
            productId, quantity: newQuantity, size, color, guestId, userId

        }))
        console.log({productId, quantity: newQuantity, size, color, guestId, userId})
    }
  }

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(updateCartItemQuantity({
        productId, quantity: 0, size, color, guestId, userId
    }))
    console.log({
        productId, quantity: 0, size, color, guestId, userId
    })
  }

  return (
    <div>
        {
            cart.products.map((product, index) => (
                <div key={index} className="flex items-start justify-between py-4 border-b border-gray-200">
                    <div className="flex items-start">
                        <img src={product.image} alt="" className='w-20 h-24 object-cover mr-4 rounded'/>
                        <div className="">
                            <h3>{product.name}</h3>
                            <p className='text-sm text-gray-500'>
                                {product.author}
                            </p>
                            <div className="flex items-center mt-2">
                                <button onClick={() => {handleAddToCart(product.productId, -1, product.quantity, product.size, product.color)}} className='border border-gray-500 rounded px-2 py-0.5 text-xl font-medium cursor-pointer'>-</button>
                                <span className='mx-4'>{product.quantity}</span>
                                <button onClick={() => {handleAddToCart(product.productId, 1, product.quantity, product.size, product.color)}} className='border border-gray-500 rounded px-2 py-0.5 text-xl font-medium cursor-pointer'>+</button>
                            </div>
                        </div>
                    </div>
                    <div className="">
                                <p>{product.price.toLocaleString()} vnđ</p>
                                <button onClick={() => {handleRemoveFromCart(product.productId,  product.size, product.color)}} className='cursor-pointer text-red-600 p-1'>Xóa</button>
                    </div>
                </div>
            ))
        }
    </div>
  )
}

export default CartContents