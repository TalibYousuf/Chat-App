import { createContext, useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {connect, io} from 'socket.io-client';


const backendUrl= import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL=backendUrl;

export const AuthContext = createContext();
const AuthProvider = ({children})=>{

    const [token,setToken]=useState(localStorage.getItem("token"));
    const [authUser,setAuthUser]=useState(null);
    const [onlineUsers,setOnlineUsers]=useState([]);
    const [socket,setSocket]=useState(null);
    
    //check if user is authenticated and if so , set the user data and connect the socket 

    const checkAuth= async ()=>{
        try {
            const {data} = await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }
    //login function to handle user authentication and socket connection
    const login = async(state,credentials)=>{
        console.log("Login started, state:", state, "payload:", credentials);
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            console.log("API response:", data);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"]=data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message);
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            
        }
    }


    //logout function to handle user logout and socket disconnection

    const logout = async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token']=null;
        toast.success("logged out successfully");
        socket.disconnect();
    }

    //function to update the user profile
    const updateProfile=async(body)=>{
        try {
            const{data}=await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("profile updated successfully");
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }

    }



    //connect socket function to handle socket connection and online users updates

    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;//if no user is found or socket/user is already connected then skip
        // Debug backendUrl to verify value
        console.log("Socket.io final URL:", backendUrl);
        const newSocket = io(backendUrl,{//make a connection and pass the user id
            query:{
                userId :userData._id,
            }
        });
        setSocket(newSocket);//This saves the socket into state — so the rest of your app can use it to:

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token;
        }
        checkAuth();

    },[])

    const value = {
        axios ,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;