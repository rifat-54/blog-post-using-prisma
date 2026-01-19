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

const updatePost=async(postId:string,authorId:string,data:Partial<Post>)=>{
  const postData=await prisma.post.findFirstOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      authorId:true
    }
  })

  if(postData.authorId!==authorId){
    throw new Error("you are not owner of this post!")
  }

  const result=await prisma.post.update({
    where:{
      id:postId
    },
    data
  })

  return result


}

export const postServices = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost
};
