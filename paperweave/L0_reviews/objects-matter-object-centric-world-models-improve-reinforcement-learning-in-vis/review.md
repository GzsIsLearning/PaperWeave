---
slug: "objects-matter-object-centric-world-models-improve-reinforcement-learning-in-vis"
title: "Objects Matter: Object-Centric World Models Improve Reinforcement Learning in Visually Complex Environments"
authors:
  - "Weipu Zhang"
  - "Adam Jelley"
  - "Trevor McInroe"
  - "Amos Storkey"
year: 2025
venue: "arXiv / Under review"
tags: [rl, mb-rl, object-centric-learning, world-models, atari]
score: 3
contribution: 3
soundness: 3
relevance: 2
open_source: false
code_url: ""
compute: "single GPU (estimated)"
dataset_access: public
---

> **Abstract:** OC-STORM integrates frozen vision foundation models (Cutie for object segmentation) into model-based RL world models. Object-centric representations replace/supplement raw pixel auto-encoding, enabling agents to focus on decision-relevant objects rather than being dominated by large background regions.

## [2026-05-02] Review

**Score:** 3/5
- Contribution: 3/5 — The idea of injecting frozen vision FM features into MBRL is pragmatic. Using Cutie's object transformer output as compact (2048-D) object representations is clever. However, the core architecture (STORM) and training paradigm (DreamerV3) are inherited with minimal changes.
- Soundness: 3/5 — Atari 100k results show improvement on object-dominant games (15 games: 142.8% HNS vs 116.5%) but regression on background-dependent games. Hollow Knight results are promising but not benchmark-standardized. The method requires manual annotation of objects (K predetermined per environment), breaking full autonomy.
- Relevance: 2/5 — RL paper with limited RS relevance. Object-centric world models might inspire object-level reasoning in EO (e.g., building-level change detection) but the connection is indirect.

**Key Insights:**
- Manual label cost is minimal: "a small number of frames" with segmentation masks — practical for deployment.
- Object features alone can be sufficient for decision-making when objects encapsulate all relevant information (Section 5.1 evidence).
- Combining object + visual features works best — visual context still matters.
- Cutie's frozen backbone provides consistent, transferable object representations without environment-specific training.

**Citation Mining:**
- Cutie [Cheng et al., 2023] — video object segmentation backbone
- DreamerV3 [Hafner et al., 2023] — model-based RL framework
- STORM [Zhang et al., 2023] — baseline world model architecture
- Slot Attention [Locatello et al., 2020] — object-centric representation

**L1 Ecology Observations:**
- Frozen vision FM features for object-centric reasoning could apply to RS scene decomposition
- Object-centric world models could improve RS change detection at object level
- Combining object + visual features is relevant for RS multi-level analysis
