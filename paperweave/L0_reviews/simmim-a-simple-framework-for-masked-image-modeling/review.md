---
slug: "simmim-a-simple-framework-for-masked-image-modeling"
title: "SimMIM: A Simple Framework for Masked Image Modeling"
authors:
  - "Zhenda Xie"
  - "Zheng Zhang"
  - "Yue Cao"
  - "Yutong Lin"
  - "Jianmin Bao"
  - "Zhuliang Yao"
  - "Qi Dai"
  - "Han Hu"
year: 2022
venue: "CVPR 2022"
tags: [self-supervised-learning, masked-image-modeling, vision-transformer, pre-training]
score: 5
contribution: 4
soundness: 5
relevance: 3
open_source: true
code_url: "https://github.com/microsoft/SimMIM"
compute: "SwinV2-H: 8×V100 or A100; SwinV2-G: larger cluster"
dataset_access: public
---

> **Abstract:** SimMIM simplifies masked image modeling to its essentials: random masking with large patch size (32), raw pixel regression with L1 loss, and an extremely lightweight linear prediction head. Achieves 83.8% ViT-B on ImageNet-1K, 87.1% SwinV2-H.

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 4/5 — Demonstrates that complex designs (dVAE tokenization, block-wise masking, heavy decoders) are unnecessary. Key insight: AvgDist as a predictor of MIM quality.
- Soundness: 5/5 — Exhaustive ablations on masking strategy, prediction head, resolution, target, and loss scope. Scaling experiments from Swin-B to 3B SwinV2-G. Multiple downstream tasks (iNat, COCO, ADE20K).
- Relevance: 3/5 — General CV self-supervised learning. Not RS-specific but MIM paradigm is widely adopted in RS (e.g., SatMAE, Scale-MAE, RingMo).

**Key Insights:**
- AvgDist metric (average distance from masked pixel to nearest visible pixel) predicts fine-tuning quality; sweet spot is [10, 20] range
- Random masking with patch size 32 + 60% ratio performs best; small patches (4-8) need 80%+ masking ratio
- Raw pixel regression (L1) matches or beats classification-based targets (dVAE tokens, color clustering)
- Linear prediction head performs as well as inverse Swin-B but 2.3× faster in pre-training
- Prediction (masked only) >> reconstruction (full image): 82.8% vs 81.7%
- Enables 3B SwinV2-G training with 40× less labeled data than JFT-3B

**Citation Mining:**
- MAE [He et al., 2022] — concurrent MIM work with asymmetric encoder-decoder
- BEiT [Bao et al., 2021] — token-based MIM predecessor
- iGPT [Chen et al., 2020] — autoregressive pixel prediction
- Swin Transformer [Liu et al., 2021] — hierarchical backbone used for scaling

**L1 Ecology Observations:**
- SimMIM's simplicity (raw pixel regression, L1 loss) is attractive for RSFM pre-training
- AvgDist metric provides principled guidance for masking ratio selection in RS (large images)
- Swin backbone + MIM pre-training enables multi-scale RS representation learning
- The 3B SwinV2-G model demonstrates MIM scalability at extreme sizes
