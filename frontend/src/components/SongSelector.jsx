import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiPlay, FiPause, FiX } from 'react-icons/fi';

const SongSelector = ({ onSelect, onClose }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingSongId, setPlayingSongId] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data } = await axios.get('https://spotify-t3db.onrender.com/api/song/list');
        if (data.success) {
          setSongs(data.songs);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, []);

  const handleTogglePlay = (e, song) => {
    e.stopPropagation();
    if (playingSongId === song._id) {
      audioRef.current.pause();
      setPlayingSongId(null);
    } else {
      audioRef.current.src = song.file;
      audioRef.current.play();
      setPlayingSongId(song._id);
    }
  };

  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#262626] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] animate-cube-slide">
        
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-white">Choose a Song</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <FiX className="text-xl dark:text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search music..." 
              className="bg-transparent border-none outline-none w-full text-sm dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-500 text-sm">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
               <p>No songs found</p>
             </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredSongs.map(song => (
                <div 
                  key={song._id} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                  onClick={() => onSelect(song)}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleTogglePlay(e, song)}>
                      {playingSongId === song._id ? <FiPause className="text-white text-xl" /> : <FiPlay className="text-white text-xl" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate dark:text-white">{song.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{song.album}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {song.duration}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongSelector;
