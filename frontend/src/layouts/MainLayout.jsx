import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-white text-black font-sans">
            <Sidebar />
            <div className="flex-1 flex justify-center md:ml-[72px] lg:ml-[244px] w-full">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout;
