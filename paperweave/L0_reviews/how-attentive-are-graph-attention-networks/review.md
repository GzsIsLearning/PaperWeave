---
slug: "how-attentive-are-graph-attention-networks"
title: "How Attentive Are Graph Attention Networks?"
authors:
  - "Shaked Brody"
  - "Uri Alon"
  - "Eran Yahav"
score: 5
contribution: 5
soundness: 5
relevance: 5
---

> **Abstract:** Shows GAT computes only "static" attention (ranking of scores unconditioned on query). Proposes GATv2 — swapping the order of LeakyReLU and linear layers — achieving dynamic attention. GATv2 outperforms GAT across 12 benchmarks.

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — Critical theoretical insight about GAT's limitation; simple, elegant fix; highly influential
- Soundness: 5/5 — Formal definitions (static vs dynamic attention), rigorous proofs (Theorems 1 & 2), comprehensive evaluation (synthetic + 12 benchmarks)
- Relevance: 5/5 — Directly relevant for any work using graph attention; GATv2 is the de facto replacement for GAT

**Key Insights:**
- GAT scoring: e(h_i, h_j) = LeakyReLU(a^T [Wh_i || Wh_j]) — can be rewritten as LeakyReLU(a1^T Wh_i + a2^T Wh_j)
- Because of this, ∃j_max that maximizes a2^T Wh_j for ALL queries → static attention (Theorem 1)
- GATv2 fix: e(h_i, h_j) = a^T LeakyReLU(W [h_i || h_j]) — MLP on concatenated pair → universal approximator
- DICTIONARYLOOKUP: GAT fails to fit training data even with 1 head; GATv2 achieves 100% train+test with 1 head
- Noise robustness: GATv2 degrades more gracefully as structural noise increases
- GATv2 > GAT on all 12 benchmarks: ogbn-arxiv (+0.33%), ogbn-products (+1.59%), QM9 (-11.5% rel. error), VarMisuse (+1.6%)
- Same O(|V|dd' + |E|d') complexity as GAT

**Notes:** ICLR 2022. Technion/CMU. Now integrated into PyTorch Geometric, DGL, TensorFlow GNN. Essential reading alongside the original GAT paper.
