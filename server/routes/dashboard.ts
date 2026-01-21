import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Total assets
    const totalAssets = await prisma.asset.count();

    // Active vs inactive
    const activeAssets = await prisma.asset.count({
      where: { operationalStatus: 'ACTIVE' },
    });
    const inactiveAssets = totalAssets - activeAssets;

    // Assets by category
    const vehicleCount = await prisma.asset.count({
      where: { assetCategory: 'VEHICLE' },
    });
    const vesselCount = await prisma.asset.count({
      where: { assetCategory: 'VESSEL' },
    });

    // Compliance expiring this month
    const expiringInspections = await prisma.compliance.count({
      where: {
        inspectionExpiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Overdue inspections
    const overdueInspections = await prisma.compliance.count({
      where: {
        inspectionExpiryDate: {
          lt: now,
        },
      },
    });

    // Insurance expiring
    const expiringInsurance = await prisma.compliance.count({
      where: {
        insuranceExpiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Fee payment status
    const paidFees = await prisma.compliance.count({
      where: { annualFeePaymentStatus: 'PAID' },
    });
    const unpaidFees = await prisma.compliance.count({
      where: { annualFeePaymentStatus: 'UNPAID' },
    });

    res.json({
      totalAssets,
      activeAssets,
      inactiveAssets,
      vehicleCount,
      vesselCount,
      expiringInspections,
      overdueInspections,
      expiringInsurance,
      paidFees,
      unpaidFees,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get expiring items
router.get('/expiring', async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await prisma.compliance.findMany({
      where: {
        OR: [
          {
            inspectionExpiryDate: {
              gte: now,
              lte: thirtyDaysFromNow,
            },
          },
          {
            insuranceExpiryDate: {
              gte: now,
              lte: thirtyDaysFromNow,
            },
          },
        ],
      },
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
      orderBy: { inspectionExpiryDate: 'asc' },
    });

    res.json(expiringItems);
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// Get overdue items
router.get('/overdue', async (req: AuthRequest, res) => {
  try {
    const now = new Date();

    const overdueItems = await prisma.compliance.findMany({
      where: {
        OR: [
          {
            inspectionExpiryDate: {
              lt: now,
            },
          },
          {
            insuranceExpiryDate: {
              lt: now,
            },
          },
        ],
      },
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
      orderBy: { inspectionExpiryDate: 'asc' },
    });

    res.json(overdueItems);
  } catch (error) {
    console.error('Get overdue items error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue items' });
  }
});

export { router as dashboardRouter };
