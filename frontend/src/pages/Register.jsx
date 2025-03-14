import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImg from "../assets/login.jpg";
import { registerUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Loading from "../components/Common/Loading";

const Register = () => {
  const { user, loading } = useSelector((state) => state.auth);
    const { shopManager } = useSelector((state) => state.shopManager);

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(email === '' || password === '' || name === ''){
        return toast.error('Vui lòng nhập đầy đủ thông tin');
    }
    if(password.length < 6){
          return toast.error('Mật khẩu phải có tối thiểu 6 kí tự');
      } 
    try {
        await dispatch(registerUser({ name, email, password })).unwrap();
        toast.success('Đăng ký thành công');
    } catch (error) {
        toast.error(error|| 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin');
    }
  };
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  if(!shopManager){
    return <FullLoading />
  }
  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">TheShop</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Đăng kí</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="w-full p-2 border rounded"
              placeholder="username@email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="w-full p-2 border rounded"
              placeholder="Họ và tên"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="w-full p-2 border rounded"
              placeholder="Mật khẩu"
            />
          </div>
          {loading && loading ? (
            <Loading />
          ) : (
            <button
            type="submit"
            className="cursor-pointer w-full bg-amber-600 text-white p-2 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-300"
          >
            Đăng ký
          </button>
          )}
          <p className="mt-6 text-center text-sm">
            Đã có tài khoản?
            <Link to="/login" className="text-gray-600">
              {" "}
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block w-1/2 h-150 bg-gray-800">
        <img className="h-full w-full object-cover" src={registerImg} alt="" />
      </div>
    </div>
  );
};

export default Register;
