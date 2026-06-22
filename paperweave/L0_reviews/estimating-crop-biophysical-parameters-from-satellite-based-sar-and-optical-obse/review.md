---
slug: "estimating-crop-biophysical-parameters-from-satellite-based-sar-and-optical-obse"
title: "Estimating crop biophysical parameters from satellite-based SAR and optical observations using self-supervised learning with geospatial foundation models"
authors:
  - "Mahya G.Z. Hashemi"
  - "Hamed Alemohammad"
  - "Ehsan Jalilvand"
  - "Pang-Ning Tan"
  - "Jasmeet Judge"
  - "Michael Cosh"
  - "Narendra N. Das"
score: 4
contribution: 4
soundness: 4
relevance: 5
---

## [2026-05-02] Wiki rebuild review

**Score:** 4/5
- Contribution: 4/5 — novelty & impact
- Soundness: 4/5 — method rigor & experiments
- Relevance: 5/5 — to RS multimodal/pretraining research

**Key Insights:**
- First application of geospatial foundation models (GFMs) to VWC and crop height estimation
- STL-GFM outperforms RF, XGBoost, and MTL-GFM; soybean VWC R²=0.90, corn R²=0.89
- Integrates Sentinel-1 C-band SAR + Sentinel-2 optical + climate data
- ViT-based MAE self-supervised pretraining on unlabeled SAR/optical patches
- Demonstrates generalization to irrigated fields not in training data
- Feature importance: NDVI, NDWI, VH backscatter, precipitation are key drivers

**Citation Mining:**
- MAE [He et al., 2022] — SSL pre-training framework
- Prithvi [IBM & NASA, 2023] — geospatial foundation model
- Sentinel-1 [ESA] — SAR data source
- Sentinel-2 [ESA] — optical data source

**L1 Ecology Observations:**
- First demonstration of GFM for crop biophysical parameter estimation
- ViT-based MAE SSL on SAR+optical patches is directly applicable to agriculture RS
- Multi-modal fusion (SAR + optical + climate) is essential for RS agricultural applications
- Generalization to unseen irrigated fields shows GFM robustness
