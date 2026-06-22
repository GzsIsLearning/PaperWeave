---
slug: "explaining-the-explainers-in-graph-neural-networks-a-comparative-study"
title: "Explaining the Explainers in Graph Neural Networks: a Comparative Study"
authors:
  - "Antonio Longa"
  - "Steve Azzolin"
  - "Gabriele Santin"
  - "Giulia Cencetti"
  - "Pietro Liò"
  - "Bruno Lepri"
  - "Andrea Passerini"
score: 3
contribution: 3
soundness: 3
relevance: 2
---

## [2026-05-02] Wiki rebuild review

**Score:** 3/5
- Contribution: 3/5 — novelty & impact
- Soundness: 3/5 — method rigor & experiments
- Relevance: 2/5 — to RS multimodal/pretraining research

**Key Insights:**
- Systematic survey comparing 12 GNN explainers on 8 message-passing architectures
- 6 graph/node classification datasets used for evaluation
- Provides guidelines on choosing explainers and avoiding interpretation pitfalls

**Notes:** GNN explainability survey. Not directly RS-related but relevant to model interpretability. 2024 preprint.

## [2026-05-24] Re-review — Full-text Reading with New Insights

**Key New Insights from Full-Text (877 lines):**

1. **12种解释器 × 8种GNN架构 × 6数据集的系统基准测试**：这是目前最全面的GNN可解释性比较研究。关键发现：
   - **图分类任务**：GraphConv 在 plausibility 和 fidelity 上综合最优；GCN最容易解释；GIN最难以解释（尽管其结构简单）
   - **节点分类任务**：GraphSage plausibility最高，GIN fidelity最高；Cheb最难解释（由于接收域过大）
   - 边缘掩码解释器在有节点特征的图上优于节点掩码，但House-Color（唯一有节点特征的数据集）例外

2. **"懒惰"现象（Laziness）**：GNN倾向于只学习一个类的判别特征，将另一类预测为"默认"选项。这导致"默认"类的解释不可靠且可能具有误导性——这是评估GNN解释器时必须考虑的关键偏差。

3. **Plausibility vs Fidelity的权衡**：高plausibility（接近人类预期）不一定对应高fidelity（忠实于模型实际决策）。两者联合分析可检测"人类偏差"——当解释器高fidelity低plausibility时，说明GNN学到的概念不同于人类先验。

4. **最小判别子图（MDS）**：Grid数据集的预期解释是3×3网格，但最小判别子图仅为一个正方形。这意味着即使解释器准确识别了MDS，plausibility评分也会偏低——这是基准设计的系统性问题。

5. **聚合函数影响可解释性**：Sum聚合（用于计数子结构）使图级embedding依赖节点数量，导致解释子图（更小）与完整图之间的分布偏移，损害fidelity评估。

**Citation Mining — 可读推荐：**
- Faber et al. (2021) "When Comparing to Ground Truth is Wrong" — KDD 2021 — 系统性指出GNN解释器基准的偏差问题，本文设计的合成数据集基于其工作
- Agarwal et al. (2022) "Evaluating Explainability for Graph Neural Networks" — 与本文最直接竞争的比较工作
- Zhao et al. (2022) "On Consistency in Graph Neural Network Interpretation" — 解释一致性分析
- Zhou et al. (2020) "GNNs: A Review" — AI Open, 本文使用的GNN分类法来源

**Cross-wiki Connections:**
- [[L2_lineage/graph/survey/gnn-review.md]] — 已收录本文
- [[L0_raw/graph-attention-networks]] — GAT是本文基准架构之一
- [[L0_raw/how-attentive-are-graph-attention-networks]] — GAT可解释性分析
- [[L3_module/model-efficiency.md]] — 可解释性与效率的权衡
- [[L3_module/open-source-reproducibility.md]] — 本文列出解释器的代码可用性

**New Score Assessment:** Score 3/5 确认。这是一篇高质量的GNN可解释性基准，方法论严谨（合成数据集设计精心、评估指标全面），但与遥感FM/MoE/多模态预训练的核心研究兴趣距离较远。主要贡献是提供了GNN解释器的选择指南和解释陷阱的避免策略，对任何使用GNN的研究都有启发意义。
