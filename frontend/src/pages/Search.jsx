import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import avatar from '../assets/img/avatar.png';
import { SearchUserSkeleton } from '../components/Skeletons';

const Search = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!query.trim()) {
                setUsers([]);
                return;
            }
            try {
                setLoading(true);
                // Artificial delay to show skeleton effect
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const res = await API.get(`/user/search?query=${query}`);
                setUsers(res.data.users);
            } catch (error) {
                console.error("Error searching users", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchUsers, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div className="w-full max-w-2xl mx-auto pt-10 px-4 md:px-8">
            <h1 className="text-2xl font-semibold mb-6">Search</h1>
            
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Search users by username..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button 
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {loading && (
                    <div className="flex flex-col gap-2">
                        <SearchUserSkeleton />
                        <SearchUserSkeleton />
                        <SearchUserSkeleton />
                        <SearchUserSkeleton />
                    </div>
                )}
                {!loading && users.length === 0 && query && (
                    <div className="text-center text-gray-500 py-8">
                        No users found for "{query}".
                    </div>
                )}
                {!loading && users.length === 0 && !query && (
                    <div className="text-center text-gray-500 py-8">
                        Search for your friends and other accounts on Instagram.
                    </div>
                )}
                {users.map(user => (
                    <Link to={`/profile/${user.username}`} key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <img 
                                src={user.profilePic || avatar} 
                                alt={user.username} 
                                className="w-12 h-12 rounded-full object-cover object-top"
                            />
                            <div>
                                <h3 className="text-[14px] font-semibold text-gray-900 leading-tight">{user.username}</h3>
                                <p className="text-[14px] text-gray-500 mt-[1px]">{user.fullname}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Search;
