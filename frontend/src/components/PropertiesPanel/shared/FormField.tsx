import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

export interface FormFieldProps {
  /** Field label text */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Help text shown below the input */
  help?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Error message (shows red styling) */
  error?: string;
  /** Additional className for the container */
  className?: string;
  /** The input element(s) */
  children: ReactNode;
}

/**
 * FormField - Standardized wrapper for label + input + help text
 *
 * Usage:
 * ```tsx
 * <FormField label="Path" required help="S3 or local file path">
 *   <input type="text" value={path} onChange={...} />
 * </FormField>
 * ```
 */
export const FormField = ({
  label,
  required = false,
  help,
  tooltip,
  error,
  className = '',
  children
}: FormFieldProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label row */}
      <div className="flex items-center gap-1">
        <label className="block text-xs text-gray-400">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50">
              <div className="bg-gray-800 text-xs text-gray-200 px-2 py-1 rounded shadow-lg max-w-xs whitespace-normal">
                {tooltip}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={error ? '[&>input]:border-red-500 [&>select]:border-red-500 [&>textarea]:border-red-500' : ''}>
        {children}
      </div>

      {/* Help text or error */}
      {(help || error) && (
        <p className={`text-[10px] ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {error || help}
        </p>
      )}
    </div>
  );
};

/**
 * Common input styles to use with FormField
 */
export const inputStyles = {
  base: 'w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none',
  small: 'w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none',
  textarea: 'w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none resize-none',
  select: 'w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none',
  checkbox: 'rounded border-gray-600 bg-canvas text-accent focus:ring-accent focus:ring-offset-0',
};
