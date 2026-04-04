import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMessageCircle, FiSend, FiBookmark, FiHeart } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import avatar from '../assets/img/avatar.png';

const Home = () => {
  const { userForm, userData } = useContext(AppContext);

  // Dummy data
  const stories = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    user: `user_${i}`,
    img: `https://i.pravatar.cc/150?img=${i + 20}`
  }));

  const posts = [
    {
      id: 1,
      user: "nature_vibes",
      avatar: "https://i.pravatar.cc/150?img=12",
      image: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=800&auto=format&fit=crop",
      likes: "12,340",
      caption: "Beautiful morning in the mountains! 🏔️✨"
    },
    {
      id: 2,
      user: "city_explorer",
      avatar: "https://i.pravatar.cc/150?img=15",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop",
      likes: "8,921",
      caption: "Urban jungle concrete views. 🏙️🔥 #city #explore"
    }
  ];

  const suggestions = [
    { id: 1, user: "john_doe", avatar: "https://i.pravatar.cc/150?img=33" },
    { id: 2, user: "jane_smith", avatar: "https://i.pravatar.cc/150?img=41" },
    { id: 3, user: "travel_diary", avatar: "https://i.pravatar.cc/150?img=52" },
    { id: 4, user: "foodie_gram", avatar: "https://i.pravatar.cc/150?img=60" },
    { id: 5, user: "photo_daily", avatar: "https://i.pravatar.cc/150?img=65" },
  ];

  return (
      <div className="flex justify-center w-full mt-4 md:mt-10">
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
            {posts.map(post => (
              <div key={post.id} className="mb-6 border-b border-gray-200 pb-5">
                {/* Post Header */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr p-[1px] from-yellow-400 to-purple-500">
                      <img src={post.avatar} alt="user" className="w-full h-full rounded-full border border-white object-cover" />
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900">{post.user}</span>
                    <span className="text-gray-400 text-xs">• 1d</span>
                  </div>
                  <BsThreeDots className="cursor-pointer" size={20} />
                </div>
                
                {/* Post Image */}
                <div className="w-full bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center border border-gray-100">
                  <img src={post.image} alt="post" className="w-full object-cover max-h-[585px]" />
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 pb-2">
                  <div className="flex items-center gap-4">
                    <FiHeart size={26} className="cursor-pointer hover:text-gray-500 transition" />
                    <FiMessageCircle size={26} className="cursor-pointer hover:text-gray-500 transition" />
                    <FiSend size={26} className="cursor-pointer hover:text-gray-500 transition" />
                  </div>
                  <FiBookmark size={26} className="cursor-pointer hover:text-gray-500 transition" />
                </div>

                {/* Post Details */}
                <div>
                  <p className="text-[14px] font-semibold mb-1 cursor-pointer">{post.likes} likes</p>
                  <p className="text-[14px] leading-[18px]">
                    <span className="font-semibold cursor-pointer mr-1">{post.user}</span>
                    {post.caption}
                  </p>
                  <p className="text-[14px] text-gray-500 cursor-pointer mt-1">View all 240 comments</p>
                  <div className="mt-2 flex items-center justify-between">
                    <input type="text" placeholder="Add a comment..." className="text-[14px] w-full outline-none placeholder-gray-500" />
                    <button className="text-[#0095f6] font-semibold text-[14px] opacity-70 hover:opacity-100">Post</button>
                  </div>
                </div>
              </div>
            ))}
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
