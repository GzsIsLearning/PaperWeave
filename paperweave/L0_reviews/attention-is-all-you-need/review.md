---
slug: "attention-is-all-you-need"
title: "Attention Is All You Need"
authors:
  - "Ashish Vaswani"
  - "Noam Shazeer"
  - "Niki Parmar"
  - "Jakob Uszkoreit"
  - "Llion Jones"
  - "Aidan N. Gomez"
  - "Łukasz Kaiser"
  - "Illia Polosukhin"
year: 2017
venue: "NeurIPS 2017"
tags: [transformer, attention, NLP, foundation-model, self-attention]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "https://github.com/tensorflow/tensor2tensor"
compute: "8×P100 GPUs (3.5天训练)"
dataset_access: public
---

> **Abstract:** 提出Transformer架构，完全基于注意力机制、摒弃循环和卷积，在机器翻译任务上达到SOTA且训练时间大幅缩短。这是所有后续Transformer变体（ViT, Swin, BERT, GPT等）的奠基之作。

## [2026-05-02] Weave Review

**Score:** 5/5
- Contribution: 5/5 — 里程碑式贡献：提出了Multi-Head Self-Attention、Positional Encoding、Scaled Dot-Product Attention，彻底改变了深度学习架构范式。影响力已远超NLP。
- Soundness: 5/5 — 在WMT 2014英德和英法翻译上验证，消融实验涵盖attention head数量、attention type、position encoding等。
- Relevance: 5/5 — 所有后续Transformer变体的根节点。遥感FM（ViT-based, Swin-based）都直接建立在此架构之上。

**Key Insights:**
- Self-attention将任意两位置间的计算路径缩短为O(1)，解决了RNN的长距离依赖问题
- Multi-Head Attention允许模型同时关注不同表示子空间
- Scaled dot-product attention ($QK^T/\sqrt{d_k}$)防止内积过大导致softmax梯度消失
- 仅使用attention即可实现seq2seq，无需RNN/CNN，且高度并行化

**Notes:**
- Google Brain出品，引用量超10万+
- 所有遥感FM中的attention机制（包括ViT, Swin, cross-attention, self-attention变体）都源于此
- 位置编码的方案（正弦编码）仍被广泛使用

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.
