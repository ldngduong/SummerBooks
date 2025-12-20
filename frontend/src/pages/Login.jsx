import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import loginImg from '../assets/login.jpg'
import {loginUser} from '../redux/slices/authSlice'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux';
import FullLoading from '../components/Common/FullLoading'
const Login = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const { shopManager } = useSelector((state) => state.shopManager);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const validateEmail = (email) => {
    if(!email || email.trim() === ''){
      return 'Vui lòng nhập đầy đủ thông tin.'
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailPattern.test(email.trim())){
      return 'Thông tin không hợp lệ.'
    }
    return ''
  }

  const validatePassword = (password) => {
    if(!password || password.trim() === ''){
      return 'Vui lòng nhập đầy đủ thông tin.'
    }
    // Sử dụng cùng pattern như backend
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/
    if(!passwordPattern.test(password)){
      return 'Thông tin không hợp lệ.'
    }
    return ''
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailErr = validateEmail(email)
    
    // Validate password
    const passwordErr = validatePassword(password)
    
    // Nếu có lỗi validation, hiển thị toast và không submit
    if(emailErr || passwordErr){
      const errorMessage = emailErr || passwordErr
      toast.error(errorMessage)
      return
    }

    try {
        await dispatch(loginUser({ email: email.trim(), password })).unwrap();
        toast.success('Đăng nhập thành công');
    } catch (error) {
        toast.error(error|| 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin');
    }
    };


  useEffect(() => {
    if(user){
        navigate('/')
    }
    }, [user, navigate]);
  if(!shopManager){
    return <FullLoading />
  }
  return (
    <div className='flex'>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form onSubmit={handleSubmit} className='w-full max-w-md bg-white p-8 rounded-lg border shadow-sm'>
            <div className="flex justify-center mb-6">
                <h2 className='text-xl font-medium'>{shopManager.name}</h2>
            </div>
            <h2 className='text-2xl font-bold text-center mb-6'>Đăng nhập</h2>
            <div className="mb-4">
                <label className='block text-sm font-semibold mb-2'>Email <span className='text-red-500'>*</span></label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={handleEmailChange}
                    className='w-full p-2 border rounded'
                    placeholder='username@email'
                />
            </div>
            <div className="mb-4">
                <label className='block text-sm font-semibold mb-2'>Mật khẩu <span className='text-red-500'>*</span></label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={handlePasswordChange}
                    className='w-full p-2 border rounded'
                    placeholder='Mật khẩu'
                />
            </div>
            <button 
                type='submit' 
                className='cursor-pointer w-full bg-amber-600 text-white p-2 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-300'
            >
                Đăng nhập
            </button>
            <p className='mt-6 text-center text-sm'>
                Chưa có tài khoản?
                <Link to='/register' className='text-gray-600'> Đăng ký</Link>
            </p>
        </form>
      </div>  
      <div className="hidden md:block w-1/2 h-150 bg-gray-800">
            <img className='h-full w-full object-cover' src={loginImg} alt="" />
      </div>
    </div>
  )
}

export default Login