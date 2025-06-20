import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../generated/prisma/index'; // Import Role enum

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Extend the Request interface to add user property
declare module 'express' {
  export interface Request {
    user?: {
      userId: number; 
      role: Role;
      companyId: number; 
      clientCode: string;
      branchID: number; 
      // Add other user properties from token payload as needed
    };
  }
}



export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  
  const token = req.headers['authorization'];

  if (token == null) {
    
    res.sendStatus(401); 
    return; 
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
     
      console.error("JWT Verification Error:", err.message);
      res.sendStatus(403); 
      return; 
    }

    
    req.user = user; 

    next(); 
  });
};


export const isAdminOrManager = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.sendStatus(401);
        return; 
    }

    if (req.user.role === Role.admin || req.user.role === Role.manager) {
        next(); 
    } else {
        res.status(403).json({ message: 'Access denied: Admins or Managers required' }); // Sending the response
        return; 
    }
};