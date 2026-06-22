---
title: Contrastive Visual Representation Learning (CV)
created: 2026-04-29
updated: 2026-04-29
type: lineage
domain: computer-vision
task: representation-learning
approach: contrastive-based
tags: [cv, contrastive, self-supervised, moco, clip]
sources:
  - L0_raw/momentum-contrast-for-unsupervised-visual-representation-learning
  - L0_raw/learning-transferable-visual-models-from-natural-language-supervision
  - L0_raw/contrastive-learning-for-unpaired-image-to-image-translation
zotero_keys: []
confidence: high
---

# Contrastive Visual Representation Learning

## Overview

MoCo (2020) 用动量编码器+动态队列实现高效对比学习。CLIP (2021) 用 4 亿图文对训练，实现 zero-shot 迁移。CUT (2020) 将对比学习应用于图像翻译。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| MoCo (He) | 2020 | 5 | 动量编码器 + 动态字典 | 8×V100 | ImageNet | true | github.com/facebookresearch/moco | 大字典是高质量对比学习的关键 |
| CLIP (Radford) | 2021 | 5 | 4 亿图文对 + 对比预训练 | 256×GPU | WIT-400M | true | github.com/openai/CLIP | 自然语言监督的超强泛化能力 |
| CUT (Park) | 2020 | 3 | patch-wise 对比损失 | — | — | true | — | 图像翻译不需要配对数据 |
