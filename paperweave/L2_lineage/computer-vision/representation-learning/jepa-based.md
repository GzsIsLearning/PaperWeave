---
title: Joint-Embedding Predictive Architectures for Visual Representation Learning (CV)
created: 2026-06-01
updated: 2026-06-01
type: lineage
domain: computer-vision
task: representation-learning
approach: jepa-based
tags: [cv, jepa, self-supervised, predictive, non-generative]
sources:
  - L0_raw/self-supervised-learning-from-images-with-a-joint-embedding-predictive-architecture
zotero_keys: []
confidence: high
---

# Joint-Embedding Predictive Architectures (JEPA) for Visual Representation Learning

## Overview

JEPA (Assran et al. 2023, LeCun 2022 conceptual) 开创性地提出：在表示空间（embedding space）做预测，而非像素空间。与 contrastive（需要正负样本对）和 MAE（显式像素重建）不同，JEPA 从 context block 预测 target block 的表示，无需手工数据增强。其核心设计是 masking 策略——足够大的 target block（语义级）和足够分布式的 context block。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| I-JEPA (Assran) | 2023 | 5 | 5 | 16×A100, 72h | ImageNet | true | github.com/facebookresearch/ijepa | 预测 semantic target 表示 + 无增强 |

## Impact

I-JEPA 启发了多个后续工作（V-JEPA 视频版、LLM-JEPA 语言版、LeWorldModel 世界模型版），是 LeCun 世界模型蓝图的重要实现。对遥感领域，JEPA 的 embedding 空间预测范式绕过了遥感数据"像素到像素"的配准要求（多时相、多传感器），具有天然适配潜力。

## Design Taxonomy

### Core Principle
- **预测空间**：不像 MAE 重建像素、不像 SimCLR 最大化正对相似度——I-JEPA 在表示空间做预测
- **非对称网络**：context encoder (student) → predictor → target encoder (teacher, EMA)
- **无数据增强**：不需要 crop、color jitter 等人为设计

### Masking Strategy (关键设计)
- Target block: 大尺度（~15-20% 图像面积），确保语义性
- Context block: 分散分布（4-6 块），提供充分上下文
- 多 target（可达 6 个）→ 平均 loss

## Cross-Paper Synthesis

| Dimension | I-JEPA | MAE | SimCLR/MoCov3 |
|-----------|--------|-----|---------------|
| Learning signal | Embedding prediction | Pixel reconstruction | Contrastive (sim/neg) |
| Data augmentation | None | Masking only | Heavy aug (crop+color) |
| Predictor | Yes (learned) | No | Projection head only |
| Teacher | EMA update | No (linear decoder) | EMA (MoCo) or no (SimCLR) |
| Output space | High-dim embedding | Low-dim pixel | High-dim embedding |
