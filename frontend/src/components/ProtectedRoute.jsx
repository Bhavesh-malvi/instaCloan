import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProtectedRoute = () => {
    const { isAuth } = useContext(AppContext);

    // Render children inside the layout if authorized, otherwise drop back to auth.
    return isAuth ? <Outlet /> : <Navigate to="/auth" />;
}

export default ProtectedRoute;
