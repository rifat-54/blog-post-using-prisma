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

export const commentServices={
    createComment,
    getCommentById,
    getCommentByAuthor
}