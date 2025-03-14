import React, { useEffect, useState } from 'react'
import { HiOutlineShoppingBag, HiOutlineUser } from 'react-icons/hi'
import { HiBars3BottomRight } from 'react-icons/hi2'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import CartDrawer from '../Layout/CartDrawer'
import { IoMdClose } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import Loading from '../Common/Loading'
import { fetchShopManager } from '../../redux/slices/shopManagerSlice'
const Navbar = () => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  const toggleCartDrawer = () => {
    setCartDrawerOpen(!cartDrawerOpen);
  }

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  }
  const dispatch = useDispatch()
  const {cart} = useSelector((state) => state.cart)
  const {user} = useSelector((state) => state.auth)
  const {shopManager, loading} = useSelector((state) => state.shopManager)
  const cartItemCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0

  useEffect(() => {
    dispatch(fetchShopManager())
  }, [dispatch])

 
  return (
    shopManager && <>
        <nav className='container mx-auto flex items-center py-4 px-6 justify-between relative'>
            <div className="">
                <Link to='/' className='text-2xl font-medium'>{shopManager.name}</Link>
            </div>
            <div className="hidden md:flex space-x-6">
                {shopManager.categories.map((category) => (
                    <Link to={`/collections/all?category=${category}`} className='text-gray-700 hover:text-amber-800 text-sm font-medium uppercase'>
                        {category}
                    </Link>
                ))}
            </div>
            <div className="flex items-center space-x-4">
                {user && (user.role === 'Quản trị viên' || user.role === 'Nhân viên bán hàng' || user.role === 'Nhân viên nhập liệu') && (
                    <Link to='/admin' className='bg-amber-700 text-sm text-white hover:bg-amber-600 transition-all duration-300 px-2 py-1 rounded-2xl'>Admin</Link>
                )}
                <Link to='/profile'>
                    <HiOutlineUser className='h-6 w-6 text-gray-700 flex justify-center'/>
                </Link>
                {user && (
                    <button onClick={toggleCartDrawer} className='relative hover:text-black cursor-pointer'>
                        <HiOutlineShoppingBag className='h-6 w-6 text-gray-700' />
                        {cartItemCount > 0 && (
                        <span className='absolute -top-2 -right-3 bg-gray-700 text-white text-xs rounded-full px-2 py-0.5'>
                            {cartItemCount}
                        </span>
                        )}
                    </button>
                )}
                <div className="overflow-hidden">
                    <SearchBar />
                </div>
                <button onClick={toggleNavDrawer} className='md:hidden h-full cursor-pointer'>
                    <HiBars3BottomRight className='h-6 w-6 text-gray-700' />
                </button>
            </div>
        </nav>
        <CartDrawer drawerOpen={cartDrawerOpen} toggleCartDrawer={toggleCartDrawer}/>
        <div className={`fixed top-0 right-0 w-full sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
            navDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            <div className="flex justify-end p-4">
                <button onClick={toggleNavDrawer}>
                    <IoMdClose className='h-6 w-6 text-gray-600 cursor-pointer'/>
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <h2 className='text-xl font-semibold mb-4'>TheShop</h2>
                <nav className='space-y-4'>
                    {shopManager.categories.map((category) => (
                        <Link onClick={toggleNavDrawer} to={`/collections/all?category=${category}`} className='block text-gray-700 hover:text-black text-sm font-medium uppercase'>
                            {category}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    </>
  )
}

export default Navbar