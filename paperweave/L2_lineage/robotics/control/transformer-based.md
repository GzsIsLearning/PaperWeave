---
title: Transformer-based Robot Control
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: robotics
task: control
approach: transformer-based
tags: [robotics, manipulation, vla, diffusion, foundation-model, imitation-learning]
sources:
  - L0_raw/a-careful-examination-of-large-behavior-models-for-multitask-dexterous-manipulat
  - L0_raw/π0-a-vision-language-action-flow-model-for-general-robot-control
zotero_keys: []
confidence: medium
---

# Transformer-based Robot Control

## Overview

基于 Transformer 的机器人操作控制，包括扩散策略（Diffusion Policy）和视觉-语言-动作（VLA）模型两条路线。从 LBM 的严谨评估方法论到 π₀ 的通用机器人基础模型，代表了从单任务行为克隆到多任务通用控制的演进。

## Papers

| Paper | Year | Venue | Score | Contribution | Compute | Code |
|-------|------|-------|-------|-------------|---------|------|
| LBM (TRI) | 2025 | RSS | 4 | Rigorous multi-task evaluation + scaling study | 32×A100 | — |
| π₀ (Physical Intelligence) | 2025 | Preprint | 5 | VLA generalist: VLM + flow matching action | Large-scale | — |

## LBM: Large Behavior Models

### 核心贡献

**不是新架构，而是新评估标准**。TRI 团队使用现有 Diffusion Policy + DiT 架构，贡献在于：

1. **1700 小时演示数据**预训练（TRI-Ramen 545h + OXE-Ramen 1150h）
2. **1800 次真机盲测 + 47000 次仿真 rollout**
3. **统计显著性**: 贝叶斯后验、Compact Letter Display、rubric QA

### 关键发现

- **样本效率**: 微调 LBM 仅需 <30% 任务专属数据即可达到单任务 baseline
- **OOD 鲁棒性**: 在分布外条件下优势更明显（仿真中 3/16 → 10/16 显著优势）
- **Scaling law**: 预训练数据量平滑提升性能，未观察到突变阈值
- **工程细节 > 架构改进**: 数据归一化错误对性能影响可能超过架构选择

### 局限

- Zero-shot 多任务能力有限（受限于小型语言编码器）
- 未开源
- 评估成本极高（真机盲测 1800 次）

## π₀: Vision-Language-Action Flow Model

### 架构

```
图像 + 语言指令 → PaliGemma (3B VLM) → 语义理解
                                            │
                              Action Expert (300M) ← 动作 token
                                            │
                              Flow Matching → 连续动作序列 (50Hz)
```

- **VLM backbone**: PaliGemma 3B 提供 Internet-scale 语义知识
- **Action expert**: 独立 Transformer 权重（MoE 风格），双向 attention 在 action chunk 内
- **Flow matching**: 扩散变体，连续动作生成，action chunking horizon H=50
- **总参数**: 3.3B

### 预训练/后训练范式

```
预训练 (~10,000h): 多样化低质量数据 → 学习恢复行为
    │  7 种机器人配置, 68 任务, + OXE, DROID, Bridge
    │
后训练 (微调): 高质量任务专属数据 → 学习流畅执行
    │  模仿 LLM 训练范式
    │
部署: 洗衣折叠 / 桌面清理 / 装箱 / 装蛋 / 购物袋
```

### 结果

- 在所有 20+ 任务中超越 OpenVLA、Octo、ACT、Diffusion Policy
- 推理延迟: 73ms on RTX 4090
- 某些任务（装箱、便当盒）仍 <50% 成功率

## LBM vs π₀

| 维度 | LBM (TRI) | π₀ (Physical Intelligence) |
|------|-----------|---------------------------|
| 架构 | Diffusion Policy + DiT | PaliGemma VLM + Flow Matching |
| 参数 | 未公开 | 3.3B |
| 数据 | 1,700h | ~10,000h |
| 核心创新 | 评估方法论 | VLA 架构 + 训练范式 |
| 语言 | 小型编码器 | 3B VLM |
| 通用性 | 多任务微调 | 零样本 + 微调 |
| 开源 | ✗ | 部分 |

## Design Patterns

### 从行为克隆到通用控制

```
2023  Diffusion Policy      ← 单任务，扩散模型生成动作
2024  Octo / OpenVLA        ← 多任务，Transformer 策略
2025  LBM                   ← 多任务预训练 + 评估标准
2025  π₀                    ← VLA 通用基础模型，LLM 训练范式
```

### VLA 设计选择

| 选择 | LBM 做法 | π₀ 做法 |
|------|---------|--------|
| 视觉编码器 | CLIP ViT-B/16 | PaliGemma ViT |
| 语言编码器 | 小型 | 3B VLM |
| 动作生成 | Diffusion | Flow Matching |
| 动作频率 | — | 50Hz (chunking H=50) |
| 训练策略 | 多任务联合 | 预训练 → 后训练 |

## Key Insights

- **评估方法学至关重要**: LBM 指出许多机器人论文可能仅在"测量统计噪声"
- **LLM 训练范式迁移有效**: π₀ 证明了预训练/后训练在机器人控制中的威力
- **VLM 提供语义基础**: Internet-scale 知识显著提升语言条件任务
- **Flow matching > Diffusion**: 连续动作生成更自然，推理更快

## Open Issues

- 推理延迟限制低功耗机器人部署（需 RTX 4090）
- 预训练数据组合的最优配方不明确
- Sim-to-real 和新机器人形态的泛化
- 长时域多阶段任务的可靠性

## Related Approaches

- [[cnn-based]] — CNN-based 机器人控制 (quadrotor DDL)
