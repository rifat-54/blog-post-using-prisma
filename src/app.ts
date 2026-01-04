import express from "express"
import { postRouter } from "./modules/post/post.router"
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cookieParser from "cookie-parser";

const app=express()
app.use(express.json())
app.use(cookieParser()); 
app.all('/api/auth/*splet', toNodeHandler(auth));
// app.all(/^\/api\/auth\/.*$/, toNodeHandler(auth));

app.use("/posts",postRouter)

app.get("/",(req,res)=>{
    res.send("server is running")
})

export default app;