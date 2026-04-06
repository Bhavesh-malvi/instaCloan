import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMessageCircle, FiSend, FiBookmark, FiHeart, FiSearch } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import avatar from '../assets/img/avatar.png';
import PostDetailModal from '../components/PostDetailModal';
import PostOptionsModal from '../components/PostOptionsModal';
import { PostSkeleton } from '../components/Skeletons';

const Home = () => {
  const { userForm, userData, feedPosts, isFeedLoading, isPostModalOpen, handlePostClick, setIsPostModalOpen, postDataById, likePost, addComment, timeAgo } = useContext(AppContext);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [selectedPostOptions, setSelectedPostOptions] = useState(null);

  const handleOptionsClick = (post) => {
    setSelectedPostOptions(post);
    setOptionsModalOpen(true);
  };

  const [commentTexts, setCommentTexts] = useState({});

  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({...prev, [postId]: text}));
  };

  const handleAddComment = async (postId) => {
    if (!commentTexts[postId]?.trim()) return;
    await addComment(postId, commentTexts[postId]);
    setCommentTexts(prev => ({...prev, [postId]: ""}));
  };

  const [animatingPosts, setAnimatingPosts] = useState({});

  const handleDoubleClick = (postId, isLiked) => {
    // Trigger animation
    setAnimatingPosts(prev => ({ ...prev, [postId]: true }));
    
    // Call API only if NOT liked
    if (!isLiked) {
       likePost(postId);
    }

    // Remove animation class after 1 second
    setTimeout(() => {
       setAnimatingPosts(prev => ({ ...prev, [postId]: false }));
    }, 1000);
  };

  // Dummy data
  const stories = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    user: `user_${i}`,
    img: `https://i.pravatar.cc/150?img=${i + 20}`
  }));

  const suggestions = [
    { id: 1, user: "john_doe", avatar: "https://i.pravatar.cc/150?img=33" },
    { id: 2, user: "jane_smith", avatar: "https://i.pravatar.cc/150?img=41" },
    { id: 3, user: "travel_diary", avatar: "https://i.pravatar.cc/150?img=52" },
    { id: 4, user: "foodie_gram", avatar: "https://i.pravatar.cc/150?img=60" },
    { id: 5, user: "photo_daily", avatar: "https://i.pravatar.cc/150?img=65" },
  ];

  return (
      <div className="flex justify-center w-full mt-4 md:mt-10">
        <style>
          {`
            @keyframes like-burst {
              0% { transform: scale(0); opacity: 0; }
              15% { transform: scale(1.2); opacity: 1; }
              30% { transform: scale(1); opacity: 0.9; }
              70% { transform: scale(1); opacity: 0.9; }
              100% { transform: scale(1.3); opacity: 0; }
            }
            .animate-like-burst {
              animation: like-burst 1s ease-in-out forwards;
            }
          `}
        </style>
        <PostDetailModal
        timeAgo={timeAgo}
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        postData={postDataById} 
      />
      <PostOptionsModal 
        isOpen={optionsModalOpen} 
        onClose={() => setOptionsModalOpen(false)} 
        post={selectedPostOptions} 
      />
        <div className="max-w-[630px] w-full md:w-[470px] flex flex-col items-center">
          
          {/* Stories Section */}
          <div className="w-full flex gap-4 overflow-x-auto scrollbar-hide py-4 mb-6">
            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center cursor-pointer min-w-[66px] max-w-[66px]">
                <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                  <div className="bg-white rounded-full p-[2px] h-full w-full">
                    <img src={story.img} alt={story.user} className="rounded-full w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-[12px] mt-1 text-gray-800 truncate w-full text-center">{story.user}</span>
              </div>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="w-full max-w-[470px] flex flex-col pb-20">
            {isFeedLoading ? (
               <>
                 <PostSkeleton />
                 <PostSkeleton />
               </>
            ) : feedPosts.length === 0 ? (
               <div className="flex flex-col items-center py-10 mt-10 text-gray-500">
                 <div className="w-20 h-20 border-2 border-gray-900 rounded-full flex items-center justify-center mb-4">
                   <FiSearch size={32} className="text-gray-900" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
                 <p className="text-sm">Follow people to see their posts here.</p>
               </div>
            ) : (
                feedPosts.map(post => (
                  <div key={post?._id} className="mb-6 border-b border-gray-200 pb-2">
                    {/* Post Header */}
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr p-[1px] from-yellow-400 to-purple-500">
                          <img src={post?.user?.profilePic} alt="user" className="w-full h-full rounded-full border border-white object-cover object-top" />
                        </div>
                        <span className="text-[14px] font-semibold text-gray-900">{post?.user?.username}</span>
                        <span className="text-gray-400 text-xs">• {timeAgo(post?.createdAt)}</span>
                      </div>
                      <BsThreeDots className="cursor-pointer" size={20} onClick={() => handleOptionsClick(post)} />
                    </div>
                    
                    {/* Post Image */}
                    <div 
                        className="w-full bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center border border-gray-100 relative cursor-pointer select-none"
                        onDoubleClick={() => handleDoubleClick(post._id, post?.likes?.includes(userData?._id))}
                    >
                      <img src={post?.images[0]} alt="post" className="w-full object-cover max-h-[585px]" />
                      
                      {/* Heart Animation Overlay */}
                      {animatingPosts[post?._id] && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                              <FaHeart className="fill-[#ff3040] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-like-burst" size={90} />
                          </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 pb-2">
                      <div className="flex items-center gap-4">
                        {post?.likes?.includes(userData?._id) ?<FaHeart size={26} className="cursor-pointer hover:text-gray-500 transition fill-red-500" onClick={()=> likePost(post._id)} /> : <FiHeart size={26} className="cursor-pointer hover:text-gray-500 transition" onClick={()=> likePost(post._id)} />}
                        <FiMessageCircle size={26} className="cursor-pointer hover:text-gray-500 transition" onClick={()=> handlePostClick(post._id)} />
                        <FiSend size={26} className="cursor-pointer hover:text-gray-500 transition" />
                      </div>
                      <FiBookmark size={26} className="cursor-pointer hover:text-gray-500 transition" />
                    </div>

                    {/* Post Details */}
                    <div>
                      <p className="text-[14px] font-semibold mb-1 cursor-pointer">{post?.likes?.length} likes</p>
                      <p className="text-[14px] leading-[18px]">
                        <span className="font-semibold cursor-pointer mr-1">{post?.user?.username}</span>
                        {post?.caption}
                      </p>
                      {post?.comments?.length > 0 && <p className="text-[14px] text-gray-500 cursor-pointer mt-1" onClick={()=> handlePostClick(post._id)}>View all {post?.comments?.length} comments</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <input 
                          type="text" 
                          placeholder="Add a comment..." 
                          className="text-[14px] w-full outline-none placeholder-gray-500" 
                          value={commentTexts[post?._id] || ""}
                          onChange={(e) => handleCommentChange(post?._id, e.target.value)}
                        />
                        <button 
                          className={`font-semibold text-[14px] ml-2 transition ${commentTexts[post?._id]?.trim() ? 'text-blue-500 hover:text-blue-700 cursor-pointer' : 'text-blue-300 pointer-events-none'}`}
                          onClick={() => handleAddComment(post?._id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

        </div>

        
        <div className="hidden xl:block w-[320px] pl-[64px] pt-10">
          {/* Active User (Profile Switch) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 cursor-pointer">
               <img src={userData?.profilePic || avatar} alt="profile" className="w-11 h-11 rounded-full object-cover object-top" />
               <div className="flex flex-col">
                 <span className="text-[14px] font-semibold text-gray-900 leading-4">{userData?.username || userForm?.username || 'insta_user'}</span>
                 <span className="text-[14px] text-gray-500">{userData?.fullname || userForm?.fullname || 'Instagram User'}</span>
               </div>
            </div>
             <button className="text-[12px] font-semibold text-[#0095f6]">Switch</button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold text-gray-500">Suggested for you</span>
            <span className="text-[12px] font-semibold cursor-pointer hover:text-gray-400">See All</span>
          </div>

          {/* Suggestions List */}
          <div className="flex flex-col gap-3">
            {suggestions.map(sug => (
              <div key={sug.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img src={sug.avatar} alt="suggestion" className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-900 leading-4">{sug.user}</span>
                    <span className="text-[12px] text-gray-500">Suggested for you</span>
                  </div>
                </div>
                <button className="text-[12px] font-semibold text-[#0095f6] hover:text-blue-900">Follow</button>
              </div>
            ))}
          </div>

          {/* Footer Links */}
          <div className="mt-8">
            <ul className="flex flex-wrap gap-x-1 gap-y-1 text-[#c7c7c7] text-[12px] leading-[14px]">
              <li className="hover:underline cursor-pointer">About •</li>
              <li className="hover:underline cursor-pointer">Help •</li>
              <li className="hover:underline cursor-pointer">Press •</li>
              <li className="hover:underline cursor-pointer">API •</li>
              <li className="hover:underline cursor-pointer">Jobs •</li>
              <li className="hover:underline cursor-pointer">Privacy •</li>
              <li className="hover:underline cursor-pointer">Terms •</li>
              <li className="hover:underline cursor-pointer">Locations •</li>
              <li className="hover:underline cursor-pointer">Language</li>
            </ul>
            <p className="text-[#c7c7c7] text-[12px] mt-4">
              © 2026 INSTAGRAM FROM META
            </p>
          </div>

        </div>
      </div>
  );
};
export default Home;
