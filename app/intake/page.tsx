'use client';
import { useState } from 'react';

export default function IntakeForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    bikeModel: '',
    serialNumber: '',
    serviceType: '',
    notes: ''
  });

  const serviceTypes = [
    'Basic Tune-Up',
    'Full Service',
    'Brake Adjustment',
    'Gear Adjustment',
    'Wheel True',
    'Chain/Cassette Replacement',
    'Flat Tire Repair',
    'Custom Build',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (printLabel = false) => {
    // Basic validation
    if (!formData.customerName || !formData.email || !formData.phone || !formData.serviceType) {
      alert('Please fill in all required fields');
      return;
    }

    // TODO: Connect to API
    console.log('Service task created:', formData);
    
    if (printLabel) {
      console.log('Printing label for new service task');
      alert('Service task created successfully! Label is printing...');
    } else {
      alert('Service task created successfully!');
    }
    
    // Reset form
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      bikeModel: '',
      serialNumber: '',
      serviceType: '',
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Intake</h1>
            <p className="text-gray-600">Create a new service request for a customer's bike</p>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bike Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bike Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bikeModel" className="block text-sm font-medium text-gray-700 mb-1">
                    Bike Model/Brand
                  </label>
                  <input
                    type="text"
                    id="bikeModel"
                    name="bikeModel"
                    value={formData.bikeModel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Trek Domane AL 2"
                  />
                </div>

                <div>
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="WTU123456789"
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer reported chain skipping in 3rd gear. Left brake lever feels spongy..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSubmit(false)}
                className="bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 font-medium"
              >
                Create Service Task
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
              >
                Create Service Task & Print Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}