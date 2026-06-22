---
title: SatlasPretrain Dataset
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: remote-sensing
contribution_type: dataset
tags: [remote-sensing, dataset, pre-training, sentinel-2, naip, iccv]
arxiv_id: "2211.15660"
sources: []
  - L0_raw/reben-refined-bigearthnet-dataset-for-remote-sensing-image-analysis
  - L0_raw/satlaspretrain
zotero_keys: [G9I4JX5E, 93E8GA4E]
venue: ICCV 2023
open_source: true
code_url: https://github.com/allenai/satlas
dataset_access: public
confidence: high
---

# SatlasPretrain Dataset

## Overview

SatlasPretrain is a massive-scale remote sensing pre-training dataset from the Allen Institute for AI (AI2), published at **ICCV 2023**. It combines Sentinel-2 and NAIP imagery with **302 million labels** across **137 categories** and **7 label types**.

Key innovation: breadth of label types — from point objects (wind turbines) to polygons (buildings) to polylines (roads) to segmentation masks — enabling multi-task pre-training that generalizes across diverse downstream tasks.

## Construction Methodology

### Data Sources

- **Sentinel-2**: 10m resolution, multi-spectral
- **NAIP**: 1m resolution, RGB, US-only
- Labels derived from automated pipelines + existing GIS databases + manual verification

### Label Types (7)

| Type | Examples | Count (approximate) |
|------|----------|---------------------|
| Points | Wind turbines, water towers, lighthouses | Many |
| Polygons | Buildings, airports, solar farms | Many |
| Polylines | Roads, rivers, coastlines | Many |
| Segmentation | Land cover categories | ~ |
| Regression | Bathymetry (water depth), tree cover % | ~ |
| Object properties | Wind turbine rotor diameter | ~ |
| Patch classification | Smoke presence, flood extent | ~ |

### Categories

137 categories spanning infrastructure, land use, natural features:
- Energy: wind turbines, solar farms, power plants
- Transportation: roads, railways, airports, ports, bridges
- Water: rivers, lakes, reservoirs, dams
- Agriculture: crop fields, irrigation
- Urban: buildings, parking lots
- Natural: forests, wetlands, glaciers

## Dataset Statistics

| Property | Value |
|----------|-------|
| Total labels | 302,000,000 |
| Categories | 137 |
| Label types | 7 |
| Image modalities | Sentinel-2 (10m) + NAIP (1m) |
| Total image megapixels | 17,000,000 |
| Area covered | 21,000,000 km² |
| License | Open (AI2) |
| Access | Public |
| Publication venue | ICCV 2023 |
| Code URL | https://github.com/allenai/satlas |
| Models (PyPI) | `satlaspretrain-models` |

### Dataset Comparison

| Dataset | Labels | Categories | Label Types | Modalities | Venue |
|---------|--------|------------|-------------|------------|-------|
| **SatlasPretrain** | **302M** | **137** | **7** | S2 + NAIP | ICCV 2023 |
| MMEarth | — | — | 0 (pretext only) | 12 modalities | arXiv 2024 |
| GeoMeld | — | — | 0 (captions) | 8 modalities | CVPRW 2026 |
| SkyScript | — | — | 0 (captions) | RGB | arXiv 2024 |

SatlasPretrain is unique in the sheer breadth of supervised label types — it's not just a pre-training dataset for self-supervised learning, but a **multi-task supervised pre-training** corpus.

## Pre-trained Models

AI2 released pre-trained models via `satlaspretrain-models` PyPI package:

- **Backbone**: Swin-B, pre-trained on SatlasPretrain
- **Backbone + FPN**: For detection/segmentation tasks
- **Modalities**: Sentinel-2, NAIP, Sentinel-2+NAIP combined
- **Task heads**: Separate prediction heads per label type, randomly initialized for downstream fine-tuning

Training recipe: multi-task learning on all 137 categories simultaneously, with task-specific loss weighting.

## Gap Analysis

✅ **Unprecedented label breadth**: 302M labels, 137 categories, 7 types — no other RS dataset comes close

✅ **Multi-task pre-training**: Learning from diverse supervision signals simultaneously

✅ **Open models**: Pre-trained weights released on PyPI, ready for fine-tuning

✅ **ICCV 2023**: Top-tier venue acceptance validates methodology

⚠️ **Modality limited**: Only Sentinel-2 + NAIP, no SAR, DEM, or climate data

⚠️ **US-centric for NAIP**: High-res imagery only covers US

⚠️ **Labels auto-generated**: Automated pipelines may introduce noise; human verification coverage unknown

⚠️ **No temporal sequences**: Static imagery, no time-series support

## Known Limitations

- NAIP coverage limited to US → geographic bias in high-res branch
- Auto-generated labels may have systematic errors (e.g., missing small objects)
- No SAR → cannot learn from cloud-penetrating modality
- Large dataset size (302M labels) makes full training computationally heavy
- Pre-trained Swin-B may not match latest architectures (ViT, ConvNeXt)

## Related

- [[mmearth]] — complementary: MMEarth offers modality breadth, SatlasPretrain offers label breadth
- [[../../representation-learning/multi-modal-fm]] — pre-training paradigm enabled by this dataset
- [[../../representation-learning/mae-based]] — MAE-based methods benefit from SatlasPretrain pre-training
- [[module/data-scarcity]] — supervised pre-training as alternative to SSL
- [[module/open-source-reproducibility]] — AI2's open model release is exemplary
