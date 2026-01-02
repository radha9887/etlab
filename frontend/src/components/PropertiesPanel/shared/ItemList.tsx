import type { ReactNode } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export interface ItemListProps<T> {
  /** Array of items to display */
  items: T[];
  /** Called when add button is clicked */
  onAdd: () => void;
  /** Called when remove button is clicked for an item */
  onRemove: (index: number) => void;
  /** Called when item is moved (optional - enables reorder buttons) */
  onMove?: (fromIndex: number, toIndex: number) => void;
  /** Render function for each item */
  renderItem: (item: T, index: number, isLast: boolean) => ReactNode;
  /** Label for the add button */
  addLabel?: string;
  /** Message shown when list is empty */
  emptyMessage?: string;
  /** Maximum number of items allowed (disables add button when reached) */
  maxItems?: number;
  /** Minimum number of items required (disables remove when at minimum) */
  minItems?: number;
  /** Whether to show item numbers */
  showNumbers?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Custom add button component */
  addButton?: ReactNode;
}

/**
 * ItemList - Reusable add/remove/reorder list component
 *
 * Usage:
 * ```tsx
 * <ItemList
 *   items={conditions}
 *   onAdd={addCondition}
 *   onRemove={removeCondition}
 *   onMove={reorderConditions}
 *   addLabel="Add Condition"
 *   renderItem={(condition, idx) => (
 *     <ConditionRow condition={condition} onChange={...} />
 *   )}
 * />
 * ```
 */
export function ItemList<T>({
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  addLabel = 'Add Item',
  emptyMessage = 'No items added yet',
  maxItems,
  minItems = 0,
  showNumbers = false,
  className = '',
  addButton
}: ItemListProps<T>) {
  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems;

  const handleMoveUp = (index: number) => {
    if (onMove && index > 0) {
      onMove(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (onMove && index < items.length - 1) {
      onMove(index, index + 1);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-xs text-gray-500 italic py-2 text-center bg-canvas/50 rounded border border-dashed border-gray-700">
          {emptyMessage}
        </div>
      )}

      {/* Items list */}
      {items.map((item, index) => (
        <div
          key={index}
          className="group relative flex items-start gap-2 p-2 bg-panel-light rounded border border-gray-700 hover:border-gray-600 transition-colors"
        >
          {/* Reorder handle (if enabled) */}
          {onMove && (
            <div className="flex flex-col gap-0.5 pt-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-0.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="p-0.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Item number */}
          {showNumbers && (
            <span className="text-xs text-gray-500 pt-1.5 min-w-[20px]">
              {index + 1}.
            </span>
          )}

          {/* Item content */}
          <div className="flex-1 min-w-0">
            {renderItem(item, index, index === items.length - 1)}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add button */}
      {addButton || (
        <button
          onClick={onAdd}
          disabled={!canAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent hover:text-accent-hover
                     hover:bg-accent/10 rounded border border-dashed border-accent/30 hover:border-accent/50
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}

      {/* Max items indicator */}
      {maxItems && items.length >= maxItems && (
        <p className="text-[10px] text-gray-500 text-center">
          Maximum of {maxItems} items reached
        </p>
      )}
    </div>
  );
}

/**
 * Helper to generate unique IDs for list items
 */
export const generateItemId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper to move an item in an array
 */
export const moveItem = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};
