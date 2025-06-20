import { Request, Response, NextFunction, Router } from "express";
import { database } from "../prisma";
import { verifyToken } from "../middleware/auth"; 
import { Decimal } from "@prisma/client/runtime/library"; 

const router = Router();

router.get(
  "/",
  verifyToken, 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyId = (req as any).user.companyId;

    if (!companyId) {
      res.status(500).json({
        status: 500,
        message: "Could not determine user's company for dashboard data.",
        data: null,
      });
      return;
    }

    try {
      // 1. Total Members
      const totalMembers = await database.member.count({
        where: {
          companyId: companyId,
          TT: false, 
        },
      });

      // 2. Total Collection (Sum of all 'amountReceived' from payments for this company's members)
      const totalCollectionResult = await database.payment.aggregate({
        _sum: {
          amountReceived: true,
        },
        where: {
          membership: {
            companyId: companyId,
            member: {
                TT: false 
            }
          },
        },
      });
      const totalCollection = totalCollectionResult._sum.amountReceived || new Decimal(0);

      // 3. Expired Members
      // Count memberships that belong to this company, are currently 'active', and whose endDate is in the past
      const now = new Date();
      const expiredMembers = await database.membership.count({
        where: {
          companyId: companyId,
          status: 'active', 
          endDate: { lt: now }, 
          member: {
            TT: false,
          }
        },
      });

      // Sum 'balanceRemaining' from all *active* memberships within this company
      const pendingAmountResult = await database.membership.aggregate({
        _sum: {
          balanceRemaining: true,
        },
        where: {
          companyId: companyId,
          status: 'active', // Only sum pending for currently active memberships
          balanceRemaining: { gt: new Decimal(0) }, 
          member: {
            TT: false, 
          }
        },
      });
      const pendingAmount = pendingAmountResult._sum.balanceRemaining || new Decimal(0);


      res.status(200).json({
        status: 200,
        message: "Dashboard data fetched successfully.",
        data: {
          totalMembers: totalMembers,
          totalCollection: totalCollection.toFixed(2),
          expiredMembers: expiredMembers,
          pendingAmount: pendingAmount.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      next(error); 
    }
  }
);

export { router as dashboardRoutes };