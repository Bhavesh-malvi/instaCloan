import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineHeart, AiFillHeart, AiOutlineDelete } from 'react-icons/ai';
import { BsChat, BsBookmark, BsThreeDots } from 'react-icons/bs';
import { FiHeart, FiSend } from 'react-icons/fi';
import avatar from '../assets/img/avatar.png';
import { FaHeart } from "react-icons/fa";
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import PostOptionsModal from './PostOptionsModal';

const PostDetailModal = ({ isOpen, onClose, postData }) => {
  const [commentText, setCommentText] = useState("");
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const { likePost, addComment, comments, userData, deleteComment, timeAgo } = useContext(AppContext);
  const [animatingPost, setAnimatingPost] = useState(false);

  const handleDoubleClick = () => {
    setAnimatingPost(true);
    const isLiked = postData?.likes?.includes(userData?._id);
    if (!isLiked && postData?._id) {
       likePost(postData._id);
    }
    setTimeout(() => {
       setAnimatingPost(false);
    }, 1000);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(postData._id, commentText);
    setCommentText("");
  };


  if (!isOpen) return null;

  if (!postData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
        <AiOutlineClose
          size={30}
          className="absolute top-4 right-4 text-white cursor-pointer hover:text-gray-300"
          onClick={onClose}
        />
      </div>
    );
  }


  const images = postData.images || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 md:p-8">
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
      <div
        className="absolute top-4 right-4 text-white cursor-pointer hover:text-gray-300 transition z-[110]"
        onClick={onClose}
      >
        <AiOutlineClose size={30} />
      </div>

      <div className="bg-white rounded-xl w-full max-w-[1000px] h-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">

        {/* Left Side: Image Component */}
        <div 
          className="w-full md:w-[60%] bg-black flex items-center justify-center border-r border-gray-200 aspect-square md:aspect-auto relative cursor-pointer select-none"
          onDoubleClick={handleDoubleClick}
        >
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt="Post Content"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-white text-sm">No Image Available</div>
          )}
          
          {animatingPost && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <FaHeart className="fill-[#ff3040] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-like-burst" size={110} />
              </div>
          )}
        </div>

        {/* Right Side: Details & Comments */}
        <div className="w-full md:w-[40%] flex flex-col bg-white h-auto md:h-full max-h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={postData?.user?.profilePic || avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover object-top"
              />
              <span className="font-semibold text-[14px] text-gray-900">{postData?.user?.username}</span>
            </div>
            <BsThreeDots size={20} className="cursor-pointer text-gray-900" onClick={() => setOptionsModalOpen(true)} />
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            {/* Caption */}
            <div className="flex gap-3">
              <img
                src={postData?.user?.profilePic || avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-top object-cover shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-[14px] text-gray-900">
                  <span className="font-semibold mr-2">{postData?.user?.username}</span>
                  {postData?.createdAt && (
                    <span className="text-[12px] text-gray-500 mt-2">
                      {timeAgo(postData.createdAt)}
                    </span>
                  )}

                </span>
                <p className='text-[14px]'>{postData?.caption}</p>

              </div>
            </div>

            {/* Render actual comments if populated from backend */}
            {comments?.length > 0 && comments.map((comment, index) => (
              <div key={comment?._id || index} className="flex gap-3 mt-2 group">
                <img
                  src={comment?.user?.profilePic || avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-100 object-top"
                />
                <div className="flex items-start justify-between w-full pr-4">
                  <div className="text-[14px]">
                    <span className="font-semibold mr-2">{comment?.user?.username || 'user'}</span>
                    {comment?.createdAt && (
                      <span className="text-[12px] text-gray-500 mt-2">
                        {timeAgo(comment.createdAt)}
                      </span>
                    )}
                    <p>{comment.text}</p>
                  </div>
                  {comment?.user?._id === userData?._id && (
                     <AiOutlineDelete 
                        className="opacity-0 group-hover:opacity-100 text-red-500 cursor-pointer mt-1 transition-opacity shrink-0"
                        size={16}
                        onClick={() => deleteComment(comment._id)}
                     />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions Footer */}
          <div className="p-4 border-t border-gray-200 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-900">
                {postData?.likes?.includes(userData?._id) ? <FaHeart size={26} className="cursor-pointer hover:text-gray-500 transition fill-red-500" onClick={() => likePost(postData._id)} /> : <FiHeart size={26} className="cursor-pointer hover:text-gray-500 transition" onClick={() => likePost(postData._id)} />}
                <BsChat size={24} className="cursor-pointer hover:text-gray-600" />
                <FiSend size={24} className="cursor-pointer hover:text-gray-600" />
              </div>
              <BsBookmark size={24} className="cursor-pointer hover:text-gray-600 text-gray-900" />
            </div>
            <div className="font-semibold text-[14px] text-gray-900">
              {postData?.likes?.length || 0} likes
            </div>
            {postData?.createdAt && (
              <div className="text-[10px] text-gray-500 uppercase tracking-wide cursor-pointer hover:underline">
                {new Date(postData.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-200 flex items-center shrink-0 h-[60px]">
            <BsChat size={24} className="text-gray-800 mr-4 shrink-0" />
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] placeholder-gray-500 text-gray-900"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className={`font-semibold text-[14px] ml-2 transition ${commentText.trim() ? 'text-blue-500 hover:text-blue-700 cursor-pointer' : 'text-blue-300 pointer-events-none'}`}
              disabled={!commentText.trim()}
              onClick={handleAddComment}
            >
              Post
            </button>
          </div>

        </div>
      </div>

      <PostOptionsModal
        isOpen={optionsModalOpen}
        onClose={() => {
          setOptionsModalOpen(false);
          // Auto-close detail modal if the post was just deleted and we no longer have it 
          // (will happen naturally if feed refreshes or by user closing)
        }}
        post={postData}
      />
    </div>
  );
};

export default PostDetailModal;
