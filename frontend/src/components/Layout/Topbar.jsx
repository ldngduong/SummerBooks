import React, { useEffect } from 'react'
import { IoLogoInstagram } from 'react-icons/io'
import { RiTiktokLine, RiTwitterXLine } from 'react-icons/ri'
import { TbBrandMeta } from 'react-icons/tb'
import { fetchShopManager } from '../../redux/slices/shopManagerSlice'
import { useDispatch, useSelector } from 'react-redux'

const Topbar = () => {
    const dispatch = useDispatch();
    const { shopManager, loading } = useSelector((state) => state.shopManager);
    useEffect(() => {
      dispatch(fetchShopManager());
    }, [dispatch]);
  
  return ( shopManager &&
    <div className='bg-amber-600 text-white'>
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
            <div className="hidden md:flex items-center space-x-4">
                {shopManager.contact.meta && (
                    <a target="_blank" href={shopManager.contact.meta} className='hover:text-gray-300'>
                        <TbBrandMeta className='h-5 w-5'/>
                    </a>
                )}
                {shopManager.contact.instagram && (
                    <a target="_blank" href={shopManager.contact.meta} className='hover:text-gray-300'>
                        <IoLogoInstagram className='h-5 w-5'/>
                    </a>
                )}
                {shopManager.contact.x && (
                    <a target="_blank" href={shopManager.contact.meta} className='hover:text-gray-300'>
                        <RiTwitterXLine className='h-5 w-5'/>
                    </a>
                )}
                {shopManager.contact.tiktok && (
                    <a target="_blank" href={shopManager.contact.meta} className='hover:text-gray-300'>
                        <RiTiktokLine className='h-5 w-5'/>
                    </a>
                )}
            </div>
            <div className="text-sm text-center flex-grow">
                {shopManager.announcement && (
                    <span>{shopManager.announcement}</span>
                )}
            </div>
            <div className="hidden md:block text-sm">
                {shopManager.contact.phone && (
                    <a href="tel:+84865641682" className='hover:text-gray-300'>{shopManager.contact.phone}</a>
                )}
            </div>
        </div>
    </div>
  )
}

export default Topbar