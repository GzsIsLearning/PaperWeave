---
slug: "foundation-models-for-generalist-geospatial-artificial-intelligence"
title: "Foundation Models for Generalist Geospatial Artificial Intelligence (Prithvi)"
authors:
  - "Johannes Jakubik"
  - "Sujit Roy"
  - "C. E. Phillips"
  - "Paolo Fraccaro"
  - "et al. (IBM Research + NASA)"
year: 2023
venue: "Nature Climate Change / arXiv"
tags: [remote-sensing, foundation-model, nasa, ibm, hls, multi-spectral, temporal, prithvi]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://huggingface.co/ibm-nasa-geospatial"
compute: "— (large-scale distributed training)"
dataset_access: "public (HLS data)"
---

> **Abstract:** Introduces Prithvi, a transformer-based geospatial FM pre-trained on 1TB+ HLS (Harmonized Landsat-Sentinel) multi-spectral data. Evaluated on cloud gap imputation, flood mapping, wildfire scar segmentation, and crop segmentation. Shows pre-training accelerates fine-tuning and outperforms task-specific models. Framework for distributed geo-FM training.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — First large-scale geospatial FM from NASA/IBM. The HLS-based pre-training with 6 spectral bands + temporal dimensions is well-motivated. Framework for distributed training and fine-tuning is practical. Comprehensive evaluation with 3 research questions.
- Soundness: 4/5 — Thorough evaluation including learning curves, frozen vs fine-tuned comparisons, and ablation on pre-training data size. However, comparisons with concurrent FMs (SatMAE, GFM) are limited.
- Relevance: 4/5 — Prithvi is one of the most widely used open-source RS FMs. HuggingFace integration makes it easily accessible.

**Key Insights:**
1. **HLS data for FM pre-training:** Multi-sensor (Landsat 8/9 + Sentinel-2) harmonized product provides 2-3 day revisit, 6 spectral bands, global coverage — ideal for temporal RS FM.
2. **Pre-training accelerates fine-tuning:** Clear learning curve analysis shows pre-trained Prithvi reaches higher accuracy faster than randomly initialized models.
3. **Diverse downstream capabilities:** Cloud gap imputation (generative), flood mapping, burn scar, crop segmentation — covering both visual understanding and temporal reasoning.

**Notes:**
- IBM Research + NASA Marshall. ViT backbone. Pre-trained on HLS L30 + S30 products.
- 6 bands used: B2 (blue), B3 (green), B4 (red), B8A (NIR), B11 (SWIR1), B12 (SWIR2).
- Pre-training: MAE-style MIM. Fine-tuning on 4 downstream tasks.
- Open-source on HuggingFace: https://huggingface.co/ibm-nasa-geospatial
- Framework includes data sampling, filtering, preprocessing pipeline.
