import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server} from "socket.io";
import mongoose from "mongoose";
//create express app and http server

const app=express();
const server=http.createServer(app);

//middlewares

app.use(express.json({limit: "4mb"}));
app.use(cors());//all urls will be connected to backend


app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

// process.nextTick(() => {
//     if (app._router && app._router.stack) {
//         app._router.stack.forEach((r) => {
//             if (r.route && r.route.path) {
//                 console.log("Route:", r.route.path);
//             }
//         });
//     }
// });



//intializing socket.io server
export const io=new Server(server,{ //(just like creating a pipeline between user and server)
    cors:{origin:"*"}
})
//storing online users

export const userSocketMap = {}; //userId :socketId (" You keep track of who is online")

//socket.io connection Handler
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    // console.log("user connected ✅" , userId);

    if(userId) userSocketMap[userId]=socket.id;

    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("user disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})



console.log("Mongo URI being used:", process.env.MONGODB_URI);
await connectDB();




const PORT=process.env.PORT || 4000;

server.listen(PORT , ()=>
    console.log("server is running on port " + PORT)
);


