---
title: Graph Neural Networks for Node Classification
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: graph
task: classification
approach: cnn-based
tags: [graph, gnn, classification, gcn, gat, attention]
sources:
  - L0_raw/semi-supervised-classification-with-graph-convolutional-networks
  - L0_raw/graph-attention-networks
  - L0_raw/how-attentive-are-graph-attention-networks
  - L0_raw/不同优化器对gcn模型参数训练的影响
zotero_keys: []
confidence: high
---

# Graph Neural Networks for Node Classification

## Overview

GCN (Kipf & Welling 2017) 定义了图卷积的谱近似，是图神经网络的奠基工作。GAT 引入注意力机制替代固定边权重，GATv2 修正了其静态注意力缺陷。GCN 优化器比较系统评估了10种优化器的适用性。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| GCN (Kipf) | 2017 | 5 | 图卷积的谱域近似，GNN奠基 | 单GPU | Cora, Citeseer, Pubmed, NELL | true | github.com/tkipf/gcn | 一阶切比雪夫近似+重归一化，线性复杂度O(|E|)，2层最优，连接Weisfeiler-Lehman |
| GAT (Veličković) | 2018 | 5 | 图上自注意力机制 | — | Cora, Citeseer, Pubmed, PPI | true | — | 多头自注意力计算邻居权重，+1.5% Cora/+1.6% Citeseer超GCN，可并行无特征分解 |
| GATv2 (Brody) | 2022 | 5 | 修正GAT静态注意力为动态注意力 | — | 12基准 | true | — | 交换LeakyReLU与线性层顺序，GATv2可学习动态注意力(依赖query节点)，12基准全胜GAT |
| GCN优化器 (王) | 2024 | 2 | 10种优化器对GCN训练的系统比较 | — | Cora | — | — | Adamax最优(OA 0.859)，Adam+SGD组合无显著优势，LBFGS过拟合严重，ASGD完全失败 |

## Key Design Choices

- **GCN**: 谱域一阶近似，Ã = A + I_N 加自环稳定传播，2-3层最优，更深需残差连接
- **GAT**: e_ij = LeakyReLU(a^T [Wh_i || Wh_j])，softmax归一化，多头注意力(K=8)稳定训练
- **GATv2**: e(h_i, h_j) = a^T LeakyReLU(W [h_i || h_j])，MLP处理拼接对→动态注意力=通用近似器
- **优化器**: 自适应学习率优化器(RMSprop/Adam/Adamax)最适合GCN; LBFGS虽训练损失最低但泛化最差

## Synthesis

GCN→GAT→GATv2构成图分类方法的进化主线：从固定谱域卷积到可学习注意力，再到真正的动态注意力。GATv2揭示了原GAT的致命缺陷(注意力排名与query节点无关，本质静态)，并通过简单重排操作修复——这提醒我们：即便是高引方法也可能存在未被发现的根本性局限。优化器研究验证了Adam族在GCN训练中的经验选择，但也暴露了单一数据集(Cora)结论的泛化风险。
