---
slug: "skymoe-a-vision-language-foundation-model-for-enhancing-geospatial-interpretatio"
title: "SkyMoE: A Vision-Language Foundation Model for Enhancing Geospatial Interpretation with Mixture of Experts"
authors:
  - "Jiaqi Liu"
  - "Ronghao Fu"
  - "Lang Sun"
  - "Haoran Liu"
  - "Xiao Yang"
  - "Weipeng Zhang"
  - "Xu Na"
  - "Zhuoran Duan"
  - "Bo Yang"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: false
code_url: null
compute: "6x NVIDIA A800-80G, batch size 144, 5 epochs"
dataset_access: true
---

> **Abstract:** MoE VLM for RS with 8 expert FFNs, adaptive router, context-disentangled augmentation (Count-Varying Cutout + Attribute Editing). CLIP-ViT(L-14) vision backbone at 504x504 resolution, Vicuna-v1.5 LLM. Introduces MGRS-Bench benchmark (10,415 images, 18,433 instances, 5 tasks). SOTA on 21 public datasets.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — Novel context-disentangled augmentation strategy to enforce expert specialization; MGRS-Bench is valuable; strong across 5 task types
- Soundness: 4/5 — Extensive ablations on #experts, augmentation components; compared against 12+ baselines on 21 datasets
- Relevance: 4/5 — Directly relevant to RS VLM, MoE, multi-task interpretation

**Key Insights:**
1. 8-expert MoE replacing FFN layers in every other LLM layer with top-2 routing, initialized from cloned Stage I weights.
2. Context-Disentangled Augmentation (CDA) with Count-Varying Cutout (mask objects to vary density) and Attribute Editing (swap spatial/color attributes with Poisson blending).
3. CDA creates contrastive pairs between local/global features, compelling experts to specialize in granularity-specific representations.
4. Adaptive Router generates task- and granularity-aware routing instructions — not just a learned linear layer but conditioned on input.
5. MGRS-Bench: multi-granularity benchmark covering IC, VQA, VG, OC, SC with 10,415 images and 18,433 instances across resolution variations.
6. Trained on 251k instruction samples from DOTA, DIOR, FAIR1M, etc.; tested on 21 datasets.
7. SOTA: 91.77% on RESISC45, 92.37% on WHU-RS19; BLEU-4 43.0 on UCM-Captions; 67.6% on RSOD counting.
8. Ablation: 8 experts > 6 > 4 > 1; CDA significant for OC (+9.47%); full model gives +6.56% VQA vs MoE alone.
9. Compared to RS-MoE (Lin et al., TGRS 2025) which uses instruction router for subtask decomposition, SkyMoE targets feature-granularity expert specialization.

**Notes:**
- 2025 arXiv, Jilin University, China.
- Two-stage training: Stage I LoRA fine-tunes LLM (W_q, W_v, rank=64) with CLIP frozen; Stage II replaces every 2nd FFN layer with MoE (top-2 routing), initialized from cloned FFNs.
- 9.36B trainable params, 712.56 TFLOPs, 20.83 ms/token latency — comparable to GeoChat/VHM.
- Load balancing auxiliary loss with coefficient alpha.
- Code not publicly released (not explicitly open-source).
- References RS-MoE [Lin et al. 2025], RSUniVLM [Liu and Lian 2024], VHM [Pang et al. 2025] as related MoE-based RS works.
- Limitation: slight trade-off on pure scene classification tasks vs global-optimized models.
