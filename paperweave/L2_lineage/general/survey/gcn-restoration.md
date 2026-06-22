---
title: GCN for Image Restoration Survey
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: general
task: survey
approach: gcn-restoration
tags: [survey, gcn, image-restoration, denoising, super-resolution]
sources:
  - L0_raw/graph-convolutional-network-for-image-restoration-a-survey
zotero_keys: []
confidence: medium
---

# GCN for Image Restoration: A Survey

## Overview

图卷积网络在图像恢复（去噪、超分辨率、去模糊）中的应用综述。Cheng et al. (2024) 覆盖了谱域和空域 GCN 方法在 low-level vision 中的应用，包含定量性能比较。

## Papers

| Paper | Year | Venue | Score | Contribution |
|-------|------|-------|-------|-------------|
| Cheng et al. | 2024 | Mathematics (MDPI) | 3 | First survey of GCNs for image restoration |

## Covered Methods

### GCN Foundations

| 类型 | 方法 | 核心思想 |
|------|------|---------|
| 谱域 GCN | SCNN, ChebNet, GCN | 图傅里叶变换 + 多项式滤波器 |
| 空域 GCN | GraphSAGE, GAT | 邻居聚合 + 注意力 |

### Image Restoration Applications

| 任务 | Best Method | PSNR (Set12 σ=15/25/50) |
|------|-------------|------------------------|
| 去噪 | GAiA-Net | 33.54 / 31.20 / 28.18 |
| 超分辨率 | SwinIR > HAN > RGCN | GCN 方法有竞争力但不占优 |
| 去模糊 | — | 多种 GCN 方法 |

### 新兴方向

- **Mesh 去噪**: 3D 网格数据的图表示
- **点云上采样**: 非规则数据的 GCN 处理
- **LLM + GCN**: 大语言模型与图网络的组合用于恢复

## Key Insights

- **GCN 在去噪中表现最好**: GAiA-Net 达到 SOTA 水平
- **在超分辨率中不如 Transformer**: SwinIR 等 Transformer 方法在 SR 上占主导
- **图构建是关键瓶颈**: 计算成本高，深 GCN 容易 over-smoothing

## Challenges

- **Over-smoothing**: 深层 GCN 中节点表示趋于一致，类似 attention rank collapse
- **图构建开销**: 从图像构建图的预处理计算成本
- **遥感适配**: 综述未深入讨论遥感图像的特殊性（大尺寸、多光谱）

## Relevance

作为 GCN 图像恢复方向的入门综述，有参考价值但深度有限。140 篇参考文献，覆盖较广但分析偏表面。对于遥感图像恢复研究者，可作为 GCN 方法的入口文献。
