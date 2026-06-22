---
slug: "segment-change-model-scm-for-unsupervised-change-detection-in-vhr-remote-sensing"
title: "Segment Change Model (SCM) for Unsupervised Change Detection in VHR Remote Sensing Images"
authors:
  - "Xiaoliang Tan"
  - "Guanzhou Chen"
  - "Tong Wang"
  - "Jiaqi Wang"
  - "Xiaodong Zhang"
score: 3
contribution: 3
soundness: 3
relevance: 3
open_source: true
code_url: "https://github.com/StephenApX/UCD-SCM"
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** Unsupervised CD using SAM + CLIP. FastSAM multi-scale features with Recalibrated Feature Fusion (RFF). Piecewise Semantic Attention (PSA) using CLIP text embeddings filters pseudo changes. Improves mIoU from 46.09% to 53.67% on LEVIR-CD, 47.56% to 52.14% on WHU-CD.

## [2026-05-02] Comprehensive Review

**Score:** 3/5
- Contribution: 3/3 — Novel combination of SAM+CLIP for unsupervised CD; PSA scheme for semantic filtering without training
- Soundness: 3/3 — Evaluated on 2 datasets; comparison with multiple baselines
- Relevance: 3/3 — Relevant to VFM-based RS CD

**Key Insights:**
1. Uses FastSAM encoder for multi-scale feature extraction, RFF module for feature fusion.
2. PSA: uses CLIP text embeddings to provide semantic awareness and filter pseudo changes.
3. Fully unsupervised: no training required, uses pre-trained VFMs only.
4. OTSU threshold for final binary change map.
5. Significant improvement over existing UCD methods on LEVIR-CD and WHU-CD.

**Notes:**
- Wuhan University, 2025.
- Parameter-free feature fusion (no learned weights).
- Combines SAM (spatial) + CLIP (semantic) for change detection.
- Code open-source.
- No VLM/MoE connection but uses CLIP as component.
