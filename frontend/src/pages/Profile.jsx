import React, { useEffect } from 'react'
import MyOrders from './MyOrders'
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../components/Common/Loading'
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null; 
  }

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart())
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.name}</h1>
            <p className='text text-gray-600 mb-2'>Email: {user.email}</p>
            <button 
              onClick={() => navigate('/my-vouchers')}
              className='cursor-pointer w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-500 transition-all duration-300 mb-3'>
              Xem voucher
            </button>
            <button 
              onClick={handleLogout} 
              className='cursor-pointer w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-all duration-300'>
              Đăng xuất
            </button>
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 shadow-md rounded-lg">
            <MyOrders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
