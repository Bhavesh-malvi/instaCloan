import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FaFacebookSquare } from 'react-icons/fa';

const Auth = () => {
  const { userForm, handleChange, handleSignup, isLogin, setIsLogin } = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(isLogin === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[350px] flex flex-col gap-3">
        
        {/* Main Auth Card */}
        <div className="bg-white px-10 pt-10 pb-6 border border-gray-300 flex flex-col items-center shadow-sm rounded-[1px]">
          
          {/* Logo (Using Google Font for Reliability) */}
          <div className="mb-6 mt-4 w-full flex flex-col items-center">
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap');
                .insta-logo {
                  font-family: 'Grand Hotel', cursive;
                }
              `}
            </style>
            <h1 className="insta-logo text-[46px] font-normal text-gray-900 tracking-wide m-0 leading-none">
              Instagram
            </h1>
          </div>
          
          {isLogin === 'signup' && (
            <h2 className="text-[#737373] font-semibold text-center mb-4 leading-5 text-[16px]">
              Sign up to see photos and videos from your friends.
            </h2>
          )}

          {isLogin === 'signup' && (
            <div className="w-full">
              <button className="w-full flex items-center justify-center bg-[#0095f6] text-white font-semibold py-1.5 rounded-lg hover:bg-[#1877f2] transition duration-200 text-[14px] mt-1 shadow-sm">
                <FaFacebookSquare className="mr-2 text-lg" />
                Log in with Facebook
              </button>
              <div className="flex items-center justify-between w-full mt-5 mb-4">
                <div className="h-[1px] bg-gray-300 w-full"></div>
                <span className="text-[#737373] font-semibold px-4 text-[13px]">OR</span>
                <div className="h-[1px] bg-gray-300 w-full"></div>
              </div>
            </div>
          )}

          <form className="w-full flex flex-col gap-[6px]" onSubmit={handleSignup}>
            
            <div className="relative">
              <input
                id="username"
                type="text"
                name="username"
                value={userForm.username}
                onChange={handleChange}
                className="peer w-full bg-[#fafafa] border border-gray-300 text-xs text-gray-800 rounded-[3px] focus:outline-none focus:border-gray-400 px-2 pt-[14px] pb-[2px]"
                placeholder=" "
                required
              />
              <label
                htmlFor="username"
                className="absolute left-2 text-[#737373] text-[10px] transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:top-[11px] peer-focus:text-[10px] peer-focus:top-[3px] top-[3px] pointer-events-none"
              >
                {isLogin === 'signin' ? "Phone number, username, or email" : "Username"}
              </label>
            </div>

            {isLogin === 'signup' && (
              <>
                <div className="relative">
                  <input
                    id="fullname"
                    type="text"
                    name="fullname"
                    value={userForm.fullname}
                    onChange={handleChange}
                    className="peer w-full bg-[#fafafa] border border-gray-300 text-xs text-gray-800 rounded-[3px] focus:outline-none focus:border-gray-400 px-2 pt-[14px] pb-[2px]"
                    placeholder=" "
                  />
                  <label
                    htmlFor="fullname"
                    className="absolute left-2 text-[#737373] text-[10px] transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:top-[11px] peer-focus:text-[10px] peer-focus:top-[3px] top-[3px] pointer-events-none"
                  >
                    Full Name
                  </label>
                </div>
                
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    name="email"
                    value={userForm.email}
                    onChange={handleChange}
                    className="peer w-full bg-[#fafafa] border border-gray-300 text-xs text-gray-800 rounded-[3px] focus:outline-none focus:border-gray-400 px-2 pt-[14px] pb-[2px]"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-2 text-[#737373] text-[10px] transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:top-[11px] peer-focus:text-[10px] peer-focus:top-[3px] top-[3px] pointer-events-none"
                  >
                    Email
                  </label>
                </div>
              </>
            )}

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={userForm.password}
                onChange={handleChange}
                className="peer w-full bg-[#fafafa] border border-gray-300 text-xs text-gray-800 rounded-[3px] focus:outline-none focus:border-gray-400 px-2 pt-[14px] pb-[2px] pr-12"
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="absolute left-2 text-[#737373] text-[10px] transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:top-[11px] peer-focus:text-[10px] peer-focus:top-[3px] top-[3px] pointer-events-none"
              >
                Password
              </label>
              {userForm.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-[10px] text-[12px] font-semibold text-gray-800 hover:text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>

            {isLogin === 'signup' && (
              <p className="text-[12px] text-[#737373] text-center mt-3 mb-2 leading-[16px]">
                People who use our service may have uploaded your contact information to Instagram.<br/><br/>
                By signing up, you agree to our Terms , Privacy Policy and Cookies Policy.
              </p>
            )}

            <button
              type="submit"
              className={`w-full text-white font-semibold py-[6px] rounded-[8px] transition duration-200 text-sm mt-2 flex items-center justify-center
                ${!userForm.username || !userForm.password ? 'bg-[#4cb5f9] hover:bg-[#4cb5f9] cursor-not-allowed opacity-70' : 'bg-[#0095f6] hover:bg-[#1877f2] shadow-sm'}`}
            >
              {isLogin === 'signin' ? 'Log in' : 'Sign up'}
            </button>
          </form>

          {isLogin === 'signin' && (
            <div className="flex flex-col items-center w-full mt-2">
              <div className="flex items-center justify-between w-full my-4">
                <div className="h-[1px] bg-gray-300 w-full"></div>
                <span className="text-[#737373] font-semibold px-4 text-[13px]">OR</span>
                <div className="h-[1px] bg-gray-300 w-full"></div>
              </div>

              <button className="flex items-center justify-center text-[#385185] font-semibold text-[14px] hover:text-blue-900 mt-2 mb-4">
                <FaFacebookSquare className="mr-2 text-xl" />
                Log in with Facebook
              </button>

              <a href="#" className="text-xs text-[#00376b] text-center mt-1">
                Forgot password?
              </a>
            </div>
          )}

        </div>

        {/* Secondary Card (Toggle Mode) */}
        <div className="bg-white border border-gray-300 py-5 text-center shadow-sm rounded-[1px]">
          <p className="text-[14px] text-gray-900">
            {isLogin === 'signin' ? "Don't have an account? " : "Have an account? "}
            <span 
              onClick={toggleAuthMode}
              className="text-[#0095f6] font-semibold cursor-pointer hover:text-[#1877f2]"
            >
              {isLogin === 'signin' ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>

        {/* App Store Links */}
        <div className="flex flex-col items-center pt-2">
          <p className="text-[14px] mb-3 text-gray-900">Get the app.</p>
          <div className="flex justify-center gap-2">
            <img 
               src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png" 
               alt="Get it on Google Play" 
               className="h-10 cursor-pointer hover:opacity-80 transition"
            />
            <img 
               src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png" 
               alt="Get it from Microsoft" 
               className="h-10 cursor-pointer hover:opacity-80 transition"
            />
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Auth;