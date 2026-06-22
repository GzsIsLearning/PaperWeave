---
slug: "from-pixels-to-words----towards-native-vision-language-primitives-at-scale"
title: "From Pixels to Words – Towards Native Vision-Language Primitives at Scale"
authors:
  - "Haiwen Diao"
  - "Mingxuan Li"
  - "Silei Wu"
  - "Linjun Dai"
  - "Xiaohua Wang"
  - "Hanming Deng"
  - "Lewei Lu"
  - "Dahua Lin"
  - "Ziwei Liu"
score: 4
contribution: 4
soundness: 4
relevance: 3
---

## [2026-05-02] Wiki rebuild review

**Score:** 4/5
- Contribution: 4/5 — novelty & impact
- Soundness: 4/5 — method rigor & experiments
- Relevance: 3/5 — to RS multimodal/pretraining research

**Key Insights:**
- NEO: native VLM that integrates vision-language in a unified decoder-only architecture
- Native-RoPE: disentangles height, width, temporal dimensions in rotary position embeddings
- Pre-Buffer + Post-LLM design for efficient pixel-word alignment
- 390M image-text examples. NEO-2.2B/9B competitive with modular VLMs
- Open source: https://github.com/EvolvingLMMs-Lab/NEO

**Citation Mining:**
- Qwen3 [Bai et al., 2025] — language backbone
- LLaVA [Liu et al., 2023] — modular VLM baseline
- Native-RoPE [this paper] — disentangled positional encoding

**L1 Ecology Observations:**
- Native-RoPE's disentangled H/W/T dimensions are directly applicable to RS: height (latitude), width (longitude), temporal (time series)
- Unified decoder-only architecture is a simplification trend for VLMs
- Pre-Buffer + Post-LLM design enables efficient pixel-word alignment for RS data
- Open-source nature facilitates RS VLM adaptation
