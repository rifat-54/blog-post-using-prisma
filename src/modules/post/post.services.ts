import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async (payload: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andCondition: PostWhereInput[] = [];
  if (payload.search) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    });
  }
  if (payload.tags) {
    andCondition.push({
      tags: {
        hasEvery: payload.tags,
      },
    });
  }

  if (typeof payload.isFeatured === "boolean") {
    andCondition.push({
      isFeatured: payload.isFeatured,
    });
  }

  if (payload.status) {
    andCondition.push({
      status: payload.status,
    });
  }

  if (payload.authorId) {
    andCondition.push({
      authorId: payload.authorId,
    });
  }
  const data = await prisma.post.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andCondition,
    },
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
    include:{
      _count:{
        select:{comments:true}
      }
    }
    // orderBy:payload.sortBy && payload.sortOrder ?
    //   {
    //     [payload.sortBy]:payload.sortOrder
    //   }:
    //   {
    //     createdAt:"desc"
    //   }
  });

  const total = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    data,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      skip: payload.skip,
      totalPage: Math.ceil(total / payload.limit),
    },
  };
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
     await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const data = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include:{
        comments:{
          where:{
            parentId:null,
            status:CommentStatus.APPROVED
          },
          orderBy:{
            createdAt:"desc"
          },
          include:{
            replies:{
              where:{
                status:CommentStatus.APPROVED
              },
              orderBy:{createdAt:"asc"},
              include:{
                replies:{
                  where:{
                    status:CommentStatus.APPROVED
                  },
                  orderBy:{createdAt:"asc"}
                }
              } 
            }
          }
        },
        _count:{
          select:{comments:true}
        }
      }
    });
    return data;
  });
};

const getMyPost=async(authorId:string)=>{
  await prisma.user.findUniqueOrThrow({
    where:{
      id:authorId,
      status:"ACTIVE"
    }
  })

    const result= await prisma.post.findMany({
        where:{
            authorId
        },
        orderBy:{
          createdAt:"desc"
        },
        include:{
          _count:{
            select:{
              comments:true
            }
          }
        }
    })

    const total=await prisma.post.count({
      where:{
        authorId
      }
    })

    // const total=await prisma.post.aggregate({
    // _count:{
    //   id:true
    //  },
    //  where:{
    //   authorId
    //  }
    // })

    return {
      data:result,
      total
    }
}

const updatePost=async(postId:string,authorId:string,data:Partial<Post>,isAdmin:boolean)=>{
  const postData=await prisma.post.findFirstOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      authorId:true
    }
  })

  if(!isAdmin &&postData.authorId!==authorId){
    throw new Error("you are not owner of this post!")
  }

  if(!isAdmin){
    delete data.isFeatured
  }

  const result=await prisma.post.update({
    where:{
      id:postId
    },
    data
  })

  return result


}

const deletePost=async(postId:string,authorId:string,isAdmin:boolean)=>{
  const postData=await prisma.post.findFirstOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      authorId:true
    }
  })

  if(!isAdmin &&postData.authorId!==authorId){
    throw new Error("you are not owner of this post!")
  }

  

  const result=await prisma.post.delete({
    where:{
      id:postId
    }
  })

  return result

}


const getStats=async()=>{
  return await prisma.$transaction(async(tx)=>{

    const[totalPost,publishedPost,draftPost,archivedPost,totalComment,approvedComment,totalUser,totalAdmin,totalUserRole,totalViews]=await Promise.all([
      await tx.post.count(),
      await tx.post.count({where:{status:PostStatus.PUBLISHED}}),
      await tx.post.count({where:{status:PostStatus.DRAFT}}),
      await tx.post.count({where:{status:PostStatus.ARCHIVED}}),
      await tx.comment.count(),
      await tx.comment.count({where:{status:CommentStatus.APPROVED}}),
      await tx.user.count(),
      await tx.user.count({where:{role:"ADMIN"}}),
      await tx.user.count({where:{role:"USER"}}),
      await tx.post.aggregate({
        _sum:{views:true}
      })
    ])

    // const totalPost=await tx.post.count()
    // const publishedPost=await tx.post.count({
    //   where:{
    //     status:PostStatus.PUBLISHED
    //   }
    // })
    // const draftPost=await tx.post.count({
    //   where:{
    //     status:PostStatus.DRAFT
    //   }
    // })
    // const archivedPost=await tx.post.count({
    //   where:{
    //     status:PostStatus.ARCHIVED
    //   }
    // })

    return {
      totalPost,
      draftPost,
      archivedPost,
      publishedPost,
      totalComment,
      approvedComment,
      totalUser,
      totalAdmin,
      totalUserRole,
      totalViews:totalViews._sum.views
    }


  })
}


export const postServices = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStats
};
