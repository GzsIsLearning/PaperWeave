---
slug: "rsunivlm-a-unified-vision-language-model-for-remote-sensing-via-granularity-orie"
title: "RSUniVLM: A Unified Vision Language Model for Remote Sensing via Granularity-oriented Mixture of Experts"
authors:
  - "Xu Liu"
  - "Zhouhui Lian"
year: 2024
venue: "arXiv / Tech Report"
tags: [remote-sensing, vision-language-model, mixture-of-experts, multi-granularity, detection, segmentation]
score: 4
contribution: 4
soundness: 3
relevance: 4
open_source: false
code_url: "—"
compute: "—"
dataset_access: "private"
---

> **Abstract:** Unified RS VLM with granularity-oriented MoE for image-level (classification, captioning), region-level (detection, grounding), pixel-level (segmentation) and multi-image (change detection) tasks. ~1B parameters. Builds large-scale RS instruction dataset from existing RS + general datasets.

## [2026-05-02] Review — Full-Text Reading

**Score:** 4/5
- Contribution: 4/5 — Impressive unification of all RS vision task granularities in a single VLM. Granularity-oriented MoE (different experts for different granularity levels) is a nice architecture innovation. The instruction dataset construction from diverse RS datasets is valuable.
- Soundness: 3/5 — Evaluation covers many tasks but lacks comparison with strongest recent baselines. Radar chart shows competitiveness but detailed tables needed.
- Relevance: 4/5 — Important direction for unified RS vision-language models. The granularity-oriented approach is generalizable.

**Key Insights:**
1. **Granularity-oriented MoE:** Different MoE experts specialize in image-level, region-level, or pixel-level understanding, enabling efficient multi-task learning without increasing total model size.
2. **Unified VLM for all RS tasks:** Single model handles classification, captioning, VQA, detection, grounding, referring expression, segmentation, and change understanding.
3. **Instruction data construction:** Combines existing RS datasets with Gemini-generated instructions for diverse tasks.

**Notes:**
- Peking University. Architecture: visual encoder + LLM + granularity MoE.
- Evaluated on RSVQA, VRSBench, DIOR-RSVG, and segmentation benchmarks.
- Multi-image comprehension (change captioning/detection) is a unique capability.
