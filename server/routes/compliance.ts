import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get compliance records
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { assetId, status } = req.query;

    const where: any = {};
    if (assetId) where.assetId = assetId;

    const compliance = await prisma.compliance.findMany({
      where,
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

    // Filter by status if provided
    let filtered = compliance;
    if (status === 'overdue') {
      filtered = compliance.filter(c =>
        c.inspectionExpiryDate && new Date(c.inspectionExpiryDate) < new Date()
      );
    } else if (status === 'expiring') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = compliance.filter(c =>
        c.inspectionExpiryDate &&
        new Date(c.inspectionExpiryDate) <= thirtyDaysFromNow &&
        new Date(c.inspectionExpiryDate) >= new Date()
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Get compliance error:', error);
    res.status(500).json({ error: 'Failed to fetch compliance records' });
  }
});

// Create/Update compliance for an asset
router.post('/:assetId', async (req: AuthRequest, res) => {
  try {
    const { assetId } = req.params;
    const complianceData = req.body;

    // Check if compliance exists
    const existing = await prisma.compliance.findUnique({
      where: { assetId },
    });

    let compliance;
    if (existing) {
      compliance = await prisma.compliance.update({
        where: { assetId },
        data: complianceData,
      });
    } else {
      compliance = await prisma.compliance.create({
        data: {
          ...complianceData,
          assetId,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: existing ? 'COMPLIANCE_UPDATED' : 'COMPLIANCE_CREATED',
        userId: req.user!.id,
        assetId,
        details: complianceData,
      },
    });

    res.json(compliance);
  } catch (error) {
    console.error('Save compliance error:', error);
    res.status(500).json({ error: 'Failed to save compliance' });
  }
});

// Update fee payment status
router.patch('/:assetId/fee-payment', async (req: AuthRequest, res) => {
  try {
    const { assetId } = req.params;
    const { annualFeePaymentStatus, annualFeeAmount } = req.body;

    const compliance = await prisma.compliance.update({
      where: { assetId },
      data: {
        annualFeePaymentStatus,
        annualFeeAmount,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'FEE_PAYMENT_UPDATED',
        userId: req.user!.id,
        assetId,
        details: { status: annualFeePaymentStatus, amount: annualFeeAmount },
      },
    });

    res.json(compliance);
  } catch (error) {
    console.error('Update fee payment error:', error);
    res.status(500).json({ error: 'Failed to update fee payment' });
  }
});

export { router as complianceRouter };
