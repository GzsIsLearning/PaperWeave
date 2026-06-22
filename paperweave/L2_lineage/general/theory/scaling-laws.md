---
title: Neural Scaling Laws
created: 2026-05-30
updated: 2026-05-30
type: lineage
domain: general
task: theory
approach: scaling-laws
tags: [theory, scaling-laws, transformer, llm, information-theory, noisy-channel]
sources:
  - L0_raw/unified-neural-scaling-laws
  - L0_raw/llms-as-noisy-channels-a-shannon-perspective
zotero_keys: []
confidence: medium
---

# Neural Scaling Laws

## Overview

Neural scaling laws 研究模型性能如何随参数规模、数据量、训练步数等维度变化。从 Kaplan et al. (2020) 的单调幂律出发，近期工作聚焦于两个方向：(1) 统一的多元函数形式，能同时处理多个维度的交互和非单调行为；(2) 从第一性原理（信息论）出发，解释 scaling 为何不再是单调的。

这两篇 2026 年 5 月新作分别代表了形式完备性和物理可解释性两条路线的最高水平。

## Evolution Timeline

```
Kaplan et al. (2020)          Chinchilla (2022)         Caballero BNSL (2023)
幂律 N, D 独立                   计算最优分配              单变量 Broken Neural Scaling Law
     │                              │                         │
     ▼                              ▼                         ▼
────────────────────────────────────────────────────────────────────────────
                                                                      │
                          2024-2025: 非单调现象被发现                    │
                          - Overtraining → U型 (Springer 2025)          │
                          - QiD → 量化退化 (Ouyang 2024)                │
                                                                      ▼
                          ┌─────────────────────────────────────────────┐
                          │       2026.05: 两条路线的交汇                │
                          ├──────────────────┬──────────────────────────┤
                          │ UNSL (2605.26248)│ Shannon Law (2605.23901)  │
                          │ 形式完备性路线     │ 物理可解释性路线           │
                          └──────────────────┴──────────────────────────┘
```

## Comparison Table

| Paper | Year | Venue | Score | Contribution | Compute | Code | Key Insight |
|-------|------|-------|-------|-------------|---------|------|-------------|
| Unified Neural Scaling Laws (Caballero) | 2026 | arXiv (Mila/DeepMind) | 4 | 多元 Broken Neural Scaling Law + 倒数求和处理非单调过渡 | — | — | UNSL 用 additive symmetry 统一过拟合和超参数效应，vision 60.9%/language 88.9% 胜率 |
| Shannon Scaling Law (Ouyang) | 2026 | ICML 2026 (ByteDance) | 5 | 将 LLM 训练映射为 Shannon 噪声信道，解释 U 型退化 | 8×GPU | — | 外推 unseen 12B 模型 pooled R²=0.847，monotonic baselines 崩溃，噪声分解直接可映射到多模态 SNR |

## Design Taxonomy

### 路线一：形式完备性 (UNSL)

UNSL 从 8 个 desiderata 出发，构建分层嵌套函数：
- 底层：Multivariate Broken Neural Scaling Law (MBNSL) — 多变量分段幂律
- 中层：R(r) — bottleneck 分量 + 非 bottleneck 分量
- 上层：Q(q) — 倒数求和处理超参数对立效应
- 顶层：additive symmetry — 两个幂律之和捕获非单调转变

**核心创新**：不是引入新的物理概念，而是说"现有的幂律函数形式表达力不够"。通过嵌套的倒数求和 + additive symmetry，能表达任何非单调行为。

### 路线二：物理可解释性 (Shannon Law)

将 LLM 训练重新解释为 Shannon 噪声信道：
- 模型大小 N → 带宽 (N^α)
- 训练 token D → 信号功率 (D^β)
- 三项噪声：数据噪声 (d·D^δ)、模型交互噪声 (c·(DN)^γ)、不可约噪声 (e)

**核心公式**：loss = 1 / (a·N^α · log₂(1 + b·D^β / (c·(DN)^γ + d·D^δ + e)))

**关键发现**：
- 当噪声指数 γ > 带宽指数 α 时，增大模型反而有害 → 解释了 U 型退化
- 数据噪声指数 δ 始终 > 信号指数 β → U 型退化在 token 轴上是内禀的
- 标准预训练是高 SNR 特例，monotonic 幂律仅在噪声可忽略时成立

### 两条路线的互补

| 维度 | UNSL | Shannon Law |
|------|------|-------------|
| 理论根源 | 分段幂律 + 倒数求和（纯数学推广） | Shannon-Hartley 定理（物理类比） |
| 可解释性 | 低（函数形式过于通用） | 高（每个参数有物理含义） |
| 适用场景 | 多维度精确预测 | 数据质量≠数据量时的容量边界诊断 |
| 参数效率 | 大量（分层嵌套） | 9 个（含物理含义） |
| 外推能力 | vision/language 双域验证 | Pythia 12B 外推 R²=0.847 |

## Cross-Paper Synthesis

两篇论文共同揭示了一个深层转变：**scaling law 2.0 的核心不再是"更大=更好"，而是"在给定噪声结构下，最优的资源分配是什么"**。

- UNSL 提供了"什么情况下出现非单调"的形式化语言
- Shannon Law 提供了"为什么出现非单调"的因果机制

两者在实用层面的交汇：用 Shannon Law 的噪声分解诊断瓶颈（哪个维度的噪声在主导？），然后用 UNSL 的函数形式做多维度外推预测。

对于遥感多模态多任务学习：Shannon Law 的噪声分解可直接映射到 SAR/Optical/Climate 三条子信道的 SNR 差异，UNSL 的 additive symmetry 可建模任务间转移学习和干扰的此消彼长。

## Open Issues

- UNSL 的参数拟合对数据量和维度覆盖要求高，小规模实验可能过拟合
- Shannon Law 的 D-N 交互噪声项 c(DN)^γ 是否在遥感多模态场景下仍需验证
- 两条路线能否统一？即：能否给 UNSL 的分段幂律赋予 Shannon 式的物理含义？
- 时序维度（如 5 个时间步的多时相数据）在两种框架中如何建模？
