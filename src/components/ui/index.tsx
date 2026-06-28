'use client';

import React from 'react';

/* ==================================================================
   REUSABLE UI COMPONENTS — E-Voting System
   All Tailwind CSS, no external UI library
   ================================================================== */

// ──────────────────────────────────────────────
// BUTTON
// ──────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const btnBase =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 shadow-sm shadow-indigo-200',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400 shadow-sm',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm shadow-red-200',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm shadow-emerald-200',
};

const btnSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────
// BADGE
// ──────────────────────────────────────────────
type BadgeColor = 'indigo' | 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'cyan';

const badgeColors: Record<BadgeColor, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
};

export function Badge({
  children,
  color = 'gray',
  dot,
}: {
  children: React.ReactNode;
  color?: BadgeColor;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColors[color]}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            color === 'green'
              ? 'bg-emerald-500'
              : color === 'red'
              ? 'bg-red-500'
              : color === 'yellow'
              ? 'bg-amber-500'
              : color === 'indigo'
              ? 'bg-indigo-500'
              : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
}

// ──────────────────────────────────────────────
// CARD
// ──────────────────────────────────────────────
export function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-sm ${
        padding ? 'p-6' : ''
      } ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// STATS CARD
// ──────────────────────────────────────────────
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  color = 'indigo',
  index = 0,
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'blue' | 'amber' | 'rose' | 'cyan';
  index?: number;
  onClick?: () => void;
}) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const bgMap = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    rose: 'bg-rose-50',
    cyan: 'bg-cyan-50',
  };

  return (
    <Card
      onClick={onClick}
      hover={!!onClick}
      className={`animate-fade-in stagger-${index + 1} relative overflow-hidden ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    trendUp ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {trendUp ? '↑' : '↓'} {trend}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg shadow-${color}-200`}
        >
          {icon}
        </div>
      </div>
      {/* Decorative element */}
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${bgMap[color]} opacity-50`}
      />
    </Card>
  );
}

// ──────────────────────────────────────────────
// MODAL
// ──────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeMap[size]} animate-scale-in max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TABLE
// ──────────────────────────────────────────────
export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Tidak ada data',
}: {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                  col.className ?? ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={String((row as any).id || (row as any)._id || idx)}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-indigo-50/50'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-700 ${col.className ?? ''}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────────────────────────────────
// TABS
// ──────────────────────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            active === tab.key
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                active === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// DROPDOWN
// ──────────────────────────────────────────────
export function Dropdown({
  trigger,
  items,
  open,
  onToggle,
  align = 'right',
}: {
  trigger: React.ReactNode;
  items: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[];
  open: boolean;
  onToggle: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <div className="relative">
      <div onClick={onToggle}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onToggle} />
          <div
            className={`absolute z-40 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 animate-scale-in ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  item.onClick();
                  onToggle();
                }}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-sm transition-colors ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon && <span className="shrink-0 w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// INPUT
// ──────────────────────────────────────────────
export function Input({
  label,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const isDateTime = props.type === 'datetime-local' || props.type === 'date';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors ${
            isDateTime 
              ? 'cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer' 
              : ''
          }`}
          onClick={(e) => {
            if (isDateTime) {
              try {
                e.currentTarget.showPicker?.();
              } catch (err) {
                console.warn('showPicker not supported:', err);
              }
            }
            props.onClick?.(e);
          }}
          {...props}
        />
        {isDateTime && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export function Select({
  label,
  options,
  ...props
}: {
  label?: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({
  label,
  ...props
}: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
        rows={3}
        {...props}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// TOGGLE
// ──────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 mt-0.5 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

// ──────────────────────────────────────────────
// SEARCH INPUT
// ──────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// AVATAR
// ──────────────────────────────────────────────
export function Avatar({
  name,
  size = 'md',
  color,
  src,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  src?: string;
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeMap = { 
    sm: 'w-8 h-8 text-xs', 
    md: 'w-10 h-10 text-sm', 
    lg: 'w-12 h-12 text-base' 
  };

  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-violet-100 text-violet-700',
  ];

  const idx = name.charCodeAt(0) % colors.length;

  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} ${color ?? colors[idx]} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ──────────────────────────────────────────────
// EMPTY STATE
// ──────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// PAGE HEADER
// ──────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// PAGINATION
// ──────────────────────────────────────────────
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit = 50,
  onLimitChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}) {
  if (totalPages <= 0 || (totalItems !== undefined && totalItems === 0)) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Number of pages to show before and after current page
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    let range = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          pages.push(l + 1);
        } else if (i - l !== 1) {
          pages.push('...');
        }
      }
      pages.push(i);
      l = i;
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-100 mt-4">
      <div className="flex items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-xs font-semibold cursor-pointer"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>data</span>
          </div>
        )}
        {totalItems !== undefined ? (
          <p className="text-xs text-slate-500">
            Menampilkan <span className="font-semibold text-slate-800">{startItem}</span> hingga{' '}
            <span className="font-semibold text-slate-800">{endItem}</span> dari{' '}
            <span className="font-semibold text-slate-800">{totalItems}</span> data
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Halaman <span className="font-semibold text-slate-800">{currentPage}</span> dari{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Sebelumnya
        </button>

        {pages.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={p === '...'}
            onClick={() => typeof p === 'number' && onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
              p === currentPage
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : p === '...'
                ? 'text-slate-400 cursor-default'
                : 'text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 flex items-center gap-1 cursor-pointer"
        >
          Berikutnya
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
