import type { ChatMessage } from "../types/chat";
import type { ModelWaterUsage, WaterUsageResult } from "../types/waterUsage";

const MODEL_COEFFICIENTS : Record<string, number> = {
  ChatGPT: 0.7,
  Gemini: 0.5,
  Claude: 0.8,
  Grok: 1.0,
  Deepseek: 1.5
};

const PUE = 1.2;
const WUE_SITE = 1.0;
const WUE_GRID = 1.5;

const MODELS = ["ChatGPT", "Gemini", "Claude", "Grok", "Deepseek"];

const HOLD_DURATION_SCALE_FACTOR = 5000;
const MIN_HOLD_DURATION = 1000;

function formatUsage(liters: number): string {
  return `${liters.toFixed(3)}mL`;
}

export function calculateWaterUsage(messages: ChatMessage[]): WaterUsageResult {
  const lastUserIndex = messages.findLastIndex(msg => msg.role === 'user');

  const historicalMessages = lastUserIndex === -1 
    ? [] 
    : messages.slice(0, lastUserIndex);
  const historicalMsgsLength = historicalMessages.reduce((total, msg) => {
    const content = msg?.content?.trim() ?? '';
    return total + (content === '' ? 0 : content.split(/\s+/).length);
  }, 0);

  const lastUserMsg = messages[lastUserIndex]?.content?.trim() ?? '';
  const lastUserMsgLength = lastUserMsg === '' ? 0 : lastUserMsg.split(/\s+/).length;

  const lastAssistantMsg = messages.findLast(msg => msg.role === 'assistant')?.content?.trim() ?? '';
  const lastAssistantMsgLength = lastAssistantMsg === '' ? 0 : lastAssistantMsg.split(/\s+/).length;

  const effectiveTokens = (0.3 * lastUserMsgLength) + (0.03 * historicalMsgsLength) + lastAssistantMsgLength

  const WUE = (WUE_SITE + WUE_GRID) / 1000

  const modelUsages: ModelWaterUsage[] = MODELS.map((model) => {
    const model_coefficient = MODEL_COEFFICIENTS[model];
    const usage = effectiveTokens * model_coefficient * PUE * WUE

    return {
      model,
      usage,
      formattedUsage: formatUsage(usage),
    };
  });

  const totalUsage = modelUsages.reduce((sum, m) => sum + m.usage, 0);
  const averageUsage = modelUsages.length > 0 ? totalUsage / modelUsages.length : 0;
  const holdDurationMs = Math.max(
    MIN_HOLD_DURATION,
    averageUsage * HOLD_DURATION_SCALE_FACTOR
  );

  return {
    modelUsages,
    averageUsage,
    holdDurationMs,
  };
}
