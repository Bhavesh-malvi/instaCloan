import React, { useState, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { BiImageAdd } from 'react-icons/bi';
import API from "../api/axios"

const CreatePostModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
      setPreviews(newPreviews);
      setCurrentIndex(0);
    }
  };

  const handleSharePost = async () =>{
    if(files.length === 0){
      console.log("Please select at least one image /video.");

      return;
    }

    try {
      const formData = new FormData();

      formData.append('caption', caption);

      files.forEach((file)=>{
        formData.append('image', file);
      });


      const {data} = await API.post('/posts/create', formData, {
        headers:{
          'Content-Type': 'multipart/form-data',
        },
      });

      if(data.success){
        console.log("Post created successfully", data);
        clearSelection();
        onClose();
      }

    } catch (error) {
      console.log("Error creating post", error);

      console.log(error.data?.message || "Failed to create post");

    }
  }

  const clearSelection = () => {
    setFiles([]);
    setPreviews([]);
    setCurrentIndex(0);
    setCaption('');
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      {/* Close button outside modal on desktop (optional, keeping it inside for now, or just top-right) */}
      <div 
        className="absolute top-4 right-4 text-white cursor-pointer hover:text-gray-300 transition"
        onClick={handleClose}
      >
        <AiOutlineClose size={30} />
      </div>

      <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="w-8">
            {previews.length > 0 && (
              <AiOutlineClose 
                size={24} 
                className="cursor-pointer text-gray-500 hover:text-gray-900" 
                onClick={clearSelection} 
              />
            )}
          </div>
          <h2 className="text-base font-semibold text-gray-900">Create new post</h2>
          <div className="w-8 text-right">
            {previews.length > 0 && (
              <button 
                type="button"
                className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition"
                onClick={handleSharePost}
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col w-full h-full min-h-[400px]">
          
          {previews.length === 0 ? (
            // Upload State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 h-[400px]">
              <BiImageAdd size={80} className="text-gray-800 mb-4" />
              <p className="text-xl font-light text-gray-800 mb-6">Drag photos and videos here</p>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Select from computer
              </button>
              <input 
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
              />
            </div>
          ) : (
            // Preview & Details State
            <div className="flex flex-col flex-1 pb-4">
              {/* Image Preview */}
              <div className="w-full bg-black flex flex-col items-center justify-center overflow-hidden max-h-[350px]">
                <div className="w-full h-full flex items-center justify-center max-h-[290px]">
                  <img 
                    src={previews[currentIndex]} 
                    alt={`Preview ${currentIndex}`} 
                    className="w-full h-full object-contain"
                  />
                </div>
                {previews.length > 1 && (
                  <div className="flex gap-2 p-2 overflow-x-auto w-full bg-neutral-900 justify-center">
                    {previews.map((src, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-12 h-12 flex-shrink-0 cursor-pointer border-2 transition ${idx === currentIndex ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <img src={src} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption Input */}
              <div className="p-4 flex flex-col gap-2">
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder-gray-400 min-h-[80px] resize-none"
                  maxLength={2200}
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{caption.length} / 2,200</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
