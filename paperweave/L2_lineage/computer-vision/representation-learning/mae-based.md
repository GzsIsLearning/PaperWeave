---
title: Masked Autoencoders for Visual Representation Learning (CV)
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: computer-vision
task: representation-learning
approach: mae-based
tags: [cv, mae, self-supervised, pre-training]
sources:
  - L0_raw/masked-autoencoders-are-scalable-vision-learners
  - L0_raw/simmim-a-simple-framework-for-masked-image-modeling
zotero_keys: []
confidence: high
---

# Masked Autoencoders for Visual Representation Learning

## Overview

MAE (He et al. 2021) 开创性地证明：随机 mask 75% 图像 patch、用可见部分重建，能学到强大的视觉表示。SimMIM 进一步简化设计。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| MAE (He) | 2021 | 5 | 非对称编码-解码，75% mask | 8×V100 | ImageNet | true | github.com/facebookresearch/mae | 高 mask 比例 + 轻量解码器是关键 |
| SimMIM (Xie) | 2022 | 4 | 更简单的 MIM：直接像素回归 | 8×V100 | ImageNet | true | github.com/microsoft/SimMIM | 不需要复杂 tokenizer |

## Impact

MAE 和 SimMIM 是遥感 MAE 方法（SatMAE, RingMo, SatSwinMAE）的直接上游。
