import { createContext, useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppProvider = ({children}) => {

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

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserForm({
            ...userForm, 
            [name]: value
        })
    }

    const handleSignup = async (e) =>{
        e.preventDefault();
        try {
            const {data} = await API.post(`/user/${isLogin}`, userForm);
            
            if(data.success){
                console.log(data.message);
                
                // localStorage is completely removed
                setIsAuth(true);
                
                // Fetch the user data since token is now safely in a secure HTTP-Only Cookie
                await getProfile();

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

    const getProfile = async () =>{
        try {
            const {data} = await API.get("/user/profile");
            
            if(data.success){
                setUserData(data.user);
                setIsAuth(true);
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
            navigate("/auth");
        }
    }

    useEffect(()=>{
        // Just completely rely on backend cookie for session continuity
        getProfile();
    }, [])

    return (
        <AppContext.Provider value={{
            userForm, handleChange, handleSignup, isLogin, setIsLogin, 
            isAuth, userData, handleLogout, isCheckingAuth
        }}>
            {children}
        </AppContext.Provider>
    )
}