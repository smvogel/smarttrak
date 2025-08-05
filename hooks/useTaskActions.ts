// hooks/useTaskActions.ts
import { useState, useCallback } from 'react';

interface UseTaskActionsReturn {
    collapsedCards: Set<string>;
    toggleCardCollapse: (taskId: string) => void;
    expandAll: () => void;
    collapseAll: (taskIds: string[]) => void;
}

export const useTaskActions = (): UseTaskActionsReturn => {
    const [collapsedCards, setCollapsedCards] = useState(new Set<string>());

    const toggleCardCollapse = useCallback((taskId: string) => {
        setCollapsedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }, []);

    const expandAll = useCallback(() => {
        setCollapsedCards(new Set());
    }, []);

    const collapseAll = useCallback((taskIds: string[]) => {
        setCollapsedCards(new Set(taskIds));
    }, []);

    return {
        collapsedCards,
        toggleCardCollapse,
        expandAll,
        collapseAll
    };
};