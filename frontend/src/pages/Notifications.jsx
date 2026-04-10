import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import { AppContext } from '../context/AppContext';
import avatar from '../assets/img/avatar.png';
import { Link } from 'react-router-dom';
import PostDetailModal from '../components/PostDetailModal';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { setHasUnreadNotifications } = useContext(SocketContext);
    const { userData, followUser, unfollowUser } = useContext(AppContext);
    const [selectedPostId, setSelectedPostId] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await API.get('/notifications');
                if (data.success) {
                    setNotifications(data.notifications);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        const markAsRead = async () => {
            try {
                await API.put('/notifications/read');
                // Remove the dot locally
                setHasUnreadNotifications(false);
            } catch (error) {
                console.error("Failed to mark read", error);
            }
        };

        fetchNotifications();
        markAsRead();

    }, [setHasUnreadNotifications]);

    const getActionText = (type) => {
        switch(type) {
            case 'like': return 'liked your post.';
            case 'storyLike': return 'liked your story.';
            case 'comment': return 'commented on your post.';
            case 'follow': return 'started following you.';
            default: return 'interacted with you.';
        }
    };

    return (
        <div className="w-full h-full sm:pt-[50px] pb-20 items-center justify-start flex flex-col pt-0 bg-white">
            <div className="w-full max-w-[600px] px-4 md:px-0 mt-5 md:mt-10 mb-8 flex flex-col items-start gap-4 flex-shrink-0 relative h-full">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>

                <div className="flex flex-col w-full px-2 gap-4 h-full overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 mt-4 text-center w-full">No recent notifications.</p>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif._id} className={"flex items-center justify-between w-full p-2 " + (notif.read ? "bg-white" : "bg-blue-50/20")}>
                                <div className="flex items-center gap-3">
                                    <Link to={`/profile/${notif.sender?.username}`}>
                                        <img 
                                            src={notif.sender?.profilePic || avatar} 
                                            alt={notif.sender?.username} 
                                            className="w-11 h-11 rounded-full object-cover object-top border border-gray-200"
                                        />
                                    </Link>
                                    <div className="flex flex-col">
                                        <span className="text-[14px]">
                                            <Link to={`/profile/${notif.sender?.username}`} className="font-bold mr-1 hover:underline">
                                                {notif.sender?.username}
                                            </Link>
                                            <span className="text-gray-800">
                                                {notif.type === 'comment' ? `commented: ${notif.text}` : getActionText(notif.type)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                {notif.post && notif.post.images && notif.post.images[0] && (
                                    <div className="cursor-pointer ml-3" onClick={() => setSelectedPostId(notif.post._id)}>
                                        {notif.post.images[0].match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                           <img src={notif.post.images[0]} className="w-11 h-11 object-cover object-top rounded" alt="post thumbnail" />
                                        ) : (
                                           <video src={notif.post.images[0]} className="w-11 h-11 object-cover rounded" />
                                        )}
                                    </div>
                                )}
                                {notif.story && notif.story.media && (
                                    <div className="ml-3">
                                        {notif.story.type === 'video' || notif.story.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                           <video src={notif.story.media} className="w-11 h-11 object-cover object-top rounded-full border border-pink-500 p-[1px]" />
                                        ) : (
                                           <img src={notif.story.media} className="w-11 h-11 object-cover object-top rounded-full border border-pink-500 p-[1px]" alt="story thumbnail" />
                                        )}
                                    </div>
                                )}
                                {notif.type === 'follow' && (
                                    <div className="ml-auto">
                                        {userData?.following?.includes(notif.sender?._id) ? (
                                            <button 
                                                onClick={() => unfollowUser(notif.sender?._id)}
                                                className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors"
                                            >
                                                Following
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => followUser(notif.sender?._id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors"
                                            >
                                                Follow Back
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedPostId && (
                <PostDetailModal 
                    postId={selectedPostId} 
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </div>
    );
};

export default Notifications;
