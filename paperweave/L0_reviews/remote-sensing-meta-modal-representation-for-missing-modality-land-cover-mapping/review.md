---
slug: "remote-sensing-meta-modal-representation-for-missing-modality-land-cover-mapping"
title: "Remote Sensing Meta Modal Representation for Missing Modality Land Cover Mapping: From EarthMiss Dataset to MetaRS Method"
authors:
  - "Yiheng Zhou"
  - "Ailong Ma"
  - "Junjue Wang"
  - "Zihang Chen"
  - "Yanfei Zhong"
score: 3
contribution: 3
soundness: 3
relevance: 3
open_source: true
code_url: "https://github.com/..."
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** EarthMiss dataset (3355 high-resolution SAR-Opt pairs, 8 classes, 0.6m resolution). MetaRS framework for missing modality land cover mapping with meta-modal aware module and representation regularization. Tested on 2023 Libya flood case.

## [2026-05-02] Comprehensive Review

**Score:** 3/5
- Contribution: 3/3 — EarthMiss dataset is useful for missing-modality research; meta-modal representation disentanglement
- Soundness: 3/3 — Evaluated on EarthMiss + 4 benchmarks + real-world Libya flood case
- Relevance: 3/3 — Relevant for multi-modal RS with modality incompleteness

**Key Insights:**
1. EarthMiss: 3355 SAR-Opt pairs at 0.6m resolution from 13 cities across 5 continents, 8 land cover classes.
2. MetaRS: meta-modal aware module extracts modality-invariant features for missing modality recovery.
3. Feature disentanglement via covariance matrix regularization preserves modality-specific distributions.
4. Meta-modal representation regularization guides focus on task-relevant features.
5. Validated on 2023 Libya flood disaster mapping as real-world application.

**Notes:**
- ISPRS Journal 2025, Wuhan University + University of Tokyo.
- First high-resolution SAR-Opt land cover dataset for missing modality research.
- Code and dataset available.
- No VLM or MoE components.
