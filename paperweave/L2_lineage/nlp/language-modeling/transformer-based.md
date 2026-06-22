---
title: Transformer-based Language Models
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: nlp
task: language-modeling
approach: transformer-based
tags: [nlp, transformer, attention, language-model, data-processing]
sources:
  - L0_raw/attention-is-all-you-need
  - L0_raw/bert-pre-training-of-deep-bidirectional-transformers-for-language-understanding
  - L0_raw/improving-language-understanding-by-generative-pre-training
  - L0_raw/understanding-and-improving-layer-normalization
  - L0_raw/ccnet-extracting-high-quality-monolingual-datasets-from-web-crawl-data
  - L0_raw/attention-residuals
  - L0_raw/attention-residuals
  - L0_raw/back-to-recurrent-processing-at-the-crossroad-of-transformers-and-state-space-mo
  - L0_raw/ccnet-extracting-high-quality-monolingual-datasets-from-web-crawl-data
  - L0_raw/mhc-manifold-constrained-hyper-connections
zotero_keys: []
confidence: high
---

# Transformer-based Language Models

## Overview

从 Attention Is All You Need (2017) 到 BERT (2019) 到 GPT 系列，Transformer 彻底改变了 NLP。CCNet (2020) 提供了大规模数据清洗基础设施，Attention Residuals (2025) 改进了残差连接的聚合方式。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| Attention Is All You Need (Vaswani) | 2017 | 5 | 纯注意力架构，抛弃 RNN/CNN | 8×P100 | WMT | true | — | 自注意力 + 多头 + 位置编码 |
| BERT (Devlin) | 2019 | 5 | 双向预训练 + masked LM | 16×TPU | BooksCorpus+Wiki | true | github.com/google-research/bert | 深度双向是突破关键 |
| GPT-1 (Radford) | 2018 | 5 | 生成式预训练 + 微调范式 | — | BooksCorpus | true | — | 单向语言模型也可以很强 |
| Layer Norm (Xu) | 2019 | 4 | 深入理解层归一化机制 | — | — | — | — | LayerNorm 为什么有效 |
| CCNet (Wenzek) | 2020 | 3 | Common Crawl 数据清洗 pipeline | 5000 CPUs | Common Crawl | true | github.com/facebookresearch/cc_net | LM perplexity 过滤提升语料质量 |
| Attn Residuals (Kimi Team) | 2025 | 4 | 可学习注意力残差连接，48B/1.4T 验证 | — | — | true | github.com/MoonshotAI/Attention-Residuals | Block AttnRes 将内存从 O(Ld) 降至 O(Nd) |
