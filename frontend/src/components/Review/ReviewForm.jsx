import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createReview } from '../../redux/slices/reviewSlice'
import { toast } from 'sonner'
import Loading from '../Common/Loading'

const ReviewForm = ({ orderId, productId, productName, productImage, onSuccess, onCancel }) => {
  const dispatch = useDispatch()
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    const newPreviewImages = []

    files.forEach((file) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        toast.error('Ảnh không đúng định dạng. Chỉ chấp nhận jpg, png, jpeg, svg')
        return
      }

      // Validate file size (25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 25MB')
        return
      }

      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviewImages.push(reader.result)
        if (newPreviewImages.length === validFiles.length) {
          setPreviewImages([...previewImages, ...newPreviewImages])
        }
      }
      reader.readAsDataURL(file)
    })

    setImages([...images, ...validFiles])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previewImages.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviewImages(newPreviews)
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate rating
    if (!rating) {
      newErrors.rating = 'Điểm hài lòng không được để trống'
    } else {
      const ratingNum = parseInt(rating)
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10 || !Number.isInteger(ratingNum)) {
        newErrors.rating = 'Điểm hài lòng không hợp lệ'
      }
    }

    // Validate comment length
    if (comment && comment.length > 500) {
      newErrors.comment = 'Nhận xét không được vượt quá 500 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await dispatch(createReview({
        orderId,
        productId,
        rating: parseInt(rating),
        comment,
        images
      })).unwrap()

      toast.success('Đánh giá thành công!')
      if (onSuccess) {
        onSuccess()
      }
      // Reset form
      setRating('')
      setComment('')
      setImages([])
      setPreviewImages([])
      setErrors({})
    } catch (error) {
      const errorMessage = error?.message || 'Đánh giá không thành công'
      toast.error(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-start mb-4">
        <img src={productImage} alt={productName} className="w-16 h-16 object-cover rounded-md mr-4" />
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-2">{productName}</h4>
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Điểm hài lòng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => {
                  setRating(e.target.value)
                  if (errors.rating) {
                    setErrors({ ...errors, rating: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.rating ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập điểm từ 1 đến 10"
                required
              />
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Nhận xét
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (errors.comment) {
                    setErrors({ ...errors, comment: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.comment ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="4"
                placeholder="Nhập nhận xét (tối đa 500 ký tự)"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.comment && (
                  <p className="text-red-500 text-sm">{errors.comment}</p>
                )}
                <p className={`text-sm ml-auto ${comment.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Ảnh đánh giá (tối đa 5 ảnh, mỗi ảnh tối đa 25MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                multiple
                onChange={handleImageChange}
                disabled={images.length >= 5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {images.length >= 5 && (
                <p className="text-sm text-gray-500 mt-1">Đã đạt giới hạn 5 ảnh</p>
              )}

              {/* Preview images */}
              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm

