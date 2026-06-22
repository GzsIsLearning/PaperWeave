---
slug: "satlaspretrain"
title: "SatlasPretrain: A Large-Scale Dataset for Remote Sensing Image Understanding"
authors:
  - "Favyen Bastani"
  - "Piper Wolters"
  - "Ritwik Gupta"
  - "Joe Ferdinando"
  - "Aniruddha Kembhavi"
year: 2023
venue: "ICCV 2023 (oral)"
tags: [remote-sensing, dataset, benchmark, multi-task, sentinel-2, naip, supervised-pretraining]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://satlas-pretrain.allen.ai/"
compute: "— (publicly hosted weights)"
dataset_access: "public"
---

> **Abstract:** Large-scale supervised RS dataset: 302M labels across 137 categories and 7 label types (points, polygons, polylines, segmentation, regression, properties, classification). 856K tiles covering Sentinel-2 (10m) and NAIP (1m) imagery. Proposes SatlasNet unified model with 7 output heads. Pre-training on SatlasPretrain improves downstream performance 18% over ImageNet.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — Major dataset contribution. Scale (302M labels, 137 categories) is transformative for supervised RS pre-training. Seven label types covering diverse geospatial features (roads, buildings, wind turbines, land cover, water depth) is unique. The spatial-temporal label structure (labels associated with coordinates + time ranges) enables time series processing.
- Soundness: 4/5 — Careful dataset construction from authoritative sources (OSM, USGS, NOAA). Good downstream evaluation across 7 tasks. Multi-task training shows 7.1% improvement. Weakness: all data from US/Europe (Sentinel-2 global but NAIP is US-only). Temporal resolution: only 4 Sentinel-2 images per tile.
- Relevance: 4/5 — Excellent resource for RS pre-training. The supervised paradigm complements SSL methods. SatlasNet unified architecture is adaptable.

**Key Insights:**
1. **Label everything visible:** SatlasPretrain's philosophy is to annotate all observable features in satellite imagery — not just one task. This creates richer supervision than single-task datasets.
2. **Multi-task pre-training beats SSL:** Pre-training on SatlasPretrain's supervised labels improves downstream accuracy by 6% over best SSL baseline (SeCo) and 18% over ImageNet — showing that diverse supervised labels can outperform SSL for RS.
3. **Sensor diversity challenge:** Models must process both Sentinel-2 (10m, 13-band multispectral) and NAIP (1m, 4-band) imagery, requiring cross-resolution capability.
4. **Long-tail applications benefit most:** Pre-training on SatlasPretrain especially improves niche tasks with few labels (e.g., glacier mapping, water tower detection).

**Notes:**
- Allen Institute for AI (AI2). Code and weights publicly available.
- Dataset: 856K tiles (828K train, 28K test), 302M labels, Sentinel-2 (512×512, 10m) + NAIP (256×256, 1m).
- 7 label types: point (8 categories), polygon (20), polyline (3), segmentation (40), regression (5), property (5), patch classification (56).
- SatlasNet: Swin-B backbone + 7 task-specific heads. Trained with multi-task loss.
- Licensed under CC-BY 4.0.
- Published at ICCV 2023 (oral).
