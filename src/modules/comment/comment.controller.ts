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

const deleteCommentById=async(req:Request,res:Response)=>{
    try {
        const authorId=req.user?.id
       const commentId=req.params.commentId as string
        const result=await commentServices.deleteCommentById(commentId,authorId as string)

        res.status(200).json(result)

    } catch (error) {
        res.status(400).json({
            success:false,
            message:"error delete comment!!",
            details:error
        })
    }
}

const updateComment=async(req:Request,res:Response)=>{
    try {
        const authorId=req.user?.id
       const commentId=req.params.commentId as string
        const result=await commentServices.updateComment(authorId as string,commentId,req.body)

        res.status(200).json(result)

    } catch (error) {
        res.status(400).json({
            success:false,
            message:"error update comment!!",
            details:error
        })
    }
}

const modarateComment=async(req:Request,res:Response)=>{
    try {
       
       const commentId=req.params.commentId as string
        const result=await commentServices.modarateComment(commentId,req.body)

        res.status(200).json(result)

    } catch (error:any) {
        res.status(400).json({
            success:false,
            message:error.message,
            details:error
        })
    }
}

export const commentController={
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteCommentById,
    updateComment,
    modarateComment
}