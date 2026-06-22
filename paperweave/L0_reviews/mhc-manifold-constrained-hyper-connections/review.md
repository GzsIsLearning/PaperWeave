---
slug: "mhc-manifold-constrained-hyper-connections"
title: "mHC: Manifold-Constrained Hyper-Connections"
authors:
  - "Zhenda Xie"
  - "Yixuan Wei"
  - "Huanqi Cao"
  - "DeepSeek-AI"
score: 4
contribution: 4
soundness: 4
relevance: 4
---

> **Abstract:** mHC constrains HC residual matrices to doubly stochastic (Birkhoff polytope) via Sinkhorn-Knopp. Restores identity mapping, stabilizes large-scale training. 6.7% overhead at n=4. Outperforms baseline and HC on 27B MoE models.

## [2026-05-02] Wiki rebuild review

**Score:** 4/5
- Contribution: 4/5 — elegant theoretical fix (manifold constraint) to HC instability with practical impact
- Soundness: 4/5 — 3B/9B/27B scaling experiments, 8 downstream benchmarks, stability analysis
- Relevance: 4/5 — addresses a key architectural bottleneck for scaling LLMs

**Key Insights:**
- HC's unconstrained residual matrices cause exploding/vanishing signals (Amax gain up to 3000x)
- Doubly stochastic constraint preserves norm (spectral norm ≤ 1) and is closed under composition
- mHC reduces composite mapping gain from ~3000 to ~1.6 (three orders of magnitude)
- Only 6.7% training overhead with kernel fusion + recompute + DualPipe overlap
- mHC outperforms HC on BBH (+2.1%), DROP (+2.3%), and consistently beats baseline

**Notes:** 2025. DeepSeek-AI. Builds on Hyper-Connections (Zhu et al., 2024). Practical infrastructure optimizations for large-scale training.
