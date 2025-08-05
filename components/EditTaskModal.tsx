// components/EditTaskModal.tsx
import React, { memo } from 'react';
import { ServiceTask, EditFormData } from '@/types/service';
import { SERVICE_TYPES, PRIORITIES } from '@/constants/kanban';

interface EditTaskModalProps {
    isOpen: boolean;
    task: ServiceTask | null;
    formData: EditFormData;
    updating: boolean;
    onClose: () => void;
    onSave: () => void;
    onInputChange: (field: string, value: string) => void;
}

const EditTaskModal = memo(({
                                isOpen,
                                task,
                                formData,
                                updating,
                                onClose,
                                onSave,
                                onInputChange
                            }: EditTaskModalProps) => {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-modal rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 glass-dark rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">✏️ Edit Service Task</h2>
                    <button
                        onClick={onClose}
                        className="glass-button text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white text-2xl p-2 rounded-lg transition-all duration-200"
                        disabled={updating}
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Customer Information Section */}
                    <FormSection title="👤 Customer Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Customer Name *"
                                type="text"
                                value={formData.customerName || ''}
                                onChange={(value) => onInputChange('customerName', value)}
                                disabled={updating}
                            />
                            <FormField
                                label="Phone *"
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(value) => onInputChange('phone', value)}
                                disabled={updating}
                            />
                            <div className="md:col-span-2">
                                <FormField
                                    label="Email (Read-only)"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={() => {}}
                                    disabled={true}
                                    readonly
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Item Information Section */}
                    <FormSection title="🚲 Item Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Item Model/Brand"
                                type="text"
                                value={formData.bikeModel || ''}
                                onChange={(value) => onInputChange('bikeModel', value)}
                                disabled={updating}
                            />
                            <FormField
                                label="Serial Number"
                                type="text"
                                value={formData.serialNumber || ''}
                                onChange={(value) => onInputChange('serialNumber', value)}
                                disabled={updating}
                            />
                        </div>
                    </FormSection>

                    {/* Service Information Section */}
                    <FormSection title="🔧 Service Information">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect
                                    label="Service Type *"
                                    value={formData.serviceType || ''}
                                    onChange={(value) => onInputChange('serviceType', value)}
                                    disabled={updating}
                                    options={[
                                        { value: '', label: 'Select a service type' },
                                        ...SERVICE_TYPES.map(type => ({ value: type, label: type }))
                                    ]}
                                />
                                <FormSelect
                                    label="Priority"
                                    value={formData.priority || 'NORMAL'}
                                    onChange={(value) => onInputChange('priority', value)}
                                    disabled={updating}
                                    options={PRIORITIES.map(priority => ({ value: priority, label: priority }))}
                                />
                            </div>
                            <FormField
                                label="Estimated Cost"
                                type="number"
                                step="0.01"
                                value={formData.estimatedCost || ''}
                                onChange={(value) => onInputChange('estimatedCost', value)}
                                disabled={updating}
                                placeholder="0.00"
                            />
                            <FormTextArea
                                label="Additional Notes"
                                value={formData.notes || ''}
                                onChange={(value) => onInputChange('notes', value)}
                                disabled={updating}
                                placeholder="Enter any additional notes about the service request..."
                                rows={4}
                            />
                        </div>
                    </FormSection>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600 glass-dark rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                        disabled={updating}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="glass-button px-6 py-2 bg-blue-600 dark:bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                        disabled={updating}
                    >
                        {updating ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
});

EditTaskModal.displayName = 'EditTaskModal';

// Helper Components
interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

const FormSection = memo(({ title, children }: FormSectionProps) => (
    <div className="glass-effect rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
    </div>
));

FormSection.displayName = 'FormSection';

interface FormFieldProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    step?: string;
}

const FormField = memo(({ label, type, value, onChange, disabled, readonly, placeholder, step }: FormFieldProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white ${
                readonly ? 'glass-dark' : 'glass-effect'
            }`}
            disabled={disabled}
            placeholder={placeholder}
            step={step}
        />
    </div>
));

FormField.displayName = 'FormField';

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    options: { value: string; label: string }[];
}

const FormSelect = memo(({ label, value, onChange, disabled, options }: FormSelectProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            disabled={disabled}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
));

FormSelect.displayName = 'FormSelect';

interface FormTextAreaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
}

const FormTextArea = memo(({ label, value, onChange, disabled, placeholder, rows }: FormTextAreaProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="glass-effect w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            placeholder={placeholder}
            disabled={disabled}
        />
    </div>
));

FormTextArea.displayName = 'FormTextArea';

export default EditTaskModal;