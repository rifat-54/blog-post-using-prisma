import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.GMAIL_APP_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification:true,
      accessType: "offline", 
      prompt: "select_account consent",
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verifationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
          from: '"Prisma Blog post" <prisma@bog.com>',
          to: user.email,
          subject: "Please verify email",
          html: `
        <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#2563eb; padding:20px; text-align:center; color:#ffffff;">
                <h2 style="margin:0;">Verify Your Email</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="font-size:16px;">Hi, ${user.name}</p>

                <p style="font-size:16px; line-height:1.5;">
                  Thank you for signing up. Please confirm your email address by clicking the button below.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="${verifationUrl}" 
                     style="background-color:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:4px; font-size:16px;">
                    Verify Email
                  </a>
                </div>

                <p style="font-size:14px; color:#666666;">
                  If you did not create this account, you can safely ignore this email.
                </p>

                <p style="font-size:14px; color:#666666;">
                  This link will expire in a limited time.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666666;">
                © 2026 Your App Name. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

        `,
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
 
});
