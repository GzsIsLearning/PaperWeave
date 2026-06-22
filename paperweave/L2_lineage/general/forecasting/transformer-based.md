---
title: Transformer-based Time Series Forecasting
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: general
task: forecasting
approach: transformer-based
tags: [forecasting, transformer, time-series, patch, foundation-model]
sources:
  - L0_raw/a-time-series-is-worth-64-words-long-term-forecasting-with-transformers
  - L0_raw/stformer-a-noise-aware-efficient-spatio-temporal-transformer-architecture-for-tr
  - L0_raw/sst-multi-scale-hybrid-mamba-transformer-experts-for-time-series-forecasting
  - L0_raw/sundial-a-family-of-highly-capable-time-series-foundation-models
zotero_keys: []
confidence: medium
---

# Transformer-based Time Series Forecasting

## Overview

Transformer 在时间序列预测中的应用，从早期的直接 tokenization 到 patch-based 范式，再到混合架构和 foundation model。核心演进方向：(1) 从单步 token 到 patch token —— 解决单时间步语义不足；(2) 从 encoder-only 到 decoder-only 生成式 —— 走向时间序列基础模型；(3) 从纯 Transformer 到 Mamba-Transformer 混合 —— 降低长序列复杂度。

## Papers

| Paper | Year | Venue | Score | Contribution | Compute | Code | Key Insight |
|-------|------|-------|-------|-------------|---------|------|-------------|
| PatchTST (Nie) | 2023 | ICLR | 4 | Patching + channel-independence; 自监督预训练 | 1×A100 | [✓](https://github.com/yuqinie98/PatchTST) | 时间序列 patch 化,借鉴 ViT |
| STFormer (Qin) | 2021 | — | 3 | 噪声感知时空 Transformer 交通预测 | — | — | 高效时空注意力 |
| SST (Xu) | 2025 | CIKM | 4 | Multi-scale Mamba-Transformer hybrid | 24GB A5000 | ✓ | 长程 Mamba + 短程 LWT 解耦 |
| Sundial (Liu) | 2025 | ICML | 4 | decoder-only TS foundation model; TimeFlow Loss | — | [✓](https://github.com/thuml/Sundial) | flow-matching 连续值生成 |
| STWave | — | — | ref | Wavelet + Transformer 交通预测 | — | — | 小波分解时空解耦 |
| TimesFM | — | — | ref | Decoder-only TS foundation model (Google) | — | — | 大规模预训练时序 FM |

## Key Papers

### PatchTST (Nie et al., ICLR 2023)

核心创新是两个简洁但高效的设计：

1. **Patching**: 将时间序列分割为子序列级 patch 作为 Transformer 输入 token，类比 ViT 的 image patching。将 token 数从 L 减少到 L/S，attention 复杂度二次方降低，使模型能处理更长历史窗口（336 → 更长）。

2. **Channel-independence**: 每个通道独立处理共享权重，避免通道混合带来的噪声。简单设计被证明优于 channel-mixing。

**自监督预训练**: Masked patch reconstruction 在 Traffic 数据集上将 MSE 从 0.367 降至 0.349。证明长 look-back window 的关键性：L=380（降采样到 96 tokens）优于 L=96 全 token。

**与遥感关联**: Patching + channel-independence 设计可借鉴用于时序卫星数据处理、作物物候预测等。

### SST (Xu et al., CIKM 2025)

首个 Mamba-Transformer 混合时间序列预测架构。核心思想：

- **Mamba expert**: 处理低分辨率长程模式（趋势+季节性），线性复杂度 O(L)
- **LWT expert**: Local Window Transformer 处理高分辨率短程变化（残差/噪声），复杂度 O(w*S)
- **Long-short router**: 自适应融合两个 expert 的输出

关键发现：Naive Mamba-Transformer stacking 因"信息干扰"而失败（MSE 0.693 vs DLinear 0.455 on ETTh1）。SST 通过显式分解解决此问题，扩展到 6k 时间步时 vanilla Transformer OOM。

### Sundial (Liu et al., ICML 2025)

首个生成式时间序列基础模型：

- **TimeFlow Loss**: 基于 flow-matching 的参数化损失函数，建模 per-token 概率分布，实现连续值生成无需离散 tokenization
- **架构**: Decoder-only Transformer + RoPE + FlashAttention + KV Cache
- **数据**: TimeBench 包含 1 万亿时间点
- **推理**: 零样本预测达毫秒级，patch-level tokenization 减少自回归步数

### 其他参考

- **STWave**: 小波分解 + Transformer 的交通预测方法，利用小波变换实现时空解耦
- **TimesFM**: Google 的 decoder-only 时间序列基础模型，大规模预训练范式

## Design Evolution

```
2021  STFormer        ← 时空 Transformer + 噪声感知注意力
  │
2023  PatchTST        ← Patching 范式确立，自监督预训练
  │
2024  TimesFM         ← Decoder-only TS FM (Google)
  │
2025  SST             ← Mamba-Transformer 混合，线性复杂度
  │   Sundial         ← 生成式 TS FM，flow-matching
```

## Key Insights

- **Patching 是关键范式转换**: 从单步 token 到子序列 patch，解决了时间步缺乏语义的问题，同时降低复杂度
- **Channel-independence 反直觉有效**: 简单但优于 channel-mixing，说明通道混合在 TS 预测中引入噪声而非信息
- **Mamba-Transformer 混合需显式分解**: 直接堆叠导致信息干扰，需按频段解耦（长程 vs 短程）
- **生成式 TS FM 兴起**: Sundial/TimesFM 证明 LLM 范式（decoder-only + 自回归）可迁移到时间序列

## Open Issues

- Channel-independence 是否丢失了跨变量依赖？何时需要 channel-mixing？
- TS foundation model 的 scaling law 尚不明确
- 混合架构（Mamba-Transformer）的最优融合策略：频段分解 vs token-level routing vs 其他？
- 与遥感时序任务（物候预测、作物监测）的迁移适配
