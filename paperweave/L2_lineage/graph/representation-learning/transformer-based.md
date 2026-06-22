---
title: Graph Representation Learning
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: graph
task: representation-learning
approach: transformer-based
tags: [graph, gnn, attention, representation-learning, inductive, relational]
sources:
  - L0_raw/graph-attention-networks
  - L0_raw/how-attentive-are-graph-attention-networks
  - L0_raw/inductive-representation-learning-on-large-graphs
  - L0_raw/predict-then-propagate-graph-neural-networks-meet-personalized-pagerank
  - L0_raw/modeling-relational-data-with-graph-convolutional-networks
zotero_keys: []
confidence: medium
---

# Graph Representation Learning

## Overview

图表示学习从 GAT 注意力机制出发，覆盖归纳式嵌入(GraphSAGE)、解耦预测与传播(PPNP/APPNP)、以及关系图卷积(R-GCN)。这些方法共同解决了 GCN 的核心局限：转导限制、过平滑、关系建模缺失。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| GAT (Veličković) | 2018 | 5 | 图上的自注意力 | — | Cora, Citeseer, Pubmed, PPI | true | — | 注意力替代固定边权重，多头稳定训练 |
| GraphSAGE (Hamilton) | 2017 | 4 | 归纳式节点嵌入框架 | — | Citation, Reddit, PPI | true | — | 邻居采样+聚合使嵌入泛化到未见节点，100×快于DeepWalk，Pooling聚合最优 |
| R-GCN (Schlichtkrull) | 2018 | 4 | 关系图卷积网络 | — | AIFB, AM, FB15k-237 | true | — | 关系特化权重矩阵+basis/block-diagonal正则，编解码器框架做链接预测，+29.8% FB15k-237 |
| PPNP/APPNP (Klicpera) | 2019 | 5 | 解耦预测与传播 | — | 4个引文/合著图 | true | — | GCN深层收敛到全局PageRank(丢失局部信息)，个性化PageRank通过teleport向量保留局部性，APPNP幂迭代O(|E|)近似 |
| How Attentive are GATs (Brody) | 2022 | 5 | GAT 注意力机制分析 | — | 12基准 | true | — | 静态注意力 vs 动态注意力，GATv2简单修复即通用近似 |

## Key Design Choices

- **归纳泛化**: GraphSAGE 邻居采样(S1=25, S2=10) + 聚合(mean/LSTM/pooling)，K=2深度足矣
- **解耦策略**: PPNP 先MLP预测→再PageRank传播，APPNP 幂迭代近似无额外参数，α(teleport概率)控制局部性
- **关系建模**: R-GCN 每种关系独立的 W_r，basis分解共享参数防过拟合，block-diagonal稀疏化
- **注意力修正**: GATv2 的 e = a^T LeakyReLU(W [h_i || h_j]) 使注意力成为通用近似器

## Synthesis

图表示学习的演进围绕三个核心问题：(1) **归纳能力** — GraphSAGE 通过采样+聚合使 GNN 从转导走向归纳，使模型可处理动态增长图；(2) **深度限制** — PPNP/APPNP 通过解耦预测与传播，优雅地解决了多层 GCN 的过平滑问题，关键是理解 GCN 深层收敛性质；(3) **异构性** — R-GCN 通过关系特化权重将 GCN 扩展到知识图谱等多关系数据。GAT→GATv2 的修正提醒我们注意力机制的细微实现差异可导致质变。这些方法共同扩展了 GNN 的适用范围：从简单无向同构图到复杂异构图，从小规模转导到大规模归纳。

### 2026-05-31 跨引用更新

**GraphSAGE 的 WL 测试连接与引文更新：**
- GraphSAGE 的理论核心是其与 Weisfeiler-Lehman 图同构测试的直接联系——这是 GNN 表达能力的理论边界，也是后续 GIN (Xu et al., ICLR 2019) 的理论前身
- Pooling 聚合器直接受 PointNet (Qi et al., CVPR 2017) 启发，揭示了点云处理与 GNN 在无序集合处理上的数学统一性
- DeepWalk 的正交不变性分析（Appendix D）解释了为什么转导方法在多图泛化场景中失败——这一理论洞见对遥感中地理空间图的应用有重要启示
- 详见 [[../L0_raw/inductive-representation-learning-on-large-graphs/review.md]] 的 2026-05-31 re-review
