import { Request, Response, NextFunction } from "express";
import { database } from "../prisma"; // Assuming this imports your initialized PrismaClient instance
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/index"; // Corrected import path for Role
import { Router } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const router = Router();

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { clientCode, role, mobileNo, password, cmpID } = req.body;  //will change this cmpId to branchId

    // 1. Validate input (basic check)
    if (!clientCode || !role || !mobileNo || !password || !cmpID) {
      res.status(400).json({
        status: 400,
        message: "Missing required login fields",
        data: null,
      });
      return;
    }

    // Ensure the provided role is valid according to our enum
    const providedRole = role as string;
    if (!Object.values(Role as any).includes(providedRole)) {
      res.status(400).json({
        status: 400,
        message: `Invalid role provided.`,
        data: null,
      });
      return;
    }
    const userRole = providedRole as Role;

    try {
      // 2. Find the User directly that matches the criteria
      const user = await database.user.findFirst({
        where: {
          mobileNo: mobileNo,
          role: userRole,
          company: {
            clientCode: clientCode,
            cmpID: cmpID,
          },
        },
        include: {
          company: {
            select: {
              id: true,
              clientCode: true,
              cmpID: true,
              name: true,
            },
          },
        },
      });

      // 3. Check if user exists OR if credentials don't match
      // We combine this check to return a generic message for security
      if (!user) {
        res.status(402).json({
          status: 402,
          message: "Invalid credentials or Unauthorized user!",
          data: null,
        });
        return;
      }

      
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   res.status(401).json({
      //     status: 401,
      //     message: "Invalid credentials", // Generic message
      //     data: null
      //   });
      //   return;
      // }

      if (!user.isActive || user.TT) {
        res.status(401).json({
          status: 401,
          message: "Account is inactive. Please contact your administrator.",
          data: null,
        });
        return;
      }

      
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          companyId: user.companyId,
          clientCode: user.company.clientCode,
          cmpID: user.company.cmpID,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      // 6. Return success response
      res.status(200).json({
        status: 200,
        message: "Login successful",
        data: { 
          token: token,
          user: {
            id: user.id,
            mobileNo: user.mobileNo,
            name: user.name,
            role: user.role,
            company: {
              id: user.company.id,
              clientCode: user.company.clientCode,
              cmpID: user.company.cmpID,
              name: user.company.name,
            },
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: 500,
        message: "An internal server error occurred during login",
        data: null,
      });
      
    }
  }
);

export { router };
