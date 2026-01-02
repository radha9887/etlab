import type { ReactNode } from 'react';

export interface ToggleOption {
  /** Unique value for this option */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Description shown below label or on hover */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface ToggleGroupProps {
  /** Available options */
  options: ToggleOption[];
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Whether to show descriptions inline */
  showDescriptions?: boolean;
  /** Additional className */
  className?: string;
  /** Label for the group */
  label?: string;
}

/**
 * ToggleGroup - Mode/option selection button group
 *
 * Usage:
 * ```tsx
 * <ToggleGroup
 *   label="Filter Mode"
 *   options={[
 *     { value: 'simple', label: 'Simple', description: 'Basic conditions' },
 *     { value: 'sql', label: 'SQL', description: 'Raw SQL expression' },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 * ```
 */
export const ToggleGroup = ({
  options,
  value,
  onChange,
  size = 'md',
  direction = 'horizontal',
  showDescriptions = false,
  className = '',
  label
}: ToggleGroupProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
      )}

      <div
        className={`
          ${isHorizontal ? 'flex gap-1' : 'flex flex-col gap-1'}
          p-1 bg-panel rounded-lg
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              className={`
                flex-1 flex items-center justify-center gap-1.5 rounded
                ${sizeClasses[size]}
                transition-colors
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-panel-light'
                }
              `}
              title={option.description}
            >
              {option.icon && (
                <span className={iconSizes[size]}>{option.icon}</span>
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Show descriptions below when enabled */}
      {showDescriptions && (
        <div className={`${isHorizontal ? 'flex' : 'flex flex-col'} gap-2 mt-1`}>
          {options.map(option => (
            <div
              key={option.value}
              className={`text-[10px] text-gray-500 ${isHorizontal ? 'flex-1 text-center' : ''}`}
            >
              {option.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ToggleButton - Single toggle button (for on/off states)
 */
export interface ToggleButtonProps {
  /** Whether the toggle is active */
  active: boolean;
  /** Called when toggle is clicked */
  onChange: (active: boolean) => void;
  /** Label text */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

export const ToggleButton = ({
  active,
  onChange,
  label,
  icon,
  size = 'md',
  className = ''
}: ToggleButtonProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs'
  };

  return (
    <button
      onClick={() => onChange(!active)}
      className={`
        flex items-center gap-1.5 rounded border transition-colors
        ${sizeClasses[size]}
        ${active
          ? 'border-accent bg-accent/20 text-accent'
          : 'border-gray-600 bg-panel-light text-gray-400 hover:text-gray-200 hover:border-gray-500'
        }
        ${className}
      `}
    >
      {icon}
      {label}
    </button>
  );
};
