import { Request, Response } from "express"
import { commentServices } from "./comment.services"


const createComment=async(req:Request,res:Response)=>{
    try {
        const user=req.user
        req.body.authorId=user?.id
        const result=await commentServices.createComment(req.body)

        res.status(201).json(result)

    } catch (error) {
        res.status(400).json({
            success:false,
            message:"cpost create errror",
            details:error
        })
    }
}

export const commentController={
    createComment
}