---
slug: "stformer-a-noise-aware-efficient-spatio-temporal-transformer-architecture-for-tr"
title: "STWave: Spatio-Temporal meets Wavelet — Disentangled Traffic Flow Forecasting via Efficient Spectral Graph Attention Network"
authors:
  - "Yuchen Fang"
  - "Yanjun Qin"
  - "Haiyong Luo"
  - "Fang Zhao"
  - "Bingbing Xu"
  - "Chenxing Wang"
  - "Liang Zeng"
year: 2022
venue: "AAAI 2022 (estimated)"
tags: [traffic-forecasting, spatio-temporal, wavelet-transform, graph-attention, efficient-transformer]
score: 4
contribution: 4
soundness: 4
relevance: 3
open_source: false
code_url: ""
compute: "GPU (single GPU sufficient)"
dataset_access: public
---

> **Abstract:** STWave uses discrete wavelet transform to disentangle traffic sequences into low-frequency (long-term) and high-frequency (short-term) components. Dual-channel encoder with dilated causal convolution + temporal attention + Efficient Spectral Graph Attention Network (ESGAT). Wavelet-based graph positional encoding + query sampling for O(N log N) complexity.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 4/5 — Novel combination of wavelet transform with graph attention for traffic forecasting. ESGAT with query sampling is elegant. Wavelet-based graph positional encoding is well-motivated.
- Soundness: 4/5 — Four real-world PeMS datasets (D3, D4, D7, D8). 15 baselines. Ablation on disentangling, multi-supervision, fusion, ESGAT components. Parameter sensitivity analyzed.
- Relevance: 3/5 — Traffic forecasting domain. Methodology (wavelet + graph attention) transferable to RS spatio-temporal tasks. Not RS-specific.

**Key Insights:**
- DWT decomposes traffic into low-frequency (long-term trends) and high-frequency (short-term fluctuations); modeled separately
- ESGAT: query sampling via GAT + topk-pooling reduces attention complexity from O(N²) to O(N log N)
- Wavelet-based graph positional encoding (ψ_s = Φ G_s Φ^T) captures both structural info and localization property
- Multi-supervision on low-frequency component improves long-term trend learning
- Fusion attention uses low-frequency as query to attend to both low and high components

**Notes:** BUPT + CAS ICT + Tsinghua. PeMS traffic datasets. 12-step in, 12-step out. Note: slug "stformer" may be inaccurate; actual paper is STWave.
