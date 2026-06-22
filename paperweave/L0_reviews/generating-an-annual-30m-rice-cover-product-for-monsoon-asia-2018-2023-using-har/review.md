---
slug: "generating-an-annual-30m-rice-cover-product-for-monsoon-asia-2018-2023-using-har"
title: "Generating an annual 30m rice cover product for Monsoon Asia (2018–2023) using harmonized Landsat and Sentinel-2 data and the NASA-IBM geospatial foundation model"
authors:
  - "Husheng Fang"
  - "Shunlin Liang"
  - "Wenyuan Li"
  - "Yongzhe Chen"
  - "Han Ma"
  - "Jianglei Xu"
  - "Yichuan Ma"
  - "Tao He"
  - "Feng Tian"
  - "Fengjiao Zhang"
  - "Hui Liang"
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
- First continental-scale application of NASA-IBM Prithvi GFM for rice mapping
- 30m annual rice maps for Monsoon Asia (2018-2023)
- CNN branch added to Prithvi for local spatial feature extraction
- Overall accuracy 84.14% across Monsoon Asia; F1 83-90% across climate zones
- Auto-labeling from existing rice products + HLS data fine-tuning
- Outperforms MODIS-based (500m) and SAR-based (20m) products

**Citation Mining:**
- Prithvi [IBM & NASA, 2023] — geospatial foundation model used
- HLS [Claverie et al., 2018] — Harmonized Landsat-Sentinel data
- MODIS — comparison baseline
- Sentinel-1 SAR — alternative approach

**L1 Ecology Observations:**
- First continental-scale GFM deployment for crop mapping — validates GFM practical utility
- CNN branch addition to ViT backbone shows hybrid architectures can improve RSFM localization
- Auto-labeling strategy reduces manual annotation cost for RS
- GFMs can produce products exceeding traditional MODIS/SAR-based approaches


## [2026-05-31] SciJudge Re-Read

**Score:** 4/5
- Contribution: 4/5 — First continental-scale GFM application for crop mapping; combines Prithvi MAE backbone + CNN-CBAM branch for local detail recovery; published in Remote Sensing of Environment (RSE) 2026
- Soundness: 4/5 — Rigorous 35,458 validation points, 6-year temporal coverage (2018-2023), cross-product comparison; stratified sampling across 4 climate zones; thorough ablation (CNN/CBAM/hyperparameters)
- Relevance: 5/5 — Directly validates RS FM utility for agricultural monitoring; addresses fragmented smallholder farming paradigm (key RS challenge)

**Key Insights:**
- Prithvi's full-parameter fine-tuning + CNN branch (with CBAM) improves F1 from 0.828 to 0.860 (+3.9%), demonstrating ViT's local spatial feature limitation and a simple architectural fix
- Auto-labeling from 10 existing rice products (overlaid via majority voting with 70% stability threshold) eliminates manual annotation — scalable paradigm for continental mapping
- 84.14% OA across Monsoon Asia, with strong gradient: Continental zone 90.06% > Arid 83.67% ≈ Tropical 83.75% > Temperate 83.07%; tropical underestimation due to cloud cover, arid commission from maize confusion
- Outperforms MODIS-based (70.03% OA, +14%) and SAR-based (82.66% OA, +1.5%) continental products
- Key limitation not fully discussed: Prithvi's 6-band pretraining (R,G,B,NIR,SWIR1,SWIR2) excludes red-edge bands which are critical for crop discrimination; this is a structural constraint inherited from HLS data design

**Compared to L2 Lineage (Multi-source Crop Monitoring):**
- Sits at the transition from "FM transfer" to "agriculture-specific FM" in the lineage; completes the CropHarvest→CropClimateX→30m Rice Cover trajectory
- Compared to AgriFM (Video Swin, multi-task): this work uses a simpler ViT+CNN architecture but achieves continental-scale single-task production, complementing AgriFM's multi-task approach
- Less architecturally ambitious than AgriFM's hierarchical Video Swin but operationally validated at larger spatial scale
- Validation methodology (Stage 2 per CEOS-LPV) is explicitly documented — rare transparency in crop mapping literature

**Notes:**
- Venue: Remote Sensing of Environment (RSE), published 2026; Wuhan University + University of Hong Kong
- Compute: 4× NVIDIA L40 GPUs, full parameter fine-tuning (not parameter-efficient like LoRA)
- Code/data: Product to be released at www.glass.hku.hk upon acceptance
- Ablation shows CNN+CBAM adds +2.3% mIoU over CNN alone (75.45 vs 74.94 IoU)
- Uses RiceAtlas for per-subregion phenology alignment (2,722 sub-regions) — domain-specific data engineering
- HLS derived from L8+S2 fusion at 30m with 2-3 day revisit, processed via Fmask cloud masking

**Citation Mining (3-8 papers):**
- 直接谱系: Prithvi-EO-2.0 (Jakubik et al., 2023) — arXiv — NASA-IBM GFM that provides the pre-trained backbone; directly determines input bands and architecture constraints
- 范式基础: MAE (He et al., 2022) — CVPR 2021 — Prithvi's self-supervised pretraining strategy; understanding MAE's masking paradigm essential for interpreting Prithvi's strengths/weaknesses
- 关键对手: AgriFM (Li et al., 2025) — RSE — Video Swin Transformer for agriculture, the architecture-level alternative to Prithvi+CNN; AgriFM's hierarchical design addresses the same local feature gap without external CNN branch
- 关键对手: U-Net baseline (this paper's own comparison) — Traditional CNN still competitive at 100% training data (F1 0.836 vs Prithvi 0.860), questioning FM advantage in data-rich regimes
- 设计空间对比: CropHarvest (Tseng et al., 2021) — NeurIPS — The pioneering unified crop dataset that enabled the data infrastructure for large-scale mapping
- 设计空间对比: PhenoRice (Boschetti et al., 2017) — RSE — Phenology-based rice mapping representing the pre-DL era baseline

**原始 review 验证:**
- Score (4/5) still holds: contribution validated by publication in high-impact RSE journal and demonstrated performance
- Key insights about auto-labeling and CNN branch are confirmed and deepened
- Original review missed: (1) red-edge band limitation inherited from Prithvi, (2) detailed comparison with AgriFM in architectural design space, (3) RSE venue confirmed (was submitted at original review), (4) explicit CEOS-LPV validation stage self-assessment

### Cross-Review Diff (vs previous reviews)

1. Original review didn't analyze Prithvi's spectral limitations (6-band only, no red-edge); this re-read identifies it as a structural constraint from HLS data design
2. New citation mining adds AgriFM (Video Swin) as key architectural competitor — absent in original review, now critical context given AgriFM's publication
3. Original review rated Relevance 5/5; this re-read confirms operational validation at continental scale strengthens this rating
4. Original review mentioned "first continental-scale" correctly but didn't quantify the performance gap between GFM and traditional ML in data-scarce vs data-rich regimes
5. This re-read adds CEOS-LPV validation stage analysis (Stage 2) missing from original review, providing quality assessment framework context
