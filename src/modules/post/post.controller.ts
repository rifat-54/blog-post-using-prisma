import { Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { userRole } from "../../middleware/auth";


const createPost = async (req: Request, res: Response) => {
  try {
    console.log(req.user);
    if (!req.user) {
      return res.status(400).json({
        error: "failed Post",
      });
    }
    const result = await postServices.createPost(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "failed Post",
      details: error,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;

      const status=req.query.status as PostStatus | undefined

      const authorId=req.query.authorId as string | undefined

      // const page=Number(req.query.page ?? 1)
      // const limit=Number(req.query.limit ?? 10)
      // const skip=(page-1)*limit

      // const sortBy=req.query.sortBy as string | undefined
      // const sortOrder=req.query.sortOrder as string | undefined

      const { page,limit,skip,sortBy,sortOrder}=paginationSortingHelper(req.query)

    const result = await postServices.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "server error",
      details: error,
    });
  }
};

const getPostById=async(req:Request,res:Response)=>{
  try {
    const id=req.params.id
    if(!id){
      throw new Error("Post id is required!")
    }

    const result=await postServices.getPostById(id)

    res.status(200).json(result);
  } catch (error) {
     res.status(400).json({
      success: false,
      message: "server error",
      details: error,
    });
  }
}

const getMyPost=async(req:Request,res:Response)=>{
  
  try {
    const id=req.user?.id
    const result=await postServices.getMyPost(id as string)

    res.status(200).json({
      success:true,
      data:result
    })
  } catch (error:any) {
    console.log(error)
    res.status(400).json({
      success:false,
      messsage:error.message
    })
  }

}
const updatePost=async(req:Request,res:Response)=>{
  
  try {
    const id=req.user?.id
    const postId=req.params.postId
    const isAdmin=req.user?.role===userRole.ADMIN
    const result=await postServices.updatePost(postId as string,id as string,req.body,isAdmin)

    res.status(200).json({
      success:true,
      data:result
    })
  } catch (error:any) {
    console.log(error)
    res.status(400).json({
      success:false,
      messsage:error.message
    })
  }

}

const deletePost=async(req:Request,res:Response)=>{
  
  try {
    const id=req.user?.id
    const postId=req.params.postId
    const isAdmin=req.user?.role===userRole.ADMIN
    const result=await postServices.deletePost(postId as string,id as string,isAdmin)

    res.status(200).json({
      success:true,
      data:result
    })
  } catch (error:any) {
    console.log(error)
    res.status(400).json({
      success:false,
      messsage:error.message
    })
  }

}

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost
};
