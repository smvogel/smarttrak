// types/service.ts
export interface ServiceTask {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    bikeModel: string;
    serialNumber: string;
    serviceType: string;
    status: TaskStatus;
    createdAt: string;
    notes: string;
    estimatedCost?: string;
    actualCost?: string;
    priority?: Priority;
    assignedTo?: string;
}

export type TaskStatus = 'FUTURE' | 'IN_SHOP' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED' | 'ON_HOLD';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface StatusConfig {
    key: TaskStatus;
    label: string;
    color: string;
    borderColor: string;
}

export interface EditFormData {
    customerName: string;
    email: string;
    phone: string;
    bikeModel: string;
    serialNumber: string;
    serviceType: string;
    notes: string;
    estimatedCost: string;
    priority: Priority;
}