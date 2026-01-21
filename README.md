# Fleet Registration & Compliance System

A comprehensive web application for managing vehicle and vessel registration, compliance tracking, fee management, and insurance monitoring.

## Features

### Core Modules
- **User Accounts & Roles**: Multi-level access control (Admin, Manager, User, Viewer)
- **Combined Asset Registry**: Unified inventory for vehicles and vessels
- **Compliance Tracking**: Monitor inspections, expiry dates, and worthiness
- **Fee & Insurance Management**: Track payment status and insurance coverage
- **Alerts & Notifications**: Automatic reminders for expiring items
- **Dashboards & Reports**: Real-time statistics and comprehensive reports
- **Audit Logs**: Full activity tracking for accountability

### Asset Management
- Support for multiple vehicle types: Car, Pickup, Truck, Bus, Motorcycle, Heavy equipment
- Support for multiple vessel types: Speedboat, Ferry, Cargo vessel, Fishing vessel, Yacht, Barge
- Track owner details, make/model, specifications, and operational status

### Compliance Features
- Road worthiness and sea worthiness tracking
- Inspection date and expiry management
- Annual fee payment tracking
- Insurance provider and policy monitoring
- Document management (certificates and uploads)

### Reporting
- Compliance summary by owner
- Revenue reports by period and category
- Insurance coverage status
- Inspection history tracking

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Deployment**: Docker, Docker Compose, Dokploy-ready

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+ (or use Docker)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Fleet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fleet_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (if you have migrations)
npx prisma migrate deploy
```

### 5. Run the application

Development mode (with hot reload):

```bash
# Terminal 1: Run the Express API server
npm run server

# Terminal 2: Run the Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Build Docker image only

```bash
docker build -t fleet-system .
```

## Deploying to Dokploy

### Option 1: Using Git Repository

1. Push your code to a Git repository
2. In Dokploy, create a new application
3. Connect your Git repository
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL`
5. Deploy

### Option 2: Using Docker Compose

1. In Dokploy, create a new Docker Compose application
2. Upload your `docker-compose.yml`
3. Set environment variables
4. Deploy

### Required Environment Variables for Dokploy

```env
DATABASE_URL=postgresql://user:password@postgres:5432/fleet_db?schema=public
JWT_SECRET=your-production-jwt-secret-here
PORT=3001
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## Database Schema

The system uses the following main models:

- **User**: User accounts with role-based access
- **Asset**: Vehicles and vessels registry
- **Compliance**: Worthiness, inspections, fees, insurance
- **Document**: Certificate and file uploads
- **Notification**: Alerts and reminders
- **AuditLog**: Activity tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Assets
- `GET /api/assets` - List all assets (with filters)
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Compliance
- `GET /api/compliance` - List compliance records
- `POST /api/compliance/:assetId` - Create/update compliance
- `PATCH /api/compliance/:assetId/fee-payment` - Update fee payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/expiring` - Get expiring items
- `GET /api/dashboard/overdue` - Get overdue items

### Reports
- `GET /api/reports/compliance-by-owner` - Compliance summary
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/insurance-coverage` - Insurance status
- `GET /api/reports/inspection-history/:assetId` - Inspection history

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/generate-alerts` - Generate alerts

## Default User Roles

- **ADMIN**: Full system access
- **MANAGER**: Manage assets and compliance
- **USER**: View and update assigned assets
- **VIEWER**: Read-only access

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Audit logging for all actions
- Data encryption at rest (PostgreSQL)
- Secure environment variable handling

## Development Commands

```bash
# Development
npm run dev              # Run Next.js dev server
npm run server          # Run Express API server

# Build
npm run build           # Build Next.js for production
npm start              # Run production server

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio

# Linting
npm run lint           # Run ESLint
```

## Monitoring and Maintenance

### Generate Compliance Alerts

You can set up a cron job to automatically generate alerts:

```bash
curl -X POST http://localhost:3001/api/notifications/generate-alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Backups

Regular PostgreSQL backups are recommended:

```bash
docker-compose exec postgres pg_dump -U fleet_user fleet_db > backup.sql
```

## Troubleshooting

### Database connection issues
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database credentials

### Port conflicts
- Change `PORT` in `.env` if 3001 is in use
- Update `NEXT_PUBLIC_API_URL` accordingly

### Prisma issues
- Run `npm run db:generate` after schema changes
- Clear `node_modules/.prisma` and regenerate if needed

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
