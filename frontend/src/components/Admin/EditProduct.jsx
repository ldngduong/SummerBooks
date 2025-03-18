import React, { useEffect, useState } from "react";
import { FiXCircle } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productDetails, updateProduct } from "../../redux/slices/adminProductSlice";
import Loading from "../Common/Loading";
import axios from "axios";
import { toast } from "sonner";

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
    price: 0,
    countOfPage: 0,
    category: "",
    publishedAt: '2025-01-01',
    author: "",
    images: [],
    countInStock: 0,
  });

  useEffect(() => {
    dispatch(productDetails({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || 0,
        category: selectedProduct.category || "",
        countOfPage: selectedProduct.countOfPage || "",
        publishedAt: new Date(selectedProduct.publishedAt).toISOString().split('T')[0] || [],
        images: selectedProduct.images || [],
        countInStock: selectedProduct.countInStock || 0,
        author: selectedProduct.author || 0,
      });
    }
  }, [selectedProduct]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isFormInvalid = Object.values(formData).some(
          (value) => value === "" || value === null
        ) || formData.images.length === 0;
        if(formData.countInStock < 0){
          toast.error("Số lượng tồn kho không hợp lệ!");
          return;
        }
        if(formData.countOfPage < 0){
          toast.error("Số lượng trang không hợp lệ!");
          return;
        }
        if(formData.price < 0){
          toast.error("Giá bán không hợp lệ!");
          return;
        }
        if (isFormInvalid) {
          toast.error("Vui lòng điền đầy đủ thông tin!");
          return;
        }
    
    
    if(uploading){
      return toast.error('Đang tải lên ảnh, chưa thể lưu!')
    }
    dispatch(updateProduct({id, productData: formData}))
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
      >
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">
            Tên sản phẩm
          </label>
          <input
            name="name"
            onChange={handleFormChange}
            value={formData.name}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="text"
            required
          />
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Mô tả</label>
          <textarea
            name="description"
            onChange={handleFormChange}
            value={formData.description}
            className="border-gray-600 border w-full p-2 rounded-lg"
            rows={4}
            required
          ></textarea>
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Giá</label>
          <input
            name="price"
            onChange={handleFormChange}
            value={formData.price}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="number"
            required
          />
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">
            Số trang
          </label>
          <input
            name="countOfPage"
            onChange={handleFormChange}
            value={formData.countOfPage}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="number"
            required
          />
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">
            Số lượng tồn kho
          </label>
          <input
            name="countInStock"
            onChange={handleFormChange}
            value={formData.countInStock}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="number"
            required
          />
        </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Ngày xuất bản</label>
          <input
            name="publishedAt"
            onChange={handleFormChange}
            value={formData.publishedAt}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="date"
            required
          />
        </div>
        <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Thể loại
                </label>
                <select
                  name="category"
                  onChange={handleFormChange}
                  value={formData.category || ""}
                  className="border-gray-600 border w-full p-2 rounded-lg"
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
              </div>
        <div className="mb-4 w-full">
          <label className="text-sm text-gray-600 block mb-1">Tác giả</label>
          <input
            name="author"
            onChange={handleFormChange}
            value={formData.author}
            className="border-gray-600 border w-full p-2 rounded-lg"
            type="text"
            required
          />
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
                    onClick={() =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter((_, i) => i !== index),
                      })
                    }
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
