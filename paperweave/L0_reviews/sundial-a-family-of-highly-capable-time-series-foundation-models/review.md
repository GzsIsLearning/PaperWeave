---
slug: "sundial-a-family-of-highly-capable-time-series-foundation-models"
title: "Sundial: A Family of Highly Capable Time Series Foundation Models"
authors:
  - "Yong Liu"
  - "Guo Qin"
  - "Zhiyuan Shi"
  - "Zhi Chen"
  - "Caiyin Yang"
  - "Xiangdong Huang"
  - "Jianmin Wang"
  - "Mingsheng Long"
score: 4
contribution: 4
soundness: 4
relevance: 4
---

> **Abstract:** 时间序列基础模型。TimeFlow Loss基于flow-matching实现连续值生成，无需离散tokenization。TimeBench 1万亿时间点。decoder-only Transformer + RoPE + FlashAttention + KV Cache。零样本预测毫秒级。

## [2026-05-02] Wiki rebuild review

**Score:** 4/5
- Contribution: 4/5 — 首个生成式时间序列FM，flow-matching适配自回归预测
- Soundness: 4/5 — 大规模实验，TSLib/GIFT-Eval/FEV三个benchmark验证
- Relevance: 4/5 — 时间序列基础模型方向

**Key Insights:**
- TimeFlow Loss: 参数化损失函数，建模per-token概率分布
- 无需离散量化，保持连续值原生特性
- Patch-level tokenization减少自回归步数
- 多patch预测加速推理

**Citation Mining:**
- PatchTST [Nie et al., 2023] — patching baseline
- TimeGPT [Garza et al., 2023] — concurrent TS FM
- TimesFM [Das et al., 2024] — concurrent TS FM
- Flow Matching [Lipman et al., 2023] — generative modeling foundation

**L1 Ecology Observations:**
- TimeFlow Loss (flow-matching for continuous values) is relevant for RS regression tasks
- Patch-level tokenization reduces autoregressive steps — efficient for long RS time series
- Zero-shot forecasting capability is valuable for RS: predict vegetation indices without target domain training
- Decoder-only + KV Cache enables efficient inference for real-time RS monitoring
