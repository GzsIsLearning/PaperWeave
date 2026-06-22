---
slug: "llms-as-noisy-channels-a-shannon-perspective"
title: "LLMs as Noisy Channels: A Shannon Perspective on Model Capacity and Scaling Laws"
authors:
  - "Xu Ouyang"
  - "Deyi Liu"
  - "Yuhang Cai"
  - "Jing Liu"
  - "Yuan Yang"
  - "Chen Zheng"
  - "Thomas Hartvigsen"
  - "Yiyuan Ma"
year: 2026
venue: "ICML 2026"
tags: [theory, scaling-laws, information-theory, noisy-channel]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: false
code_url: "—"
compute: "Pythia 160M-12B, OLMo2 1B-32B"
dataset_access: public
---

> **Abstract:** Proposes the Shannon Scaling Law, modeling LLM training as information transmission over a noisy channel via the Shannon-Hartley theorem. Maps model size to bandwidth and tokens to signal power, capturing three noise sources. Validated across Gaussian noise, SFT, and quantization perturbations on Pythia and OLMo2, achieving robust R^2 scores and extrapolating to unseen model/token combinations where monotonic baselines collapse.

## [2026-05-30] Review

**Score:** 5/5
- Contribution: 5/5 — First-principles physical framework (Shannon-Hartley) applied to LLM scaling. Not just a new function form but a causal explanation decomposing degradation into three physically interpretable noise sources. Unifies monotonic pretraining and U-shaped perturbed regimes under one equation.
- Soundness: 5/5 — Validated across 3 perturbation types (Gaussian noise at 6 SNR levels, SFT on 3 tasks at 5-8 learning rates, quantization at 3 bit-widths plus alternate schemes), 2 model families (Pythia 160M-12B, OLMo2 1B-32B). Ablation on the D-N interaction term confirms necessity. Strong extrapolation in both token-only, model-only, and joint settings.
- Relevance: 5/5 — Noise decomposition directly maps to multi-modal fusion SNR analysis. The SNR-dependent crossover (gamma > alpha under noise) is an actionable diagnostic for determining when scaling helps vs. hurts. The intrinsic U-shape from delta > beta has practical implications for data curation and training duration decisions.

**Key Insights:**
- C_LLM = a * N^alpha * log2(1 + b*D^beta / (c*(DN)^gamma + d*D^delta + e)). Loss = 1/C_LLM. This is a true theoretical framework, not just a curve-fitting exercise — each term maps to a physical quantity in the Shannon-Hartley theorem.
- SNR-dependent crossover: under noise, model-interaction noise exponent gamma exceeds bandwidth exponent alpha (gamma > alpha), meaning scaling model size beyond a threshold amplifies noise faster than it adds capacity. Model scaling backfires in low-SNR regimes.
- Intrinsic U-shaped degradation: data-noise exponent delta always exceeds signal exponent beta (delta > beta), even in clean pretraining. This implies that given enough tokens, accumulated noise will inevitably overtake information gain — U-shaped degradation is universal, not perturbation-specific.
- The simplified 6-parameter variant (removing coefficients b and e) preserves near-full predictive power while halving parameter count from 9. In token extrapolation, Shannon-Simpl achieves R^2=0.945 vs. the full law's 0.941.
- For joint (N,D) extrapolation, the full 9-parameter law is necessary (R^2=0.847 vs. 0.673 for the simplified version), confirming the extra parameters encode meaningful joint structure identifiable only when training data spans both axes.
- Relevance to multi-modal learning: each noise source (data noise, model-interaction noise, irreducible noise) provides a natural decomposition for analyzing modality-specific SNR. The framework suggests that multi-modal fusion should optimize per-modality SNR rather than naively scaling all modalities.

**Notes:**
- ICML 2026 accepted. First-author Xu Ouyang from ByteDance Seed / UVA, corresponding author.
- Pythia + OLMo2 are open-source, wikitext2 evaluation. All evaluation data is public.
- No code released for the law fitting itself (uses scipy.optimize.curve_fit with initialization=[1] or [0.1]).
- Exponent analysis (§5.3) is the most actionable part for practitioners — provides direct guidance on whether scaling model size or tokens is beneficial given a noise regime.
- The paper also validates across alternate quantization schemes (AWQ, bitsandbytes, quanto) confirming robustness beyond GPTQ.
- The explicit X-perturbation variant (§5.5) matches the implicit formulation while allowing direct SNR modulation when external noise levels are known.
- 78 images in the paper (loss landscapes, 3D surfaces, contour plots across all noise levels).

**Code Review:**
- No dedicated repository. Fitting uses scipy.optimize.curve_fit with simple initialization ([1] or [0.1]).
- All evaluation models (Pythia, OLMo2) and datasets (wikitext2, GSM8K, SiQA, StarCoder) are publicly available, making reproduction feasible.
- SFT uses trl.SFTTrainer; quantization uses optimum.gptq.GPTQQuantizer, AWQ, bitsandbytes, and quanto.
- The Gaussian noise injection formula (scaling by weight power and target SNR in dB) is clearly specified and easy to replicate.

**Citation Mining (3-8 papers):**
- Kaplan et al. (2020). "Scaling Laws for Neural Language Models." arXiv:2001.08361. — The original OpenAI monotonic power law that this work generalizes and surpasses under noise.
- Hoffmann et al. (2022). "Training Compute-Optimal Large Language Models." arXiv:2203.15556. — The Chinchilla law; also shown to collapse under perturbations.
- Ouyang et al. (2024). "Low-bit Quantization Favors Undertrained LLMs: Scaling Laws for Quantized LLMs with 100T Training Tokens." arXiv:2411.17691. — QiD Law, the primary perturbation-aware baseline that this work consistently outperforms.
- Kumar et al. (2024). "Scaling Laws for Precision." arXiv:2411.04330. — Law of Precision; another perturbation-aware baseline with exponential degradation term.
- Springer et al. (2025). "Overtrained Language Models are Harder to Fine-Tune." arXiv:2503.19206. — Identified catastrophic overtraining phenomenon that motivated this work. The SFT protocol is directly adapted from this paper.
- Shannon (1948). "A Mathematical Theory of Communication." Bell Labs Technical Journal. — The foundational theorem this entire framework is built upon.
- Shwartz-Ziv & Tishby (2017). "Opening the Black Box of Deep Neural Networks via Information." arXiv:1703.00810. — Information bottleneck precedent for analyzing DNNs through mutual information.
- Biderman et al. (2023). "Pythia: A Suite for Analyzing Large Language Models across Training and Scaling." arXiv:2304.01373. — The Pythia model suite used for primary validation.

**Cross-wiki Connections:**
- L2: [[L2_lineage/general/theory/scaling-laws]]
- L3: Connects to modality-fusion (noise decomposition per modality maps directly to fusion SNR optimization), pretraining-paradigm (SNR perspective provides a principled data-quality diagnostic — higher-quality data = higher effective SNR), quantization (the framework explains why quantization hurts more for overtrained/larger models), and SFT strategies (learning rate as noise modulator, with optimal LR representing the loss-basin sweet spot).
