---
title: GeoMeld Dataset
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: remote-sensing
contribution_type: dataset
tags: [remote-sensing, dataset, multimodal, sar, optical, dem, land-cover, foundation-model]
arxiv_id: "2604.10591"
sources:
zotero_keys: []
venue: CVPR 2026 Workshop
open_source: true
code_url: https://github.com/MaramAI/GeoMeld
dataset_access: public
confidence: medium
---

# GeoMeld Dataset

## Overview

GeoMeld is a large-scale multi-modal remote sensing dataset (~2.5M spatially aligned samples) paired with semantically grounded captions, designed for foundation model pre-training. Accepted at CVPR 2026 Workshop.

Key innovation: **agentic captioning** — 4 LLM-powered agents (Orchestrator → Captioner → Evaluator → Verifier) generate and verify text descriptions that are factually grounded in measurable geospatial signals (land cover stats, water presence, terrain classification).

## Construction Methodology

### Geographic Sourcing (3 principles)

1. **Biome-stratified sampling**: reduces over-representation of agriculture/urban; improves coverage of tundra, wetlands, mangroves
2. **Cross-dataset anchors**: uses coordinates from MMEarth (1.2M) and SkyScript (699k) but discards original imagery/annotations to prevent leakage
3. **Underrepresented regions**: 666k custom points in Africa, South America, Asia → improves global equity

### Modality Alignment

- Spatial: 1280m × 1280m ROI per anchor, resampled to 10m GSD → 128×128 arrays
- Temporal: anchor-based reference (NAIP date for US; random month for others)
- Sentinel-2: <10% cloud cover; Sentinel-1 and Dynamic World: within ±15 days of S-2 acquisition

### Agentic Captioning Pipeline

```
Orchestrator → Captioner → Evaluator → Verifier → Final Caption
    │              │           │           │
    │         generates     ranks via    cross-checks
    │         candidates    RemoteCLIP   against OSM,
    │                                   JRC water,
    │                                   geomorphon
    │
 extracts structured
 metadata + land-cover
 stats + geo tags
```

## Dataset Statistics

| Property | Value |
|----------|-------|
| Total samples | ~2.5M |
| Modalities | Sentinel-2 (10 bands), Sentinel-1 (VV/VH/HH/HV), NAIP (RGB, 1m), ASTER-DEM, canopy height, ESA WorldCover, Dynamic World, geographic metadata |
| Spatial coverage | Global (biome-stratified + 666k underrepresented region samples) |
| Temporal range | NAIP: 2012-2023; Sentinel: aligned to anchor dates |
| Resolution | 10m GSD (NAIP upsampled from 1m) |
| Grid size | 128×128 per sample |
| Caption style | Semantically grounded, multi-sentence, verified against geospatial signals |
| License | Not specified (arXiv preprint) |
| Access | Public (GitHub repository) |
| Publication venue | CVPR 2026 Workshop |
| Code URL | https://github.com/MaramAI/GeoMeld |

### Dataset Comparison

| Dataset | Samples | Modalities | Resolution | Captions | Foundation Model |
|---------|---------|------------|------------|----------|-----------------|
| MMEarth | 1.2M | S1, S2, DEM, canopy, land-cover, ERA5, geo | 10m | No | MP-MAE |
| SkyScript | 2.6M | RGB | 0.1-30m | Simple text | SkyCLIP |
| SatlasPretrain | 302M labels | S2, NAIP, Sentinel-1 | varying | No | SatlasNet |
| GeoMeld | 2.5M | S2, S1 (4 pol), NAIP, DEM, canopy, 2× land-cover, geo | 10m (NAIP 1m) | Verified agentic | GeoMeld-FM |

## Benchmark Baselines

GeoMeld-FM pre-training evaluated on 4 downstream benchmarks:

| Method | BigEarthNet F1↑ | So2Sat Acc↑ | Cashew IoU↑ | SAcrop IoU↑ |
|--------|-----------------|-------------|-------------|-------------|
| ImageNet (supervised) | 55.7 | 36.6 | 77.1 | 26.7 |
| MMEarth (MP-MAE) | 67.1 | 54.6 | 79.8 | 38.2 |
| **GeoMeld-FM (full)** | **71.8** | **59.8** | **83.2** | **42.7** |

Ablation: MP-MAE + JEPA + ITC each contributes additively. Full model outperforms all baselines.

## Gap Analysis

Compared to existing RS datasets:

✅ **Multimodal breadth**: Unlike MMEarth (5 modalities) or SkyScript (RGB only), GeoMeld has 8+ aligned modalities including NAIP high-res and dual-polarization SAR

✅ **Semantic grounding**: First RS dataset with agentically-verified captions (vs. simple metadata in SkyScript)

✅ **Geographic equity**: 666k underrepresented region samples vs. MMEarth's Sentinel-biased distribution

⚠️ **Not truly global**: Still NAIP-centric for US samples; Sentinel-1 coverage incomplete in some regions

⚠️ **Caption quality unverified at scale**: Agentic pipeline is automated — human evaluation sample size unknown

⚠️ **Temporal limitation**: Single timepoint per location, no time-series

## Known Limitations

- NAIP only available for US → non-US samples lack 1m RGB
- Sentinel-1 availability varies by orbit and region
- Agentic captions may hallucinate despite verification chain
- No temporal dimension — static snapshots only
- License not yet specified (preprint stage)

## Related

- [[../../representation-learning/multi-modal-fm]] — GeoMeld-FM method contribution
- [[../benchmark/pangaea]] — PANGAEA benchmark for geospatial FM evaluation
- [[module/data-scarcity]] — data scarcity problem this dataset addresses
- [[module/modality-fusion]] — modality fusion strategies enabled by multi-modal data
