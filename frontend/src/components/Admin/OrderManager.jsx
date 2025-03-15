import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/adminOrderSlice'
import Loading from '../Common/Loading'

const OrderManager = () => {
  const dispatch = useDispatch()
  const {order, loading} = useSelector((state) => state.adminOrder)
  const navigate = useNavigate()
  const [tab, setTab] = useState()
  const handleChangeTab = (type) => {
    setTab(type)
    navigate(`?status=${type}`)
    dispatch(fetchAllOrders({status: type}))
  }

  const handleStatusChange = async (id, e) => {
    dispatch(updateOrderStatus({id, status: e.target.value}))
  }

  useEffect(() => {
    handleChangeTab('Chờ duyệt')
  }, [])

  if(loading){
    return <Loading />
  }
  return (
    <div className='flex flex-col h-full'>
        <h1 className='text-3xl font-bold mb-6'>Quản lý đơn hàng</h1>
        <div className="flex h-full shadow-md w-full p-4 gap-3 flex-col">
            <div className="flex justify-between mb-4">
                <div className="text-sm s w-full flex justify-center items-center">
                    <button 
                        onClick={() => {handleChangeTab('Chờ duyệt')}}
                        className={`${tab === 'Chờ duyệt' ? 'border-b border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-700 hover:border-b hover:border-gray-300 '}   
                        w-full px-4 py-2 font-bold cursor-pointer`}
                    >
                        Chờ duyệt
                    </button>
                </div>
                <div className="text-sm w-full flex justify-center items-center">
                <button 
                        onClick={() => {handleChangeTab('Đang giao')}}
                        className={`${tab === 'Đang giao' ? 'border-b border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-700 hover:border-b hover:border-gray-300 '}   
                        w-full px-4 py-2 font-bold cursor-pointer`}
                    >
                        Đang giao
                    </button>
                </div>
                <div className="text-sm w-full flex justify-center items-center">
                <button 
                        onClick={() => {handleChangeTab('Đã giao')}}
                        className={`${tab === 'Đã giao' ? 'border-b border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-700 hover:border-b hover:border-gray-300 '}   
                        w-full px-4 py-2 font-bold cursor-pointer`}
                    >
                        Đã giao
                    </button>                
                </div>
                <div className="text-sm w-full flex justify-center items-center">
                <button 
                        onClick={() => {handleChangeTab('Đã hủy')}}
                        className={`${tab === 'Đã hủy' ? 'border-b border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-700 hover:border-b hover:border-gray-300 '}   
                        w-full px-4 py-2 font-bold cursor-pointer`}
                    >
                        Đã hủy
                    </button>                
                </div>
            </div>
            <div className="w-full rounded-lg overflow-auto shadow-md">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 first:rounded-tl-lg last:rounded-tr-lg">Mã đơn</th>
                            <th className="px-4 py-2">Tên khách</th>
                            <th className="px-4 py-2">Số điện thoại</th>
                            <th className="px-4 py-2">Trạng thái</th>
                            <th className="px-4 py-2 last:rounded-tr-lg">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order && order.length>0 ? (order.map((order)=> (
                            <tr key={order._id} className='hover:bg-gray-100 transition-all duration-300'>
                                <th onClick={()=>{navigate(`/admin/orders/${order._id}`)}} className='px-4 py-3 cursor-pointer text-blue-600 underline'>{order._id.substring(0,3)}...{order._id.substring(order._id.length-4)}</th>
                                <th className='px-4 py-3'>{order.name}</th>
                                <th className='px-4 py-3'>{order.phone}</th>
                                {(order.status === 'Chờ duyệt' || order.status === 'Đang giao') && (
                                    <th className={`px-4 py-3`}>
                                        <select value={order.status} onChange={(e) => {handleStatusChange(order._id, e)}} className='px-2 py-1 rounded-md border border-gray-500' name="status" id="">
                                            <option value="Chờ duyệt">Chờ duyệt</option>
                                            <option value="Đang giao">Đang giao</option>
                                            <option value="Đã giao">Đã giao</option>
                                            <option value="Đã hủy">Đã hủy</option>
                                        </select>
                                    </th>
                                )}
                                <th className='px-4 py-3'>{new Date(order.paidAt).toLocaleDateString()}</th>
                            </tr>
                        ))) : (
                            <tr>                            
                                <th colSpan={5} className='px-4 py-3'>Không có đơn hàng nào gần đây</th>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}

export default OrderManager