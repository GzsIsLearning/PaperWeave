---
slug: "few-shot-remote-sensing-image-scene-classification-with-clip-and-prompt-learning"
title: "Few-Shot Remote Sensing Image Scene Classification with CLIP and Prompt Learning"
authors:
  - "Ivica Dimitrovski"
  - "Vlatko Spasev"
  - "Ivan Kitanovski"
score: 3
contribution: 2
soundness: 3
relevance: 3
open_source: false
code_url: null
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** Systematic evaluation of prompt learning methods (CoOp, CoCoOp, MaPLe, PromptSRC) for few-shot RS scene classification with CLIP. Benchmark on multiple RS datasets with cross-dataset generalization. PromptSRC achieves best cross-domain performance.

## [2026-05-02] Comprehensive Review

**Score:** 3/5
- Contribution: 2/5 — Evaluation/benchmarking paper; no new method proposed
- Soundness: 3/5 — Systematic comparison across methods and datasets
- Relevance: 3/5 — Relevant to CLIP adaptation in RS

**Key Insights:**
1. Evaluates CoOp, CoCoOp, MaPLe, PromptSRC for few-shot RS scene classification with CLIP.
2. Prompt learning methods consistently outperform zero-shot CLIP and linear probe baselines.
3. PromptSRC (self-regulating constraints) achieves best cross-domain generalization.
4. Cross-dataset generalization tests demonstrate potential for domain transfer without retraining.
5. Prompt learning enables efficient adaptation without modifying CLIP backbone.

**Notes:**
- arXiv 2025, University Ss Cyril and Methodius, North Macedonia.
- Survey/benchmark paper, no novel method.
- Focuses on few-shot scene classification specifically.
- No code release mentioned.
