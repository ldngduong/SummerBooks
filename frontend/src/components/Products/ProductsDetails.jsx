import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'

import ProductGrid from './ProductGrid'
import { fetchProductDetails, fetchSimilarProducts } from '../../redux/slices/productsSlice'
import Loading from '../Common/Loading'
import { useNavigate, useParams } from 'react-router-dom'
import { addToCart } from '../../redux/slices/cartSlice'
import { fetchProductReviews } from '../../redux/slices/reviewSlice'
import ReviewList from '../Review/ReviewList'

const ProductsDetails = ({id}) => {
    const navigate = useNavigate()
  const dispatch = useDispatch()
  const {similarProducts, selectedProduct, loading, error} = useSelector((state) => state.product)
  const {user, guestId} = useSelector((state) => state.auth)
  const {productReviews, productReviewsLoading} = useSelector((state) => state.review)
  const {id: paramId} = useParams()
  const productId = id || paramId
  
  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts(productId));
      dispatch(fetchProductDetails(productId));
      dispatch(fetchProductReviews(productId));
    }
    
  }, [dispatch, productId]);

  

  const [mainImage, setMainImage] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  useEffect(() => {
    if(selectedProduct?.images?.length > 0){
        setMainImage(selectedProduct.images[0].url)
    }

  }, [selectedProduct])

  const handleQuatityChange = (action) => {
    if(action === 'plus'){
        if(selectedQuantity + 1 > selectedProduct?.countInStock){
            return toast.error('Số lượng sách trong kho không đủ!')
        }
        setSelectedQuantity((prev) => prev+1)
    } 
    if(action === 'minus' && selectedQuantity > 1) setSelectedQuantity((prev) => prev-1)
  }

  const handleAddToCart = () => {
    if(!user){
        navigate('/login')
        return toast.error('Vui lòng đăng nhập để mua hàng!')
    }

    setIsButtonDisabled(true)
    dispatch(addToCart({
        productId,
        quantity: selectedQuantity,
        userId: user?._id,
        guestId,
        author: selectedProduct.author
    })).then(() => {
        toast.success('Thêm vào giỏ hàng thành công!')
        setIsButtonDisabled(false)
    })
  }
  if (loading || !selectedProduct || !similarProducts) {
    return <Loading />;
  }

  return (
    <div className='p-6'>
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
            <div className="flex flex-col md:flex-row">
                <div className="hidden md:flex flex-col space-y-4 mr-6">
                    {selectedProduct?.images?.map((image, index) => (
                        <img 
                            className={`w-20 h-20 object-cover rounded-lg cursor-pointer ${image.url == mainImage ? 'border' : ''} hover:scale-105 transition-all duration-300`} 
                            key={index} 
                            src={image.url} 
                            alt="" 
                            onClick={() => setMainImage(image.url)}
                            />
                            
                    ))}
                </div>
                <div className="md:w-1/2">
                    <div className="relative w-full aspect-square">
                        <img
                        src={mainImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                    </div>
                </div>
                <div className="md:hidden overflow-x-scroll space-x-4 my-4 flex w-full">
                    {selectedProduct?.images?.map((image, index) => (
                        <img 
                            className={`flex-none w-15 h-15 object-cover rounded-lg cursor-pointer ${image == mainImage ? 'border' : ''} hover:scale-105 transition-all duration-300`} 
                            key={index} 
                            src={image} 
                            alt="" 
                            onClick={() => setMainImage(image)}
                            />
                    ))}
                </div>

                <div className="md:w-1/2 md:ml-10">
                    <h1 className='text-2xl md:text-3xl font-bold mb-2'>{selectedProduct?.name}</h1>
                    <p className='text-lg text-gray-600 mb-1'>{selectedProduct?.author}</p>
                    <p className='text-sm text-gray-600 mb'>Số trang: {selectedProduct?.countOfPage}</p>
                    <p className='text-sm text-gray-600 mb'>Kho: {selectedProduct?.countInStock}</p>
                    <p className='text-sm text-gray-600 mb'>Đánh giá: {selectedProduct?.rating}</p>
                    <p className='text-sm text-gray-600 mb-1'>Xuất bản: {new Date(selectedProduct?.publishedAt).toLocaleDateString('vi-VN')}</p>
                    <p className='text-xl text-gray-600 mb-4 font-semibold'>{selectedProduct?.price} vnđ</p>
                    <p className='text-gray-600 mb-4'>{selectedProduct?.description}</p>
                    <div className="mb-4">
                        <p className='text-gray-700'>Số lượng</p>
                        <div className="flex items-center space-x-4 mt-2">
                            <button onClick={() => {handleQuatityChange('minus')}} className='cursor-pointer px-2 py-1 bg-gray-200 rounded text-lg'>-</button>
                            <span className='text-lg'>{selectedQuantity}</span>
                            <button onClick={() => {handleQuatityChange('plus')}} className='cursor-pointer px-2 py-1 bg-gray-200 rounded text-lg'>+</button>
                        </div>
                    </div>

                    {selectedProduct?.countInStock !== 0 ? (
                    <button 
                        disabled={isButtonDisabled}
                        onClick={handleAddToCart}
                        className={`bg-amber-600 text-white py-2 px-6 rounded w-full mb-4 hover:bg-amber-700 cursor-pointer transition-all duration-300 ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        {isButtonDisabled ? 'Đang thêm vào giỏ hàng...' : 'Thêm vào giỏ hàng'}
                    </button>
                    ) : (
                    <button 
                        disabled
                        className={`bg-gray-600 text-white py-2 px-6 rounded w-full mb-4 hover:bg-gray-700 cursor-pointer transition-all duration-300 ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        Hết hàng
                    </button>
                    )}
                </div>
            </div>
            <ReviewList reviews={productReviews} loading={productReviewsLoading} />
            <div className="mt-20">
                <h2 className='text-2xl text-center font-medium mb-4'>Bạn có thể thích</h2>
                <ProductGrid products={similarProducts} />
            </div>
        </div>
    </div>
  )
}

export default ProductsDetails