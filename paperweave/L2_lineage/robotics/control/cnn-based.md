---
title: CNN-based Robot Control
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: robotics
task: control
approach: cnn-based
tags: [robotics, quadrotor, attitude-control, cnn, geometric-control, online-learning]
sources:
  - L0_raw/dimension-decomposed-learning-for-quadrotor-geometric-attitude-control-with-almo
zotero_keys: []
confidence: medium
---

# CNN-based Robot Control

## Overview

基于学习的机器人控制，特别是将几何控制理论与神经网络在线学习结合的方法。DDL (Sliced Learning) 展示了如何在资源受限的嵌入式硬件上实现具有理论保证的自适应神经控制。

## Papers

| Paper | Year | Score | Contribution | Hardware | Key Insight |
|-------|------|-------|-------------|----------|-------------|
| DDL / Sliced Learning | — | ref | Dimension-decomposed geometric learning for quadrotor attitude control | STM32 MCU | Learning-from-error + Lie-algebraic structure |

## DDL: Dimension-Decomposed Learning (Sliced Learning)

### 动机

传统 "learning-from-states" 范式直接学习状态到动作的映射，在扰动下缺乏鲁棒性保证。DDL 采用 **learning-from-error** 范式：学习误差（期望姿态与实际姿态的偏差）到扰动补偿的映射。

### 架构

```
期望姿态 ──→ Lie-algebraic Error (so(3))
                        │
                        ▼
              Sliced Adaptive-Neuro Mapping (SANM)
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
       Submap₁      Submap₂      Submapₙ  (轴分解)
           │            │            │
           ▼            ▼            ▼
       浅层神经网络 + 自适应律 (每个子映射)
           │            │            │
           └────────────┼────────────┘
                        ▼
              扰动补偿 (SO(3))
                        │
                        ▼
              Lyapunov-based 在线更新
```

### 关键设计

1. **Learning-from-error**: 输入是 Lie-algebraic 误差表示，而非原始状态
2. **Axis-wise decomposition**: 高维映射分解为低维子映射 —— 每个 SO(3) 轴独立处理
3. **Lyapunov-based adaptation**: 有收敛保证的在线学习律
4. **SANM 模块**: 浅层神经网络 × 轴数，每个子映射参数极少

### 性能

| 指标 | 值 |
|------|-----|
| 运行频率 | 400Hz |
| 硬件 | STM32 微控制器 |
| 验证 | 真实四旋翼飞行实验 |
| 收敛性 | Lyapunov 指数收敛证明 |

## Design Principles

### Learning-from-Error vs Learning-from-States

| 范式 | 输入 | 输出 | 优势 | 劣势 |
|------|------|------|------|------|
| Learning-from-states | 传感器状态 | 控制信号 | 端到端简单 | 泛化差，无理论保证 |
| Learning-from-error | 姿态误差 (so(3)) | 扰动补偿 | 有收敛保证，可解释 | 需领域知识 |

### 为什么维度分解有效？

- **降低学习复杂度**: n-D 映射 → 3 个 1-D 映射（四旋翼 SO(3)）
- **参数效率**: 浅层网络每个子映射仅需少量参数
- **硬件友好**: 适合 MCU 级别的部署

## Key Insights

- **几何先验至关重要**: SO(3) Lie 代数结构约束解空间，防止非物理输出
- **学习误差比学习绝对映射更可泛化**: 扰动变化时只需更新轻量 SANM，无需重训练
- **在线适应 vs 离线训练**: Lyapunov 自适应律提供实时收敛保证
- **400Hz on MCU**: 证明学习-based 控制可以在极端资源约束下运行

## 与深度学习方法的对比

| 维度 | DDL | 深度学习控制 |
|------|-----|-------------|
| 模型 | 浅层网络 (轴分解) | 深层网络 |
| 参数 | ~数百 | 百万~十亿 |
| 训练 | 在线自适应 | 离线预训练 |
| 理论保证 | Lyapunov 收敛证明 | 通常无 |
| 部署 | MCU (STM32) | GPU |
| 泛化 | 扰动泛化好 | 数据驱动泛化 |

## Relevance

DDL 代表了机器人控制中"小型化、可证明的神经控制"路线 —— 与 π₀ 的"大数据+大模型"路线形成互补。对于需要在安全关键场景下部署学习方法的应用（如无人机），DDL 的理论保证和硬件效率有独特价值。

## Related Approaches

- [[transformer-based]] — Transformer-based 机器人控制 (LBM, π₀)
