'use client';

import { HealthStatus } from "@/components/HealthStatus";

export function StatusSection() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <HealthStatus />
      </div>
    </div>
  );
}