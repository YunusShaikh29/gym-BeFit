import { Request, Response, NextFunction, Router } from "express";
import { database } from "../prisma"; // Your Prisma Client instance
import { verifyToken, isAdminOrManager } from "../middleware/auth"; // Middleware
import { Gender } from "../generated/prisma/index"; // Import Gender enum from Prisma
import { Decimal } from "@prisma/client/runtime/library"; // For Decimal calculations

const router = Router();

router.post(
  "/",
  verifyToken,
  isAdminOrManager,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      name,
      mobileNo,
      gender,
      address,
      city,
      pincode,
      email,
      aadhar,
    } = req.body;

    const createdById = (req as any).user.userId;
    const companyId = (req as any).user.companyId;

    if (!name || !createdById || !companyId) {
      res.status(400).json({
        status: 400,
        message: "Missing required member fields (name, creator/company info).",
        data: null,
      });
      return;
    }

    if (gender && !Object.values(Gender).includes(gender as Gender)) {
      res.status(400).json({
        status: 400,
        message: `Invalid gender provided. Accepted genders are: ${Object.values(Gender).join(", ")}.`,
        data: null,
      });
      return;
    }
    if (email && typeof email !== 'string') {
        res.status(400).json({ status: 400, message: "Invalid email format.", data: null });
        return;
    }
    if (pincode && typeof pincode !== 'string') {
        res.status(400).json({ status: 400, message: "Invalid pincode format.", data: null });
        return;
    }

    try {
      const newMember = await database.member.create({
        data: {
          name,
          mobileNo,
          gender: gender as Gender,
          address,
          city,
          pincode,
          email,
          aadhar,
          isActive: true,
          TT: false,
          companyId: companyId,
          createdById: createdById,
        },
      });

      res.status(201).json({
        status: 201,
        message: "Member personal details created successfully.",
        data: {
          member: newMember,
        },
      });
    } catch (error) {
      console.error("Error creating member personal details:", error);
      next(error);
    }
  }
);


router.get(
  "/",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyId = (req as any).user.companyId;
    if (!companyId) {
      res.status(500).json({
        status: 500,
        message: "Could not determine user's company.",
        data: null,
      });
      return;
    }

    const { isActive, isExpired, searchText } = req.query; 

    const whereCondition: any = {
      companyId: companyId, 
      TT: false, 
    };

    if (isActive !== undefined) {
      whereCondition.isActive = isActive === "true"; 
    }

    if (searchText) {
      whereCondition.OR = [
        { name: { contains: searchText as string, mode: "insensitive" } },
        { mobileNo: { contains: searchText as string, mode: "insensitive" } },
        { email: { contains: searchText as string, mode: "insensitive" } },
        { address: { contains: searchText as string, mode: "insensitive" } },
        { city: { contains: searchText as string, mode: "insensitive" } },
        { pincode: { contains: searchText as string, mode: "insensitive" } },
        { aadhar: { contains: searchText as string, mode: "insensitive" } },
      ];
    }

    const membershipWhereCondition: any = {
        companyId: companyId, 
        status: 'active' 
    };

    if (isExpired !== undefined) {
        const now = new Date();
        if (isExpired === 'true') {
            membershipWhereCondition.endDate = { lt: now };
        } else {
            membershipWhereCondition.endDate = { gte: now };
        }
    }


    try {
      const members = await database.member.findMany({
        where: whereCondition,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          memberships: { 
            where: membershipWhereCondition, 
            orderBy: { createdAt: 'desc' }, 
            take: 1, 
            include: {
                payments: { 
                    orderBy: { paymentDate: 'desc' },
                    select: {
                        id: true,
                        amountReceived: true,
                        paymentDate: true,
                        paymentMethod: true,
                       
                    }
                }
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const membersWithDetails = members.map(member => {
        const currentMembership = member.memberships[0] || null; 

        return {
          ...member,
          currentMembership: currentMembership ? {
            id: currentMembership.id,
            durationMonths: currentMembership.durationMonths,
            totalPlanAmount: currentMembership.totalPlanAmount,
            discountAmount: currentMembership.discountAmount,
            finalPayableAmount: currentMembership.finalPayableAmount,
            startDate: currentMembership.startDate,
            endDate: currentMembership.endDate,
            amountPaidByMember: currentMembership.amountPaidByMember,
            balanceRemaining: currentMembership.balanceRemaining,
            status: currentMembership.status,
            remark: currentMembership.remark,
          } : null,
          isCurrentlyExpired: currentMembership ? new Date() > currentMembership.endDate : null,
          
        };
      });


      res.status(200).json({
        status: 200,
        message: "Fetched all members successfully.",
        data: {
          members: membersWithDetails,
        },
      });
    } catch (error) {
      console.error("Error fetching members:", error);
      next(error);
    }
  }
);

// Endpoint to Fetch a Single Member by ID
router.get(
  "/:id",
  verifyToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const memberId = parseInt(req.params.id, 10);

    if (isNaN(memberId)) {
      res.status(400).json({ status: 400, message: "Invalid member ID.", data: null });
      return;
    }

    const companyId = (req as any).user.companyId;
    if (!companyId) {
      res.status(500).json({ status: 500, message: "Could not determine user's company.", data: null });
      return;
    }

    try {
      const member = await database.member.findUnique({
        where: {
          id: memberId,
          companyId: companyId,
          TT: false,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          memberships: { 
            orderBy: { createdAt: 'desc' },
            include: {
                payments: { 
                    orderBy: { paymentDate: 'desc' },
                }
            }
          },
          company: {
            select: {
              clientCode: true,
              branchID: true,
              name: true,
            },
          },
        },
      });

      if (!member) {
        res.status(404).json({ status: 404, message: "Member not found.", data: null });
        return;
      }

      const currentMembership = member.memberships[0] || null;

      res.status(200).json({
        status: 200,
        message: "Member fetched successfully.",
        data: {
          member: {
              ...member,
              currentMembership: currentMembership ? {
                id: currentMembership.id,
                durationMonths: currentMembership.durationMonths,
                totalPlanAmount: currentMembership.totalPlanAmount,
                discountAmount: currentMembership.discountAmount,
                finalPayableAmount: currentMembership.finalPayableAmount,
                startDate: currentMembership.startDate,
                endDate: currentMembership.endDate,
                amountPaidByMember: currentMembership.amountPaidByMember,
                balanceRemaining: currentMembership.balanceRemaining,
                status: currentMembership.status,
                remark: currentMembership.remark,
              } : null,
              isCurrentlyExpired: currentMembership ? new Date() > currentMembership.endDate : null,
          }
        },
      });
    } catch (error) {
      console.error(`Error fetching member ${memberId}:`, error);
      next(error);
    }
  }
);

// TODO:
// 1. Endpoint to CREATE A NEW MEMBERSHIP for an existing member (e.g., POST /members/:memberId/memberships)
//    - This endpoint would receive membership plan details (duration, total amount, dates, discount, remark).
//    - It would create a new Membership record, link it to the Member, Company, and User (creator).
//    - It would set initial `amountPaidByMember` to 0 and `balanceRemaining` to `finalPayableAmount`.
// 2. Endpoint to ADD A PAYMENT to a specific MEMBERSHIP (e.g., POST /memberships/:membershipId/payments)
//    - This endpoint would receive payment details (amountReceived, paymentMethod, notes).
//    - It would create a new Payment record, link it to the Membership.
//    - It would then UPDATE the `amountPaidByMember` and `balanceRemaining` on the associated `Membership` record.
// 3. Endpoints for Updating/Soft Deleting Members and Memberships.

export { router as memberRoutes };