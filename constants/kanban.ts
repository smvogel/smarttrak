// constants/kanban.ts
import { StatusConfig, Priority } from '@/types/service';

export const TASK_STATUSES: StatusConfig[] = [
    {
        key: 'FUTURE',
        label: 'Future',
        color: 'bg-gray-100 border-gray-300',
        borderColor: '#6b7280'
    },
    {
        key: 'IN_SHOP',
        label: 'In Shop',
        color: 'bg-blue-50 border-blue-300',
        borderColor: '#3b82f6'
    },
    {
        key: 'IN_PROGRESS',
        label: 'In Progress',
        color: 'bg-yellow-50 border-yellow-300',
        borderColor: '#f59e0b'
    },
    {
        key: 'COMPLETED',
        label: 'Completed',
        color: 'bg-green-50 border-green-300',
        borderColor: '#10b981'
    },
    {
        key: 'CLOSED',
        label: 'Closed',
        color: 'bg-gray-50 border-gray-200',
        borderColor: '#6b7280'
    }
];

export const SERVICE_TYPES = [
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

export const PRIORITIES: Priority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export const PRIORITY_COLORS = {
    URGENT: 'text-red-600 dark:text-red-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    LOW: 'text-green-600 dark:text-green-400',
    NORMAL: 'text-gray-600 dark:text-gray-400'
} as const;