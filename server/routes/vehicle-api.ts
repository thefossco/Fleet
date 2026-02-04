import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const CMMS_API_BASE_URL = process.env.CMMS_API_BASE_URL || 'https://dev-api-cmms.mtcc.com.mv';
const CMMS_API_TOKEN = process.env.CMMS_API_TOKEN || '471c310ab18f98f7afe47d1b311cd60217e485fca4e8a2c0';

// All routes require authentication
router.use(authenticateToken);

// Search vehicles from external CMMS API
router.get('/search', async (req: AuthRequest, res) => {
  try {
    const { query, limit, entityType } = req.query;

    const params = new URLSearchParams();
    params.append('entityType', (entityType as string) || 'Vehicle');
    params.append('limit', (limit as string) || '10');
    if (query) {
      params.append('query', query as string);
    }

    const url = `${CMMS_API_BASE_URL}/entity/search?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': CMMS_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CMMS API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `CMMS API returned ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Vehicle API search error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles from CMMS API' });
  }
});

// Get a single vehicle by ID from external CMMS API
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const entityId = req.params.id as string;

    const url = `${CMMS_API_BASE_URL}/entity/${entityId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': CMMS_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CMMS API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `CMMS API returned ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Vehicle API get error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle from CMMS API' });
  }
});

export { router as vehicleApiRouter };
