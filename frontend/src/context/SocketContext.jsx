import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AppContext } from "./AppContext";
import API from "../api/axios";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { userData } = useContext(AppContext);
    const [socket, setSocket] = useState(null);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [toastNotifications, setToastNotifications] = useState([]);

    useEffect(() => {
        if (userData?._id) {
            const socketInstance = io("http://localhost:8000", {
                withCredentials: true
            });

            setSocket(socketInstance);

            socketInstance.emit("join", userData._id);

            socketInstance.on("receiveMessage", (message) => {
                // We'll increment unread count only if we are not actively on the receiver's chat page
                // But for now, just increment global unread count directly via generic events, 
                // we leave specific handling to Messages.jsx, but since we map "distinct sender" we should re-fetch unread count
                fetchUnreadCount();
            });

            socketInstance.on("newNotification", (notification) => {
                setHasUnreadNotifications(true);
                
                // Add to toast notifications array and auto-remove after 4 seconds
                const toastId = Date.now();
                setToastNotifications(prev => [...prev, { ...notification, toastId }]);

                setTimeout(() => {
                    setToastNotifications(prev => prev.filter(t => t.toastId !== toastId));
                }, 4000);
            });

            // Fetch initial unread message count
            fetchUnreadCount();
            fetchUnreadNotificationDotStatus();

            return () => {
                socketInstance.disconnect();
                setSocket(null);
            };
        }
    }, [userData]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await API.get('/messages/unread/count');
            if (data.success) {
                setUnreadMessageCount(data.count);
            }
        } catch (error) {
            console.log("Failed to fetch unread count", error);
        }
    };

    const fetchUnreadNotificationDotStatus = async () => {
         try {
             // Basic fetch to check if any unread ones exist
             const { data } = await API.get('/notifications');
             if (data.success && data.notifications.some(n => !n.read)) {
                 setHasUnreadNotifications(true);
             }
         } catch(error){
             console.log("Failed to fetch notifications dot status", error);
         }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            unreadMessageCount,
            setUnreadMessageCount,
            fetchUnreadCount,
            hasUnreadNotifications,
            setHasUnreadNotifications,
            toastNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );
};
