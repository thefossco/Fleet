'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/api';

const VEHICLE_TYPES = ['Car', 'Pickup', 'Truck', 'Bus', 'Motorcycle', 'Heavy equipment'];
const VESSEL_TYPES = ['Speedboat', 'Ferry', 'Cargo vessel', 'Fishing vessel', 'Yacht', 'Barge'];

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assetCategory: 'VEHICLE',
    assetType: '',
    registrationNumber: '',
    ownerName: '',
    ownerContact: '',
    makeModel: '',
    yearOfManufacture: new Date().getFullYear(),
    engineOrFuelType: '',
    engineCapacity: '',
    vesselLength: '',
    vesselTonnage: '',
    operationalStatus: 'ACTIVE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset type when category changes
      ...(name === 'assetCategory' ? { assetType: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clean up data based on category
      const cleanedData = {
        ...formData,
        yearOfManufacture: parseInt(formData.yearOfManufacture.toString()),
        engineCapacity: formData.assetCategory === 'VEHICLE' ? formData.engineCapacity : undefined,
        vesselLength: formData.assetCategory === 'VESSEL' ? parseFloat(formData.vesselLength) || undefined : undefined,
        vesselTonnage: formData.assetCategory === 'VESSEL' ? parseFloat(formData.vesselTonnage) || undefined : undefined,
      };

      await apiRequest('/assets', {
        method: 'POST',
        body: JSON.stringify(cleanedData),
      });

      router.push('/assets');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assetTypes = formData.assetCategory === 'VEHICLE' ? VEHICLE_TYPES : VESSEL_TYPES;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Asset</h2>
          <p className="mt-1 text-sm text-gray-600">
            Register a new vehicle or vessel in the system
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 max-w-3xl">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asset Category and Type */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Category *
                </label>
                <select
                  name="assetCategory"
                  value={formData.assetCategory}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="VEHICLE">Vehicle</option>
                  <option value="VESSEL">Vessel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type *
                </label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select type...</option>
                  {assetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Owner Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Contact *
                </label>
                <input
                  type="text"
                  name="ownerContact"
                  value={formData.ownerContact}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make and Model *
                </label>
                <input
                  type="text"
                  name="makeModel"
                  value={formData.makeModel}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Manufacture *
                </label>
                <input
                  type="number"
                  name="yearOfManufacture"
                  value={formData.yearOfManufacture}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine or Fuel Type
              </label>
              <input
                type="text"
                name="engineOrFuelType"
                value={formData.engineOrFuelType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Category-specific fields */}
            {formData.assetCategory === 'VEHICLE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Capacity (e.g., 2.0L, 1500cc)
                </label>
                <input
                  type="text"
                  name="engineCapacity"
                  value={formData.engineCapacity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}

            {formData.assetCategory === 'VESSEL' && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vesselLength"
                    value={formData.vesselLength}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tonnage
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vesselTonnage"
                    value={formData.vesselTonnage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Operational Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operational Status
              </label>
              <select
                name="operationalStatus"
                value={formData.operationalStatus}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/assets')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
