---
title: JEPA-based World Models
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: rl
task: world-models
approach: jepa-based
tags: [rl, world-models, jepa, self-supervised, planning, model-based-rl]
sources:
  - L0_raw/leworldmodel-stable-end-to-end-joint-embedding-predictive-architecture-from-pixe
zotero_keys: []
confidence: medium
---

# JEPA-based World Models

## Overview

Joint Embedding Predictive Architecture (JEPA) 在基于模型强化学习中的应用。JEPA 通过在潜在空间中进行预测来学习世界模型，核心挑战是防止表示崩塌（所有输入映射到同一潜在向量）。LeWorldModel 提出了一个简洁的解决方案。

## Papers

| Paper | Year | Venue | Score | Contribution | Compute | Code |
|-------|------|-------|-------|-------------|---------|------|
| LeWorldModel (Maes) | 2025 | Preprint | 4 | Stable end-to-end JEPA from pixels; only 2 loss terms | 1 GPU | — |

## LeWorldModel

### 核心问题

JEPA 的核心挑战：如何在不使用 stop-gradient、EMA、预训练编码器等启发式方法的情况下防止表示崩塌？

### 解决方案: 双项损失

```
L = L_pred + λ × L_SIGReg

L_pred:    next-embedding prediction loss (MSE)
L_SIGReg:  Sketched-Isotropic-Gaussian Regularizer
```

- **SIGReg**: 强制潜在嵌入服从各向同性高斯分布，基于 Cramér-Wold 定理的可证明反崩塌保证
- **超参数**: 从 PLDM 的 6 个降至 1 个有效参数 (λ)

### 架构

```
pixels → Encoder → latent z_t
                        │
                  Predictor → ẑ_{t+1}
                        │
                  L_pred(ẑ_{t+1}, z_{t+1}) + λ × SIGReg(z)
```

### 结果

| 指标 | LeWM | DINO-WM |
|------|------|---------|
| 参数量 | 15M | >100M |
| 训练时间 | 数小时 (单 GPU) | 数天 |
| 规划速度 | 48× faster | baseline |
| 任务 | Push-T, OGBench-Cube, Two-Room, Reacher | 同 |

### 关键特性

- **端到端训练**: 从原始像素到潜在空间，无需预训练编码器
- **潜在空间物理结构**: 通过 probing 和 violation-of-expectation 测试验证，潜在空间编码了直观物理
- **规划**: 使用简单 CEM solver，无需复杂 MPC

### 局限

- 仅 15M 参数，scaling 行为未探索
- 仅在相对简单的控制任务上测试
- 无真实机器人实验

## JEPA vs 其他世界模型范式

| 范式 | 代表方法 | 预测空间 | 崩塌风险 | 复杂度 |
|------|---------|---------|---------|--------|
| **JEPA** | LeWM, I-JEPA, V-JEPA | 潜在空间 | 高（需正则） | 低 |
| **Pixel-reconstruction** | DreamerV3, STORM | 像素空间 | 无 | 高（解码器） |
| **Foundation-model** | DINO-WM | 特征空间 | 低（冻结编码器） | 极高 |
| **Contrastive** | CURL | 对比空间 | 中 | 中 |

JEPA 的优势在于 compact latents → 快速规划，且无需昂贵的像素重建或庞大 foundation model。

## Key Insights

- **SIGReg 是关键**: 匹配 1D marginals 到高斯分布足以防崩塌，无需复杂的不变损失
- **简单性带来实用性**: 15M 参数 + 单 GPU + 数小时 = 可复现的世界模型学习
- **物理理解涌现**: 仅从预测损失中，潜在空间自发编码物理结构
- **48× 规划加速**: compact latent 是 foundation model features 的实用替代

## Open Issues

- LeWM 能否扩展到更复杂的视觉环境（3D 导航、操作任务）？
- SIGReg 在不同 latent dimension 下的行为
- JEPA 与 pixel-reconstruction 的融合（如 DreamerV3 + JEPA）
- 真实机器人部署的 sim-to-real 差距

## Related Approaches

- [[../model-based/object-centric]] — OC-STORM, object-centric world models
