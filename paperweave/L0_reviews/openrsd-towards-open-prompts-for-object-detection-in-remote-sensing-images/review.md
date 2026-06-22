---
slug: "openrsd-towards-open-prompts-for-object-detection-in-remote-sensing-images"
title: "OpenRSD: Towards Open-prompts for Object Detection in Remote Sensing Images"
authors:
  - "Ziyue Huang"
  - "Yongchao Feng"
  - "Ziqi Liu"
  - "Shuai Yang"
  - "Qingjie Liu"
  - "Yunhong Wang"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://github.com/floatingstarZ/OpenRSDt"
compute: "Single 2080Ti GPU (20.8 FPS inference)"
dataset_access: true
---

> **Abstract:** Open-prompt RS object detector supporting multimodal prompts (text/image) and multi-task heads (alignment + fusion). Supports oriented + horizontal detection. Multi-stage training pipeline. ORSD+ dataset (470K+ images, 200 categories). 8.7% higher AP than YOLO-World.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — Novel open-prompt RS detection framework with both oriented and HBB; multi-task heads for speed/accuracy tradeoff; large-scale training dataset
- Soundness: 4/5 — Evaluated on 7 public datasets; multi-stage training pipeline with pseudo-labeling
- Relevance: 4/5 — Directly relevant to open-vocabulary RS detection, prompt-based methods

**Key Insights:**
1. OpenRSD: multimodal prompt-based detector supporting text prompts (via SkyCLIP) and image prompts (via DINOv2).
2. Dual detection heads: Alignment head (fast, scalable) + Fusion head (high precision, cross-modal).
3. Multi-stage training: pretraining -> fine-tuning with pseudo-labels -> self-training with SkyCLIP filtering.
4. ORSD+ dataset: 470K+ images, 200 categories from diverse RS datasets.
5. 8.7% higher AP than YOLO-World; 20.8 FPS inference speed.
6. Supports both horizontal (HBB) and oriented (OBB) bounding boxes.

**Notes:**
- Beihang University, 2025.
- Built on RTMDet framework.
- SkyCLIP used for text prompts and pseudo-label filtering.
- Multi-stage pipeline effective for cross-domain generalization.
- Code and models open-source.
