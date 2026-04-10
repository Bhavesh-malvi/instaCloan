import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { SocketContext } from '../context/SocketContext';
import API from '../api/axios';
import avatar from '../assets/img/avatar.png';
import { FiImage, FiSend } from 'react-icons/fi';
import { BsInfoCircle } from 'react-icons/bs';

const Messages = () => {
  const { userData, navigate } = useContext(AppContext);
  const { socket, fetchUnreadCount } = useContext(SocketContext);
  const [connections, setConnections] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [preview, setPreview] = useState(null);
  const messagesEndRef = useRef(null);
  
  

  // Fetch Sidebar Connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data } = await API.get('/user/connections');
        if (data.success) {
          setConnections(data.connections);
        }
      } catch (error) {
        console.error("Failed to fetch connections", error);
      }
    };
    fetchConnections();
  }, []);

  // Fetch Messages when Active Chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatUser) return;
      try {
        const { data } = await API.get(`/messages/${activeChatUser._id}`);
        if (data.success) {
          setMessages(data.messages);
          scrollToBottom();
          
          // Mark as seen when switching to this user
          await API.put(`/messages/seen/${activeChatUser._id}`);
          fetchUnreadCount();
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    if (activeChatUser) {
      fetchMessages();
    }
  }, [activeChatUser, fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (message) => {
        if (activeChatUser && (message.sender === activeChatUser._id || message.sender._id === activeChatUser._id)) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();

            // Auto mark as seen if currently in chat
            API.put(`/messages/seen/${activeChatUser._id}`).then(() => {
                fetchUnreadCount();
            }).catch(e => console.error(e));
        }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
        socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, activeChatUser, fetchUnreadCount]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if(file){
      setMediaFile(file);
      setPreview(URL.createObjectURL(file));
      e.target.value = null;
    }
  }

  const removeMedia = () => {
    setMediaFile(null);
    setPreview(null);
  }

  

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !mediaFile) || !activeChatUser) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('receiver', activeChatUser._id);
      if (messageText.trim()) formData.append('text', messageText);
      if (mediaFile) formData.append('media', mediaFile); // Fixed key from 'image' to 'media' per backend expectations

      const { data } = await API.post(`/messages/send/${activeChatUser._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setMessageText('');
        setMediaFile(null);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col sm:flex-row">
      {/* Sidebar / Contacts List */}
      <div className="w-full sm:w-[350px] bg-white border-r border-gray-200 flex flex-col h-[30vh] sm:h-full flex-shrink-0">
        
        <div className="h-20 flex items-center px-4 font-bold text-xl border-b border-gray-200 bg-white sticky top-0 z-10 w-full sm:pt-[24px]">
          {userData?.username || 'Messages'}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {connections.length === 0 ? (
            <div className="p-4 text-center text-gray-500 font-semibold text-sm mt-10">
              No connections found. Follow someone to start messaging!
            </div>
          ) : (
            connections.map((user) => (
              <div 
                key={user._id} 
                onClick={() => setActiveChatUser(user)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${activeChatUser?._id === user._id ? 'bg-gray-100' : ''}`}
              >
                <img src={user.profilePic || avatar} alt={user.username} className="w-14 h-14 rounded-full object-cover border border-gray-200 object-top" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{user.username}</span>
                  <span className="text-gray-500 text-sm truncate">{user.fullname}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white h-[70vh] sm:h-full">
        {!activeChatUser ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mb-4">
               <FiSend size={45} className="ml-1" />
            </div>
            <h2 className="text-2xl font-light text-gray-800">Your Messages</h2>
            <p className="text-gray-500 mt-2">Send private photos and messages to a friend or group.</p>
          </div>
        ) : (
          <>
            {/* Chat Window Header */}
            <div className="h-20 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 sm:pt-[24px]">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={activeChatUser.profilePic || avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 object-top" />
                <span className="font-semibold text-gray-900 text-[16px]">{activeChatUser.username}</span>
              </div>
              <BsInfoCircle size={24} className="cursor-pointer hover:text-gray-500 transition" />
            </div>

            {/* Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col gap-4">
              <div className="mt-auto"></div> {/* Push items to bottom if not filled */}
              
              <div className="flex flex-col items-center justify-center py-6 mb-6">
                <img src={activeChatUser.profilePic || avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 object-top" />
                <span className="font-semibold text-lg">{activeChatUser.fullname}</span>
                <span className="text-gray-500 text-sm">Instagram</span>
                <button className="px-4 py-1.5 mt-4 text-sm font-semibold text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 transition" onClick={() => navigate(`/profile/${activeChatUser.username}`)}>View Profile</button>
              </div>

              {messages.map((msg, idx) => {
                // Ensure msg object bindings safely map sender structure internally (sometimes populated differently)
                const isSentByMe = typeof msg.sender === 'object' 
                     ? msg.sender._id === userData?._id 
                     : msg.sender === userData?._id;

                return (
                  <div key={idx} className={`w-full flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col max-w-[70%] ${isSentByMe ? 'items-end' : 'items-start'}`}>
                      {/* Media Body */}
                      {msg.media && (
                        <div className="mb-1 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 min-h-[100px]">
                            {msg.media.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img src={msg.media} alt="Message Media" className="w-full max-w-[250px] object-cover" />
                            ) : (
                                <video src={msg.media} controls className="w-full max-w-[250px] object-cover" />
                            )}
                        </div>
                      )}

                      {/* Text Body */}
                      <div className={`flex flex-col gap-1 ${isSentByMe ? 'items-end' : 'items-start'}`}>
                        {msg.story && (
                           <div className="mb-1 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 max-w-[120px] shadow-sm relative">
                               {msg.story.type === 'video' || msg.story.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                   <video src={msg.story.media} className="w-full object-cover max-h-[160px]" />
                               ) : (
                                   <img src={msg.story.media} alt="Story Reply" className="w-full object-cover max-h-[160px]" />
                               )}
                               <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                   <span className="text-white text-xs font-semibold bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Story</span>
                               </div>
                           </div>
                        )}
                        {msg.text && msg.text.trim() !== "" && (
                          <div className={`px-4 py-2 text-[15px] ${isSentByMe ? 'bg-[#3797F0] text-white rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px]' : 'bg-[#EFEFEF] text-black rounded-t-[20px] rounded-br-[20px] rounded-bl-[4px]'}`}>
                              {msg.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <div className="p-4 sm:p-5 bg-white shrink-0">
              {mediaFile && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-gray-100 rounded-lg max-w-[150px]">
                   <div className="flex-1 truncate text-sm font-semibold w-[150px] h-[150px]"><img src={preview} alt="" className="w-full max-w-[150px] object-cover h-[150px] object-top" /></div>
                   <button onClick={removeMedia} className="text-red-500 font-bold ml-auto px-2">✕</button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="w-full border border-gray-300 rounded-full flex items-center px-4 py-1 relative">
                <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition text-black">
                  <FiImage size={24} />
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleImage} />
                </label>
                
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="flex-1 bg-transparent px-3 py-3 outline-none text-[15px]" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                
                {(messageText.trim() || mediaFile) && (
                  <button type="submit" disabled={isSending} className="text-[#0095F6] font-semibold px-4 hover:text-[#00376B] transition disabled:opacity-50 text-[14px]">
                    {isSending ? '...' : 'Send'}
                  </button>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
