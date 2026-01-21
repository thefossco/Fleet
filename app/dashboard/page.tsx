'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  inactiveAssets: number;
  vehicleCount: number;
  vesselCount: number;
  expiringInspections: number;
  overdueInspections: number;
  expiringInsurance: number;
  paidFees: number;
  unpaidFees: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiRequest('/dashboard/stats');
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Assets */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">Total Assets</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats?.totalAssets || 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {stats?.vehicleCount || 0} vehicles, {stats?.vesselCount || 0} vessels
              </div>
            </div>
          </div>

          {/* Active Assets */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">Active Assets</p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">
                    {stats?.activeAssets || 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {stats?.inactiveAssets || 0} inactive
              </div>
            </div>
          </div>

          {/* Expiring Inspections */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">Expiring Soon</p>
                  <p className="mt-1 text-3xl font-semibold text-yellow-600">
                    {stats?.expiringInspections || 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Within 30 days
              </div>
            </div>
          </div>

          {/* Overdue Inspections */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">Overdue</p>
                  <p className="mt-1 text-3xl font-semibold text-red-600">
                    {stats?.overdueInspections || 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Requires attention
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
          {/* Fee Payment Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Payment Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600 font-semibold">{stats?.paidFees || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unpaid</span>
                <span className="text-red-600 font-semibold">{stats?.unpaidFees || 0}</span>
              </div>
            </div>
          </div>

          {/* Insurance Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expiring Soon</span>
                <span className="text-yellow-600 font-semibold">
                  {stats?.expiringInsurance || 0}
                </span>
              </div>
              <Link
                href="/compliance"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all compliance records →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/assets/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Asset
            </Link>
            <Link
              href="/compliance"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Update Compliance
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
