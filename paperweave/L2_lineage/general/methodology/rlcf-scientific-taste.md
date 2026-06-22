---
title: RLCF & Scientific Taste (RL from Community Feedback)
created: 2026-05-20
updated: 2026-05-20
type: lineage
domain: general
task: methodology
approach: rlcf-scientific-taste
tags: [methodology, RL, preference-modeling, reward-model, GRPO, scientific-taste, RLCF]
sources:
  - L0_raw/ai-can-learn-scientific-taste/review.md
zotero_keys: []
confidence: medium
---

# RLCF & Scientific Taste: Reinforcement Learning from Community Feedback

## Overview

提出 **Reinforcement Learning from Community Feedback (RLCF)** 范式，将「科学品味」（判断和提出高影响力研究想法的能力）形式化为偏好建模 + 偏好对齐问题。核心创新在于用引用数据构造大规模场-时间匹配的偏好对，通过 GRPO 训练生成式奖励模型（Scientific Judge），再以其为奖励通过 Comparison-Based GRPO 训练理念生成模型（Scientific Thinker）。

## Papers

| Paper | Year | Score | Contribution | Notes |
|-------|------|-------|-------------|-------|
| Tong et al. (RLCF) | 2026 | 4 | 首个将科学品味作为可学习目标的形式化框架；SciJudgeBench 69.7万对偏好数据 | RLCF 范式远超 AI Scientist 的执行力范畴 |

## Key Concepts

### RLCF 三阶段流水线

```
Stage 1: 构建社区偏好
  社区信号（引用数） → 同领域+同年份配对 → 69.7万对偏好数据 (SciJudgeBench)
  
Stage 2: 偏好建模 (Scientific Judge)
  论文A标题+摘要 vs 论文B标题+摘要 → GRPO → 推理轨迹 + 预测 (A/B) → 二值奖励

Stage 3: 偏好对齐 (Scientific Thinker)
  种子论文 → 组采样G个想法 → Scientific Judge循环锦标赛 → 组内胜率作为奖励 → Comparison-Based GRPO更新
```

### Comparison-Based GRPO

对于开放任务（无绝对评分标准），采用**循环锦标赛 + 组内胜率**：

$$r_i = \frac{1}{G-1} \sum_{j \neq i} s(o_i, o_j), \quad s(o_i, o_j) \in \{0,1\}$$

相比常规 GRPO 优势：
- 无需绝对评分标准
- 两两比较自然可靠
- 适用于任何开放生成任务

### 三重泛化证据

| 泛化轴 | 设置 | 最大提升 |
|--------|------|---------|
| 时间 (Temporal OOD) | 训练于≤2024 → 测试2025论文 | +55.1 pts (1.5B) |
| 领域 (Field OOD) | 训练仅CS → 测试Math/Physics/Others | +61.3 pts (1.5B) |
| 指标 (Metric OOD) | 训练用引用 → 测试ICLR评审分 | +72.0 pts (1.5B) |

## Design Space

### 相关范式对比

| 范式 | 信号源 | 是否可扩展 | 适用任务 | 代表工作 |
|------|--------|----------|---------|---------|
| RLHF | 人工偏好标注 | ❌成本高 | 对齐（helpful/harmless） | Ouyang et al. (2022) |
| RLVR | 自动可验证奖励（代码/数学） | ✅ | 数学推理、代码生成 | DeepSeek-R1 (2025) |
| **RLCF** | **社区反馈（引用）** | **✅大规模自动** | **科学品味、开放任务** | **本论文** |
| GRM / RM-R1 | 模型自身推理 | ✅ | 通用奖励建模 | Mahan et al. (2024) |

### 关键方法论差异

- **vs AI Scientist** (Lu et al., 2024): AI Scientist 侧重于执行（实验→论文），本工作侧重判断×提出
- **vs Si et al. Can LLMs Generate Novel Ideas**: 发现问题（LLM缺乏品味）→ 本工作提出解决方案（RLCF）
- **vs GRM**: GRM 直接训练生成式奖励模型，本工作在 GRM 基础上加上了社区偏好作为监督信号

## Best Practices

1. **偏好配对策略**: 同领域 + 同年份匹配，绝对引用差≥8且相对差≥30%
2. **位置交换一致性**: 必须将A/B顺序对调各评一次，两次一致才计为正确
3. **通用能力监控**: 训练后检查 MMLU/GPQA/MATH 等基准，确保不退化（±3%以内）
4. **Judge 与 Thinker 模型解耦**: 小 Judge（4B）+ 大 Thinker（30B）可节约资源

## Pitfalls

1. **引用滞后性**: 刚发表的高潜力论文可能引用低，可建模引用动力学补充
2. **领域分类粒度**: arXiv 子学科分类有限，更细粒度聚类可能提升配对质量
3. **LLM 评估偏差**: 理念生成评估依赖 LLM 评委，未经过实验验证
4. **SciJudgeBench 仅覆盖 arXiv**: 无法代表所有科学产出形式

## Relevance

对遥感研究的具体迁移路径：
1. 构建遥感论文的 SciJudge-RS 数据集（用 IEEE TGRS/ISPRS/CVPR 引用配对）
2. 训练遥感论文的 Scientific Judge，可用于论文筛选、审稿、推荐
3. Comparison-Based GRPO 可用于遥感生成任务（变化描述、captioning）
