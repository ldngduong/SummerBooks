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
    price: 0,
    countOfPage: 0,
    category: "",
    publishedAt: '2025-01-01',
    author: "",
    images: [],
    countInStock: 0,
  });
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    dispatch(fetchShopManager());
  }, [dispatch]);
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

    if (uploading) {
      return toast.error("Đang tải lên ảnh, chưa thể tạo sản phẩm!");
    }
    await dispatch(createProduct(formData));
    setFormData({
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
                  className="border-gray-600 border w-full p-2 rounded-lg"
                  type="text"
                />
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  onChange={handleFormChange}
                  value={formData.description}
                  className="border-gray-600 border w-full p-2 rounded-lg"
                  rows={4}
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
                />
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">Số trang</label>
                <input
                  name="countOfPage"
                  onChange={handleFormChange}
                  value={formData.countOfPage}
                  className="border-gray-600 border w-full p-2 rounded-lg"
                  type="number"
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
                />
              </div>
              <div className="mb-4 w-full">
                <label className="text-sm text-gray-600 block mb-1">
                  Ngày xuất bản
                </label>
                <input
                  name="publishedAt"
                  onChange={handleFormChange}
                  value={formData.publishedAt}
                  className="border-gray-600 border w-full p-2 rounded-lg"
                  type="date"
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
                <label className="text-sm text-gray-600 block mb-1">Tấc giả</label>
                <input
                  name="author"
                  onChange={handleFormChange}
                  value={formData.author}
                  className="border-gray-600 border w-full p-2 rounded-lg"
                  type="text"
                />
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
                          onClick={() =>
                            setFormData({
                              ...formData,
                              images: formData.images.filter(
                                (_, i) => i !== index
                              ),
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
