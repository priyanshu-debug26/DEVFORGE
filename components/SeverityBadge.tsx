import React from 'react';
import { VulnerabilitySeverity } from '@/lib/types';

interface SeverityBadgeProps {
  severity: VulnerabilitySeverity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const sev = severity.toUpperCase() as VulnerabilitySeverity;

  switch (sev) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          LOW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-gray-500/20 text-gray-400 border border-gray-500/30">
          INFO
        </span>
      );
  }
}
