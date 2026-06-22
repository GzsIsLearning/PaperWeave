---
slug: "seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data"
title: "Seasonal Contrast: Unsupervised Pre-Training from Uncurated Remote Sensing Data"
authors:
  - "Oscar Manas"
  - "Alexandre Lacoste"
  - "Xavier Giro-i-Nieto"
  - "David Vazquez"
  - "Pau Rodriguez"
year: 2021
venue: "ICCV 2021"
tags: [remote-sensing, self-supervised, contrastive-learning, seasonal, sentinel-2, representation-learning]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "— (publicly available)"
compute: "— (ResNet-50, 200 epochs)"
dataset_access: "public (Sentinel-2, 1M images)"
---

> **Abstract:** Contrastive SSL for RS using temporal/seasonal positive pairs. Introduces multi-head architecture with 3 embedding sub-spaces: (1) invariant to all augmentations (time+artificial), (2) invariant only to seasonal changes, (3) invariant only to artificial augmentations. Collects 1M uncurated Sentinel-2 images around cities worldwide. Outperforms ImageNet pre-training on BigEarthNet, EuroSAT, OSCD.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — Key insight: seasonal changes provide "free" natural augmentations for SSL. Multi-head design (3 sub-spaces with different invariances) allows the model to preserve time-varying and time-invariant features simultaneously. Automatic data collection pipeline is reproducible.
- Soundness: 4/5 — Clean ablations on data scale (100K vs 1M), backbone (ResNet-18/50), and method variants (MoCo-v2 + temporal positives). Evaluation on 3 diverse tasks. Weakness: only tests RGB bands (not 13-band Sentinel-2 data), no spectral SSL exploration.
- Relevance: 4/5 — Highly influential foundational work in RS SSL. SeCo dataset and method are widely used as baselines. Inspired many contrastive RS SSL methods.

**Key Insights:**
1. **Temporal positives as natural augmentations:** Seasonal changes (snow, crop growth, foliage) provide semantically meaningful positive pairs that artificial augmentations cannot replicate.
2. **Multi-augmentation contrastive:** Three embedding sub-spaces with different invariance patterns prevent the model from discarding useful time-varying features. Sub-space 0 (all-invariant), Sub-space 1 (seasonal-invariant), Sub-space 2 (artifical-invariant).
3. **Sampling around cities:** Uncurated data collection by sampling around 10K most populated cities avoids oceans/deserts, maximizing scene diversity. 1M images from 200K locations, 5 seasonal timestamps each.
4. **SeCo data > curated data:** Pre-training on 1M uncurated SeCo images outperforms pre-training on curated labeled RS datasets for transfer learning.

**Notes:**
- Element AI / ServiceNow. ResNet-18/50 backbone, MoCo-v2 framework.
- Pre-training: 200 epochs, batch size 256, SGD lr=0.03, MoCo queue 16384.
- Only RGB channels (3/12 Sentinel-2 bands) used.
- Published at ICCV 2021.
- Public dataset and models available.
