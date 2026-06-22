---
slug: "model-knowledge-prior-embedded-subspace-learning-network-for-hyperspectral-image"
title: "Model Knowledge-Prior Embedded Subspace Learning Network for Hyperspectral Image Classification"
authors:
  - "Xiangyu Nie"
  - "Zhaohui Xue"
  - "Jun Li"
score: 2
contribution: 2
soundness: 2
relevance: 1
open_source: false
code_url: null
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** MKPSL-Net for HSI classification combining model-driven LRSR (low-rank sparse representation) with data-driven deep learning. Deep spatial-spectral integrated dictionary learning, Contextual Information Aggregation Module, Subspace Prior Attention Mechanism, Residual-Label Joint Loss.

## [2026-05-02] Comprehensive Review

**Score:** 2/5
- Contribution: 2/5 — Incremental hybrid of representation model and deep learning for HSI
- Soundness: 2/5 — Evaluated on 4 HSI datasets but methods are incremental
- Relevance: 1/5 — HSI classification, no VLM/MoE connection

**Key Insights:**
1. Combines LRSR model prior with deep learning for HSI classification.
2. DS2IDL: self-supervised dictionary learning in spatial-spectral domain.
3. CIAM: multi-scale contextual feature aggregation.
4. SPAM: subspace prior attention for class-discriminative features.
5. RLJL: joint residual and label loss.

**Notes:**
- ISPRS Journal 2025, Hohai University + NUAA + CUG.
- Pure HSI classification, no connection to VLM/MoE/VL research.
- Not relevant to the RS VLM/Vision-Language batch theme.
