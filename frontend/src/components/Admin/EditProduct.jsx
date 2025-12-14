import React, { useEffect, useState } from "react";
import { FiXCircle } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productDetails, updateProduct } from "../../redux/slices/adminProductSlice";
import Loading from "../Common/Loading";
import axios from "axios";
import { toast } from "sonner";
import { fetchShopManager } from "../../redux/slices/shopManagerSlice";

const EditProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector(
    (state) => state.adminProduct
  );
  const { shopManager } = useSelector((state) => state.shopManager);
  const { id } = useParams();
  const [uploading, setUploading] = useState(false);
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchShopManager());
  }, [dispatch]);

  useEffect(() => {
    dispatch(productDetails({ id }));
  }, [dispatch, id]);

  // Hàm format số với dấu chấm phân cách hàng nghìn
  const formatPrice = (value) => {
    if (!value) return '';
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.toString().replace(/\D/g, '');
    if (!numericValue) return '';
    // Format với dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm unformat (loại bỏ dấu chấm) để lấy giá trị số
  const unformatPrice = (value) => {
    return value.toString().replace(/\./g, '');
  };

  useEffect(() => {
    if (selectedProduct) {
      const stockValue = selectedProduct.countInStock || 0;
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: formatPrice(selectedProduct.price || 0),
        category: selectedProduct.category || "",
        countOfPage: selectedProduct.countOfPage || "",
        publishedAt: new Date(selectedProduct.publishedAt).toISOString().split('T')[0] || [],
        images: selectedProduct.images || [],
        countInStock: stockValue,
        author: selectedProduct.author || "",
      });
      
      // Validate số lượng tồn kho khi load dữ liệu
      if (stockValue <= 0) {
        setErrors(prev => ({ ...prev, countInStock: "Số lượng tồn kho tối thiểu là 1" }));
      } else {
        setErrors(prev => ({ ...prev, countInStock: "" }));
      }
    }
  }, [selectedProduct]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    
    // Xử lý đặc biệt cho trường giá tiền
    if (name === 'price') {
      const formattedValue = formatPrice(value);
      setFormData({ ...formData, [name]: formattedValue });
      
      // Validate real-time cho giá
      const priceValue = unformatPrice(formattedValue);
      if (priceValue === '') {
        newErrors.price = "Vui lòng nhập đầy đủ thông tin";
      } else {
        const priceNum = Number(priceValue);
        if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
          newErrors.price = "Giá trị không hợp lệ";
        } else if (priceNum < 1000) {
          newErrors.price = "Giá bán tối thiểu là 1.000 VNĐ";
        } else {
          newErrors.price = "";
        }
      }
    } else if (name === 'countOfPage') {
      // Chặn số âm cho số trang
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '') {
        setFormData({ ...formData, [name]: '' });
        newErrors.countOfPage = "Vui lòng nhập đầy đủ thông tin";
      } else if (numericValue === '0') {
        setFormData({ ...formData, [name]: 0 });
        newErrors.countOfPage = "Số trang tối thiểu là 24 trang";
      } else {
        const num = Number(numericValue);
        setFormData({ ...formData, [name]: num });
        // Validate real-time
        if (num < 24) {
          newErrors.countOfPage = "Số trang tối thiểu là 24 trang";
        } else {
          newErrors.countOfPage = "";
        }
      }
    } else if (name === 'countInStock') {
      // Cho phép nhập để validate real-time
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue === '') {
        setFormData({ ...formData, [name]: '' });
        newErrors.countInStock = "Vui lòng nhập đầy đủ thông tin";
      } else {
        const num = Number(numericValue);
        setFormData({ ...formData, [name]: num });
        // Validate real-time: nếu < 1 thì hiển thị lỗi
        if (num < 1) {
          newErrors.countInStock = "Số lượng tồn kho tối thiểu là 1";
        } else {
          newErrors.countInStock = "";
        }
      }
    } else if (name === 'name') {
      setFormData({ ...formData, [name]: value });
      // Validate real-time cho tên sách
      if (!value || value.trim() === "") {
        newErrors.name = "Vui lòng nhập đầy đủ thông tin";
      } else if (value.trim().length > 250) {
        newErrors.name = "Tên sách không được vượt quá 250 ký tự";
      } else {
        newErrors.name = "";
      }
    } else if (name === 'description') {
      setFormData({ ...formData, [name]: value });
      // Validate real-time cho mô tả
      if (!value || value.trim() === "") {
        newErrors.description = "Vui lòng nhập đầy đủ thông tin";
      } else if (value.trim().length > 2000) {
        newErrors.description = "Mô tả không được vượt quá 2000 ký tự";
      } else {
        newErrors.description = "";
      }
    } else if (name === 'author') {
      setFormData({ ...formData, [name]: value });
      // Validate real-time cho tác giả
      if (!value || value.trim() === "") {
        newErrors.author = "Vui lòng nhập đầy đủ thông tin";
      } else {
        const authorTrimmed = value.trim();
        if (authorTrimmed.length < 3) {
          newErrors.author = "Tác giả phải có tối thiểu 3 ký tự";
        } else if (authorTrimmed.length > 50) {
          newErrors.author = "Tác giả không được vượt quá 50 ký tự";
        } else {
          newErrors.author = "";
        }
      }
    } else if (name === 'category') {
      setFormData({ ...formData, [name]: value });
      // Validate real-time cho thể loại
      if (!value || value === "") {
        newErrors.category = "Vui lòng nhập đầy đủ thông tin";
      } else {
        newErrors.category = "";
      }
    } else if (name === 'publishedAt') {
      setFormData({ ...formData, [name]: value });
      // Validate real-time cho ngày xuất bản
      if (!value || value === "") {
        newErrors.publishedAt = "Vui lòng nhập đầy đủ thông tin";
      } else {
        newErrors.publishedAt = "";
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setErrors(newErrors);
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



  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation cho Tên sách: Bắt buộc, chuỗi ký tự, độ dài không quá 250 ký tự
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Vui lòng nhập đầy đủ thông tin";
    } else if (formData.name.trim().length > 250) {
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
    
    if(uploading){
      return toast.error('Đang tải lên ảnh, chưa thể lưu!')
    }
    
    // Chuẩn bị dữ liệu để gửi (unformat giá tiền)
    const submitData = {
      ...formData,
      price: formData.price ? Number(unformatPrice(formData.price.toString())) : 0
    };
    
    dispatch(updateProduct({id, productData: submitData}))
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

  if (loading) {
    return <Loading />;
  }
  return selectedProduct ? (
    <div className="flex flex-col h-full relative">
      <h1 className="text-3xl font-bold mb-6">Sửa sản phẩm</h1>
      <form
        className={`w-full p-3 rounded-lg shadow-lg font-semibold`}
        onSubmit={handleFormSubmit}
        noValidate
      >
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
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Mô tả</label>
          <textarea
            name="description"
            onChange={handleFormChange}
            value={formData.description}
            className={`border w-full p-2 rounded-lg ${
              errors.description ? "border-red-500" : "border-gray-600"
            }`}
            rows={4}
            required
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
            placeholder="1.000"
            required
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">
            Số trang
          </label>
          <input
            name="countOfPage"
            onChange={handleFormChange}
            value={formData.countOfPage}
            className={`border w-full p-2 rounded-lg ${
              errors.countOfPage ? "border-red-500" : "border-gray-600"
            }`}
            type="number"
            min="0"
            required
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
            required
          />
          {errors.countInStock && (
            <p className="text-red-500 text-sm mt-1">{errors.countInStock}</p>
          )}
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Ngày xuất bản</label>
          <input
            name="publishedAt"
            onChange={handleFormChange}
            value={formData.publishedAt}
            className={`border w-full p-2 rounded-lg ${
              errors.publishedAt ? "border-red-500" : "border-gray-600"
            }`}
            type="date"
            required
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
            required
          />
          {errors.author && (
            <p className="text-red-500 text-sm mt-1">{errors.author}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-1">Thêm ảnh</label>
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
                        images: formData.images.filter((_, i) => i !== index),
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

        <div className="mb-4 w-full flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-500 transition-all duration-300 rounded-lg w-full py-2 text-white cursor-pointer">
            Lưu
          </button>
          <Link
            className="hover:border-black border-gray-400 transition-all duration-300 rounded-lg w-full py-2 border flex justify-center items-center"
            to="/admin/products"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  ) : null;
};

export default EditProduct;
