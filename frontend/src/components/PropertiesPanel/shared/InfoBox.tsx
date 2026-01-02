import type { ReactNode } from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle, Lightbulb, Zap } from 'lucide-react';

export type InfoBoxType = 'info' | 'warning' | 'error' | 'success' | 'tip' | 'performance';

export interface InfoBoxProps {
  /** Type determines color and icon */
  type: InfoBoxType;
  /** Optional title */
  title?: string;
  /** Content */
  children: ReactNode;
  /** Whether the box can be dismissed */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

const typeConfig: Record<InfoBoxType, { bg: string; border: string; text: string; icon: ReactNode }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: <Info className="w-4 h-4" />
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: <XCircle className="w-4 h-4" />
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: <CheckCircle className="w-4 h-4" />
  },
  tip: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: <Lightbulb className="w-4 h-4" />
  },
  performance: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: <Zap className="w-4 h-4" />
  }
};

/**
 * InfoBox - Contextual information/warning/error message box
 *
 * Usage:
 * ```tsx
 * <InfoBox type="warning" title="Performance Note">
 *   This operation triggers a shuffle. Consider partitioning first.
 * </InfoBox>
 * ```
 */
export const InfoBox = ({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  size = 'md'
}: InfoBoxProps) => {
  const config = typeConfig[type];

  const sizeClasses = {
    sm: 'p-2 text-[10px]',
    md: 'p-3 text-xs'
  };

  return (
    <div
      className={`
        ${config.bg} ${config.border} border rounded
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <span className={`${config.text} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-medium ${config.text} mb-1`}>
              {title}
            </div>
          )}
          <div className="text-gray-300">
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-white flex-shrink-0"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Quick helper components for common use cases
 */
export const InfoNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="info" title={title}>{children}</InfoBox>
);

export const WarningNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="warning" title={title}>{children}</InfoBox>
);

export const ErrorNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="error" title={title}>{children}</InfoBox>
);

export const SuccessNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="success" title={title}>{children}</InfoBox>
);

export const TipNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="tip" title={title}>{children}</InfoBox>
);

export const PerformanceNote = ({ children, title }: { children: ReactNode; title?: string }) => (
  <InfoBox type="performance" title={title}>{children}</InfoBox>
);
