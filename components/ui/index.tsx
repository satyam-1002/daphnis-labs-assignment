'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

// ─── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-95 select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-lg shadow-brand-900/40 focus-visible:ring-brand-400',
      secondary: 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/30',
      ghost: 'text-white/60 hover:text-white hover:bg-white/5 focus-visible:ring-white/20',
      danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 focus-visible:ring-red-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ─── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-4 py-3 rounded-xl bg-dark-850/60 border text-white placeholder:text-white/20 focus:outline-none transition-colors duration-150 font-mono text-sm',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
            : 'border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  };

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-dark-850/80 border border-white/[0.06] backdrop-blur-md',
        glow && 'shadow-lg shadow-brand-900/20',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── HashDisplay ───────────────────────────────────────────────────────────────

interface HashDisplayProps {
  label: string;
  value: string;
  className?: string;
}

export function HashDisplay({ label, value, className }: HashDisplayProps) {
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
  };

  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
        <button
          onClick={copy}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors px-2 py-0.5 rounded hover:bg-brand-500/10"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
      <div className="font-mono text-xs break-all text-white/70 bg-dark-950/60 rounded-lg px-3 py-2 border border-white/5">
        {value || <span className="text-white/20 italic">—</span>}
      </div>
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx('animate-spin text-brand-400', className ?? 'h-5 w-5')}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── StatusDot ─────────────────────────────────────────────────────────────────

export function StatusDot({ status }: { status: 'CREATED' | 'STARTED' | 'REVEALED' | string }) {
  const colors = {
    CREATED: 'bg-amber-400',
    STARTED: 'bg-brand-400 animate-pulse',
    REVEALED: 'bg-emerald-400',
  };

  return (
    <span
      className={clsx(
        'inline-block w-2 h-2 rounded-full',
        colors[status as keyof typeof colors] ?? 'bg-white/30'
      )}
    />
  );
}
