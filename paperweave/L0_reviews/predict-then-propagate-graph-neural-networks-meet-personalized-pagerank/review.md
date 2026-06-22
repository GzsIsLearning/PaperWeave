---
slug: "predict-then-propagate-graph-neural-networks-meet-personalized-pagerank"
title: "Predict Then Propagate: Graph Neural Networks meet Personalized PageRank"
authors:
  - "Johannes Gasteiger"
  - "Aleksandar Bojchevski"
  - "Stephan Günnemann"
year: 2019
venue: "ICLR 2019"
tags: [graph-neural-networks, pagerank, propagation, semi-supervised-learning]
score: 5
contribution: 5
soundness: 5
relevance: 4
open_source: true
code_url: "https://github.com/gasteigerjo/ppnp"
compute: "CPU/GPU (single GPU sufficient)"
dataset_access: public
---

> **Abstract:** PPNP/APPNP decouples neural network prediction from graph propagation using personalized PageRank. This addresses the limited-range (oversmoothing) problem in GCNs while maintaining linear complexity. Achieves SOTA on 4 citation/co-authorship graphs with rigorous statistical evaluation (100 runs).

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — Pioneering insight that prediction and propagation should be decoupled. The PageRank analysis explains GCN's oversmoothing problem theoretically. APPNP provides practical linear-complexity approximation.
- Soundness: 5/5 — Rigorous evaluation: 100 runs per experiment, bootstrapping, paired t-tests. Identifies that prior methods' gains vanish under proper statistical testing.
- Relevance: 4/5 — Foundational idea for deep GNNs; the prediction-propagation decoupling influenced many subsequent works. Relevant for graph-based RS applications.

**Key Insights:**
- GCN converges to the global PageRank limit distribution as layers increase — losing local information
- Personalized PageRank preserves locality via teleport vector (restart probability α)
- Decoupling: neural network does prediction only, propagation is done via personalized PageRank
- APPNP approximates exact PPNP via power iteration with K steps — no additional parameters
- With K=10 and α=0.1, APPNP reaches near exact PPNP performance
- Key hyperparameters: α (teleport probability) and K (propagation steps)
- Benefits nodes far from training set with few labels

**Citation Mining:**
- GCN [Kipf & Welling, 2017] — base model that oversmooths
- PageRank [Page et al., 1999] — theoretical foundation
- Personalized PageRank [Haveliwala, 2002] — teleport formulation
- GAT [Velickovic et al., 2018] — attention-based comparison

**L1 Ecology Observations:**
- Decoupling prediction from propagation is relevant for RS: spatial propagation can be done separately from feature extraction
- Personalized PageRank preserves local vs global information trade-off — applicable to geographic spatial modeling
- The theoretical analysis of GCN's limit behavior is fundamental for understanding deep graph networks
- APPNP's zero additional parameters for propagation is attractive for real-world deployment
