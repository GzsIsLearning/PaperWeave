---
title: Promptable Segmentation (CV)
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: computer-vision
task: segmentation
approach: promptable
tags: [cv, segmentation, foundation-model, promptable, sam]
sources:
  - L0_raw/segment-anything
  - L0_raw/segment-anything
zotero_keys: []
confidence: high
---

# Promptable Segmentation

## Overview

SAM (Kirillov et al. 2023) 定义了 promptable segmentation 这一新范式，通过 SA-1B 数据集（11M 图像、1.1B masks）和三阶段数据引擎实现了零样本泛化。是分割领域最重要的基础模型之一。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| SAM (Kirillov) | 2023 | 5 | promptable 分割基础模型，11M 图像 1.1B masks | 256×A100 | SA-1B | true | github.com/facebookresearch/segment-anything | 三阶段数据飞轮 + 3-output mask 解决歧义 |

## Impact

SAM 在遥感分割中已广泛使用：建筑提取、耕地分割、变化检测等。SA-1B 虽为自然图像，但 promptable 范式可直接迁移至遥感。大量遥感 SAM 适应工作（SAM-RS、RSPrompter 等）涌现，是 2023 年最有影响力的视觉基础模型之一。
