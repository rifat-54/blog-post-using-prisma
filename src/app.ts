import express from "express"
import { postRouter } from "./modules/post/post.router"
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"
import { commentRouter } from "./modules/comment/comment.router";
import errorHandler from "./middleware/globalErrorHandlar";
import { notFound } from "./middleware/notFound";
// import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(cors({
    origin:process.env.APP_URL || "http://localhost:5000",
    
    credentials:true
}))
// app.use(cookieParser()); 

app.all('/api/auth/*splat', toNodeHandler(auth));


app.use("/posts",postRouter)

app.use("/comments",commentRouter)

app.get("/",(req,res)=>{
    res.send("server is running")
})

app.use(notFound)
app.use(errorHandler)

export default app;