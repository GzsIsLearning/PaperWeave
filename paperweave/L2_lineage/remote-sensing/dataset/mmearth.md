---
title: MMEarth Dataset
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: remote-sensing
contribution_type: dataset
tags: [remote-sensing, dataset, multimodal, sar, optical, dem, land-cover, climate, foundation-model]
arxiv_id: "2405.02771"
sources: []
zotero_keys: []
venue: arXiv 2024
open_source: true
code_url: https://github.com/vishalned/MMEarth
dataset_access: public
confidence: high
---

# MMEarth Dataset

## Overview

MMEarth is the first large-scale multi-modal pre-training dataset for Earth observation, covering **1.2M global locations** with **12 modalities** balanced across **14 biomes**. Designed for self-supervised representation learning with the MP-MAE (Multi-Pretext Masked Autoencoder) framework.

Published 2024. Code and data fully open (CC BY 4.0).

## Construction Methodology

### Geographic Sampling

- 1.2M locations globally, years 2017–2020
- **Biome-stratified**: samples proportional to ecoregion area within each of 14 biomes
- Formula: `N_e = (N_total / 14) * (A_e / A_biome_e)`
- All data from Google Earth Engine (GEE)
- Two subsets: MMEarth100k (full-res 128×128) and MMEarth64 (1.2M locations at 64×64)

### Pixel-level Modalities (128×128 px, 1.28 km)

| Sensor/Product | Description | #Channels |
|----------------|-------------|-----------|
| Sentinel-2 L1C/L2A | Optical multispectral | 12 |
| Sentinel-1 | SAR (VV/VH/HV/HH, asc/desc) | 8 |
| ASTER DEM | Elevation + slope | 2 |
| ETH-GCHM | Canopy height + uncertainty | 2 |
| Dynamic World | Land cover (yearly mode) | 1 (categorical) |
| ESA WorldCover | Land cover (2020) | 1 (categorical) |

### Image-level Modalities (scalar per location)

| Modality | Description |
|----------|-------------|
| Biome | 14 terrestrial biomes |
| Ecoregion | 846 ecoregions |
| ERA5 Temperature | mean/min/max for month, prev month, year |
| ERA5 Precipitation | total for month, prev month, year |
| Geolocation | Cyclic encoding (lat/lon → 4D) |
| Date | Cyclic encoding of observation month (2D) |

### Preprocessing

- Sentinel-2 cloud filter: <10% tile-level cloud cover
- Random year selection from 2017-2020
- All bands resampled to 10m GSD

## Dataset Statistics

| Property | Value |
|----------|-------|
| Total samples | 1,200,000 |
| Modalities | 12 (6 pixel-level + 6 image-level) |
| Pixel-level channels | 26 total (S2:12, S1:8, DEM:2, canopy:2, DW:1, ESA:1) |
| Spatial coverage | Global, 14 biomes |
| Temporal range | 2017-2020 |
| Resolution | 10m GSD (128×128 px = 1.28 km) |
| License | CC BY 4.0 |
| Access | Public (GEE + direct download) |
| Publication venue | arXiv 2024 |
| Code URL | https://github.com/vishalned/MMEarth |

### Dataset Comparison

| Dataset | Samples | Modalities | Pixel Ch. | Image-level | Biomes |
|---------|---------|------------|-----------|-------------|--------|
| MMEarth | 1.2M | 12 | 26 | 6 | 14 |
| SatlasPretrain | 302M labels | S2 + NAIP | 3-12 | 0 | — |
| GeoMeld | 2.5M | 8 | varies | 0 | biome-stratified |
| SkyScript | 2.6M | RGB | 3 | 0 | — |

MMEarth is unique in providing both pixel-level AND image-level modalities (climate, biome, location) — enabling supervision signals beyond pure vision.

## Benchmark Baselines (MP-MAE Results)

| Method | BigEarthNet F1↑ | So2Sat Acc↑ | EuroSat Acc↑ |
|--------|-----------------|-------------|--------------|
| ImageNet (supervised) | 55.7 | 36.6 | 86.0 |
| Sentinel-2 MAE | 64.1 | 45.8 | 89.4 |
| **MMEarth MP-MAE (equal weight)** | **67.1** | **54.6** | **89.7** |
| **MMEarth MP-MAE (uncertainty)** | **67.2** | **54.8** | **90.0** |

Key gains: +4pp on BigEarthNet, +16pp on So2Sat over ImageNet baseline. Multi-modal pretext tasks consistently outperform optical-only pre-training.

## Gap Analysis

Compared to prior work:

✅ **First global multi-modal RS dataset**: 12 modalities vs. prior single-modality or dual-modality datasets

✅ **Image-level modalities**: Climate (ERA5), biome, location as supervision signals — unique to MMEarth

✅ **Biome balancing**: Explicit geographic equity, unlike random sampling

✅ **Fully open**: CC BY 4.0, GEE scripts public, data downloadable

⚠️ **Only Sentinel-2 as optical**: No high-res (NAIP/Maxar/Planet) imagery

⚠️ **Static snapshots**: Single timepoint per location, no temporal sequences

⚠️ **No text captions**: Unlike SkyScript or GeoMeld, purely numeric modalities

## Known Limitations

- Sentinel-2 10m resolution limits applicability to very-high-res tasks
- No temporal dimension (single observation per location)
- SAR coverage limited to Sentinel-1 (C-band), no X-band or L-band
- Land cover from Dynamic World auto-classified, not human-verified
- Image-level modalities require special handling in architecture (pooling or separate encoders)

## Related

- [[../../representation-learning/multi-modal-fm]] — MP-MAE method contribution
- [[geomeld]] — successor dataset with agentic captions
- [[satlaspretrain]] — larger label count, narrower modalities
- [[../benchmark/pangaea]] — benchmark evaluates GFMs pre-trained on MMEarth
- [[module/modality-fusion]] — multi-modal fusion strategies
- [[module/data-scarcity]] — pre-training as response to annotation bottleneck
