---
slug: "graph-neural-networks-a-review-of-methods-and-applications"
title: "Graph Neural Networks: A Review of Methods and Applications"
authors:
  - "Jie Zhou"
  - "Ganqu Cui"
  - "Shengding Hu"
  - "Zhengyan Zhang"
  - "Cheng Yang"
  - "Zhiyuan Liu"
  - "Lifeng Wang"
  - "Changcheng Li"
  - "Maosong Sun"
score: 4
contribution: 4
soundness: 5
relevance: 4
---

> **Abstract:** Comprehensive survey of GNNs with a general design pipeline (find graph structure → specify type/scale → design loss → build model). Covers propagation (convolution, recurrent, skip-connection), sampling, and pooling modules. Systematically categorizes applications.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 4/5 — Unified design pipeline perspective is valuable; bridges theory and practice
- Soundness: 5/5 — Exhaustive coverage of spectral (SCNN, ChebNet, GCN, AGCN, DGCN, GWNN) and spatial (Neural FPs, DCNN, GraphSAGE, GAT, MoNet, MPNN, NLNN, GN) methods; thorough theoretical analysis section
- Relevance: 4/5 — Essential reference for anyone working with graph-structured data; relevant for graph-based RS methods

**Key Insights:**
- Design pipeline: (1) find graph structure, (2) specify type/scale, (3) design loss, (4) build with modules
- Propagation: convolution operators (spectral/spatial/attention-based), recurrent operators (GGNN, Tree/Graph LSTM), skip connections (Highway GCN, JKN, DeepGCNs)
- Sampling: node sampling (GraphSAGE, PinSage), layer sampling (FastGCN, LADIES), subgraph (ClusterGCN, GraphSAINT)
- Pooling: direct (Set2set, SortPooling), hierarchical (DiffPool, gPool, EigenPooling, SAGPool)
- Applications: physics, chemistry, biology, knowledge graphs, traffic, recommendation, CV, NLP, combinatorial optimization
- Four open problems: robustness, interpretability, graph pretraining, complex graph types

**Notes:** AI Open 2020. Tsinghua University. ~1300 citations. Very well-organized; the design pipeline framework makes it an excellent teaching/reference resource.
