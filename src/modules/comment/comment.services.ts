import { CommentStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const createComment=async(payload:{
    content:string,
    authorId:string,
    postId:string,
    parentId?:string
})=>{

    await prisma.post.findUniqueOrThrow({
        where:{
            id:payload.postId
        }
    })
    // await prisma.comment.findUniqueOrThrow({
    //     where:{
    //         id:payload.parentId
    //     }
    // })

    return await prisma.comment.create({
        data:payload
    })
}

const getCommentById=async(commentId:string)=>{
    return await prisma.comment.findUnique({
        where:{
            id:commentId
        },
        include:{
            post:{
                select:{
                    id:true,
                    title:true,
                    views:true
                }
            }
        }
    })
}

const getCommentByAuthor=async(authorId:string)=>{
    return await prisma.comment.findMany({
        where:{
            authorId
        },
        include:{
            post:{
                select:{
                    id:true,
                    title:true,
                    views:true
                }
            }
        }
    })
}

const deleteCommentById=async(commentId:string,authorId:string)=>{
    const commentData=await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId
        },
        select:{
            id:true
        }
        
    })

    if(!commentData){
        throw new Error("Comment not found!!")
    }

    return await prisma.comment.delete({
        where:{
            id:commentData.id
        }
    })
}


const updateComment=async(authorId:string,commentId:string,updatedData:{content?:string,status?:CommentStatus})=>{

       const commentData=await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId
        },
        select:{
            id:true
        }
        
    })

    if(!commentData){
        throw new Error("Comment not found!!")
    }

    return await prisma.comment.update({
        where:{
            id:commentId,
            authorId
        },
        data:updatedData
            
            // ...(updatedData.content!==undefined && {content:updatedData.content}),
            // ...(updatedData.status!==undefined && {status:updatedData.status})
        
        
    })

}


const modarateComment=async(commentId:string,payload:{status:CommentStatus})=>{
   const commentData= await prisma.comment.findUniqueOrThrow({
        where:{
            id:commentId
        }
    })

    if(commentData.status===payload.status){
        throw new Error("Status already updated!!")
    }
    return await prisma.comment.update({
        where:{
            id:commentId
        },
        data:payload
    })
}


export const commentServices={
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteCommentById,
    updateComment,
    modarateComment
}