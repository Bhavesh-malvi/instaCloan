import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiSettings, FiHeart } from 'react-icons/fi';
import { BsGrid3X3, BsBookmark, BsPersonBoundingBox, BsChatFill } from 'react-icons/bs';
import { BiMoviePlay } from "react-icons/bi";
import avatar from '../assets/img/avatar.png';
import PostDetailModal from '../components/PostDetailModal';
import API from '../api/axios';
import { ProfileHeaderSkeleton, GridPostSkeleton } from '../components/Skeletons';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { userData, postDataById, isPostModalOpen, handlePostClick, setIsPostModalOpen, followUser, unfollowUser } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('POSTS');
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If the viewed profile is the logged-in user, redirect to /profile
    if (userData && userData.username === username) {
        navigate('/profile');
        return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch User Info
        const resUser = await API.get(`/user/profile-info/${username}`);
        if(resUser.data.success) {
            setProfileUser(resUser.data.user);
            // Fetch User Posts
            const resPosts = await API.get(`/posts/user/${resUser.data.user._id}`);
            if(resPosts.data.success) {
                setUserPosts(resPosts.data.posts);
            }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
        setError("User not found or something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if(username) {
        fetchUserProfile();
    }
  }, [username, userData?.username, navigate]);


  if (loading) {
      return (
          <div className="w-full flex justify-center mt-6 lg:mt-10 mb-20">
              <div className="max-w-[935px] w-full px-4 sm:px-6">
                  <ProfileHeaderSkeleton />
                  <div className="flex items-center justify-center gap-12 w-full mt-2 border-t border-transparent relative -top-[1px]">
                      {/* Fake tabs */}
                      <div className="w-16 h-4 bg-gray-200 animate-pulse my-4"></div>
                      <div className="w-16 h-4 bg-gray-200 animate-pulse my-4"></div>
                      <div className="w-16 h-4 bg-gray-200 animate-pulse my-4"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 grid-flow-row mt-2">
                      <GridPostSkeleton />
                      <GridPostSkeleton />
                      <GridPostSkeleton />
                      <GridPostSkeleton />
                      <GridPostSkeleton />
                      <GridPostSkeleton />
                  </div>
              </div>
          </div>
      );
  }

  if (error || !profileUser) {
      return (
          <div className="w-full flex flex-col items-center justify-center mt-20 text-center">
              <h2 className="text-2xl font-semibold mb-4">Sorry, this page isn't available.</h2>
              <p className="text-gray-500 mb-6">The link you followed may be broken, or the page may have been removed.</p>
              <button onClick={() => navigate('/')} className="text-blue-500 font-semibold hover:underline">Go back to Instagram.</button>
          </div>
      );
  }

  const isFollowing = userData?.following?.includes(profileUser._id);
  const isFollower = userData?.followers?.includes(profileUser._id);

  const profileData = {
    username: profileUser.username,
    fullname: profileUser.fullname || '',
    bio: profileUser.bio || '',
    link: '',
    avatar: profileUser.profilePic || avatar,
    postsCount: userPosts.length,
    followersCount: profileUser.followers?.length || 0,
    followingCount: profileUser.following?.length || 0,
  };

  const tabs = [
    { name: 'POSTS', icon: <BsGrid3X3 size={12} /> },
    { name: 'REELS', icon: <BiMoviePlay size={14} /> },
    { name: 'TAGGED', icon: <BsPersonBoundingBox size={14} /> },
  ];

  return (
    <div className="w-full flex justify-center mt-6 lg:mt-10 mb-20">
      <PostDetailModal     
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        postData={postDataById} 
      />
      <div className="max-w-[935px] w-full px-4 sm:px-6">
        
        {/* PROFILE HEADER AREA */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-10 pb-10 border-b border-gray-200 w-full gap-8 md:gap-[100px]">
          
          {/* Avatar Area */}
          <div className="flex justify-center flex-shrink-0 w-full md:w-auto mt-2 md:pl-10">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-300 bg-gray-50">
              <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover object-top bg-white" />
            </div>
          </div>

          {/* User Info Area */}
          <div className="flex flex-col flex-1 w-full mt-4 md:mt-0">
            
            {/* Top row: Username & Actions */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <span className="text-[20px] text-gray-900 pr-5 leading-6">{profileData.username}</span>
              <div className="flex items-center gap-2">
                {isFollowing ? (
                    <button onClick={() => {
                        unfollowUser(profileUser._id);
                        setProfileUser(prev => ({
                            ...prev,
                            followers: prev.followers.filter(id => id !== userData._id)
                        }));
                    }} className="bg-[#efefef] hover:bg-[#dbdbdb] transition text-black font-semibold text-[14px] px-4 py-1.5 rounded-lg active:opacity-70">
                        Following
                    </button>
                ) : (
                    <button onClick={() => {
                        followUser(profileUser._id);
                        setProfileUser(prev => ({
                            ...prev,
                            followers: [...(prev.followers || []), userData._id]
                        }));
                    }} className="bg-[#0095f6] hover:bg-[#1877f2] transition text-white font-semibold text-[14px] px-5 py-1.5 rounded-lg active:opacity-70">
                        {isFollower ? "Follow Back" : "Follow"}
                    </button>
                )}
                <button className="bg-[#efefef] hover:bg-[#dbdbdb] transition text-black font-semibold text-[14px] px-4 py-1.5 rounded-lg active:opacity-70">
                  Message
                </button>
              </div>
            </div>

            {/* Middle row: Stats */}
            <div className="flex items-center gap-8 mb-5">
              <p className="text-[16px] text-gray-900"><span className="font-semibold">{profileData.postsCount}</span> posts</p>
              <p className="text-[16px] text-gray-900 cursor-pointer"><span className="font-semibold">{profileData.followersCount}</span> followers</p>
              <p className="text-[16px] text-gray-900 cursor-pointer"><span className="font-semibold">{profileData.followingCount}</span> following</p>
            </div>

            {/* Bottom row: Bio */}
            <div>
              <p className="text-[14px] font-semibold text-gray-900 leading-5">{profileData.fullname}</p>
              <p className="text-[14px] text-gray-900 leading-[18px] whitespace-pre-wrap">{profileData.bio}</p>
            </div>

          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center justify-center gap-12 w-full mt-2 border-t border-transparent relative -top-[1px]">
          {tabs.map((tab) => (
            <div 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-4 border-t cursor-pointer transition ${activeTab === tab.name ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {tab.icon}
              <span className="text-[12px] font-semibold tracking-widest">{tab.name}</span>
            </div>
          ))}
        </div>

        {/* PHOTO GRID */}
        {activeTab === 'POSTS' && (
            <div className="grid grid-cols-3 gap-1 grid-flow-row mt-2">
            {userPosts.length === 0 ? (
                <div className="col-span-3 py-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mb-4">
                        <BsGrid3X3 size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">No Posts Yet</h2>
                </div>
            ) : (
                userPosts.map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-200 cursor-pointer relative group" onClick={() => handlePostClick(img._id)}>
                    <img src={img.images[0]} alt="Grid post" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 z-10 text-white">
                        {/* Hover Overlay Stats */}
                        <div className="flex items-center gap-2 font-semibold">
                        <FiHeart size={20} className="fill-white" />
                        <span>{img.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                        <BsChatFill size={20} className="fill-white" />
                        <span>{img.comments?.length || 0}</span> 
                        </div>
                    </div>
                    </div>
                ))
            )}
            </div>
        )}

        {/* Informative text if rendering other tabs */}
        {activeTab !== 'POSTS' && (
          <div className="w-full h-[300px] flex items-center justify-center relative opacity-80 pointer-events-none">
            <p className="text-gray-500 text-sm font-semibold">Section under construction</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
