import React from 'react'
import Loading from '../Common/Loading'

const ReviewList = ({ reviews, loading }) => {
  if (loading) {
    return <Loading />
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    )
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Đánh giá sản phẩm</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500 ml-2">/10</span>
          </div>
          <div className="text-gray-600">
            ({reviews.length} {reviews.length === 1 ? 'đánh giá' : 'đánh giá'})
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">
                    {review.user?.name || 'Người dùng'}
                  </span>
                  <span className="text-lg font-bold text-amber-600">
                    {review.rating}/10
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {review.comment && (
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
            )}

            {review.images && review.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {review.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`Review image ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewList
