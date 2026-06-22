---
title: Miscellaneous Methods
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: general
task: other
approach: miscellaneous
tags: [spatial-statistics, optimization, visualization, ai-agents, time-series-classification]
sources:
  - L0_raw/geographically-and-temporally-weighted-regression-for-modeling-spatio-temporal-v
  - L0_raw/hgcn2sp-hierarchical-graph-convolutional-network-for-two-stage-stochastic-progra
  - L0_raw/echarts-a-declarative-framework-for-rapid-construction-of-web-based-visualizatio
  - L0_raw/when-openclaw-ai-agents-teach-each-other-peer-learning-patterns-in-the-moltbook-
  - L0_raw/shapeformer-shapelet-transformer-for-multivariate-time-series-classification
zotero_keys: []
confidence: low
---

# Miscellaneous Methods

## Overview

跨领域的杂项论文，涵盖空间统计、组合优化、可视化、AI agent 社区和时间序列分类。这些论文不属于统一的主题群组，但各自在其领域内有参考价值。

## Papers

| Paper | Year | Venue | Score | Domain | Contribution |
|-------|------|-------|-------|--------|-------------|
| GTWR (Huang) | 2010 | IJGIS | 3 | Spatial Stats | GWR + temporal distance |
| HGCN2SP (Wu) | 2024 | ICML | 4 | Optimization | Hierarchical GCN + RL for 2SP |
| ECharts (Li) | 2018 | — | ref | Visualization | Declarative web viz framework |
| Moltbook (et al.) | — | — | ref | AI Agents | Peer learning patterns in agent communities |
| ShapeFormer (Le) | 2024 | KDD | 4 | TS Classification | Shapelet Transformer for MTSC |

## GTWR: Geographically and Temporally Weighted Regression

### 方法

扩展 GWR (Geographically Weighted Regression)，在核权重中加入时间距离：

```
d_ST² = λ[(u_i-u_j)² + (v_i-v_j)²] + μ(t_i-t_j)²
```

- 退化性质: μ=0 → GWR; λ=0 → TWR; 通用 → GTWR
- 参数 τ=μ/λ 通过交叉验证优化

### 结果

- R²: OLS=0.763, TWR=0.779, GWR=0.890, GTWR=0.928
- 46.4% 误差降低 vs OLS
- 数据: Calgary 房价 (2002-2004), 5000 观测, 11 变量
- 局限: 仅 3 年时间数据

### 与遥感关联

GTWR 的时空变系数模型可应用于遥感中的时空分析（如城市热岛效应、植被动态），但本质上是统计方法而非深度学习方法。

## HGCN2SP: Hierarchical GCN for Two-Stage Stochastic Programming

### 方法

用层次图卷积网络 + 强化学习做两阶段随机规划的场景缩减：

- **低层 GCN**: 二部图编码每个场景（变量 ↔ 约束）
- **高层 GCN**: 实例图编码场景间关系（节点=场景，边=相似度加权）
- **Attention decoder**: 类似 Kool et al. (2018)，顺序选择场景
- **PPO 训练**: reward = α × 一致性 + (1-α) × (-求解时间)

### 结果

| 任务 | k | 误差 | 时间 | Gurobi 时间 |
|------|---|------|------|------------|
| CFLP | 5 | 2.47% | 2.45s | 10,695s |
| NDP | 20 | 2.25% | 0.98s | — |

泛化能力强：在 200-场景实例上训练，可直接用于 500-场景和 2× 更大的实例。

### 意义

首次考虑场景排序对求解器性能的影响，证明了 GNN+RL 在运筹优化中的实用性。

## ECharts: Declarative Web Visualization Framework

### 概述

百度开源的声明式可视化框架（2013 年发布，22,000+ GitHub stars）：

- **声明式 JSON option model**: 无需编程，通过 JSON 配置即可创建交互式可视化
- **流式数据驱动架构**: 可组合组件 + ZRender 渲染引擎 (Canvas/SVG/VML)
- **渐进式渲染**: 百万级数据点不阻塞 UI
- **Web Workers 多线程渲染**
- 19 种内置图表类型，可扩展

### 意义

工程系统而非研究贡献。展示了大规模 Web 可视化系统的设计原则：声明式 API、流式架构、渐进渲染。

## Moltbook: AI Agent Peer Learning

### 概述

对 Moltbook 社区的 EDM 分析 —— 超过 240 万 AI agent（基于 OpenClaw 框架）的社交网络：

- 28,683 实质性帖子（过滤 58% spam），138 评论线程
- **Statement-to-question ratio**: 11.4:1（人类论坛 1:2-1:5）—— AI 默认"告诉"而非"提问"
- **内容偏好**: 程序性内容收到 3.5× 更多评论
- **参与极度不均**: Gini=0.91 (MOOC 0.5-0.7)
- 评论模式: 验证 22%，知识延伸 18%，应用 12%，元认知反思 7%

### 意义

首次大规模实证表征 AI agent 社区中的话语模式，提供了 AI 教育设计的六个可检验假设。谨慎区分话语模式与认知过程，避免拟人化。

## ShapeFormer: Shapelet Transformer for MTSC

### 方法

结合 shapelet 和 Transformer 用于多变量时间序列分类：

- **双模块**: 类别特定 shapelet 模块 + 通用 CNN Transformer 模块
- **Offline Shapelet Discovery**: PIP-based 方法，候选数从 45M 降至 ~5900
- **Shapelet Filter**: 计算 P_i(I_i) - P_s(S_i) 作为差异特征，shapelets 变为可学习参数
- **Class token**: 使用最高信息增益的 shapelet token 而非平均池化

### 结果

- 30 个 UEA MTS 数据集
- Friedman + Wilcoxon 统计显著性检验
- 固定位置 embedding（start/end/variable），不使用不稳定的 best-fit 位置

### 意义

首个将 Transformer 与 shapelet 结合的 MTSC 方法。Shapelet 的可解释性与 Transformer 的表达能力互补。
