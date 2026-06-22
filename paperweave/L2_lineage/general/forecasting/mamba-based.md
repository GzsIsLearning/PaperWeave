---
title: Mamba-based Time Series Forecasting
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: general
task: forecasting
approach: mamba-based
tags: [forecasting, mamba, state-space-model, time-series, hybrid]
sources:
  - L0_raw/sst-multi-scale-hybrid-mamba-transformer-experts-for-time-series-forecasting
zotero_keys: []
confidence: medium
---

# Mamba-based Time Series Forecasting

## Overview

Mamba (State Space Model) 在时间序列预测中的应用，核心优势是线性复杂度 O(L)，使模型能够处理极长序列（6k+ 时间步）而不会像 Transformer 般 OOM。当前的主要范式是 Mamba-Transformer 混合架构：Mamba 处理长程依赖，Transformer 捕获局部细节。

## Papers

| Paper | Year | Venue | Score | Contribution | Compute | Code | Key Insight |
|-------|------|-------|-------|-------------|---------|------|-------------|
| SST (Xu) | 2025 | CIKM | 4 | Multi-scale Mamba-Transformer hybrid with MoE routing | 24GB A5000 | ✓ | 频段分解: Mamba 长程 + LWT 短程 |

## SST: Multi-Scale Hybrid Mamba-Transformer Experts

### 动机

纯 Mamba 处理时间序列存在信息瓶颈——短程变化被长程趋势淹没。纯 Transformer 在处理长序列时 O(L²) 复杂度不可行。直接堆叠 Mamba+Transformer 由于"信息干扰"而失败（ETTh1 上 MSE 0.693 vs DLinear 0.455）。

### 架构

```
输入时间序列
    │
    ├─→ Patcher (降采样) ──→ Mamba Expert ──→ 长程模式 (趋势+季节性)
    │                          (低分辨率)
    │
    └─→ Patcher (高分辨率) → LWT Expert ──→ 短程变化 (残差/噪声)
                               (高分辨率)
                                    │
                            Long-Short Router (自适应融合)
                                    │
                              输出预测
```

- **Mamba Expert**: SSM 捕获长程依赖，线性复杂度，天然编码位置信息（无需 positional embedding）
- **LWT Expert**: Local Window Transformer，attention 限制在窗口 w 内，复杂度 O(w*S) 而非 O(S²)
- **Long-Short Router**: 学习如何融合两个 expert 的输出

### 关键发现

| 指标 | 值 |
|------|-----|
| 最大序列长度 | 6,000 时间步 (线性扩展) |
| Vanilla Transformer OOM | 336 时间步 |
| PatchTST OOM | 3,000 时间步 |
| 数据集 | 7 个真实数据集 (ETT, Weather, ECL, Traffic) |
| 评估 | 10-seed 平均 |

### 新指标: PTS Resolution

R_PTS = sqrt(P) / Str，量化 patching 后的时间序列粒度，指导 patcher 参数选择。

## Why Mamba for Time Series?

| 维度 | Transformer | Mamba |
|------|-------------|-------|
| 复杂度 | O(L²) | O(L) |
| 长序列支持 | 受限于 attention | 天然优势 |
| 位置编码 | 需要显式 PE | 内置 (SSM 状态传递) |
| 局部模式 | 依赖 attention 窗口 | 较弱，需混合 |
| 训练吞吐 | 较高 (FlashAttention) | 中等 |

Mamba 的线性复杂度使其在需要极长上下文的时间序列场景（如高频传感器数据、长期气候序列）中具有根本优势。但 Mamba 在捕获局部精细模式方面不如 Transformer，因此混合架构是当前最优解。

## Key Insights

- **直接堆叠 Mamba-Transformer 失败**: 信息干扰导致性能不如简单线性模型 (DLinear)
- **频段分解是关键**: 长程模式（Mamba）+ 短程变化（Transformer）显式解耦避免干扰
- **Mamba 不需要位置编码**: SSM 的状态传递机制天然编码序列位置
- **线性扩展至 6k+ 步**: 远超 Transformer 的实用极限

## Open Issues

- 纯 Mamba 架构（不混合 Transformer）在时间序列预测中的上限在哪里？
- 双向 Mamba (Vision Mamba 风格) 是否适用于时间序列？
- Mamba 的选择性机制如何与多变量时间序列的 channel 结构相互作用？
- 与其他 SSM 变体（S4, H3, Hyena）在时间序列上的对比

## Related Approaches

- [[transformer-based]] — Transformer-based 方法，包括 PatchTST、Sundial
