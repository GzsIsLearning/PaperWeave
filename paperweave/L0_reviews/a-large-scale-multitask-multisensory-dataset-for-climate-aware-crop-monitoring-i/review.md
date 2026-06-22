---
slug: "a-large-scale-multitask-multisensory-dataset-for-climate-aware-crop-monitoring-i"
title: "CropClimateX: A Large-scale, Multitask, Multisensory Dataset for Climate-Aware Crop Monitoring"
authors:
  - "Adrian Höhl"
  - "Stella Ofori-Ampofo"
  - "Miguel-Ángel Fernández-Torres"
  - "Ridvan Salih Kuzu"
  - "Xiao Xiang Zhu"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://bigearth.net"
compute: "N/A (dataset paper)"
dataset_access: true
---

> **Abstract:** CropClimateX dataset: 15,500 data cubes (12x12km), 1,527 US counties, 2018-2022. Multi-sensor (Sentinel-1/2, Landsat-8, MODIS), weather (Daymet), extreme events, soil, terrain. Supports crop yield prediction, phenology mapping, extreme event detection, multi-task learning. Genetic Algorithm optimizes minicube sampling.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/4 — Comprehensive multi-task, multi-sensor dataset for agricultural monitoring; optimized sampling reduces size by 43% while retaining 93% of crop regions
- Soundness: 4/4 — Careful data collection and validation methodology
- Relevance: 4/4 — Important resource for RS crop monitoring research

**Key Insights:**
1. CropClimateX integrates Sentinel-1/2, Landsat-8, MODIS, Daymet weather, extreme event indices, soil, and terrain data.
2. Genetic Algorithm + Sliding Grid Algorithm for optimized minicube placement targeting cultivated areas.
3. 43% dataset size reduction while retaining 93% of crop regions.
4. Supports multiple tasks: yield prediction, phenology mapping, crop condition forecasting, extreme event detection, sensor fusion, multi-task learning.
5. Covers contiguous US, 1,527 counties, 2018-2022.

**Notes:**
- Scientific Data (Nature) 2025, TU Munich + DLR + UC3M.
- Dataset paper, no ML model proposed.
- Important resource for climate-aware agriculture research.
- Open access dataset.
