'use client';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    bikes: Array<{
        id: string;
        model: string;
        brand: string;
        serialNumber: string;
    }>;
}

export default function IntakeForm() {
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        bikeModel: '', // Maps to itemModel in backend
        serialNumber: '',
        serviceType: '',
        notes: '',
        estimatedCost: '',
        priority: 'NORMAL'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newServiceTaskId, setNewServiceTaskId] = useState<string | null>(null);

    // Customer search functionality
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const router = useRouter();

    const serviceTypes = [
        'Basic Tune-Up',
        'Full Service',
        'Brake Adjustment',
        'Gear Adjustment',
        'Wheel True',
        'Chain/Cassette Replacement',
        'Flat Tire Repair',
        'Custom Build',
        'Diagnostic',
        'Warranty Work',
        'Other'
    ];

    const priorities = [
        {value: 'LOW', label: 'Low', color: 'text-green-600'},
        {value: 'NORMAL', label: 'Normal', color: 'text-gray-600'},
        {value: 'HIGH', label: 'High', color: 'text-orange-600'},
        {value: 'URGENT', label: 'Urgent', color: 'text-red-600'}
    ];

    // Search for existing customers
    const searchCustomers = async (query: string) => {
        if (query.length < 2) {
            setCustomerSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setCustomerSuggestions(data.customers || []);
            }
        } catch (err) {
            console.error('Error searching customers:', err);
        }
    };

    // Handle customer search input
    const handleCustomerSearchChange = (value: string) => {
        setCustomerSearch(value);
        setSelectedCustomer(null);

        // Update form data with search value
        setFormData(prev => ({
            ...prev,
            customerName: value
        }));

        // Search for customers
        searchCustomers(value);
        setShowSuggestions(true);
    };

    // Select a customer from suggestions
    const selectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.name);
        setShowSuggestions(false);

        // Pre-fill form with customer data
        setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            email: customer.email,
            phone: customer.phone
        }));
    };

    // Select an item from customer's previous items
    const selectItem = (item: any) => {
        setFormData(prev => ({
            ...prev,
            bikeModel: item.model || '',
            serialNumber: item.serialNumber || ''
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        // Special handling for customer name to trigger search
        if (name === 'customerName') {
            handleCustomerSearchChange(value);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (printLabel = false) => {
        // Basic validation
        if (!formData.customerName || !formData.email || !formData.phone || !formData.serviceType) {
            setError('Please fill in all required fields: Customer Name, Email, Phone, and Service Type');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/service-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create service task');
            }

            const result = await response.json();
            setNewServiceTaskId(result.serviceJob.id);
            setSuccess(true);

            if (printLabel) {
                // Call label printing API
                try {
                    const labelResponse = await fetch('/api/labels', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            taskId: result.serviceJob.id,
                            labelType: 'SERVICE_TAG',
                            printerName: 'Default Printer'
                        }),
                    });

                    if (!labelResponse.ok) {
                        console.warn('Label printing failed, but task was created successfully');
                    }
                } catch (labelError) {
                    console.warn('Label printing error:', labelError);
                }
            }

            // Reset form
            setFormData({
                customerName: '',
                email: '',
                phone: '',
                bikeModel: '',
                serialNumber: '',
                serviceType: '',
                notes: '',
                estimatedCost: '',
                priority: 'NORMAL'
            });
            setSelectedCustomer(null);
            setCustomerSearch('');

        } catch (err) {
            console.error('Error creating service task:', err);
            setError(err instanceof Error ? err.message : 'Failed to create service task');
        } finally {
            setLoading(false);
        }
    };

    // Auto-hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div
                            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Task Created Successfully!</h2>

                        {newServiceTaskId && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-2">Service Task ID:</p>
                                <code
                                    className="text-lg font-mono bg-white px-3 py-2 rounded border text-blue-600 font-bold">
                                    #{newServiceTaskId.slice(-8)}
                                </code>
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            The service request has been added to your dashboard and is ready for processing.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                Create Another Service Task
                            </button>
                            <button
                                onClick={() => router.push('/protected/dashboard')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div
                className="absolute top-10 left-10 w-32 h-32 glass-effect rounded-full floating-element opacity-10"></div>
            <div
                className="absolute top-1/2 right-10 w-24 h-24 glass-effect rounded-full floating-slow opacity-15"></div>
            <div
                className="absolute bottom-20 left-1/4 w-20 h-20 glass-effect rounded-full floating-fast opacity-20"></div>

            <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="glass-card rounded-xl shadow-2xl p-8">
                    {/* Header Section */}
                    <div className="mb-8 glass-effect rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                            <span className="mr-3">📝</span>
                            Service Intake
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">Create a new service request for a customer's
                            bike</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="glass-effect border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <div
                                className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Customer Information */}
                        <div className="glass-effect rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                <span className="mr-2">👤</span>
                                Customer Information
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative">
                                    <label htmlFor="customerName"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Customer Name * {selectedCustomer && <span
                                        className="text-green-600 dark:text-green-400 text-xs">(Existing Customer)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="customerName"
                                        name="customerName"
                                        value={customerSearch}
                                        onChange={(e) => handleCustomerSearchChange(e.target.value)}
                                        onFocus={() => customerSuggestions.length > 0 && setShowSuggestions(true)}
                                        className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Start typing to search existing customers..."
                                        disabled={loading}
                                    />

                                    {/* Customer Suggestions Dropdown */}
                                    {showSuggestions && customerSuggestions.length > 0 && (
                                        <div
                                            className="absolute z-50 w-full mt-1 glass-modal rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                                            {customerSuggestions.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectCustomer(customer);
                                                    }}
                                                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-200"
                                                >
                                                    <div
                                                        className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                                                    <div
                                                        className="text-sm text-gray-600 dark:text-gray-300">{customer.email} • {customer.phone}</div>
                                                    {customer.bikes.length > 0 && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {customer.bikes.length} item{customer.bikes.length !== 1 ? 's' : ''} on
                                                            file
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email"
                                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            placeholder="john@example.com"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone"
                                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            placeholder="(555) 123-4567"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Show existing items for selected customer */}
                            {selectedCustomer && selectedCustomer.bikes.length > 0 && (
                                <div
                                    className="mt-4 glass-effect rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                                        <span className="mr-2">🚲</span>
                                        Previous Items for {selectedCustomer.name}:
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedCustomer.bikes.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => selectItem(item)}
                                                className="glass-button flex justify-between items-center p-3 rounded-lg hover:scale-105 cursor-pointer transition-all duration-200"
                                            >
                                                <div>
                                                    <span
                                                        className="font-medium text-gray-900 dark:text-white">{item.model}</span>
                                                    {item.serialNumber && (
                                                        <span
                                                            className="text-gray-500 dark:text-gray-400 text-sm ml-2">#{item.serialNumber}</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 font-medium">Select
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bike Information */}
                        <div className="glass-effect rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                <span className="mr-2">🚲</span>
                                Bike Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bikeModel"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bike Model/Brand
                                    </label>
                                    <input
                                        type="text"
                                        id="bikeModel"
                                        name="bikeModel"
                                        value={formData.bikeModel}
                                        onChange={handleInputChange}
                                        className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="Trek Domane AL 2"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="serialNumber"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        id="serialNumber"
                                        name="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={handleInputChange}
                                        className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="WTU123456789"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Information */}
                        <div className="glass-effect rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                <span className="mr-2">🔧</span>
                                Service Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="serviceType"
                                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Service Type *
                                        </label>
                                        <select
                                            id="serviceType"
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={handleInputChange}
                                            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                            disabled={loading}
                                        >
                                            <option value="">Select a service type</option>
                                            {serviceTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="priority"
                                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                                            disabled={loading}
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority.value} value={priority.value}>
                                                    {priority.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="estimatedCost"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Estimated Cost
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="estimatedCost"
                                        name="estimatedCost"
                                        value={formData.estimatedCost}
                                        onChange={handleInputChange}
                                        className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                        placeholder="0.00"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes"
                                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Description / Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                        placeholder="Describe the issue or service requested..."
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="glass-effect rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    className="glass-button bg-gray-600 dark:bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">📋</span>
                                            Create Service Task
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                    className="glass-button bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">🖨️</span>
                                            Create & Print Label
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}