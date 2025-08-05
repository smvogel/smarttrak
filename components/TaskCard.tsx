// components/TaskCard.tsx
import React, { useState, useEffect, memo } from 'react';
import { ServiceTask } from '@/types/service';
import { PRIORITY_COLORS } from '@/constants/kanban';

interface TaskCardProps {
    task: ServiceTask;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPrintLabel: () => void;
    onDragStart: (e: React.DragEvent) => void;
}

const TaskCard = memo(({
                           task,
                           isCollapsed,
                           onToggleCollapse,
                           onEdit,
                           onDelete,
                           onPrintLabel,
                           onDragStart
                       }: TaskCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority?: string) => {
        return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.NORMAL;
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest(`[data-menu-id="${task.id}"]`)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isMenuOpen, task.id]);

    const handleMenuAction = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="glass-card rounded-lg p-4 cursor-move hover:shadow-lg transition-all duration-300 group relative"
        >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {task.customerName}
                    </h3>
                    {task.priority && task.priority !== 'NORMAL' && (
                        <span className={`inline-block text-xs font-medium px-2 py-1 mt-1 rounded-full glass-effect ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                    )}
                </div>

                {/* Three-Dot Menu */}
                <TaskMenu
                    task={task}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    isCollapsed={isCollapsed}
                    onMenuAction={handleMenuAction}
                    onToggleCollapse={onToggleCollapse}
                    onEdit={onEdit}
                    onPrintLabel={onPrintLabel}
                    onDelete={onDelete}
                />
            </div>

            {/* Card Content */}
            {isCollapsed ? (
                <CollapsedView task={task} />
            ) : (
                <ExpandedView task={task} formatDate={formatDate} />
            )}
        </div>
    );
});

TaskCard.displayName = 'TaskCard';

// Extracted Menu Component
interface TaskMenuProps {
    task: ServiceTask;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    isCollapsed: boolean;
    onMenuAction: (action: () => void) => void;
    onToggleCollapse: () => void;
    onEdit: () => void;
    onPrintLabel: () => void;
    onDelete: () => void;
}

const TaskMenu = memo(({
                           task,
                           isMenuOpen,
                           setIsMenuOpen,
                           isCollapsed,
                           onMenuAction,
                           onToggleCollapse,
                           onEdit,
                           onPrintLabel,
                           onDelete
                       }: TaskMenuProps) => (
    <div className="relative flex-shrink-0" data-menu-id={task.id}>
        <button
            onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
            }}
            className="glass-button text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center w-8 h-8"
            title="Actions"
        >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
        </button>

        {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 glass-modal rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 min-w-[160px] z-50">
                <div className="py-1">
                    <MenuButton
                        onClick={() => onMenuAction(onToggleCollapse)}
                        icon={isCollapsed ? '📖' : '📕'}
                        text={isCollapsed ? 'Expand' : 'Collapse'}
                    />
                    <MenuButton
                        onClick={() => onMenuAction(onEdit)}
                        icon="✏️"
                        text="Edit Task"
                    />
                    <MenuButton
                        onClick={() => onMenuAction(onPrintLabel)}
                        icon="🖨️"
                        text="Print Label"
                    />
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <MenuButton
                        onClick={() => onMenuAction(onDelete)}
                        icon="🗑️"
                        text="Delete Task"
                        variant="danger"
                    />
                </div>
            </div>
        )}
    </div>
));

TaskMenu.displayName = 'TaskMenu';

interface MenuButtonProps {
    onClick: () => void;
    icon: string;
    text: string;
    variant?: 'default' | 'danger';
}

const MenuButton = memo(({ onClick, icon, text, variant = 'default' }: MenuButtonProps) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center space-x-2 ${
            variant === 'danger'
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        <span>{icon}</span>
        <span>{text}</span>
    </button>
));

MenuButton.displayName = 'MenuButton';

// Extracted Card Views
const CollapsedView = memo(({ task }: { task: ServiceTask }) => (
    <div className="space-y-1">
        <div className="text-xs text-gray-600 dark:text-gray-300">
            <strong>{task.serviceType}</strong>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">#{task.id.slice(-8)}</div>
    </div>
));

CollapsedView.displayName = 'CollapsedView';

const ExpandedView = memo(({ task, formatDate }: { task: ServiceTask; formatDate: (date: string) => string }) => (
    <>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            <div><strong>Service:</strong> {task.serviceType}</div>
            {task.bikeModel && <div><strong>Item:</strong> {task.bikeModel}</div>}
            <div><strong>Phone:</strong> {task.phone}</div>
            <div><strong>Created:</strong> {formatDate(task.createdAt)}</div>
            {task.estimatedCost && (
                <div><strong>Est. Cost:</strong> ${task.estimatedCost}</div>
            )}
            {task.assignedTo && (
                <div><strong>Assigned:</strong> {task.assignedTo}</div>
            )}
        </div>

        {task.notes && (
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.notes}</p>
            </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">#{task.id.slice(-8)}</span>
        </div>
    </>
));

ExpandedView.displayName = 'ExpandedView';

export default TaskCard;