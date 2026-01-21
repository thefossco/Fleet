import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { assetsRouter } from './routes/assets';
import { complianceRouter } from './routes/compliance';
import { dashboardRouter } from './routes/dashboard';
import { reportsRouter } from './routes/reports';
import { notificationsRouter } from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
