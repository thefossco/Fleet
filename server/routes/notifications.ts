import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get all notifications for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { unreadOnly } = req.query;

    const where: any = { userId: req.user!.id };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(notification);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.post('/mark-all-read', async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Generate alerts for expiring items (called by cron job or manually)
router.post('/generate-alerts', async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find expiring inspections
    const expiringInspections = await prisma.compliance.findMany({
      where: {
        inspectionExpiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        asset: true,
      },
    });

    // Find expiring insurance
    const expiringInsurance = await prisma.compliance.findMany({
      where: {
        insuranceExpiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        asset: true,
      },
    });

    // Find overdue items
    const overdueInspections = await prisma.compliance.findMany({
      where: {
        inspectionExpiryDate: {
          lt: now,
        },
      },
      include: {
        asset: true,
      },
    });

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
      },
    });

    let notificationCount = 0;

    // Create notifications for each admin
    for (const user of adminUsers) {
      // Expiring inspections
      for (const item of expiringInspections) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'INSPECTION_EXPIRING',
            title: 'Inspection Expiring Soon',
            message: `${item.asset.assetCategory} ${item.asset.registrationNumber} inspection expires on ${item.inspectionExpiryDate?.toLocaleDateString()}`,
            relatedAssetId: item.assetId,
          },
        });
        notificationCount++;
      }

      // Expiring insurance
      for (const item of expiringInsurance) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'INSURANCE_EXPIRING',
            title: 'Insurance Expiring Soon',
            message: `${item.asset.assetCategory} ${item.asset.registrationNumber} insurance expires on ${item.insuranceExpiryDate?.toLocaleDateString()}`,
            relatedAssetId: item.assetId,
          },
        });
        notificationCount++;
      }

      // Overdue inspections
      for (const item of overdueInspections) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'INSPECTION_OVERDUE',
            title: 'Inspection Overdue',
            message: `${item.asset.assetCategory} ${item.asset.registrationNumber} inspection is overdue since ${item.inspectionExpiryDate?.toLocaleDateString()}`,
            relatedAssetId: item.assetId,
          },
        });
        notificationCount++;
      }
    }

    res.json({
      message: `Generated ${notificationCount} notifications`,
      expiringInspections: expiringInspections.length,
      expiringInsurance: expiringInsurance.length,
      overdueInspections: overdueInspections.length,
    });
  } catch (error) {
    console.error('Generate alerts error:', error);
    res.status(500).json({ error: 'Failed to generate alerts' });
  }
});

export { router as notificationsRouter };
