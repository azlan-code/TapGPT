export interface ModelWaterUsage {
  model: string;
  usage: number;
  formattedUsage: string;
}

export interface WaterUsageResult {
  modelUsages: ModelWaterUsage[];
  averageUsage: number;
  holdDurationMs: number;
}
