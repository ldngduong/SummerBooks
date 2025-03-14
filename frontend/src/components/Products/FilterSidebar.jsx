import { param } from 'framer-motion/client';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchShopManager } from '../../redux/slices/shopManagerSlice';
const FilterSidebar = () => {
  const dispatch = useDispatch()
  const {shopManager} = useSelector((state) => state.shopManager)
  useEffect(() => {
    dispatch(fetchShopManager)
  }, [dispatch])
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'all'
  })
  
  const [priceRange, setPriceRange] = useState([0, 100])

  const categories = shopManager.categories


  const handleFilterChange = (e) => {
      const {name, value, checked, type} = e.target;
      let newFilters = {...filters}
      if(type === 'checkbox'){
        if(checked){
            newFilters[name] = [...(newFilters[name] || []), value]
        } else {
            newFilters[name] = newFilters[name].filter((item) => item!==value)
        }
      } else {
        if (newFilters[name] === value) {
            newFilters[name] = undefined;
        } else {
            newFilters[name] = value;
        }
      }
      setFilters(newFilters);
      updateURLParams(newFilters);
  }

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
        if(Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
            params.append(key, newFilters[key].join(','))
        } else if (newFilters[key]){
            params.append(key, newFilters[key]);
        }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`)
  }


  useEffect(() => {
    const params = Object.fromEntries([...searchParams])
    setFilters((prevFilters) => ({
        category: params.category || prevFilters.category || '',
    }));
  }, [searchParams])

  return ( categories &&
    <div className='px-8'>
        <h2 className='py-6 text-lg font-semibold'>Bộ lọc</h2>
        <div className="mb-6">
            <select className='px-2 py-1 rounded-lg border-gray-400 border' name="sortBy" id="" value={filters.sortBy} onChange={handleFilterChange}>
                <option value="all">Tất cả</option>
                <option value="popularity">Phổ biến</option>
                <option value="priceAsc">Giá: thấp đến cao</option>
                <option value="priceDesc">Giá: cao đến thấp</option>
            </select>
        </div>
        <div className="mb-6">
            <label htmlFor="" className="block text-gray-600 font-medium mb-2">
                Thể loại
            </label>
            <div className='flex items-center mb-1'>
                    <input 
                        onChange={handleFilterChange}
                        value='All'
                        type="radio" 
                        name='category' 
                        className='mr-2 h-4 w-4 text-gray-500 focus:ring-gray-400 border-gray-300'
                        checked={filters.category === 'All'}
                    />
                    <span className='text-gray-700'>All</span>
            </div> 
            {categories.map((category) => (
               <div key={category} className='flex items-center mb-1'>
                    <input 
                        onChange={handleFilterChange}
                        value={category} 
                        type="radio" 
                        name='category' 
                        className='mr-2 h-4 w-4 text-gray-500 focus:ring-gray-400 border-gray-300'
                        checked={filters.category === category}
                    />
                    <span className='text-gray-700'>{category}</span>
               </div> 
            ))}
            
        </div>
    </div>
  )
}

export default FilterSidebar