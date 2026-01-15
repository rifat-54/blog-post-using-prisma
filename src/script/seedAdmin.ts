import { prisma } from "../lib/prisma";
import { userRole } from "../middleware/auth";


async function seedAdmin(){
    try {
        console.log("****** Start admin Creation *****");
        const adminData={
            name:"admin4 user",
            email:"admin4@email.com",
            role:userRole.ADMIN,
            password:"admin@123"
            
        }
        console.log("**** Check if admin exit ****");
        const exitingUser=await prisma.user.findUnique({
            where:{
                email:adminData.email
            }
        })

        if(exitingUser){
            throw new Error("user already exit!!")
        }

        const signUpAdmin=await fetch("http://localhost:5000/api/auth/sign-up/email",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Origin":"http://localhost:5000"
            },
            body:JSON.stringify(adminData)
        })

        
        if(signUpAdmin.ok){
            console.log("**** Successfully admin created ****");

            const data=await prisma.user.update({
                where:{
                    email:adminData.email
                },
                data:{
                    emailVerified: true
                }
            })

            console.log("updated data -> ",data);

        }
            
    } catch (error) {
        console.error(error)
    }
}

seedAdmin()