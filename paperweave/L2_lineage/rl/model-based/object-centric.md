---
title: Object-Centric World Models
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: rl
task: model-based
approach: object-centric
tags: [rl, model-based-rl, world-models, object-centric, dreamer, atari]
sources:
  - L0_raw/objects-matter-object-centric-world-models-improve-reinforcement-learning-in-vis
zotero_keys: []
confidence: medium
---

# Object-Centric World Models

## Overview

将对象中心表示引入基于模型强化学习。核心直觉：在复杂视觉环境中，agent 应关注决策相关的对象（如敌人、道具），而非被大面积背景区域（天空、地面）主导。OC-STORM 通过冻结的视觉基础模型实现对象分割，无需端到端训练对象检测器。

## Papers

| Paper | Year | Venue | Score | Contribution | Compute | Code |
|-------|------|-------|-------|-------------|---------|------|
| OC-STORM (Zhang) | 2025 | arXiv | 3 | Frozen VFM object features in MBRL world model | 1 GPU | — |

## OC-STORM

### 动机

DreamerV3/STORM 的 world model 在像素空间做 auto-encoding —— 大背景区域（天空、墙壁）占据大部分重建损失，掩盖了关键小对象（敌人、道具）。对象中心世界模型让 agent 显式关注对象。

### 架构

```
视觉输入 → Cutie (frozen) → Object Transformer → 对象特征 (2048-D)
                                │
                                ├─→ Object Categorical VAE (16×16 latent)
                                │
输入 → CNN Encoder → 视觉特征 → ├─→ Visual Categorical VAE (32×32 latent)
                                │
                                └─→ RSSM (DreamerV3) → Actor/Critic
```

- **Cutie**: 冻结的视觉基础模型，做对象分割
- **Object features**: 2048-D compact 表示，来自 Cutie 的 object transformer 输出
- **组合策略**: 对象特征 + 视觉特征联合使用效果最好

### 结果

| 场景 | OC-STORM | STORM baseline |
|------|----------|---------------|
| 对象主导游戏 (15 Atari) | 142.8% HNS | 116.5% |
| 背景依赖游戏 | 退化 | 更好 |
| Hollow Knight (400k) | 13.3% win rate | lower |

### 局限

- **需要手动标注 K 个对象**: 每个环境需少量标注帧 —— 破坏全自主性
- **计算开销**: Cutie 的 object transformer 额外推理
- **对象定义模糊**: K=？什么算"对象"？任务依赖

## Design Trade-offs

### 对象 vs 视觉特征

| 场景类型 | 最佳策略 | 原因 |
|---------|---------|------|
| 对象封装所有信息 | 仅用对象特征 | 视觉特征含噪声 |
| 对象 + 背景都重要 | 对象 + 视觉联合 | 视觉上下文补充 |
| 背景主导 | 仅用视觉特征 | 对象特征误导 |

## Key Insights

- **冻结 VFM 是捷径**: 不需端到端训练对象检测器，Cutie 提供一致的可迁移对象表示
- **对象特征足够紧凑**: 2048-D vs full image reconstruction，大幅减小 RSSM 负担
- **手动标注成本可接受**: "少量标注帧"在实践中可行，但限制了大规模部署
- **视觉上下文仍然重要**: 纯对象特征在背景依赖任务上退化

## Open Issues

- 如何自动发现任务相关对象（无需手动指定 K）？
- 多对象世界模型中的对象交互建模
- 与 foundation model world models (如 DINO-WM) 的结合
- 遥感中的应用潜力：建筑物级变化检测、对象级土地利用分类

## Related Approaches

- [[../world-models/jepa-based]] — LeWorldModel, JEPA-based world models
- DreamerV3 — Pixel-reconstruction world model baseline
- STORM — Base architecture inherited by OC-STORM
