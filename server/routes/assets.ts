import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all assets with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { category, type, status, search } = req.query;

    const where: any = {};

    if (category) where.assetCategory = category;
    if (type) where.assetType = type;
    if (status) where.operationalStatus = status;
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search as string, mode: 'insensitive' } },
        { ownerName: { contains: search as string, mode: 'insensitive' } },
        { makeModel: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        compliance: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get single asset
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        compliance: true,
        documents: true,
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create asset
router.post('/', async (req: AuthRequest, res) => {
  try {
    const assetData = req.body;

    const asset = await prisma.asset.create({
      data: {
        ...assetData,
        createdById: req.user!.id,
      },
      include: {
        compliance: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_CREATED',
        userId: req.user!.id,
        assetId: asset.id,
        details: { registrationNumber: asset.registrationNumber, category: asset.assetCategory },
      },
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        compliance: true,
        documents: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_UPDATED',
        userId: req.user!.id,
        assetId: asset.id,
        details: { changes: Object.keys(updateData) },
      },
    });

    res.json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.asset.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_DELETED',
        userId: req.user!.id,
        assetId: id,
        details: {},
      },
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export { router as assetsRouter };
