import React, { useEffect } from 'react'
import Hero from '../components/Layout/Hero'
import NewArrival from '../components/Products/NewArrival'
import ProductsDetails from '../components/Products/ProductsDetails'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBestSeller } from '../redux/slices/productsSlice'
import Loading from '../components/Common/Loading'

const Home = () => {
    const dispatch = useDispatch()
    const {bestSeller, loading, error} = useSelector((state) => state.product)
    useEffect(() => {
      dispatch(fetchBestSeller())
    }, [dispatch])
  
  return (
    <>
        <Hero />
        <NewArrival />
        <h2 className='text-3xl text-center font-bold mb-4'>Best Seller</h2>
        {bestSeller ? <ProductsDetails id={bestSeller._id} /> : <Loading />}
    </>
  )
}

export default Home