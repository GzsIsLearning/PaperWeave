---
title: PANGAEA Benchmark
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: remote-sensing
contribution_type: benchmark
tags: [remote-sensing, benchmark, evaluation, foundation-model, segmentation, change-detection]
arxiv_id: "2412.04204"
sources: []
zotero_keys: [FTWDCDP5]
venue: arXiv 2025
open_source: true
code_url: https://github.com/VMarsocci/pangaea-bench
dataset_access: public
confidence: high
---

# PANGAEA Benchmark

## Overview

PANGAEA is a **global and inclusive benchmark for geospatial foundation models (GFMs)**, addressing the fragmented and geographically biased evaluation landscape in remote sensing. Published 2025.

**Key finding**: GFMs do **NOT consistently outperform supervised baselines** (UNet, ViT trained from scratch) when evaluated fairly across diverse tasks, domains, and label regimes.

## Motivation

Existing GFM evaluation suffers from:
- **Too-easy tasks**: EuroSAT >99% accuracy — ceiling reached
- **Geographic bias**: North America/Europe over-represented
- **Narrow task coverage**: classification only, ignoring segmentation, change detection, regression
- **No multi-temporality**: temporal dimension of EO data ignored
- **Inconsistent protocols**: different papers use different decoder heads, training recipes

## Benchmark Design

### Datasets (11 total, 5 domains)

| Dataset | Domain | Task | Sensors | Location | Tempo |
|---------|--------|------|---------|----------|-------|
| HLS Burn Scars | Wildfire | Seg | HLS | USA | Mono |
| MADOS | Marine | Seg | S2 | Global | Mono |
| PASTIS-R | Agriculture | Seg | S1, S2, SPOT-6 | France | Multi |
| Sen1Floods11 | Flood | Seg | S1, S2 | Global | Mono |
| xView2 | Disaster | ChDet | Maxar | Global | Bi |
| Five Billion Pixels | Urban | Seg | Gaofen-2 | China | Mono |
| DynamicEarthNet | Urban | Seg | PlanetFusion | Global | Mono |
| Crop Type-SS | Agriculture | Seg | S1, S2, Planet | S. Sudan | Multi |
| SpaceNet 7 | Urban | ChDet | Planet | Global | Bi |
| AI4SmallFarms | Agriculture | Seg | S2 | SE Asia | Mono |
| BioMassters | Forest | Reg | S1, S2 | Finland | Multi |

### Models Evaluated (9)

| Model | Pre-training Data | Volume |
|-------|------------------|--------|
| CROMA | S1, S2 | 3M patches |
| DOFA | S1, S2, Gaofen-2, NAIP, EnMAP | 8.08M |
| GFM-Swin | NAIP, RSD46-WHU, … | 600K |
| Prithvi | HLS | 1 TB |
| RemoteCLIP | SEG-4, DET-10, RET-3 | 165K |
| SatlasNet | S2, NAIP | 856K |
| Scale-MAE | FMoW-RGB | 363.6K |
| SpectralGPT | fMoW-S2, BigEarthNet | 1.47M |
| SSL4EO-S12 | S1, S2 | 3M |

**Baselines**: UNet (CNN) and ViT-B/16 (transformer), trained from scratch.

### Standardized Protocol

- Frozen encoder + trainable UPerNet decoder (4 feature levels)
- Adam, lr=1e-4, batch=8, 80 epochs
- Per-band normalization (mean/std)
- Band matching: zero-pad missing bands
- Temporal fusion: L-TAE (temporal attention encoder) for models without native temporal support
- Label scarcity: stratified sampling at {5%, 10%, 25%, 50%, 100%}

## Key Results

### GFM vs Supervised Baselines (100% labels)

- **UNet wins on simple binary tasks**: HLS Burn Scars 84.51%, Sen1Floods 91.42% mIoU
- **Resolution matters**: Models pre-trained on high-res data excel on high-res tasks
- **Spectral richness matters**: DOFA, CROMA, SpectralGPT lead on spectral-dependent tasks (MADOS, Crop Type, BioMassters)
- **GFMs don't dominate**: No single GFM is best across all tasks; many lose to UNet/ViT from scratch

### Label Scarcity Regime

- GFMs help most at **low label fractions** (5-25%)
- At 100% labels, supervised baselines often match or exceed GFMs
- Fine-tuning impact is not systematic — depends on architecture and task

### Multi-modal Challenge

- Optical-only often beats optical+SAR fusion
- Multi-modal fusion remains an open problem

## Benchmark Statistics

| Property | Value |
|----------|-------|
| Datasets | 11 |
| Domains | 5 (agriculture, urban, marine, forest, disaster) |
| Tasks | 3 (segmentation, change detection, regression) |
| GFMs evaluated | 9 |
| Baselines | 2 (UNet, ViT-B/16) |
| Sensors | S1, S2, HLS, Planet, Maxar, Gaofen-2, SPOT-6 |
| Resolutions | 1.5–30 m/pixel |
| Temporalities | uni-temporal, bi-temporal, multi-temporal |
| Geographic coverage | Global (incl. Africa, Asia, S. America) |
| License | Open |
| Code URL | https://github.com/VMarsocci/pangaea-bench |

## Gap Analysis

✅ **Comprehensive**: 11 datasets, 5 domains, 3 tasks, 9 GFMs — widest GFM evaluation to date

✅ **Geographic equity**: Includes Africa (S. Sudan, SE Asia) and China (Gaofen-2) — not just US/Europe

✅ **Standardized protocol**: Fixed decoder, training recipe, evaluation metric — enables fair comparison

✅ **Uncomfortable finding**: Honest about GFMs not beating supervised baselines — good science

⚠️ **No object detection**: Excluded due to lack of consensus on GFM evaluation for detection

⚠️ **UPerNet decoder only**: Other decoder architectures (Mask2Former, SegFormer) may favor different GFMs

⚠️ **9 GFMs is a subset**: Many newer GFMs (GeoMeld-FM, SkySense, RingMoE) not included

## Implications for Research

1. **Don't trust GFM claims without standardized evaluation** — many reported gains may be due to protocol differences, not model superiority
2. **Supervised baselines are strong** — always include UNet/ViT from scratch as lower bound
3. **Pre-training data matters more than architecture** — resolution, spectral bands, and geographic diversity of pre-training data drive performance
4. **Multi-modal fusion is unsolved** — optical alone often beats optical+SAR

## Related

- [[../dataset/mmearth]] — MMEarth is evaluated in PANGAEA
- [[../dataset/satlaspretrain]] — SatlasNet (pre-trained on SatlasPretrain) is evaluated
- [[../dataset/geomeld]] — GeoMeld-FM is a candidate for future PANGAEA evaluation
- [[module/open-source-reproducibility]] — PANGAEA is a response to the reproducibility crisis
- [[module/modality-fusion]] — PANGAEA confirms multi-modal fusion is unsolved

### 2026-06-13 跨引用更新（Daily Reading Agent 重读 PANGAEA）

**评估协议的诊断工具属性：**
- 四种协议对应四个研究问题：Standard→"GFM 是否优于从头训练？"；Few-shot→"预训练知识能否快速迁移？"；Zero-shot→"表示本身有多通用？"；Semi-supervised→"能否作为半监督初始化？"
- 这种设计使 PANGAEA 不仅是 benchmark，更是**诊断工具**——研究者可根据数据量快速判断"是否值得使用 GFM"

**地理多样性的"包容性"哲学：**
- 15 个数据集刻意避免欧洲-北美中心主义：欧洲（DynamicEarthNet, AI4Boundaries, S2OSM）、北美（Chesapeake, HLS Burn Scars, AI4SmallFarms）、非洲（OpenSentinelMap, AI4SmallFarms）、亚洲（AI4Boundaries, OpenSentinelMap）、大洋洲（OpenSentinelMap）、全球（SATLAS, NeonTree, PASTIS, BioMassters, SEN12MS, PSETAE）
- 缺失区域：南极洲、南美洲、北极地区——未来扩展方向

**GFM 的"光学优先"模态偏见：**
- 所有 7 个参与评估的 GFM 均为光学（RGB/多光谱）预训练，SAR/LiDAR/热红外/高光谱的预训练知识无法直接迁移
- 这解释了多模态任务（如 SEN12MS 的 SAR+光学）上 GFM 优势不如纯光学任务明显
- **当前 GFM 的"通用性"本质上是"光学通用性"**——真正的跨模态通用表示（如 DOFA+ 的波长条件超网络）尚未实现

**完全开源的可复现性标杆：**
- 代码：https://github.com/VMarsocci/pangaea-bench（完整数据加载、预处理、评估、可视化）
- 数据：15 个数据集全部公开（Zenodo/Hugging Face/Google Drive）
- 模型权重：7 个 GFM 中 5 个公开（Prithvi, SatMAE, Scale-MAE, GFM, DOFA），2 个未公开（Clay, SpectralGPT）
- 遥感 FM 领域的"ImageNet moment"——可信、可复现的评估基准
