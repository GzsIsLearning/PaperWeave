---
slug: "masked-autoencoders-are-scalable-vision-learners"
title: "Masked Autoencoders Are Scalable Vision Learners"
authors:
  - "Kaiming He"
  - "Xinlei Chen"
  - "Saining Xie"
  - "Yanghao Li"
  - "Piotr Dollar"
  - "Ross Girshick"
score: 5
contribution: 5
soundness: 5
relevance: 5
---

> **Abstract:** MAE: asymmetric encoder-decoder, mask 75% random patches, reconstruct pixels. Encoder only on visible patches (no mask tokens), lightweight decoder. ViT-H 87.8% IN1K. 3x faster training. Strong transfer.

## [2026-05-02] Wiki rebuild review

**Score:** 5/5
- Contribution: 5/5 — groundbreaking self-supervised vision pretraining paradigm
- Soundness: 5/5 — thorough ablations, multiple downstream tasks, scaling analysis
- Relevance: 5/5 — foundational work, widely cited and adopted

**Key Insights:**
- Masking 75% of patches creates a nontrivial self-supervisory task
- Asymmetric design: encoder sees only 25% visible patches (no mask tokens) → 3x+ speedup
- Pixel reconstruction works as well as token prediction (simpler, no dVAE needed)
- ViT-H/448 achieves 87.8% IN1K accuracy with only IN1K data
- Transfer outperforms supervised pretraining on COCO, ADE20K, iNat, Places

**Citation Mining:**
- ViT [Dosovitskiy et al., 2021] — base architecture for MAE encoder
- BERT [Devlin et al., 2019] — MLM inspiration for MIM
- BEiT [Bao et al., 2021] — earlier MIM with dVAE tokenization
- SimMIR [Xie et al., 2022] — concurrent simplified MIM approach

**L1 Ecology Observations:**
- MAE's asymmetric encoder-decoder design is adopted by most remote sensing MIM methods (SatMAE, Scale-MAE, SpectralMAE)
- High masking ratio (75%) exploits spatial redundancy — highly relevant for remote sensing with large images
- Pixel reconstruction simplifies pre-training pipelines for RS foundation models
- ViT backbone + MIM pretraining is now the standard combination for RSFM pre-training
