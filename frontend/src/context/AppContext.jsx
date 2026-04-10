import { createContext, useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [userForm, setUserForm] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
    })
    const [isLogin, setIsLogin] = useState("signin");
    const navigate = useNavigate()
    const [isAuth, setIsAuth] = useState(false)
    const [userData, setUserData] = useState(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userPosts, setUserPosts] = useState([])
    const [postDataById, setPostDataById] = useState(null)
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [feedPosts, setFeedPosts] = useState([])
    const [isFeedLoading, setIsFeedLoading] = useState(true);
    const [comments, setComments] = useState([])
    const [stories, setStories] = useState([])
    const [isStoryLoading, setIsStoryLoading] = useState(true)
    const [suggestedUsers, setSuggestedUsers] = useState([])



    const timeAgo = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
    
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d`;
      const weeks = Math.floor(days / 7);
      if (weeks < 52) return `${weeks}w`;
      return `${Math.floor(weeks / 52)}y`;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserForm({
            ...userForm,
            [name]: value
        })
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post(`/user/${isLogin}`, userForm);

            if (data.success) {
                console.log(data.message);

                // localStorage is completely removed
                setIsAuth(true);

                // Fetch the user data since token is now safely in a secure HTTP-Only Cookie
                await getProfile();
                await getFeedPost();
                await suggestedUser()
                await getStories()

                setUserForm({
                    fullname: "",
                    username: "",
                    email: "",
                    password: "",
                })

                navigate("/");
            }

        } catch (error) {
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            } else {
                console.log(error.message);
            }
        }
    }

    const getProfile = async () => {
        try {
            const { data } = await API.get("/user/profile");

            if (data.success) {
                setUserData(data.user);
                setIsAuth(true);

                getUserPost(data.user._id);
            }
        } catch (error) {
            setIsAuth(false);
            setUserData(null);
        } finally {
            setIsCheckingAuth(false);
        }
    }

    const handleLogout = async () => {
        try {
            // Backend clears the secure cookie
            await API.post("/user/logout");
        } catch (error) {
            console.log("Logout error", error);
        } finally {
            setIsAuth(false);
            setUserData(null);
            setFeedPosts([]);
            setUserPosts([]);
            navigate("/auth");
        }
    }


    const getUserPost = async (userId) => {
        try {
            const { data } = await API.get(`/posts/user/${userId}`)
            if (data.success) {
                setUserPosts(data.posts);
            }


        } catch (error) {
            console.log("post controller error", error);
        }
    }

    const getPostById = async (postId) => {
        try {
            const { data } = await API.get(`/posts/post/${postId}`)
            if (data.success) {
                setPostDataById(data.post);

                getComment(postId);
            }
        } catch (error) {
            console.log("post controller error", error);
        }
    }


    const handlePostClick = async (postId) => {
        setIsPostModalOpen(true);
        await getPostById(postId);
    };


    const getStories = async () => {
        try {
            setIsStoryLoading(true);
            const { data } = await API.get("/story");
            if (data.success) {
                setStories(data.stories);
            }
        } catch (error) {
            console.log("story fetch error", error);
        } finally {
            setIsStoryLoading(false);
        }
    }

    const uploadStory = async (file, song = null, overlays = null) => {
        try {
            const formData = new FormData();
            formData.append("media", file);
            if (song) formData.append("song", JSON.stringify(song));
            if (overlays) formData.append("overlays", JSON.stringify(overlays));
            
            const { data } = await API.post("/story/create", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                getStories();
            }
        } catch (error) {
            console.log("story upload error", error);
        }
    }

    const deleteStory = async (storyId) => {
        try {
            const { data } = await API.delete(`/story/delete/${storyId}`);
            if (data.success) {
                getStories();
            }
        } catch (error) {
            console.log("story delete error", error);
        }
    }

    const toggleLikeStoryAPI = async (storyId) => {
        try {
            const { data } = await API.post(`/story/like/${storyId}`);
            if (data.success) {
                getStories();
            }
        } catch (error) {
            console.log("story like error", error);
        }
    }

    const viewStoryAPI = async (storyId) => {
        try {
            await API.post(`/story/view/${storyId}`);
            // No need to refetch entire stories just for views, we manage viewers list optimistically
        } catch (error) {
            console.log("story view error", error);
        }
    }

    const getFeedPost = async () =>{
        try {
            // Only show skeleton loader if we have no posts currently rendered
            setFeedPosts(prev => {
                if (prev.length === 0) setIsFeedLoading(true);
                return prev;
            });

            const {data} = await API.get("/posts/feed")

            if(data.success){
                setFeedPosts(data.posts);
            }

        } catch (error) {
            console.log("post controller error", error);

            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsFeedLoading(false);
        }
    }


    const likePost = async (postId) =>{
        try {
            const {data} = await API.post(`/posts/like/${postId}`)
            if(data.success){
                getFeedPost();
                getPostById(postId);
            }
        } catch (error) {
            console.log("post controller error", error);
        }
    }


    const deletePost = async (postId) =>{
        try {
            const {data} = await API.delete(`/posts/delete/${postId}`)
            if(data.success){
                getFeedPost();
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }


    const addComment = async (postId, commentText) => {
        try {
            const {data} = await API.post(`/comments/add/${postId}`, {text: commentText});
            if(data.success){
                getFeedPost();
                getPostById(postId);
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }

    const getComment = async (postId) => {
        try {
            const {data} = await API.get(`/comments/get/${postId}`)
            if(data.success){
                setComments(data.comment);
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }

    const deleteComment = async (commentId) =>{
        try {
            const {data} = await API.delete(`/comments/delete/${commentId}`)
            if(data.success){
                getFeedPost();
                getPostById(postDataById._id);
                getComment(postDataById._id);
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }


    const followUser = async (userId) =>{
        try {
            const {data} = await API.post(`/user/follow/${userId}`)
            if(data.success){
                console.log("follow", data.message);
                
                getProfile();
                getFeedPost();
                getPostById(postDataById._id);
                getComment(postDataById._id);
                suggestedUser();
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }


    const unfollowUser = async (userId) =>{
        try {
            const {data} = await API.post(`/user/unfollow/${userId}`)
            if(data.success){
                console.log("unfollow", data.message);
                
                getProfile();
                getFeedPost();
                getPostById(postDataById._id);
                getComment(postDataById._id);
                suggestedUser();
            }
        } catch (error) {
            console.log("post controller error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }


    const suggestedUser = async () =>{
        try {
            const {data} = await API.get("/user/suggested")
            if(data.success){
                setSuggestedUsers(data.users);
            }
        } catch (error) {
            console.log("suggested user fetch error", error);
            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        }
    }

    


    useEffect(() => {
        getProfile();
        suggestedUser();
        getFeedPost();
        getStories();
    }, [])

    return (
        <AppContext.Provider value={{
            userForm, handleChange, handleSignup, isLogin, setIsLogin,
            isAuth, userData, handleLogout, isCheckingAuth, userPosts,
            getPostById, postDataById, isPostModalOpen, handlePostClick,
            setIsPostModalOpen, feedPosts, isFeedLoading, likePost, deletePost, addComment,
            deleteComment,comments, timeAgo, followUser, unfollowUser,
            stories, getStories, isStoryLoading, uploadStory, deleteStory,
            toggleLikeStoryAPI, viewStoryAPI, suggestedUsers,
            navigate
        }}>
            {children}
        </AppContext.Provider>
    )
}