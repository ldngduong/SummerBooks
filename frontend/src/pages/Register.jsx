import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImg from "../assets/login.jpg";
import { registerUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Loading from "../components/Common/Loading";
import FullLoading from "../components/Common/FullLoading";

const Register = () => {
  const { user, loading } = useSelector((state) => state.auth);
    const { shopManager } = useSelector((state) => state.shopManager);

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    name: "",
    password: "",
    general: "",
  });
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const namePattern = /^[\p{L}\s]{2,}$/u;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-]{8,}$/;

    const newErrors = { email: "", name: "", password: "", general: "" };

    if (name.trim() === "") {
      newErrors.name = "Vui lòng nhập đầy đủ thông tin";
    } else if (!namePattern.test(name.trim())) {
      newErrors.name = "Họ và tên không đúng định dạng (chỉ chữ, tối thiểu 2 ký tự).";
    }

    if (email.trim() === "") {
      newErrors.email = "Vui lòng nhập đầy đủ thông tin";
    } else if (!emailPattern.test(email.trim())) {
      newErrors.email = "Email không đúng định dạng.";
    }

    if (password.trim() === "") {
      newErrors.password = "Vui lòng nhập đầy đủ thông tin";
    } else if (!passwordPattern.test(password)) {
      newErrors.password =
        "Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.";
    }

    if (newErrors.email || newErrors.name || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    try {
      setErrors({ email: "", name: "", password: "", general: "" });
      await dispatch(registerUser({ name, email, password })).unwrap();
      toast.success('Đăng ký thành công');
    } catch (error) {
      const errMsg = error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin';
      const serverErrors = { email: "", name: "", password: "", general: "" };
      if (typeof errMsg === "string") {
        if (errMsg.toLowerCase().includes("email")) {
          serverErrors.email = errMsg;
        } else if (errMsg.toLowerCase().includes("tên")) {
          serverErrors.name = errMsg;
        } else if (errMsg.toLowerCase().includes("mật khẩu")) {
          serverErrors.password = errMsg;
        } else {
          serverErrors.general = errMsg;
        }
      } else {
        serverErrors.general = 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin';
      }
      setErrors(serverErrors);
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
            <h2 className="text-xl font-medium">{shopManager.name}</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Đăng kí</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="w-full p-2 border rounded"
              placeholder="username@email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
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
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className="w-full p-2 border rounded"
              placeholder="Họ và tên"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className="w-full p-2 border rounded"
              placeholder="Mật khẩu"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {errors.general && (
            <p className="text-red-500 text-sm mb-2">{errors.general}</p>
          )}
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
