---
slug: "reben-refined-bigearthnet-dataset-for-remote-sensing-image-analysis"
title: "REBEN: Refined BigEarthNet Dataset for Remote Sensing Image Analysis"
authors:
  - "Kai Norman Clasen"
  - "Leonard Hackel"
  - "Tom Burgert"
  - "Gencer Sumbul"
  - "Begüm Demir"
  - "Volker Markl"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://bigearth.net"
compute: "N/A (dataset paper)"
dataset_access: true
---

> **Abstract:** Refined BigEarthNet (reBEN): 549,488 Sentinel-1/2 patches with updated sen2cor processing, corrected CLC2018 labels, pixel-level reference maps, geographically-decorrelated splits, DL-optimized format. Addresses label noise, spatial correlation, and tool update issues in BigEarthNet.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/4 — Significant quality improvements over widely-used BigEarthNet; pixel-level maps enable segmentation; geographical split reduces spatial correlation
- Soundness: 4/4 — Thorough documentation of improvements; experimental validation
- Relevance: 4/4 — Essential dataset for RS DL research

**Key Insights:**
1. Updated sen2cor atmospheric correction (latest version) for higher-quality Sentinel-2 patches.
2. Corrected CLC2018 labels addressing label noise present in original BigEarthNet.
3. Pixel-level reference maps enable both pixel- and scene-based learning tasks.
4. New geographically-decorrelated split algorithm reduces spatial correlation between train/val/test sets.
5. 1200m x 1200m patch size (vs variable sizes in BigEarthNet).
6. rico-hdl tool for converting to DL-optimized format.

**Notes:**
- TU Berlin + BIFOLD + EPFL, 2025.
- Essential update to the widely-used BigEarthNet benchmark.
- Open access dataset, code, and pre-trained models.
- Enables more reliable evaluation of DL models for multi-label RS classification.

## [2026-05-29] SciJudge Re-Read
**Score:** 4/5
- Contribution: 4/5
- Soundness: 4/5
- Relevance: 4/5

**Key Insights:**
1. Geographical split reduces spatial correlation elegantly.
2. Label noise correction removes ~7.5% patches.
3. rico-hdl addresses BigEarthNet slowness but Linux-binary only.
4. S2>>S1; S1+S2 marginal gain over S2 alone.
5. MLP-Mixer worst — ConvNet biases still matter at 1200m.

**Notes:** arXiv preprint. Data at bigearth.net.

**Citation Mining:** BigEarthNet-MM, CLC2018, sen2cor, Ben-Ge, RSVQAxBEN, Wilhelm 2021, Tuia 2024.

**Cross-Review Diff:** Added S1+S2 marginality flag, arXiv caveat, rico-hdl limitation, parallel extensions.
