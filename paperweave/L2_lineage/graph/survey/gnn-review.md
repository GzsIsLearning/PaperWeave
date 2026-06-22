---
title: GNN Survey & Explainability
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: graph
task: survey
approach: gnn-review
tags: [graph, gnn, survey, explainability, review]
sources:
  - L0_raw/graph-neural-networks-a-review-of-methods-and-applications
  - L0_raw/explaining-the-explainers-in-graph-neural-networks-a-comparative-study
zotero_keys: []
confidence: medium
---

# GNN Survey & Explainability

## Overview

本页面覆盖两篇综述：(1) GNN方法与应用的系统性综述，提供设计流水线框架；(2) GNN解释器的比较研究，为模型可解释性提供指南。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| GNN综述 (Zhou) | 2020 | 4 | GNN统一设计流水线+全面方法分类 | — | — | — | — | 设计流水线:找图结构→定类型/尺度→设计损失→构建模块；覆盖谱/空间/采样/池化全模块 |
| GNN解释器比较 (Longa) | 2024 | 3 | 12种GNN解释器在8种架构上的系统比较 | — | 6个图/节点分类数据集 | — | — | 提供解释器选择指南与解释陷阱避免策略，但仅覆盖分类任务 |

## Key Design Choices

- **GNN设计流水线** (Zhou et al.): 传播模块(卷积/循环/skip-connection)、采样模块(节点/层/子图)、池化模块(直接/层次)
- **谱方法**: SCNN, ChebNet, GCN, AGCN, DGCN, GWNN
- **空间方法**: Neural FPs, DCNN, GraphSAGE, GAT, MoNet, MPNN, NLNN, GN
- **GNN解释器**: 覆盖Gradient-based, Perturbation-based, Decomposition-based, Surrogate等12种方法
- **开放问题**: 鲁棒性、可解释性、图预训练、复杂图类型

## Synthesis

两篇综述分别从"如何设计GNN"和"如何理解GNN"两个维度提供参考。Zhou et al. (2020) 的设计流水线视图将碎片化的GNN方法组织为统一框架——传播→采样→池化——对研究者和实践者都有导航价值。Longa et al. (2024) 揭示了GNN可解释性的现状:12种解释器在不同架构上表现各异，选择不当可能导致误导性结论。两篇共同指向GNN领域的核心瓶颈:可解释性仍落后于模型能力增长。
