import { Request, Response } from "express"
import { postServices } from "./post.services"

 
const createPost=async(req:Request,res:Response)=>{
    try {
        const result=await postServices.createPost(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({
            error:"failed Post",
            details:error
        })
    }
}

export const postController={
    createPost
}