# TapGPT

A really thirsty AI chatbot

## Local Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API key ([Get one here](https://ai.google.dev/))

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

### Server Setup

```bash
cd server
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

The server runs on `http://localhost:3001` by default.

### Environment Variables

Create a `.env` file in the `server/` directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

## Water Usage Formula

The approximate water usage calculation estimates the environmental impact of AI inference based on data center power and cooling requirements. The chain from tokens to water is:

**Tokens → GPU Compute → Electricity → Water**

Water consumption comes from two sources:

1. **On-site cooling water (Scope 1)**: Data centers use evaporative cooling systems to dissipate heat from servers. This is measured as WUE (Water Usage Effectiveness) in liters per kWh.

2. **Off-site water (Scope 2)**: Electricity generation itself consumes water (thermal power plants, hydroelectric dams, etc.). This varies significantly by grid mix and region.

### Effective Tokens

The effective tokens ($t_{eff}$) formula accounts for how modern LLM providers actually process conversations: major providers cache the computed key-value states of the conversation prefix between turns. When you send turn *n*, the model doesn't recompute the entire history ($w_{history}$) from scratch. It reuses the cached states and only processes your new message.

$$t_{eff} = 0.03 \cdot w_{history} + 0.3 \cdot w_{in} + w_{out}$$

**Why these coefficients?**

| Coefficient | Value | Explanation |
|-------------|-------|-------------|
| $w_{history}$ | 0.03 | **KV caching** reduces reprocessing cost to ~10% of fresh tokens. API pricing reflects this: cached input is typically priced at 10–25% of regular input, and pricing tracks compute cost reasonably well. |
| $w_{in}$ | 0.3 | **Input processing** is a single parallel forward pass through the model, requiring roughly one-third the compute of output generation. |
| $w_{out}$ | 1.0 | **Output generation** requires sequential autoregressive decoding. Each token depends on all previous tokens, making it the most compute-intensive operation. |

### Full Formula

$$W_{total} (mL) = t_{eff} \times \frac{E_{model}}{1000} \times PUE \times (WUE_{site} + WUE_{grid})$$

| Variable | Meaning |
| --- | --- |
| $t_{eff}$ | Effective tokens (weighted sum of historical, input, and output tokens) |
| $w_{history}$ | Number of words in the conversation before the current query |
| $w_{in}$ | Number of words in the user's current prompt query |
| $w_{out}$ | Number of words in the model's response to the current query |
| $E_{model}$ | Wh per 1,000 output tokens (model-specific coefficient) |
| $PUE$ | Power Usage Effectiveness of data center |
| $WUE_{site}$ | Water Usage Effectiveness for on-site cooling (L/kWh) |
| $WUE_{grid}$ | Water Usage Effectiveness for electricity generation (L/kWh) |

### Constants Used

| Constant | Value | Explanation |
|----------|-------|-------------|
| PUE | 1.2 | Modern hyperscale data centers achieve 1.1–1.2; we use a conservative middle estimate. Older or smaller facilities may reach 1.3+. |
| WUE_site | 1.0 L/kWh | Based on Google's fleet average. Industry range is 0.2–1.8 L/kWh depending on climate and cooling technology. |
| WUE_grid | 1.5 L/kWh | US average consumed water for electricity generation. Varies significantly by region and energy mix. |

### Model Coefficients

Different models have different computational requirements. These coefficients represent estimated Wh per 1,000 output tokens:

| Model | Coefficient | Basis |
|-------|-------------|-------|
| Gemini | 0.5 | Google disclosed ~0.24 Wh per median prompt (2024). Most efficient due to TPU infrastructure and model optimization. |
| ChatGPT | 0.7 | OpenAI disclosed ~0.34 Wh per average query (2024). GPU-based serving, well-optimized. |
| Claude | 0.8 | Frontier-model estimate. Anthropic has not disclosed energy metrics; assumed similar to OpenAI with slight overhead. |
| Grok | 1.0 | No public disclosure. Assumed less optimized serving infrastructure than established providers. |
| Deepseek | 1.5 | No public disclosure. Higher estimate due to uncertain infrastructure optimization. |

## Why Estimates Vary

Published water usage estimates for AI queries vary by orders of magnitude. Here's why:

### Different Scopes
- Some studies only count **on-site cooling water** (Scope 1)
- Others include **electricity generation water** (Scope 2)
- Full lifecycle assessments may include manufacturing water (Scope 3)

### Different Model Efficiencies
- **Frontier models** (GPT-4, Claude Opus) are large and compute-intensive
- **Distilled/optimized models** (GPT-4o-mini, Claude Haiku) are much more efficient
- A 2023 UC Riverside study estimated ~500 mL per GPT-3 conversation but this was before modern optimizations

### Data Center Location Effects
- **Climate**: Desert locations need more evaporative cooling
- **Grid mix**: Coal-heavy grids use more water than renewables
- **Cooling technology**: Air cooling vs evaporative vs liquid cooling

### Batching Efficiency
- Production systems batch multiple requests together
- Academic estimates often assume single-query processing
- Batching can improve efficiency by 10x or more

### The Range in Practice
- **2023 UC Riverside (GPT-3 era)**: ~500 mL per conversation
- **2024–2025 optimized stacks**: Google ~0.26 mL/query, OpenAI ~0.32 mL/query
- This represents a ~1,500x improvement from optimization and more efficient models

## Disclaimer

> **⚠️ Uncertainty Warning**
>
> These calculations are rough, back-of-the-napkin approximations with potential error bars of **~10x in either direction**. Key unknowns include:
>
> - Actual model sizes and architectures (not publicly disclosed)
> - Quantization levels and serving optimizations
> - Which specific data center served your request
> - Real-time PUE and WUE metrics (vary by load and weather)
> - Batching efficiency at time of request
