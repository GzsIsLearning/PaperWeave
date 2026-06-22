---
slug: "a-semantic-enhanced-multi-modal-remote-sensing-foundation-model-for-earth-observ"
title: "SkySense++: A Semantic-Enhanced Multi-Modal Remote Sensing Foundation Model for Earth Observation"
authors:
  - "Kang Wu"
  - "Yingying Zhang"
  - "Lixiang Ru"
  - "Bo Dang"
  - "Jiangwei Lao"
  - "Lei Yu"
  - "Junwei Luo"
  - "Zifan Zhu"
  - "Yue Sun"
  - "Jiahao Zhang"
  - "Qi Zhu"
  - "Jian Wang"
  - "Ming Yang"
  - "Jingdong Chen"
  - "Yongjun Zhang"
  - "Yansheng Li"
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "To be released (extension of SkySense)"
compute: "Large-scale (80+ GPUs implied)"
dataset_access: true
---

> **Abstract:** Extension of SkySense with semantic-enhanced pre-training. Two-stage progressive pre-training: (1) representation-enhanced via MGCL on 27M multi-modal images, (2) semantic-enhanced via Masked Semantic Learning (MSL) with in-context learning using semantic banks. Supports 11+ satellite platforms, 12 EO tasks across 7 domains.

## [2026-05-02] Comprehensive Review

**Score:** 5/5
- Contribution: 5/5 — Novel masked semantic learning + in-context learning for multi-modal RSFM; progressive training from unlabeled to labeled data; semantic bank concept
- Soundness: 5/5 — Evaluated on 12 EO tasks across 7 domains; strong few-shot capability demonstrated
- Relevance: 5/5 — Directly relevant to RS foundation models

**Key Insights:**
1. Extends SkySense with semantic-enhanced pre-training using Masked Semantic Learning (MSL).
2. Semantic bank: learnable features encoding categories for in-context learning across modalities.
3. Progressive training: Stage I (MGCL on 27M unlabeled images) -> Stage II (MSL on labeled data).
4. Supports 11+ satellite platforms (Sentinel-1/2, Gaofen-2, Jilin-1, SPOT-5, Planet).
5. 12 EO tasks across 7 domains: agriculture, forestry, oceanography, atmosphere, biology, land surveying, disaster.
6. In-context learning enables few-shot downstream adaptation without fine-tuning.
7. Introduces RS-Rep (representation) and RS-Sem (semantic) datasets.

**Notes:**
- Nature (2025), Ant Group + Wuhan University. Extension of SkySense (CVPR 2024).
- Spatio-temporal-modality decoupling architecture inherited from SkySense.
- Key innovation over SkySense: adding semantic supervision with in-context learning.
