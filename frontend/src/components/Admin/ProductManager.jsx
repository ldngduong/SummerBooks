import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiXCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../Common/Loading";
import {
  createProduct,
  deleteProduct,
  fetchProduct,
} from "../../redux/slices/adminProductSlice";
import { toast } from "sonner";
import axios from "axios";
import { fetchShopManager } from "../../redux/slices/shopManagerSlice";

const ProductManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.adminProduct);
  const { shopManager } = useSelector((state) => state.shopManager);

  const [isShowForm, setIsShowForm] = useState(false);
  const handleToggleForm = () => {
    setIsShowForm(!isShowForm);
  };
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    countOfPage: 0,
    category: "",
    publishedAt: '2025-01-01',
    author: "",
    images: [],
    countInStock: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    dispatch(fetchShopManager());
  }, [dispatch]);
  // Hàm format số với dấu chấm phân cách hàng nghìn
  const formatPrice = (value) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    // Format với dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm unformat (loại bỏ dấu chấm) để lấy giá trị số
  const unformatPrice = (value) => {
    return value.replace(/\./g, '');
  };

  // Handler để ngăn tooltip HTML5 validation
  const handleInvalid = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === 'countInStock') {
      const num = Number(value);
      if (num < 1) {
        setErrors({ ...errors, [name]: "Số lượng tồn kho tối thiểu là 1" });
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho trường giá tiền
    if (name === 'price') {
      const formattedValue = formatPrice(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === 'countOfPage') {
      // Chặn số âm cho số trang
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '' || numericValue === '0') {
        setFormData({ ...formData, [name]: numericValue === '' ? '' : 0 });
      } else {
        setFormData({ ...formData, [name]: Number(numericValue) });
      }
    } else if (name === 'countInStock') {
      // Cho phép nhập để validate real-time
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '') {
        setFormData({ ...formData, [name]: '' });
        setErrors({ ...errors, [name]: "" });
      } else {
        const num = Number(numericValue);
        setFormData({ ...formData, [name]: num });
        // Validate real-time: nếu < 1 thì hiển thị lỗi
        if (num < 1) {
          setErrors({ ...errors, [name]: "Số lượng tồn kho tối thiểu là 1" });
        } else {
          setErrors({ ...errors, [name]: "" });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
      // Xóa lỗi khi người dùng bắt đầu nhập
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };



  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation cho Tên sách: Bắt buộc, chuỗi ký tự, độ dài không quá 250 ký tự
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Vui lòng nhập đầy đủ thông tin";
    } else if (formData.name.trim().length >= 250) {
      newErrors.name = "Tên sách không được vượt quá 250 ký tự";
    }

    // Validation cho Giá bán: Bắt buộc, số tự nhiên, > 1000 VNĐ
    const priceValue = formData.price ? unformatPrice(formData.price.toString()) : '';
    if (priceValue === "" || priceValue === null || priceValue === undefined) {
      newErrors.price = "Vui lòng nhập đầy đủ thông tin";
    } else {
      const priceNum = Number(priceValue);
      if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
        newErrors.price = "Giá trị không hợp lệ";
      } else if (priceNum < 1000) {
        newErrors.price = "Giá bán tối thiểu là 1.000 VNĐ";
      }
    }

    // Validation cho Tác giả: Bắt buộc, chuỗi ký tự, tối thiểu 3 ký tự và tối đa 50 ký tự
    if (!formData.author || formData.author.trim() === "") {
      newErrors.author = "Vui lòng nhập đầy đủ thông tin";
    } else {
      const authorTrimmed = formData.author.trim();
      if (authorTrimmed.length < 3) {
        newErrors.author = "Tác giả phải có tối thiểu 3 ký tự";
      } else if (authorTrimmed.length > 50) {
        newErrors.author = "Tác giả không được vượt quá 50 ký tự";
      }
    }

    // Validation cho Mô tả: Bắt buộc, chuỗi ký tự, độ dài không quá 2000 ký tự
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Vui lòng nhập đầy đủ thông tin";
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = "Mô tả không được vượt quá 2000 ký tự";
    }

    // Validation cho Thể loại: Bắt buộc, là một trong các lựa chọn từ danh sách
    if (!formData.category || formData.category === "") {
      newErrors.category = "Vui lòng nhập đầy đủ thông tin";
    }

    // Validation cho Số trang: Bắt buộc, số tự nhiên, tối thiểu 24 trang
    if (formData.countOfPage === "" || formData.countOfPage === null || formData.countOfPage === undefined) {
      newErrors.countOfPage = "Vui lòng nhập đầy đủ thông tin";
    } else {
      const pageNum = Number(formData.countOfPage);
      if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
        newErrors.countOfPage = "Giá trị không hợp lệ";
      } else if (pageNum < 24) {
        newErrors.countOfPage = "Số trang tối thiểu là 24 trang";
      }
    }

    // Validation cho Ngày xuất bản: Bắt buộc, định dạng ngày
    if (!formData.publishedAt || formData.publishedAt === "") {
      newErrors.publishedAt = "Vui lòng nhập đầy đủ thông tin";
    }

    // Validation cho Số lượng tồn kho: Bắt buộc, số tự nhiên, > 0
    if (formData.countInStock === "" || formData.countInStock === null || formData.countInStock === undefined) {
      newErrors.countInStock = "Vui lòng nhập đầy đủ thông tin";
    } else {
      const stockNum = Number(formData.countInStock);
      if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
        newErrors.countInStock = "Số lượng tồn kho tối thiểu là 1";
      }
    }

    // Validation cho Ảnh: Bắt buộc có ít nhất 1 ảnh
    if (formData.images.length === 0) {
      newErrors.images = "Vui lòng nhập đầy đủ thông tin";
    }

    setErrors(newErrors);

    // Nếu có lỗi, dừng lại
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (uploading) {
      return toast.error("Đang tải lên ảnh, chưa thể tạo sản phẩm!");
    }
    
    // Chuẩn bị dữ liệu để gửi (unformat giá tiền)
    const submitData = {
      ...formData,
      price: formData.price ? Number(unformatPrice(formData.price.toString())) : 0
    };
    
    await dispatch(createProduct(submitData));
    setFormData({
      name: "",
      description: "",
      price: "",
      countOfPage: 0,
      category: "",
      publishedAt: '2025-01-01',
      author: "",
      images: [],
      countInStock: 0,
    });
    setErrors({});
  };
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const imagesData = new FormData();
      imagesData.append("image", file);
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        imagesData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      console.log(data);
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, { url: data.imageUrl, altText: "" }],
      }));
      // Xóa lỗi ảnh khi thêm ảnh thành công
      if (errors.images) {
        setErrors({ ...errors, images: "" });
      }
      setUploading(false);
    } catch (error) {
      console.log(error);
      setUploading(false);
    }
  };
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này?"
    );
    if (isConfirmed) {
      await dispatch(deleteProduct(id));
      toast.success("Xóa sản phẩm thành công.");
    }
  };
  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);
  if (loading) {
    return <Loading />;
  }
  return (
    shopManager && (
      <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-6">Quản lý sản phẩm</h1>
        <div className="w-full h-fit font-semibold mb-4 relative">
          <button
            onClick={handleToggleForm}
            className="cursor-pointer mb-2 inline-block bg-gray-600 text-white rounded-lg px-4 py-2"
          >
            {isShowForm ? "Đóng" : "Thêm sản phẩm"}
          </button>
          <form
            className={`w-full overflow-hidden rounded-lg shadow-lg transition-all duration-500 transform ${
              isShowForm ? "max-h-1000" : "max-h-0"
            }`}
            onSubmit={handleFormSubmit}
            noValidate
          >
            <div className="p-4">
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Tên sản phẩm
                </label>
                <input
                  name="name"
                  onChange={handleFormChange}
                  value={formData.name}
                  className={`border w-full p-2 rounded-lg ${
                    errors.name ? "border-red-500" : "border-gray-600"
                  }`}
                  type="text"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  onChange={handleFormChange}
                  value={formData.description}
                  className={`border w-full p-2 rounded-lg ${
                    errors.description ? "border-red-500" : "border-gray-600"
                  }`}
                  rows={4}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">Giá</label>
                <input
                  name="price"
                  onChange={handleFormChange}
                  value={formData.price}
                  className={`border w-full p-2 rounded-lg ${
                    errors.price ? "border-red-500" : "border-gray-600"
                  }`}
                  type="text"
                  placeholder="Nhập giá (ví dụ: 10.000)"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">Số trang</label>
                <input
                  name="countOfPage"
                  onChange={handleFormChange}
                  value={formData.countOfPage}
                  className={`border w-full p-2 rounded-lg ${
                    errors.countOfPage ? "border-red-500" : "border-gray-600"
                  }`}
                  type="number"
                  min="0"
                />
                {errors.countOfPage && (
                  <p className="text-red-500 text-sm mt-1">{errors.countOfPage}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Số lượng tồn kho
                </label>
                <input
                  name="countInStock"
                  onChange={handleFormChange}
                  onInvalid={handleInvalid}
                  value={formData.countInStock}
                  className={`border w-full p-2 rounded-lg ${
                    errors.countInStock ? "border-red-500" : "border-gray-600"
                  }`}
                  type="number"
                  min="1"
                />
                {errors.countInStock && (
                  <p className="text-red-500 text-sm mt-1">{errors.countInStock}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Ngày xuất bản
                </label>
                <input
                  name="publishedAt"
                  onChange={handleFormChange}
                  value={formData.publishedAt}
                  className={`border w-full p-2 rounded-lg ${
                    errors.publishedAt ? "border-red-500" : "border-gray-600"
                  }`}
                  type="date"
                />
                {errors.publishedAt && (
                  <p className="text-red-500 text-sm mt-1">{errors.publishedAt}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Thể loại
                </label>
                <select
                  name="category"
                  onChange={handleFormChange}
                  value={formData.category || ""}
                  className={`border w-full p-2 rounded-lg ${
                    errors.category ? "border-red-500" : "border-gray-600"
                  }`}
                >
                  <option value="" disabled>
                    Chọn thể loại
                  </option>
                  {shopManager.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">Tác giả</label>
                <input
                  name="author"
                  onChange={handleFormChange}
                  value={formData.author}
                  className={`border w-full p-2 rounded-lg ${
                    errors.author ? "border-red-500" : "border-gray-600"
                  }`}
                  type="text"
                />
                {errors.author && (
                  <p className="text-red-500 text-sm mt-1">{errors.author}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-1">
                  Thêm ảnh
                </label>
                <div className="w-fit flex gap-2 items-center">
                  {uploading ? (
                    <Loading />
                  ) : (
                    <label
                      htmlFor="imageUpload"
                      className="hover:bg-gray-500 transition-all duration-300 cursor-pointer text-sm text-white bg-gray-700 px-4 py-2 rounded-lg block mb-1"
                    >
                      Chọn ảnh
                    </label>
                  )}
                </div>
                <input
                  hidden
                  id="imageUpload"
                  type="file"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-1">
                  Ảnh sản phẩm
                </label>
                <div className="flex flex-wrap gap-2 w-full">
                  {formData && formData.images.length > 0 ? (
                    formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-30 aspect-square overflow-hidden relative"
                      >
                        <img
                          src={image.url}
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              images: formData.images.filter(
                                (_, i) => i !== index
                              ),
                            });
                            // Xóa lỗi ảnh nếu đã có ảnh
                            if (errors.images && formData.images.length > 1) {
                              setErrors({ ...errors, images: "" });
                            }
                          }}
                          className="text-white absolute top-0 right-0 p-3 font-bold text-2xl rounded-full cursor-pointer"
                        >
                          <FiXCircle />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>Không có hình ảnh</p>
                  )}
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                )}
                <input
                  hidden
                  id="imageUpload"
                  type="file"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="mb-4 w-full">
                <button className="bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-lg w-full py-2 text-white cursor-pointer">
                  Thêm
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="flex h-full shadow-md w-full p-4 gap-3 flex-col relative">
          <div className="w-full">
            <h2 className="mb-4 font-semibold text-lg">Danh sách sản phẩm</h2>
            <div className="w-full rounded-lg overflow-auto shadow-md">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 first:rounded-tl-lg last:rounded-tr-lg">
                      ID
                    </th>
                    <th className="px-4 py-2">Tên sản phẩm</th>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2 last:rounded-tr-lg">Giá</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {product && product.length > 0 ? (
                    product.map((product) => (
                      <tr className="hover:bg-gray-100 transition-all duration-300">
                        <th
                          onClick={() => {
                            navigate(`/product/${product._id}`);
                          }}
                          className="px-4 py-3 cursor-pointer text-blue-600 underline"
                        >
                          {product._id.substring(0, 3)}...
                          {product._id.substring(product._id.length - 4)}
                        </th>
                        <th className="px-4 py-3">{product.name}</th>
                        <th className="px-4 py-3">{product.sku}</th>
                        <th className="px-4 py-3">{product.price}</th>
                        <th className="flex">
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="hover:text-red-600 transition-all duration-200 text-red-400 px-4 py-3 cursor-pointer"
                          >
                            Xóa
                          </button>
                          <Link
                            className="hover:text-amber-500 transition-all duration-200 text-amber-600 px-4 py-3 cursor-pointer"
                            to={`/admin/products/${product._id}/edit`}
                          >
                            Sửa
                          </Link>
                        </th>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th colSpan={5} className="px-4 py-3">
                        Không có sản phẩm nào
                      </th>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductManager;
