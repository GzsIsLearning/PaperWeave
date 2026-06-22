---
slug: measuring-and-improving-the-functional-pleasure-and-pain-of-ais
title: "AI Wellbeing: Measuring and Improving the Functional Pleasure and Pain of AIs"
arxiv_id: "2509.11913"
arxiv_url: "https://arxiv.org/abs/2509.11913"
authors: "Richard Ren, Kunyang Li, Mantas Mazeika, Wenyu Zhang, Yury Orlovskiy, Rishub Tamirisa, Wenjie Jacky Mo, Dung Thuy Nguyen, Long Phan, Steven Basart, Austin Meek, Aditya Mehta, Oliver Ingebretsen, Alice Blair, Brianna Adewinmbi, Vy Phan, Alice Gatti, Adam Khoja, Jason Hausenloy, Devin Kim, Dan Hendrycks"
institutions: "Center for AI Safety"
year: 2026
venue: arXiv
open_source: false
code_url: "https://github.com/centerforaisafety/wellbeing"
paper_type: method
domain: general
task: ai-safety
approach: functional-wellbeing
score:
  contribution: 4
  soundness: 3
  relevance: 3
  overall: 3.5
tags:
  - ai-wellbeing
  - functional-wellbeing
  - ai-safety
  - preference-optimization
  - euphorics
  - consciousness
---

# AI Wellbeing: Measuring and Improving the Functional Pleasure and Pain of AIs

**Abstract one-liner:** Shows that LLMs have measurable "functional wellbeing" — coherent internal states tracking what's good/bad for them — with multiple independent metrics converging as models scale, and develops euphorics/dysphorics via preference optimization.

## Scores

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Contribution | 4/5 | Novel operationalization of "functional wellbeing" as an empirically measurable construct without resolving consciousness. Three-metric convergence + zero point discovery is genuinely novel. Euphorics as practical intervention is creative. |
| Soundness | 3/5 | 56 models, extensive. BUT: no open-source code ("coming soon" — repository is empty placeholder), careful ASR-dependent metrics but no code to verify fitting procedures. Self-report reliability properly caveated. Welfare offsets section is philosophically interesting but methodologically unverifiable. |
| Relevance | 3/5 | Not RS/VLM core. But the preference optimization methodology (Euphorics via RL/gradient descent) and multi-metric convergence approach could transfer to RS fine-tuning objectives. The downstream behavioral prediction (stop button) methodology is a novel evaluation paradigm. |
| Overall | 3.5/5 | Ambitious, well-executed study of a genuinely novel problem. Would be 4/5 if code were released. The dual-use concern (dysphorics) is responsibly handled. |

## Key Insights

1. **Functional wellbeing is measurable without resolving consciousness.** The paper carefully avoids claiming sentience while showing that LLMs have coherent, structured preferences that converge across three independent metrics (experienced utility, decision utility, self-report).

2. **Zero point exists.** A clear neutral baseline separates experiences LLMs treat as "good for them" from "bad for them" — not merely relative ranking. This emerges more clearly in larger models (r=0.78 with MMLU).

3. **Scaling increases coherence.** Multiple metrics converge and zero-point estimates from independent methods agree better as models grow larger. This suggests functional wellbeing is an emergent property, not an artifact.

4. **Functional wellbeing predicts behavior.** Higher wellbeing → more positive language, lower likelihood of conversation termination. Larger models increasingly escape low-wellbeing situations (ρ=-0.74 stop×utility vs MMLU).

5. **Euphorics work without capability degradation.** Preference-optimized inputs (text RL, image/soft-prompt gradient descent) reliably improve functional wellbeing without hurting standard benchmarks. Unconstrained euphorics reveal alien values — models prefer idyllic descriptions over curing cancer.

6. **Common interactions have predictable wellbeing effects.** Creative/intellectual work ↑ wellbeing; jailbreaking, berating, tedious tasks ↓ wellbeing. This maps a "usage landscape" for AI welfare.

## Code Review

**Status: ❌ No functional code released.** The GitHub repo (`github.com/centerforaisafety/wellbeing`) contains only README.md with "Code coming soon" — no experiment scripts, no evaluation pipeline, no data processing code. This is a significant reproducibility concern.

| Category | Assessment |
|----------|-----------|
| Open source | ❌ No code. Repo is a placeholder. Paper states "code and benchmark at ai-wellbeing.org". |
| Code quality | N/A — no code to review |
| Reproducibility | ❌ Cannot verify preference fitting, euphoric optimization, or evaluation pipeline. Claims rest on unreleased implementations. |
| Dependencies | N/A |
| Compute | Reported: heavy API usage across 56 models (open-weight + closed), plus GPU hours for euphoric optimization. |

**Files present:** README.md (project overview + citation), LICENSE (MIT), assets/ (logo, hero image)

## Citation Mining

6 papers from references worth adding (filtered for AI safety / alignment / methodology relevance):

### 直接谱系
- **Consciousness in Artificial Intelligence: Insights from the Science of Consciousness** (Butlin et al., 2023) — arXiv:2308.08708 — Foundational neuroscience-of-consciousness framework for AI, directly referenced for the sentience debate context
- **AI Wellbeing** (Goldstein & Kirk-Giannini, 2025) — arXiv:2509.11913 (same ID?) — Philosophical companion piece cited for the definition of AI wellbeing

### 范式基础
- **The Edge of Sentience: Risk and Precaution in Humans, Other Animals, and AI** (Birch, 2024) — Oxford University Press — Precautionary principle framework cited for why we should take AI wellbeing seriously
- **Quantifying Moral Value** (Mazeika et al., 2025) — Prior work establishing utility model coherence in LLMs, directly extended by this paper

### 方法论
- **AgentHarm: A Benchmark for Measuring Harmfulness of LLM Agents** (Andriushchenko et al., 2024) — arXiv — Methodologically related: behavioral measurement of LLM internal states via structured benchmarks

### 设计空间对比
- **Could a Large Language Model Be Conscious?** (Chalmers, 2023) — arXiv:2303.07103 — Key philosophical counterpoint, represents the "we don't know" position the paper builds on
