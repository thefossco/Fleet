import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Compliance summary by owner
router.get('/compliance-by-owner', async (req: AuthRequest, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        compliance: true,
      },
      orderBy: { ownerName: 'asc' },
    });

    // Group by owner
    const byOwner = assets.reduce((acc: any, asset) => {
      const owner = asset.ownerName;
      if (!acc[owner]) {
        acc[owner] = {
          ownerName: owner,
          ownerContact: asset.ownerContact,
          totalAssets: 0,
          compliant: 0,
          expiring: 0,
          overdue: 0,
        };
      }

      acc[owner].totalAssets++;

      if (asset.compliance) {
        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);

        const inspectionExpiry = asset.compliance.inspectionExpiryDate
          ? new Date(asset.compliance.inspectionExpiryDate)
          : null;

        if (inspectionExpiry) {
          if (inspectionExpiry < now) {
            acc[owner].overdue++;
          } else if (inspectionExpiry <= thirtyDays) {
            acc[owner].expiring++;
          } else {
            acc[owner].compliant++;
          }
        }
      }

      return acc;
    }, {});

    res.json(Object.values(byOwner));
  } catch (error) {
    console.error('Compliance by owner error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Revenue by period
router.get('/revenue', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      annualFeePaymentStatus: 'PAID',
    };

    const compliance = await prisma.compliance.findMany({
      where,
      include: {
        asset: {
          select: {
            registrationNumber: true,
            assetCategory: true,
            assetType: true,
          },
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = compliance.reduce(
      (sum, c) => sum + (c.annualFeeAmount || 0),
      0
    );

    // Group by category
    const byCategory = compliance.reduce((acc: any, c) => {
      const category = c.asset.assetCategory;
      if (!acc[category]) {
        acc[category] = { category, revenue: 0, count: 0 };
      }
      acc[category].revenue += c.annualFeeAmount || 0;
      acc[category].count++;
      return acc;
    }, {});

    res.json({
      totalRevenue,
      totalPaidAssets: compliance.length,
      byCategory: Object.values(byCategory),
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
});

// Insurance coverage status
router.get('/insurance-coverage', async (req: AuthRequest, res) => {
  try {
    const now = new Date();

    const compliance = await prisma.compliance.findMany({
      include: {
        asset: {
          select: {
            registrationNumber: true,
            ownerName: true,
            assetCategory: true,
            assetType: true,
          },
        },
      },
    });

    const covered = compliance.filter(
      c => c.insuranceExpiryDate && new Date(c.insuranceExpiryDate) > now
    );

    const expired = compliance.filter(
      c => c.insuranceExpiryDate && new Date(c.insuranceExpiryDate) <= now
    );

    const noInsurance = compliance.filter(c => !c.insuranceExpiryDate);

    res.json({
      total: compliance.length,
      covered: covered.length,
      expired: expired.length,
      noInsurance: noInsurance.length,
      coveredList: covered,
      expiredList: expired,
      noInsuranceList: noInsurance,
    });
  } catch (error) {
    console.error('Insurance coverage error:', error);
    res.status(500).json({ error: 'Failed to generate insurance report' });
  }
});

// Inspection history
router.get('/inspection-history/:assetId', async (req: AuthRequest, res) => {
  try {
    const { assetId } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: {
        assetId,
        action: {
          in: ['COMPLIANCE_CREATED', 'COMPLIANCE_UPDATED'],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    console.error('Inspection history error:', error);
    res.status(500).json({ error: 'Failed to fetch inspection history' });
  }
});

export { router as reportsRouter };
