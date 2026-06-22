---
slug: "multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre"
title: "Multi-label Guided Soft Contrastive Learning for Efficient Earth Observation Pretraining"
authors:
  - "Yi Wang"
  - "Conrad M Albrecht"
  - "Xiao Xiang Zhu"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://github.com/zhu-xlab/softcon"
compute: "Single GPU (efficient), 100 epochs"
dataset_access: true
---

> **Abstract:** Soft contrastive learning using land-cover multi-label supervision from Dynamic World. Cross-domain continual pretraining from DINOv2. Efficient ResNet50/ViT-S achieve SOTA on BigEarthNet (84.8/85.0 mAP on 10% data), surpassing ViT-L models. Multispectral + SAR.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — Novel soft contrastive loss for multi-label EO; cross-domain continual pretraining from DINOv2; efficient data usage
- Soundness: 4/5 — Extensive evaluation on 11 downstream tasks; comparison with CROMA, SkySense, etc.
- Relevance: 4/5 — Directly relevant for efficient EO pretraining

**Key Insights:**
1. Soft contrastive learning: computes cosine similarity of multi-label vectors as soft targets, avoiding false negative issues in standard contrastive learning.
2. Cross-domain continual pretraining: initialize from DINOv2 (natural images) with simple weight initialization + Siamese masking for unaligned modalities.
3. Matches SSL4EO with Dynamic World land cover maps to create global multi-label scene classification dataset.
4. ResNet50/ViT-S (23M params, 100 epochs) outperform ViT-L models (300M+ params, 300 epochs) on BigEarthNet.
5. ViT-B achieves SOTA 86.8 mAP on multispectral, 82.5 on SAR BigEarthNet.
6. Effective for both multispectral (Sentinel-2) and SAR (Sentinel-1).

**Notes:**
- TGRS 2025, TU Munich + DLR.
- Key insight: use free land-cover products (Dynamic World) as multi-label supervision.
- Siamese masking: randomly mask input patches on trainable branch to save memory.
- Open-source code and models.
