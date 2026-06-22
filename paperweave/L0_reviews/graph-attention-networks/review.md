---
slug: "graph-attention-networks"
title: "Graph Attention Networks"
authors:
  - "Petar Velickovic"
  - "Guillem Cucurull"
  - "Arantxa Casanova"
  - "Adriana Romero"
  - "Pietro Lio"
  - "Yoshua Bengio"
score: 5
contribution: 5
soundness: 4
relevance: 5
---

> **Abstract:** GAT introduces masked self-attention on graph neighborhoods. Nodes attend over neighbors with learnable weights. Achieves SOTA on Cora (83.0%), Citeseer (72.5%), Pubmed (79.0%), and PPI (0.973 F1).

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — Pioneered attention mechanism for graphs; highly influential (20K+ citations)
- Soundness: 4/5 — Strong experimental validation across 4 benchmarks; multi-head attention stabilizes training
- Relevance: 5/5 — Foundational method for graph-based deep learning, widely applicable to RS

**Key Insights:**
- Self-attention on graph neighbors: e_ij = LeakyReLU(a^T [Wh_i || Wh_j]), normalized via softmax
- Multi-head attention: K independent heads, concatenated (hidden) or averaged (output layer)
- No eigendecomposition needed; parallelizable across node-neighbor pairs; inductive capable
- +1.5% over GCN on Cora, +1.6% on Citeseer, +20.5% over GraphSAGE on PPI

**Citation Mining:**
- GCN [Kipf & Welling, 2017] — base graph convolution
- Transformer [Vaswani et al., 2017] — self-attention inspiration
- GraphSAGE [Hamilton et al., 2017] — inductive baseline comparison
- GATv2 [Brody et al., 2022] — dynamic attention fix (this paper's finding)

**L1 Ecology Observations:**
- GAT's attention mechanism is relevant for spatial graph modeling in RS (e.g., scene graphs)
- Multi-head attention in graphs parallels multi-head self-attention in Transformers
- GAT's static attention limitation (exposed by GATv2) is important for any RS application using graph attention
- Graph attention can model irregular spatial relationships in RS (e.g., between geographic entities)
- The per-edge scoring mechanism is related to how cross-attention works in VLMs
