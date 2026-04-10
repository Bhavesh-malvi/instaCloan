import React, { useContext, useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import { AppContext } from '../context/AppContext';
import { FiMessageCircle, FiSend, FiBookmark, FiHeart, FiSearch, FiMusic, FiVolume2, FiVolumeX, FiType, FiEye, FiEyeOff, FiPlus, FiXCircle } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import avatar from '../assets/img/avatar.png';
import PostDetailModal from '../components/PostDetailModal';
import PostOptionsModal from '../components/PostOptionsModal';
import SongSelector from '../components/SongSelector';
import { PostSkeleton } from '../components/Skeletons';
import { useRef } from 'react';

const Home = () => {
  const { userForm, userData, feedPosts, isFeedLoading, isPostModalOpen, handlePostClick, setIsPostModalOpen, postDataById, likePost, addComment, timeAgo, stories, uploadStory, isStoryLoading, deleteStory, viewStoryAPI, toggleLikeStoryAPI, suggestedUsers, followUser } = useContext(AppContext);
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
  
  // Story Overlay State
  const [storySong, setStorySong] = useState(null);
  const [isSongSelectorOpenInStory, setIsSongSelectorOpenInStory] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [tempText, setTempText] = useState('');
  const [storyTextPos, setStoryTextPos] = useState({ x: 50, y: 50 }); // percentages
  const [storySongPos, setStorySongPos] = useState({ x: 50, y: 70 });
  const [isStorySongVisible, setIsStorySongVisible] = useState(true);
  const [isStoryMuted, setIsStoryMuted] = useState(false);
  const [songStartTime, setSongStartTime] = useState(0);

  const parseStrDurationToSec = (durStr) => {
    if (!durStr) return 0;
    const parts = durStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  const [dragging, setDragging] = useState(null); // 'text' or 'song'
  const previewRef = useRef(null);

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
      const overlays = {
        song: { ...storySongPos, visible: isStorySongVisible },
        text: storyText ? { content: storyText, ...storyTextPos } : null
      };
      const finalSong = storySong ? { ...storySong, startTime: songStartTime } : null;
      await uploadStory(previewStoryFile, finalSong, overlays);
      resetStoryState();
      setIsUploadingStory(false);
    }
  };

  const resetStoryState = () => {
    setPreviewStoryFile(null);
    setPreviewStoryUrl('');
    setStorySong(null);
    setStoryText('');
    setTempText('');
    setIsAddingText(false);
    setIsSongSelectorOpenInStory(false);
    setStoryTextPos({ x: 50, y: 50 });
    setStorySongPos({ x: 50, y: 70 });
    setIsStorySongVisible(true);
    setSongStartTime(0);
    if(storySong) {
       storyAudio.pause();
       storyAudio.src = "";
    }
  };

  const cancelStoryUpload = () => {
    resetStoryState();
  };

  // Dragging Logic for Preview
  const handleDragStart = (e, type) => {
    setDragging(type);
  };

  const handleDragMove = (e) => {
    if (!dragging || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain to 0-100%
    const constrainedX = Math.max(10, Math.min(90, x));
    const constrainedY = Math.max(10, Math.min(90, y));

    if (dragging === 'text') {
      setStoryTextPos({ x: constrainedX, y: constrainedY });
    } else if (dragging === 'song') {
      setStorySongPos({ x: constrainedX, y: constrainedY });
    }
  };

  const handleDragEnd = () => {
    setDragging(null);
  };

  // Story Viewer Audio State
  const [storyAudio] = useState(new Audio());
  const [isMuted, setIsMuted] = useState(false);
  
  // Feed Post Audio State
  const [feedAudio] = useState(new Audio());
  const [playingPostId, setPlayingPostId] = useState(null);
  const [isFeedMuted, setIsFeedMuted] = useState(false);

  // Story Viewer Timeline State
  const [viewingUserId, setViewingUserId] = useState(null);
  
  const viewingUserGroup = useMemo(() => {
     if (!viewingUserId) return null;
     return groupedStories.find(g => g.user._id === viewingUserId) || null;
  }, [viewingUserId, groupedStories]);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [viewedUserIds, setViewedUserIds] = useState(() => {
    const saved = localStorage.getItem('viewedStoryUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [showStoryMenu, setShowStoryMenu] = useState(false);
  const [showStoryViewsModal, setShowStoryViewsModal] = useState(false);
  
  const handleStoryReply = async (receiverId, storyId, text) => {
    try {
        const formData = new FormData();
        formData.append('receiver', receiverId);
        formData.append('text', text);
        formData.append('story', storyId);
        
        const { data } = await API.post(`/messages/send/${receiverId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
            console.log("Story reply sent!");
        }
    } catch (error) {
        console.error("Failed to send story reply", error);
    }
  };

  // Upload Preview Audio preview
  useEffect(() => {
    if (previewStoryFile && storySong && !isStoryMuted) {
      if (!storyAudio.src.includes(storySong.file)) {
        storyAudio.src = storySong.file;
        storyAudio.currentTime = songStartTime;
      }
      storyAudio.play().catch(e => console.log("Audio preview blocked", e));
    } else {
      storyAudio.pause();
    }
  }, [storySong, isStoryMuted, previewStoryFile, storyAudio, songStartTime]);

  useEffect(() => {
    if (viewingUserGroup && viewingUserGroup.items[activeStoryIndex]?.song?.name) {
      const song = viewingUserGroup.items[activeStoryIndex].song;
      if (!storyAudio.src.includes(song.file)) {
        storyAudio.src = song.file;
        storyAudio.currentTime = song.startTime || 0;
      }
      storyAudio.muted = isMuted;
      storyAudio.play().catch(e => console.log("Autoplay blocked", e));
    } else {
      storyAudio.pause();
      storyAudio.src = "";
    }
  }, [viewingUserGroup, activeStoryIndex, isMuted, storyAudio]);

  useEffect(() => {
    storyAudio.muted = isMuted;
  }, [isMuted, storyAudio]);

  const togglePostMusic = (e, post) => {
    e.stopPropagation();
    if (playingPostId === post._id) {
      feedAudio.pause();
      setPlayingPostId(null);
    } else {
      if (post.song?.name) {
        if (!feedAudio.src.includes(post.song.file)) {
           feedAudio.src = post.song.file;
           feedAudio.currentTime = post.song.startTime || 0;
        }
        feedAudio.muted = isFeedMuted;
        feedAudio.play();
        setPlayingPostId(post._id);
      }
    }
  };

  useEffect(() => {
    feedAudio.muted = isFeedMuted;
  }, [isFeedMuted, feedAudio]);

  const handleViewStory = (group) => {
    setViewedUserIds(prev => {
      if (!prev.includes(group.user._id)) {
        const updated = [...prev, group.user._id];
        localStorage.setItem('viewedStoryUsers', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    setViewingUserId(group.user._id);
    setActiveStoryIndex(0);
  };

  useEffect(() => {
    if (viewingUserGroup && viewingUserGroup.user._id !== userData?._id) {
       const activeItem = viewingUserGroup.items[activeStoryIndex];
       if (activeItem) {
          const alreadyViewed = activeItem.viewers?.some(v => v.user === userData?._id || v.user._id === userData?._id);
          if (!alreadyViewed) {
             viewStoryAPI(activeItem._id);
          }
       }
    }
  }, [viewingUserGroup, activeStoryIndex, userData, viewStoryAPI]);

  useEffect(() => {
    let timer;
    if (viewingUserGroup && viewingUserGroup.items.length > 0 && !showStoryMenu) {
      const activeItem = viewingUserGroup.items[activeStoryIndex];
      const durationMs = (activeItem?.song?.name || activeItem?.type === 'video') ? 15000 : 5000;
      timer = setTimeout(() => {
        handleNextStory();
      }, durationMs);
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
        setViewingUserId(null);
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
        setViewingUserId(prevGroup.user._id);
        setActiveStoryIndex(prevGroup.items.length - 1);
      }
    }
  };

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
                <div 
                  className="flex-1 flex items-center justify-center bg-black overflow-hidden relative"
                  ref={previewRef}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {previewStoryFile.type.includes('video') ? (
                    <video src={previewStoryUrl} className="w-full h-full object-contain" autoPlay loop muted={isStoryMuted} />
                  ) : (
                    <img src={previewStoryUrl} className="w-full h-full object-contain" alt="Preview" />
                  )}

                  {/* Overlays */}
                  {storyText && (
                    <div 
                      className="absolute text-white font-bold text-2xl cursor-move whitespace-nowrap drop-shadow-md z-30"
                      style={{ left: `${storyTextPos.x}%`, top: `${storyTextPos.y}%`, transform: 'translate(-50%, -50%)' }}
                      onMouseDown={(e) => handleDragStart(e, 'text')}
                    >
                      {storyText}
                    </div>
                  )}

                  {storySong && isStorySongVisible && (
                    <div 
                      className="absolute bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 cursor-move z-30"
                      style={{ left: `${storySongPos.x}%`, top: `${storySongPos.y}%`, transform: 'translate(-50%, -50%)' }}
                      onMouseDown={(e) => handleDragStart(e, 'song')}
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 shadow-sm flex-shrink-0">
                        <img src={storySong.image} alt={storySong.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-[100px] max-w-[140px]">
                        <span className="text-gray-900 font-bold text-sm truncate leading-tight">{storySong.name}</span>
                        <span className="text-gray-500 font-medium text-xs truncate">Instagram Music</span>
                      </div>
                      <FiVolume2 className="text-gray-400 text-lg ml-1" />
                    </div>
                  )}

                  {/* Top Controls Toolbar outside or inside image preview */}
                  <div className="absolute top-4 right-4 flex flex-col gap-5 z-40 bg-black/50 p-3 rounded-full border border-white/10 shadow-xl items-center">
                    {/* Text block */}
                    <div className="flex flex-col gap-1 items-center">
                      <button onClick={() => setIsAddingText(true)} className="text-white hover:text-gray-300 transition-colors" title="Add/Edit Text">
                        <FiType size={22} />
                      </button>
                      {storyText && <FiXCircle size={14} className="text-red-400 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setStoryText('')} title="Remove Text" />}
                    </div>

                    {/* Music block */}
                    <div className="flex flex-col gap-1 items-center">
                      <button onClick={() => setIsSongSelectorOpenInStory(true)} className="text-white hover:text-gray-300 transition-colors" title="Add Music">
                        <FiMusic size={22} />
                      </button>
                      {storySong && <FiXCircle size={14} className="text-red-400 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setStorySong(null)} title="Remove Music" />}
                    </div>

                    {storySong && (
                      <button onClick={() => setIsStoryMuted(!isStoryMuted)} className="text-white hover:text-gray-300 transition-colors" title={isStoryMuted ? "Unmute" : "Mute"}>
                        {isStoryMuted ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
                      </button>
                    )}
                    {storySong && (
                      <button onClick={() => setIsStorySongVisible(!isStorySongVisible)} className="text-white hover:text-gray-300 transition-colors" title={isStorySongVisible ? "Show Sticker" : "Hide Sticker"}>
                        {isStorySongVisible ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                      </button>
                    )}
                  </div>

                </div>
                <div className="p-4 flex flex-col gap-3 justify-end bg-black">
                  {storySong && (
                    <div className="w-full bg-[#262626] p-2 rounded-lg flex items-center gap-3">
                      <FiMusic className="text-gray-400" />
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.max(0, parseStrDurationToSec(storySong.duration) - 15)} 
                        value={songStartTime}
                        onChange={(e) => {
                           const val = Number(e.target.value);
                           setSongStartTime(val);
                           storyAudio.currentTime = val;
                        }}
                        className="flex-1 accent-blue-500 h-1"
                      />
                      <span className="text-white text-xs">{Math.floor(songStartTime / 60)}:{(songStartTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                  <div className="flex justify-end w-full">
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

              {/* Modals for Text Input & Song Selector */}
              {isAddingText && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-black/80">
                   <div className="flex justify-between items-center p-4">
                     <button onClick={() => setIsAddingText(false)} className="text-white font-semibold">Cancel</button>
                     <button onClick={() => { setStoryText(tempText); setIsAddingText(false); }} className="text-white font-semibold flex items-center justify-center bg-white text-black px-4 py-1.5 rounded-full">Done</button>
                   </div>
                   <div className="flex-1 flex items-center justify-center p-4">
                      <input 
                        type="text" 
                        autoFocus
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        placeholder="Type something..."
                        className="bg-transparent text-white text-3xl font-bold text-center border-none outline-none w-full"
                      />
                   </div>
                </div>
              )}
              {isSongSelectorOpenInStory && (
                <SongSelector 
                  onSelect={(song) => {
                    setStorySong(song);
                    setIsSongSelectorOpenInStory(false);
                  }}
                  onClose={() => setIsSongSelectorOpenInStory(false)}
                />
              )}

            </div>
          )}

          {/* Instagram Story Viewer Timeline Modal */}
          {viewingUserGroup && viewingUserGroup.items[activeStoryIndex] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
              <div key={viewingUserGroup.user._id} className="relative w-full max-w-[400px] h-[90vh] md:h-[80vh] bg-black rounded-lg overflow-hidden flex flex-col pointer-events-auto animate-cube-slide">
                
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 w-full p-2 flex gap-1 z-20">
                  {viewingUserGroup.items.map((item, idx) => {
                    const isExtended = item.song?.name || item.type === 'video';
                    const durStr = isExtended ? '15s' : '5s';
                    return (
                      <div key={idx} className="h-[2px] bg-gray-500/50 flex-1 rounded-full overflow-hidden">
                        <div 
                          key={idx === activeStoryIndex ? `active-${idx}` : `inactive-${idx}`}
                          className={`h-full bg-white ${idx === activeStoryIndex ? 'animate-story-progress' : idx < activeStoryIndex ? 'w-full' : 'w-0'}`}
                          style={{ 
                            animationPlayState: showStoryMenu ? 'paused' : 'running',
                            animationDuration: durStr
                          }}
                        ></div>
                      </div>
                    );
                  })}
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
                                  setViewingUserId(null);
                                  setActiveStoryIndex(0);
                                }}
                              >
                                Delete
                              </button>
                           </div>
                         )}
                       </div>
                    )}
                    <button className="text-white text-xl drop-shadow-md pb-[2px]" onClick={(e) => { e.stopPropagation(); setShowStoryMenu(false); setViewingUserId(null); setActiveStoryIndex(0); }}>✕</button>
                  </div>
                </div>

                {/* Tap Zones for Navigation */}
                <div className="absolute inset-0 z-10 flex">
                  <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory}></div>
                  <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory}></div>
                </div>

                {/* Media Content */}
                <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
                  {viewingUserGroup.items[activeStoryIndex].type === 'video' ? (
                     <video src={viewingUserGroup.items[activeStoryIndex].media} className="w-full h-full object-cover" autoPlay />
                  ) : (
                     <img src={viewingUserGroup.items[activeStoryIndex].media} className="w-full h-full object-cover" alt="Story" />
                  )}

                  {/* Overlays Rendering */}
                  {viewingUserGroup.items[activeStoryIndex].overlays?.text && (
                    <div 
                      className="absolute text-white font-bold text-2xl whitespace-nowrap drop-shadow-md z-30"
                      style={{ 
                        left: `${viewingUserGroup.items[activeStoryIndex].overlays.text.x}%`, 
                        top: `${viewingUserGroup.items[activeStoryIndex].overlays.text.y}%`, 
                        transform: 'translate(-50%, -50%)',
                        color: viewingUserGroup.items[activeStoryIndex].overlays.text.color || '#fff'
                      }}
                    >
                      {viewingUserGroup.items[activeStoryIndex].overlays.text.content}
                    </div>
                  )}

                  {viewingUserGroup.items[activeStoryIndex].overlays?.song?.visible && viewingUserGroup.items[activeStoryIndex].song?.name && (
                    <div 
                      className="absolute bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-30 pointer-events-auto cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      style={{ 
                        left: `${viewingUserGroup.items[activeStoryIndex].overlays.song.x}%`, 
                        top: `${viewingUserGroup.items[activeStoryIndex].overlays.song.y}%`, 
                        transform: 'translate(-50%, -50%)' 
                      }}
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 shadow-sm flex-shrink-0">
                        <img src={viewingUserGroup.items[activeStoryIndex].song.image} alt={viewingUserGroup.items[activeStoryIndex].song.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-[100px] max-w-[140px]">
                        <span className="text-gray-900 font-bold text-sm truncate leading-tight">{viewingUserGroup.items[activeStoryIndex].song.name}</span>
                        <span className="text-gray-500 font-medium text-xs truncate">Instagram Music</span>
                      </div>
                      {isMuted ? <FiVolumeX className="text-gray-400 text-lg ml-1" /> : <FiVolume2 className="text-blue-500 text-lg ml-1" />}
                    </div>
                  )}
                  
                  {/* Bottom Controls: Like, Reply, Views */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex items-center gap-3 z-40 pointer-events-auto bg-gradient-to-t from-black/60 to-transparent">
                    {viewingUserGroup.user._id !== userData?._id ? (
                        <>
                           <input 
                              type="text" 
                              placeholder={`Reply to ${viewingUserGroup.user.username}...`}
                              className="flex-1 bg-transparent border border-white/60 rounded-full px-4 py-2.5 text-white placeholder-white outline-none focus:border-white transition-colors"
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                      handleStoryReply(viewingUserGroup.user._id, viewingUserGroup.items[activeStoryIndex]._id, e.target.value);
                                      e.target.value = '';
                                  }
                              }}
                           />
                           <button 
                                className="text-white hover:scale-110 transition-transform p-2 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLikeStoryAPI(viewingUserGroup.items[activeStoryIndex]?._id);
                                }}
                           >
                               {viewingUserGroup.items[activeStoryIndex]?.likes?.includes(userData?._id) ? (
                                   <FaHeart size={28} className="fill-red-500 animate-like-burst" />
                               ) : (
                                   <FiHeart size={28} />
                               )}
                           </button>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-center">
                           <button 
                               className="flex flex-col items-center justify-center text-white gap-1 hover:bg-white/10 px-4 py-1 rounded-lg transition-colors cursor-pointer"
                               onClick={(e) => { e.stopPropagation(); setShowStoryViewsModal(true); }}
                           >
                               <FiEye size={22} className="drop-shadow-md" />
                               <span className="text-xs font-semibold drop-shadow-md pb-[1px]">{viewingUserGroup.items[activeStoryIndex]?.viewers?.length || 0}</span>
                           </button>
                        </div>
                    )}
                  </div>
                  
                </div>
              </div>
              
              {/* Story Views Modal */}
              {showStoryViewsModal && viewingUserGroup.user._id === userData?._id && (
                  <div className="absolute inset-x-0 bottom-0 top-auto md:top-0 md:relative w-full max-w-[400px] bg-[#262626] md:rounded-lg h-[50vh] md:h-[80vh] flex flex-col z-[60] overflow-hidden animate-cube-slide transition-transform duration-300 pointer-events-auto">
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#262626] z-10">
                          <h3 className="text-white font-bold text-center flex-1">Viewers & Likes</h3>
                          <button onClick={(e) => { e.stopPropagation(); setShowStoryViewsModal(false); }} className="text-white font-bold">✕</button>
                      </div>
                      <div className="flex-1 overflow-y-auto w-full">
                           <div className="p-4 text-white text-sm">
                               <div className="mb-6">
                                   <h4 className="flex items-center gap-2 mb-3 text-gray-400 font-semibold"><FiEye /> {viewingUserGroup.items[activeStoryIndex]?.viewers?.length || 0} Views</h4>
                                   {viewingUserGroup.items[activeStoryIndex]?.viewers?.length === 0 ? (
                                       <span className="text-gray-500">No views yet.</span>
                                   ) : (
                                       <div className="flex flex-col gap-3">
                                           {viewingUserGroup.items[activeStoryIndex]?.viewers?.map((v, i) => (
                                               <div key={i} className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                                {v.user?.profilePic ? (
                                                                    <img src={v.user.profilePic} className="w-full h-full object-cover object-top" alt={v.user.username || 'User'} />
                                                                ) : (
                                                                    <img src={avatar} className="w-full h-full object-cover" alt="Default Avatar" />
                                                                )}
                                                            </div>
                                                            {viewingUserGroup.items[activeStoryIndex]?.likes?.includes(v.user?._id || v.user) && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#262626] rounded-full p-[2px] z-10 border border-[#262626]">
                                                                    <FaHeart size={12} className="fill-red-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-[14px]">{v.user?.username || "Instagram User"}</span>
                                                    </div>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           </div>
                      </div>
                  </div>
              )}
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

                        {post?.song?.name && (
                          <div 
                            className="ml-2 flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 cursor-pointer max-w-[150px]"
                            onClick={(e) => togglePostMusic(e, post)}
                          >
                            <FiMusic size={12} className={playingPostId === post._id ? "text-blue-500 animate-pulse" : "text-gray-500"} />
                            <span className="text-[11px] text-gray-700 font-medium truncate max-w-[80px]">{post.song.name}</span>
                            {playingPostId === post._id ? (
                               isFeedMuted ? <FiVolumeX size={12} className="text-gray-500 ml-1 hover:text-gray-800" onClick={(e) => { e.stopPropagation(); setIsFeedMuted(false); }} /> : <FiVolume2 size={12} className="text-gray-500 ml-1 hover:text-gray-800" onClick={(e) => { e.stopPropagation(); setIsFeedMuted(true); }} />
                            ) : null}
                          </div>
                        )}
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
            {suggestedUsers?.map(sug => (
              <div key={sug._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img src={sug.profilePic || avatar} alt="suggestion" className="w-11 h-11 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-900 leading-4">{sug.username}</span>
                    <span className="text-[12px] text-gray-500">{sug.fullname || "Suggested for you"}</span>
                  </div>
                </div>
                <button onClick={() => followUser(sug._id)} className="text-[12px] font-semibold text-[#0095f6] hover:text-blue-900">Follow</button>
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
