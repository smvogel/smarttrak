// components/DeleteConfirmModal.tsx
import React, { memo } from 'react';
import { ServiceTask } from '@/types/service';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    task: ServiceTask | null;
    deleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmModal = memo(({
                                            isOpen,
                                            task,
                                            deleting,
                                            onCancel,
                                            onConfirm
                                        }: DeleteConfirmModalProps) => {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-modal rounded-xl shadow-2xl max-w-md w-full">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-600 glass-dark rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">🗑️ Delete Service Task</h2>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-12 h-12 mx-auto glass-effect rounded-full flex items-center justify-center border border-red-200 dark:border-red-800">
                            <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete this service task?
                        </p>
                        <div className="glass-effect rounded-lg p-4 mt-4">
                            <p className="font-semibold text-gray-900 dark:text-white">{task.customerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{task.serviceType}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{task.bikeModel}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">#{task.id.slice(-8)}</p>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-4 font-medium">
                            ⚠️ This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600 glass-dark rounded-b-xl">
                    <button
                        onClick={onCancel}
                        className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                        disabled={deleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="glass-button px-6 py-2 bg-red-600 dark:bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-all duration-200"
                        disabled={deleting}
                    >
                        {deleting ? '⏳ Deleting...' : '🗑️ Delete Task'}
                    </button>
                </div>
            </div>
        </div>
    );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';