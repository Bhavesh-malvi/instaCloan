import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMessageCircle, FiSend, FiBookmark, FiHeart, FiSearch } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import avatar from '../assets/img/avatar.png';
import PostDetailModal from '../components/PostDetailModal';
import PostOptionsModal from '../components/PostOptionsModal';
import { PostSkeleton } from '../components/Skeletons';

const Home = () => {
  const { userForm, userData, feedPosts, isFeedLoading, isPostModalOpen, handlePostClick, setIsPostModalOpen, postDataById, likePost, addComment, timeAgo, stories, uploadStory, isStoryLoading, deleteStory } = useContext(AppContext);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [selectedPostOptions, setSelectedPostOptions] = useState(null);

  const handleOptionsClick = (post) => {
    setSelectedPostOptions(post);
    setOptionsModalOpen(true);
  };

  const [commentTexts, setCommentTexts] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState({});

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

  // Group stories by user
  const groupedStories = useMemo(() => {
    if (!stories) return [];
    const grMap = {};
    stories.forEach(story => {
      const uid = story?.user?._id;
      if (!uid) return;
      if (!grMap[uid]) {
        grMap[uid] = {
          user: story.user,
          items: []
        };
      }
      grMap[uid].items.push(story);
    });
    // Reverse so oldest is first in the array for timeline playback
    Object.values(grMap).forEach(gr => gr.items.reverse());
    return Object.values(grMap);
  }, [stories]);

  // Story Upload Preview State
  const [previewStoryFile, setPreviewStoryFile] = useState(null);
  const [previewStoryUrl, setPreviewStoryUrl] = useState('');
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  const handleStoryImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewStoryFile(file);
      setPreviewStoryUrl(URL.createObjectURL(file));
      e.target.value = null; // reset input
    }
  };

  const handleUploadStory = async () => {
    if (previewStoryFile) {
      setIsUploadingStory(true);
      await uploadStory(previewStoryFile);
      setPreviewStoryFile(null);
      setPreviewStoryUrl('');
      setIsUploadingStory(false);
    }
  };

  const cancelStoryUpload = () => {
    setPreviewStoryFile(null);
    setPreviewStoryUrl('');
  };

  // Story Viewer Timeline State
  const [viewingUserGroup, setViewingUserGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [viewedUserIds, setViewedUserIds] = useState(() => {
    const saved = localStorage.getItem('viewedStoryUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showStoryMenu, setShowStoryMenu] = useState(false);

  const handleViewStory = (group) => {
    setViewedUserIds(prev => {
      if (!prev.includes(group.user._id)) {
        const updated = [...prev, group.user._id];
        localStorage.setItem('viewedStoryUsers', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    setViewingUserGroup(group);
    setActiveStoryIndex(0);
  };

  useEffect(() => {
    let timer;
    if (viewingUserGroup && viewingUserGroup.items.length > 0 && !showStoryMenu) {
      timer = setTimeout(() => {
        handleNextStory();
      }, 5000); // 5 seconds per story
    }
    return () => clearTimeout(timer);
  }, [viewingUserGroup, activeStoryIndex, showStoryMenu]);

  const handleNextStory = () => {
    if (!viewingUserGroup) return;
    setShowStoryMenu(false);
    if (activeStoryIndex < viewingUserGroup.items.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else {
      const allGroups = [];
      const currGrp = groupedStories.find(g => g.user._id === userData?._id);
      if (currGrp) allGroups.push(currGrp);
      allGroups.push(...groupedStories.filter(g => g.user._id !== userData?._id));

      const currentIndex = allGroups.findIndex(g => g.user._id === viewingUserGroup.user._id);
      
      if (currentIndex !== -1 && currentIndex < allGroups.length - 1) {
        handleViewStory(allGroups[currentIndex + 1]);
      } else {
        setViewingUserGroup(null);
        setActiveStoryIndex(0);
      }
    }
  };

  const handlePrevStory = () => {
    setShowStoryMenu(false);
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else {
      const allGroups = [];
      const currGrp = groupedStories.find(g => g.user._id === userData?._id);
      if (currGrp) allGroups.push(currGrp);
      allGroups.push(...groupedStories.filter(g => g.user._id !== userData?._id));

      const currentIndex = allGroups.findIndex(g => g.user._id === viewingUserGroup.user._id);
      if (currentIndex > 0) {
        const prevGroup = allGroups[currentIndex - 1];
        setViewedUserIds(prev => prev.includes(prevGroup.user._id) ? prev : [...prev, prevGroup.user._id]);
        localStorage.setItem('viewedStoryUsers', JSON.stringify([...viewedUserIds, prevGroup.user._id]));
        setViewingUserGroup(prevGroup);
        setActiveStoryIndex(prevGroup.items.length - 1);
      }
    }
  };

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
            @keyframes cube-slide {
              0% { transform: translateX(50px) scale(0.95); opacity: 0; }
              100% { transform: translateX(0) scale(1); opacity: 1; }
            }
            .animate-cube-slide {
              animation: cube-slide 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            @keyframes story-progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-story-progress {
              animation: story-progress 5s linear forwards;
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
            
            {/* Current User Story Bubble */}
            <div className="flex flex-col items-center min-w-[66px] max-w-[66px] relative">
              <div 
                className={`w-[66px] h-[66px] rounded-full p-[2px] cursor-pointer ${
                  groupedStories.find(g => g.user._id === userData?._id)
                    ? (viewedUserIds.includes(userData?._id) ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500')
                    : 'border-2 border-gray-200'
                }`}
                onClick={() => {
                  const currentUserGroup = groupedStories.find(g => g.user._id === userData?._id);
                  if (currentUserGroup) {
                    handleViewStory(currentUserGroup);
                  }
                }}
              >
                <div className="bg-white rounded-full p-[2px] h-full w-full relative">
                  <img src={userData?.profilePic || avatar} alt="Your Story" className="rounded-full w-full h-full object-cover object-top" />
                  {/* Plus Icon Overlay */}
                  <label className="absolute bottom-0 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white cursor-pointer text-white text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                    +
                    <input type="file" className="hidden" accept="image/*,video/*" onClick={(e) => e.stopPropagation()} onChange={handleStoryImageSelect} />
                  </label>
                </div>
              </div>
              <span className="text-[12px] mt-1 text-gray-800 truncate w-full text-center">Your story</span>
            </div>

            {/* Display Other Users Stories */}
            {!isStoryLoading && groupedStories?.filter(g => g.user._id !== userData?._id).map(group => (
              <div key={group.user._id} className="flex flex-col items-center cursor-pointer min-w-[66px] max-w-[66px]" onClick={() => handleViewStory(group)}>
                <div className={`w-[66px] h-[66px] rounded-full p-[2px] ${viewedUserIds.includes(group.user._id) ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'}`}>
                  <div className="bg-white rounded-full p-[2px] h-full w-full">
                    <img src={group.user?.profilePic || avatar} alt={group.user?.username} className="rounded-full w-full h-full object-cover object-top" />
                  </div>
                </div>
                <span className="text-[12px] mt-1 text-gray-800 truncate w-full text-center">{group.user?.username}</span>
              </div>
            ))}
          </div>

          {/* Upload Preview Modal */}
          {previewStoryFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              <div className="relative w-full max-w-md h-[80vh] bg-[#262626] rounded-xl overflow-hidden flex flex-col justify-between">
                <div className="p-4 flex items-center justify-between border-b border-gray-700">
                  <button onClick={cancelStoryUpload} className="text-white">✕ Cancel</button>
                  <h3 className="text-white font-semibold">Preview Story</h3>
                  <div className="w-16"></div> {/* Spacer for centering */}
                </div>
                <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
                  {previewStoryFile.type.includes('video') ? (
                    <video src={previewStoryUrl} className="w-full h-full object-contain" autoPlay loop muted />
                  ) : (
                    <img src={previewStoryUrl} className="w-full h-full object-contain" alt="Preview" />
                  )}
                </div>
                <div className="p-4 flex justify-end">
                  <button 
                    onClick={handleUploadStory} 
                    disabled={isUploadingStory}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isUploadingStory ? 'Sharing...' : 'Share to Story >'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Story Viewer Timeline Modal */}
          {viewingUserGroup && viewingUserGroup.items[activeStoryIndex] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
              <div key={viewingUserGroup.user._id} className="relative w-full max-w-[400px] h-[90vh] md:h-[80vh] bg-black rounded-lg overflow-hidden flex flex-col pointer-events-auto animate-cube-slide">
                
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 w-full p-2 flex gap-1 z-20">
                  {viewingUserGroup.items.map((_, idx) => (
                    <div key={idx} className="h-[2px] bg-gray-500/50 flex-1 rounded-full overflow-hidden">
                      <div 
                        key={idx === activeStoryIndex ? `active-${idx}` : `inactive-${idx}`}
                        className={`h-full bg-white ${idx === activeStoryIndex ? 'animate-story-progress' : idx < activeStoryIndex ? 'w-full' : 'w-0'}`}
                        style={{ animationPlayState: showStoryMenu ? 'paused' : 'running' }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-2 left-0 w-full p-3 pt-4 flex items-center gap-3 z-20 pointer-events-none">
                  <img src={viewingUserGroup.user?.profilePic || avatar} className="w-8 h-8 rounded-full border border-white/50 object-cover object-top" />
                  <span className="text-white font-semibold text-sm drop-shadow-md">{viewingUserGroup.user?.username}</span>
                  <span className="text-white/70 text-xs ml-2 drop-shadow-md">{timeAgo(viewingUserGroup.items[activeStoryIndex].createdAt)}</span>
                  <div className="ml-auto flex items-center gap-4 pointer-events-auto relative">
                    {viewingUserGroup.user._id === userData?._id && (
                       <div className="relative">
                         <BsThreeDots 
                           className="text-white cursor-pointer drop-shadow-md" 
                           size={20} 
                           onClick={(e) => { e.stopPropagation(); setShowStoryMenu(!showStoryMenu); }} 
                         />
                         
                         {showStoryMenu && (
                           <div className="absolute top-8 right-0 bg-[#262626] rounded-xl shadow-lg w-[120px] overflow-hidden z-50 animate-cube-slide" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="w-full text-left px-4 py-3 text-red-500 font-semibold text-[14px] hover:bg-black/50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStory(viewingUserGroup.items[activeStoryIndex]._id);
                                  setShowStoryMenu(false);
                                  setViewingUserGroup(null);
                                  setActiveStoryIndex(0);
                                }}
                              >
                                Delete
                              </button>
                           </div>
                         )}
                       </div>
                    )}
                    <button className="text-white text-xl drop-shadow-md pb-[2px]" onClick={(e) => { e.stopPropagation(); setShowStoryMenu(false); setViewingUserGroup(null); setActiveStoryIndex(0); }}>✕</button>
                  </div>
                </div>

                {/* Tap Zones for Navigation */}
                <div className="absolute inset-0 z-10 flex">
                  <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory}></div>
                  <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory}></div>
                </div>

                {/* Media Content */}
                <div className="w-full h-full flex items-center justify-center">
                  {viewingUserGroup.items[activeStoryIndex].type === 'video' ? (
                     <video src={viewingUserGroup.items[activeStoryIndex].media} className="w-full h-full object-cover" autoPlay />
                  ) : (
                     <img src={viewingUserGroup.items[activeStoryIndex].media} className="w-full h-full object-cover" alt="Story" />
                  )}
                </div>
              </div>
            </div>
          )}

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
                        className="w-full bg-black rounded-sm overflow-hidden flex border border-gray-100 relative cursor-pointer select-none group"
                        onDoubleClick={() => handleDoubleClick(post._id, post?.likes?.includes(userData?._id))}
                    >
                      <div 
                        className="flex w-full transition-transform duration-300 ease-in-out items-center" 
                        style={{ transform: `translateX(-${(activeImageIndex[post._id] || 0) * 100}%)` }}
                      >
                        {post?.images.map((imgSrc, idx) => (
                          <img key={idx} src={imgSrc} alt="post" className="w-full object-contain max-h-[585px] flex-shrink-0" />
                        ))}
                      </div>
                      
                      {/* Carousel Controls */}
                      {post?.images?.length > 1 && (
                        <>
                          {(activeImageIndex[post._id] || 0) > 0 && (
                            <button 
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-black p-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(prev => ({ ...prev, [post._id]: (prev[post._id] || 0) - 1 }));
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                          )}
                          
                          {(activeImageIndex[post._id] || 0) < post.images.length - 1 && (
                            <button 
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-black p-1.5 rounded-full z-20 opacity-0 group-hover:opacity-100 transition shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(prev => ({ ...prev, [post._id]: (prev[post._id] || 0) + 1 }));
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                          )}

                          {/* Pagination Dots */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                            {post.images.map((_, idx) => (
                              <div key={idx} className={`rounded-full transition-all duration-300 ${(activeImageIndex[post._id] || 0) === idx ? 'bg-blue-400 w-1.5 h-1.5' : 'bg-white/70 w-1.5 h-1.5'}`}></div>
                            ))}
                          </div>
                        </>
                      )}

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
