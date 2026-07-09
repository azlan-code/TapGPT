import { useState } from "react";
import type { ModelWaterUsage } from "../types/waterUsage";

interface WaterUsageStatsProps {
  visible: boolean;
  modelUsages: ModelWaterUsage[];
}

export function WaterUsageStats({ visible, modelUsages }: WaterUsageStatsProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`
      fixed top-4 left-4 rounded-lg border border-black bg-white px-4 py-3
      transition-all duration-250 z-20
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
    `}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full cursor-pointer hover:opacity-70 transition-opacity"
      >
        <h2 className="text-sm font-bold text-black">Total Water Used in this Chat</h2>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-250 ${collapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className={`
        overflow-hidden transition-all duration-250
        ${collapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-96 opacity-100 mt-2'}
      `}>
        <div className="space-y-1">
          {modelUsages.map((item) => (
            <div key={item.model} className="flex justify-between gap-4 text-sm">
              <span className="text-black">{item.model}</span>
              <span className="text-black font-medium">{item.formattedUsage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
