'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/api';
import { format } from 'date-fns';

interface ComplianceRecord {
  id: string;
  assetId: string;
  worthinessType: string;
  inspectionDate: string | null;
  inspectionExpiryDate: string | null;
  annualFeeAmount: number | null;
  annualFeePaymentStatus: string;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiryDate: string | null;
  asset: {
    registrationNumber: string;
    ownerName: string;
    assetCategory: string;
    assetType: string;
  };
}

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCompliance();
  }, [filter]);

  const loadCompliance = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const data = await apiRequest(`/compliance?${params.toString()}`);
      setRecords(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { text: 'Not set', color: 'text-gray-500' };

    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    if (expiry < now) {
      return { text: 'Overdue', color: 'text-red-600' };
    } else if (expiry <= thirtyDays) {
      return { text: 'Expiring Soon', color: 'text-yellow-600' };
    } else {
      return { text: 'Valid', color: 'text-green-600' };
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Compliance Tracking</h2>
        </div>

        {/* Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('expiring')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'expiring'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expiring Soon
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Compliance Table */}
        {loading ? (
          <div className="text-center py-12">Loading compliance records...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worthiness
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspection Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insurance Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No compliance records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => {
                      const inspectionStatus = getExpiryStatus(record.inspectionExpiryDate);
                      const insuranceStatus = getExpiryStatus(record.insuranceExpiryDate);

                      return (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {record.asset.registrationNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.asset.assetCategory} - {record.asset.assetType}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.asset.ownerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.worthinessType.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.inspectionExpiryDate ? (
                              <div>
                                <div className="text-sm text-gray-900">
                                  {format(new Date(record.inspectionExpiryDate), 'MMM dd, yyyy')}
                                </div>
                                <div className={`text-sm font-medium ${inspectionStatus.color}`}>
                                  {inspectionStatus.text}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.insuranceExpiryDate ? (
                              <div>
                                <div className="text-sm text-gray-900">
                                  {format(new Date(record.insuranceExpiryDate), 'MMM dd, yyyy')}
                                </div>
                                <div className={`text-sm font-medium ${insuranceStatus.color}`}>
                                  {insuranceStatus.text}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.annualFeePaymentStatus === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.annualFeePaymentStatus}
                            </span>
                            {record.annualFeeAmount && (
                              <div className="text-sm text-gray-500 mt-1">
                                ${record.annualFeeAmount}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
