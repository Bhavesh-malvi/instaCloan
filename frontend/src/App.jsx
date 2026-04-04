import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AppContext } from './context/AppContext'
import Profile from './pages/Profile'

// Dummy Component indicating page works inside Layout
const PlaceholderPage = ({ title }) => (
  <div className="w-full flex items-center justify-center pt-20">
    <h1 className="text-2xl font-semibold text-gray-400">{title} Page Content</h1>
  </div>
);

const App = () => {
  const { isAuth, isCheckingAuth } = useContext(AppContext);

  // Return a completely blank or loading screen until auth verified
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <p className="text-gray-500 font-semibold pt-[10vh]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Main Layout matches outer design (Sidebar) */}
          <Route element={<MainLayout />}>
            <Route path='/' element={<Home />} /> 
            <Route path='/search' element={<PlaceholderPage title="Search" />} />
            <Route path='/explore' element={<PlaceholderPage title="Explore" />} />
            <Route path='/reels' element={<PlaceholderPage title="Reels" />} />
            <Route path='/messages' element={<PlaceholderPage title="Messages" />} />
            <Route path='/notifications' element={<PlaceholderPage title="Notifications" />} />
            <Route path='/create' element={<PlaceholderPage title="Create" />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Route>

        {/* Public/Auth Routes */}
        <Route path='/auth' element={!isAuth ? <Auth /> : <Navigate to="/" />} />

        {/* 404 Fallback */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App