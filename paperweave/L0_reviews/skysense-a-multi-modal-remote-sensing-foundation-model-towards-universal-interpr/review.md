---
slug: "skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr"
title: "SkySense: A Multi-Modal Remote Sensing Foundation Model Towards Universal Interpretation for Earth Observation Imagery"
authors:
  - "Xin Guo"
  - "Jiangwei Lao"
  - "Bo Dang"
  - "Yingying Zhang"
  - "Lei Yu"
  - "Lixiang Ru"
  - "Liheng Zhong"
  - "Ziyuan Huang"
  - "Kang Wu"
  - "Dingxiang Hu"
  - "Huimei He"
  - "Jian Wang"
  - "Jingdong Chen"
  - "Ming Yang"
  - "Yongjun Zhang"
  - "Yansheng Li"
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "Pre-trained weights to be released"
compute: "80x NVIDIA A100-80GB, batch size 240"
dataset_access: true
---

> **Abstract:** Largest multi-modal RS foundation model (2.06B params). Pre-trained on 21.5M temporal sequences of HSROI + Sentinel-2 MSI + Sentinel-1 SAR. Factorized multi-modal spatiotemporal encoder. Multi-Granularity Contrastive Learning + Geo-Context Prototype Learning. SOTA on 16 datasets over 7 tasks vs 18 RSFMs.

## [2026-05-02] Comprehensive Review

**Score:** 5/5
- Contribution: 5/5 — Largest MM-RSFM; novel factorized encoder design; MGCL for multi-granularity; Geo-Context Prototype Learning; comprehensive evaluation
- Soundness: 5/5 — Exhaustive experiments on 16 datasets, 7 tasks, vs 18 RSFMs; thorough ablations on all components
- Relevance: 5/5 — Directly relevant to RS foundation models, multi-modal learning, spatiotemporal representation

**Key Insights:**
1. Largest Multi-Modal RS Foundation Model: 2.06B parameters, pre-trained on 21.5M temporal sequences with optical (HSROI, Sentinel-2 MSI) and SAR (Sentinel-1) data.
2. Factorized Multi-Modal Spatiotemporal Encoder: decouples spatial feature extraction from multi-modal temporal fusion, enabling modular use (spatial encoder alone or with fusion module).
3. Multi-Granularity Contrastive Learning (MGCL): contrastive learning at pixel-, object-, and image-level across single- and multi-modal features for coarse-to-fine representations.
4. Geo-Context Prototype Learning (GCPL): unsupervised region-aware prototypes (4096 regions, 100 prototypes each) using Sinkhorn-Knopp algorithm + EMA, integrating geo-context via attention.
5. Cross-Modal Alignment (CMA): aligns features across HSROI, MSI, and SAR modalities using multi-modal contrastive loss.
6. Modular design allows flexible deployment: spatial encoder alone for single-modal tasks, combined with fusion module for multi-modal tasks.
7. SOTA on all 16 datasets across 7 tasks: semantic segmentation, object detection, change detection, scene classification, multi-modal segmentation, crop mapping.
8. Specifically: 92.58 F1 on LEVIR-CD, 78.73 mAP50 on DIOR, 97.68% OA on AID (20% TR), 54.57 mAP on FAIR1M.
9. Multi-modal fusion particularly beneficial under cloud cover (>50%: +13% with SAR).
10. Ablation: MGCL +2.2%, multi-modal +2.6%, CMA +0.7%, GCPL +0.5% on Dyna.-MM.

**Notes:**
- CVPR 2024, Ant Group + Wuhan University collaboration.
- Swin-H for HSROI, ViT-L for MSI and SAR encoders.
- Teacher-student self-supervised pretraining framework with EMA updates.
- Date-specific temporal positional encoding (DTPE) for seasonal awareness.
- GCPL visualizations show unsupervised segmentation of cropland, water bodies, etc.
- Major competitors: GFM, SatLas, Scale-MAE, SatMAE, RingMo, CACo, CMID.
- Released pre-trained weights (Ant Group).
- Limitations: Primarily vision-only (no language modality); future work plans to incorporate language.
- Key datasets: DynamicEarthNet, PASTIS-MM, BEN-MM, iSAID, DIOR, FAIR1M, LEVIR-CD, OSCD, fMoW-S2.


## [2026-05-31] SciJudge Re-Read

**Score:** 5/5
- Contribution: 5/5 — Largest MM-RSFM (2.06B params) at time of publication; factorized spatiotemporal encoder is a principled design choice; multi-granularity contrastive + Geo-Context Prototype Learning are novel; published at CVPR 2024
- Soundness: 5/5 — Most comprehensive evaluation in RS FM literature: 16 datasets, 7 tasks, 18 competing models; thorough ablations showing additive gains of each component
- Relevance: 5/5 — Remains one of the most broadly capable RS FMs; sets benchmark for multi-modal spatiotemporal representation

**Key Insights:**
- Factorized encoder design (spatial extraction → multi-modal temporal fusion) is principled: RSI sequences are spatially aligned by nature, making 3D convolution unnecessary — decoupling saves substantial parameters vs 3D architectures
- Multi-Granularity Contrastive Learning (pixel/object/image level + single/multi-modal) is the key innovation — coarse-to-fine spatial granularity addresses diverse downstream tasks from pixel-level segmentation to image-level classification
- Geo-Context Prototype Learning (4096 regions × 100 prototypes, Sinkhorn-Knopp + EMA) learns emergent unsupervised segmentation (water, cropland) that aligns with ESRI LandCover — surprising that 100 prototypes per region can capture such diverse global semantics
- Cross-Modal Alignment across HSROI/MSI/SAR is critical: ablation shows +0.7% mIoU from CMA alone; SAR contributes more under high cloud cover (50%+ cloud: +13% with SAR), validating the practical necessity of multi-modal pretraining
- 80× A100-80GB is massive compute (240 batch size) — raises questions about accessibility; model weights were to be released but status unclear

**Compared to L2 Lineage (MAE-based):**
- SkySense is the culmination of the contrastive + MAE hybrid trajectory (CROMA→GFM→SkySense) in the MAE-based lineage
- Its factorized encoder design differs fundamentally from end-to-end 3D approaches (SatSwinMAE, SeaMo); the modularity enables flexible deployment (spatial encoder alone or with fusion)
- Key comparison with RingMoE (14.7B, 2025): RingMoE pushes scale beyond SkySense with MoE, but SkySense's modular design remains more practical for real-world deployment
- Compared to Prithvi-EO-2.0 (600M, 2024): SkySense is older (CVPR 2024) but larger and more multi-modal; Prithvi-2.0 focuses on HLS temporal modeling with metadata embeddings

**Compared to L2 Lineage (Contrastive-based):**
- Represents the endpoint of the "massive scale" paradigm in contrastive RS (2150M images vs SoftCon's 780K)
- SoftCon achieves comparable BigEarthNet performance with 100 epochs — SkySense's advantage lies in complex downstream (segmentation/detection) where scale matters
- Geo-Context Prototype Learning extends the "free labels from RS properties" paradigm (SeCo's time → GASSL's GPS → CACo's change → SkySense's region prototypes)

**Notes:**
- Venue: CVPR 2024, Ant Group + Wuhan University
- Compute: 80× A100-80GB, 240 batch size, Swin-H for HSROI + ViT-L for MSI/SAR
- Code/weights: "to be released" per paper; verify GitHub release status for current usability
- Key downstream: LEVIR-CD 92.58 F1, DIOR 78.73 mAP50, FAIR1M 54.57 mAP, AID 97.68% OA
- Ablation: MGCL +2.2% → +MM +2.6% → +CMA +0.7% → +GCPL +0.5% (cumulative 48.2% mIoU on Dyna.-MM)
- Limitation: Vision-only, no language modality; future work mentions language integration
- Date-specific temporal positional encoding (DTPE) with 365 learnable parameters for seasonal awareness

**Citation Mining (3-8 papers):**
- 直接谱系: Swin Transformer (Liu et al., 2021) — CVPR — Backbone of SkySense's HSROI encoder; hierarchical shifted-window attention is the spatial feature extraction foundation
- 直接谱系: DINO / Caron et al. (2021) — ICCV — Teacher-student EMA framework that SkySense adapts for multi-modal pretraining; the self-distillation paradigm enables unsupervised prototype learning
- 范式基础: MoCo v3 / He et al. (2020) — CVPR — Momentum contrastive learning foundation; SkySense's MGCL uses MoCo-style contrastive loss at multiple granularities
- 关键对手: SoftCon / Wang et al. (2024) — IEEE TGRS — Efficiency-focused alternative achieving competitive BigEarthNet with 100 epochs vs SkySense's 1000+; challenges the "more compute = better" assumption
- 关键对手: RingMoE / Sun et al. (2025) — IEEE TGRS — 14.7B parameter MoE successor; SkySense's main scale competitor in the Chinese RS FM ecosystem
- 设计空间对比: GFM / Mendieta et al. (2023) — ICCV — Continual pretraining alternative (8× cheaper); represents the efficiency-first design philosophy contrasting SkySense's scale-first approach
- 设计空间对比: CROMA / Fuller et al. (2023) — NeurIPS — Earlier multi-modal hybrid (contrastive+MAE) at ViT-B scale; SkySense's direct methodological precursor

**原始 review 验证:**
- Score (5/5) and all dimensions confirmed — remains one of the strongest RS FMs even by 2026 standards
- Original Key Insights hold well; the factorized encoder judgment is validated by continued architectural influence
- Open-source status update needed: original review said "weights to be released" — at CVPR 2024 publication, weights release status should be verified; this is a significant practical concern
- The review didn't discuss compute accessibility — 80× A100 is prohibitive for most researchers, limiting reproducibility despite claimed release
- CVPR 2024 venue confirmed (was stated in original review)

### Cross-Review Diff (vs previous reviews)

1. Original review didn't include comparison with SoftCon (efficiency-focused competitive paradigm); this re-read adds SoftCon as a critical design-space alternative
2. Original review didn't mention compute accessibility concerns; this re-read identifies 80× A100 as a reproducibility barrier
3. New citation mining adds RingMoE (14.7B MoE successor published 2025) as key competitor, reflecting 1.5 years of subsequent RS FM developments
4. Original review listed GFM, SatLas, Scale-MAE as competitors; this re-read adds SoftCon and RingMoE as more relevant comparative baselines given 2025-2026 progress
5. Original review didn't analyze the factorized encoder vs 3D encoder design trade-off; this re-read contextualizes it as a principled alternative to SatSwinMAE's 3D approach
