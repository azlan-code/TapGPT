interface WaterUsageStatsProps {
  visible: boolean;
}

const waterUsageData = [
  { model: "ChatGPT", usage: "0.00L" },
  { model: "Gemini", usage: "0.00L" },
  { model: "Claude", usage: "0.00L" },
  { model: "Grok", usage: "0.00L" },
  { model: "Deepseek", usage: "0.00L" },
];

export function WaterUsageStats({ visible }: WaterUsageStatsProps) {
  return (
    <div className={`
      fixed top-4 left-4 rounded-lg border border-black bg-white px-4 py-3
      transition-all duration-250
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
    `}>
      <h2 className="text-sm font-bold text-black mb-2">Water Usage Comparison</h2>
      <div className="space-y-1">
        {waterUsageData.map((item) => (
          <div key={item.model} className="flex justify-between gap-4 text-sm">
            <span className="text-black">{item.model}</span>
            <span className="text-black font-medium">{item.usage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
