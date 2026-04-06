import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const PostOptionsModal = ({ isOpen, onClose, post }) => {
  const { deletePost, userData } = useContext(AppContext);

  if (!isOpen || !post) return null;

  const isOwnPost = post?.user?._id === userData?._id;

  const handleDelete = async () => {
    await deletePost(post._id);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    onClose();
  }

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-[400px] flex flex-col overflow-hidden text-[14px]"
        onClick={(e) => e.stopPropagation()}
      >
        {isOwnPost && (
          <button 
            className="w-full py-3.5 text-red-500 font-bold border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
        <button 
          className="w-full py-3.5 text-gray-900 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100"
          onClick={handleCopyLink}
        >
          Copy link
        </button>
        <button 
          className="w-full py-3.5 text-gray-900 hover:bg-gray-50 active:bg-gray-100"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PostOptionsModal;
