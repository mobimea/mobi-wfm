import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Building2,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { Location } from '../types';

interface ExtendedLocation extends Location {
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  operating_hours?: string;
  status?: 'active' | 'inactive';
}

interface FieldOperationsProps {
  employees: any[];
  locations: ExtendedLocation[];
  attendance: any[];
  addLocation: (location: ExtendedLocation) => Promise<void>;
  editLocation: (locationId: string, updates: Partial<ExtendedLocation>) => Promise<void>;
  removeLocation: (locationId: string) => Promise<void>;
}

const FieldOperations: React.FC<FieldOperationsProps> = ({
  employees,
  locations,
  attendance,
  addLocation,
  editLocation,
  removeLocation
}: FieldOperationsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ExtendedLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    manager_name: '',
    operating_hours: '',
    status: 'active'
  });

  // Filter locations based on search
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      manager_name: '',
      operating_hours: '',
      status: 'active'
    });
    setEditingLocation(null);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (location: ExtendedLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city || '',
      state: location.state || '',
      zip_code: location.zip_code || '',
      phone: location.phone || '',
      email: location.email || '',
      manager_name: location.manager_name || '',
      operating_hours: location.operating_hours || '',
      status: location.status || 'active'
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingLocation) {
        await editLocation(editingLocation.id, {
          ...formData,
          status: formData.status as 'active' | 'inactive'
        });
        setSuccess('Location updated successfully!');
      } else {
        const newLocation = {
          id: crypto.randomUUID(),
          lat: 0,
          lng: 0,
          geofence_radius: 100,
          created_at: new Date().toISOString(),
          ...formData,
          status: formData.status as 'active' | 'inactive'
        };
        await addLocation(newLocation as ExtendedLocation);
        setSuccess('Location added successfully!');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving location:', error);
      setError(error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (location: Location) => {
    if (!window.confirm(`Are you sure you want to delete ${location.name}?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await removeLocation(location.id);
      setSuccess(`${location.name} has been deleted successfully!`);
    } catch (error: any) {
      console.error('Error deleting location:', error);
      setError(error.message || 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const getLocationStats = (location: Location) => {
    const locationEmployees = employees.filter(emp => emp.primary_location_id === location.id);
    const locationAttendance = attendance.filter(att => {
      const employee = employees.find(emp => emp.id === att.employee_id);
      return employee?.primary_location_id === location.id;
    });

    const today = new Date().toDateString();
    const todayAttendance = locationAttendance.filter(att => new Date(att.date).toDateString() === today);

    return {
      totalEmployees: locationEmployees.length,
      todayAttendance: todayAttendance.length
    };
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-blue-600" />
            Field Operations
          </h1>
          <p className="text-gray-600">Manage locations and field operations</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Filter size={16} />
            Showing {filteredLocations.length} of {locations.length} locations
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>

          {filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-600">
                {locations.length === 0
                  ? "Get started by adding your first location."
                  : "Try adjusting your search filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLocations.map((location) => {
                const stats = getLocationStats(location);

                return (
                  <div key={location.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-600">{location.city || 'N/A'}, {location.state || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {location.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        {location.address}
                      </div>

                      {location.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {location.phone}
                        </div>
                      )}

                      {location.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {location.email}
                        </div>
                      )}

                      {location.operating_hours && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} />
                          {location.operating_hours}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{stats.totalEmployees}</div>
                        <div className="text-xs text-gray-600">Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{stats.todayAttendance}</div>
                        <div className="text-xs text-gray-600">Today Check-ins</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Location"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(location)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Location Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingLocation ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    editingLocation ? 'Update Location' : 'Add Location'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOperations;
