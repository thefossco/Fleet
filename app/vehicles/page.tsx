'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/api';

interface VehicleEntity {
  id: string;
  name?: string;
  entityType?: string;
  [key: string]: any;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState('10');
  const [hasSearched, setHasSearched] = useState(false);

  const searchVehicles = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      params.append('limit', limit);
      params.append('entityType', 'Vehicle');

      const data = await apiRequest(`/vehicle-api/search?${params.toString()}`);

      // Handle different response shapes from the CMMS API
      if (Array.isArray(data)) {
        setVehicles(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else if (data?.results && Array.isArray(data.results)) {
        setVehicles(data.results);
      } else if (data?.entities && Array.isArray(data.entities)) {
        setVehicles(data.entities);
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Get display-friendly keys from a vehicle object (exclude internal fields)
  const getDisplayFields = (vehicle: VehicleEntity) => {
    const skipKeys = new Set(['id', '__v', '_id', 'createdAt', 'updatedAt']);
    return Object.entries(vehicle).filter(
      ([key, value]) =>
        !skipKeys.has(key) && value !== null && value !== undefined && value !== ''
    );
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Search (CMMS)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search for vehicles from the external CMMS system
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <form onSubmit={searchVehicles} className="flex gap-4 items-end">
            <div className="flex-1">
              <label
                htmlFor="query"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Query
              </label>
              <input
                id="query"
                type="text"
                placeholder="e.g. MC 14"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-32">
              <label
                htmlFor="limit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Limit
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            Searching CMMS API...
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Results ({vehicles.length})
              </h3>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
                No vehicles found. Try a different search query.
              </div>
            ) : (
              <div className="grid gap-4">
                {vehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id || index}
                    className="bg-white shadow rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {vehicle.name || vehicle.registrationNumber || vehicle.label || `Vehicle ${index + 1}`}
                      </h4>
                      {vehicle.entityType && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {vehicle.entityType}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {getDisplayFields(vehicle).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-600">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}:
                          </span>{' '}
                          <span className="text-gray-900">
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">&#128269;</div>
            <p className="text-gray-500">
              Enter a search query above to find vehicles from the CMMS system.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
