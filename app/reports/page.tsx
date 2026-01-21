'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/api';

interface ComplianceByOwner {
  ownerName: string;
  ownerContact: string;
  totalAssets: number;
  compliant: number;
  expiring: number;
  overdue: number;
}

interface RevenueData {
  totalRevenue: number;
  totalPaidAssets: number;
  byCategory: {
    category: string;
    revenue: number;
    count: number;
  }[];
}

interface InsuranceCoverage {
  total: number;
  covered: number;
  expired: number;
  noInsurance: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('compliance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [complianceData, setComplianceData] = useState<ComplianceByOwner[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [insuranceData, setInsuranceData] = useState<InsuranceCoverage | null>(null);

  useEffect(() => {
    loadReportData();
  }, [activeTab]);

  const loadReportData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'compliance') {
        const data = await apiRequest('/reports/compliance-by-owner');
        setComplianceData(data);
      } else if (activeTab === 'revenue') {
        const data = await apiRequest('/reports/revenue');
        setRevenueData(data);
      } else if (activeTab === 'insurance') {
        const data = await apiRequest('/reports/insurance-coverage');
        setInsuranceData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('compliance')}
                className={`${
                  activeTab === 'compliance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Compliance by Owner
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`${
                  activeTab === 'revenue'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Revenue Report
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className={`${
                  activeTab === 'insurance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Insurance Coverage
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading report...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
              <>
                {/* Compliance by Owner */}
                {activeTab === 'compliance' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Compliance Summary by Owner
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Total Assets
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Compliant
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Expiring
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Overdue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {complianceData.map((owner, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {owner.ownerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {owner.ownerContact}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                {owner.totalAssets}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                                {owner.compliant}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600">
                                {owner.expiring}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                                {owner.overdue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Revenue Report */}
                {activeTab === 'revenue' && revenueData && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Report</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                      <div className="bg-blue-50 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-blue-600">
                          ${revenueData.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          From {revenueData.totalPaidAssets} paid assets
                        </p>
                      </div>
                    </div>

                    <h4 className="text-md font-medium text-gray-900 mb-3">Revenue by Category</h4>
                    <div className="space-y-3">
                      {revenueData.byCategory.map((cat, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{cat.category}</p>
                              <p className="text-sm text-gray-600">{cat.count} assets</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              ${cat.revenue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insurance Coverage */}
                {activeTab === 'insurance' && insuranceData && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Insurance Coverage Status
                    </h3>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                        <p className="text-3xl font-bold text-gray-900">{insuranceData.total}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">Covered</p>
                        <p className="text-3xl font-bold text-green-600">{insuranceData.covered}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {((insuranceData.covered / insuranceData.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">Expired</p>
                        <p className="text-3xl font-bold text-red-600">{insuranceData.expired}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {((insuranceData.expired / insuranceData.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">No Insurance</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {insuranceData.noInsurance}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {((insuranceData.noInsurance / insuranceData.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
