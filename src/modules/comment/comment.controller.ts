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

const getCommentById=async(req:Request,res:Response)=>{
    try {
       const id=req.params.commentId as string
        const result=await commentServices.getCommentById(id)

        res.status(200).json(result)

    } catch (error) {
        res.status(400).json({
            success:false,
            message:"error fetch comment!!",
            details:error
        })
    }
}

const getCommentByAuthor=async(req:Request,res:Response)=>{
    try {
       const id=req.params.authorId as string
        const result=await commentServices.getCommentByAuthor(id)

        res.status(200).json(result)

    } catch (error) {
        res.status(400).json({
            success:false,
            message:"error fetch comment!!",
            details:error
        })
    }
}

export const commentController={
    createComment,
    getCommentById,
    getCommentByAuthor
}