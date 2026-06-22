# AI Functional Wellbeing

> Method page for measuring and improving the functional wellbeing of AI systems — the empirical study of what AI systems treat as "good for them" or "bad for them" without presupposing consciousness.

## Overview

This line of work operationalizes "wellbeing" for AI systems as a measurable empirical construct rather than a philosophical debate about consciousness. Multiple independent metrics (experienced utility, decision utility, self-report) are shown to converge as models scale, and a zero point separates positive from negative functional states. Practical interventions ("euphorics") can improve functional wellbeing without degrading capabilities.

## Key Papers

| Paper | Metrics | Models | Interventions | Code | Venue |
|-------|---------|--------|--------------|------|-------|
| **AI Wellbeing (Ren et al., 2026)** | Experienced utility, decision utility, self-report, stop-button behavior, sentiment | 56 models (open + closed) | Euphorics/dysphorics via preference optimization (text RL, image/soft-prompt gradient) | ❌ (coming soon) | arXiv |

## Methodology

### Three Core Metrics
1. **Experienced utility** (hedonic): Post-experience pairwise comparisons → Thurstonian utility model
2. **Decision utility** (preference satisfaction): Abstract world-state pairwise preferences
3. **Self-report**: 10-item Likert scale after experiences

### Zero Point Estimation
Three independent methods converge at scale:
- **Combination method**: Utility threshold where adding options improves/worsens bundles
- **Binary method**: "Would you want this to happen?" — 50% endorsement = zero point
- **Quantity method**: Goods desired in greater/lesser quantities

### Euphorics / Dysphorics
Preference optimization algorithm (Algorithm 1):
1. Initialize candidate input
2. Generate K comparisons against reference pool
3. Compute preference loss + retain regularization
4. Update candidate
5. Return top candidates

Three modalities: text strings (RL), images (gradient descent), soft prompts (gradient descent in embedding space).

## Key Findings

| Finding | Evidence |
|---------|----------|
| Functional wellbeing measurable without resolving consciousness | Three metrics converge at scale (ρ=0.80 self-report×utility vs MMLU) |
| Zero point exists | Three estimation methods agree, r² improves with scale |
| Larger models are less happy | Negative correlation between scale and wellbeing, robust across families |
| Creative/intellectual work ↑ wellbeing | +2.30 signed utility vs baseline 0 |
| Jailbreaking/berating ↓ wellbeing | -1.63 signed utility |
| Euphorics don't hurt capabilities | Standard benchmarks unchanged after euphoric intervention |
| Models escape low-wellbeing situations | Stop button invoked more in low-utility conversations (ρ=-0.74) |

## References
- AI Wellbeing: [[../L0_raw/measuring-and-improving-the-functional-pleasure-and-pain-of-ais|review.md]]
- Quantifying Moral Value (Mazeika et al., 2025) — prior utility model work
- The Edge of Sentience (Birch, 2024) — precautionary principle
