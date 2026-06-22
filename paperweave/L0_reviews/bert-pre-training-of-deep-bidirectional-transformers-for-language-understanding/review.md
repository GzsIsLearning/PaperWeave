---
slug: "bert-pre-training-of-deep-bidirectional-transformers-for-language-understanding"
title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
authors:
  - "Jacob Devlin"
  - "Ming-Wei Chang"
  - "Kenton Lee"
  - "Kristina Toutanova"
year: 2019
venue: "NAACL 2019"
tags: [NLP, transformer, pre-training, bidirectional, MLM]
score: 5
contribution: 5
soundness: 5
relevance: 4
open_source: true
code_url: "https://github.com/google-research/bert"
compute: "4-16 TPUs (4天训练)"
dataset_access: public
---

> **Abstract:** BERT提出Masked Language Model (MLM)预训练目标，实现深度双向Transformer预训练，通过预训练+微调范式在11项NLP任务上达到SOTA。建立了NLP和后续所有领域的"预训练→微调"范式。

## [2026-05-02] Weave Review

**Score:** 5/5
- Contribution: 5/5 — 里程碑贡献：提出MLM和NSP（Next Sentence Prediction）预训练目标，解决了Transformer的双向预训练问题。建立了"大规模无监督预训练+有监督微调"范式，影响了整个深度学习领域。
- Soundness: 5/5 — 在11项NLP任务上全面验证，涵盖句子级和token级任务，消融实验详尽（包括MLM vs 单向LM、不同模型规模等）。
- Relevance: 4/5 — BERT的预训练范式深刻影响了遥感FM的设计：masked image modeling (MAE, SatMAE)直接继承自MLM思想。预训练+微调流程是所有遥感FM的标准操作。

**Key Insights:**
- MLM随机mask 15% tokens，让模型基于双向上下文预测被mask词——使深度双向预训练成为可能
- 证明了预训练表示可以大幅减少对精心设计任务特定架构的依赖
- BERT_BASE (110M)和BERT_LARGE (340M)两种规模，展示了模型缩放的效果
- 微调时所有参数都参与更新（非冻结骨干），这与BLIP-2等后续工作的"冻结骨干"思路形成对比

**Notes:**
- Google AI Language出品
- 在所有遥感FM中（SatMAE, Prithvi, SkySense等），MIM预训练目标均直接源于BERT的MLM

**Citation Mining:**
- OpenAI GPT [Radford et al., 2018] — unidirectional baseline compared throughout
- ELMo [Peters et al., 2018] — feature-based approach vs BERT's fine-tuning
- Transformer [Vaswani et al., 2017] — base architecture
- BooksCorpus + Wikipedia — pre-training data sources
- GLUE [Wang et al., 2018] — evaluation benchmark

**L1 Ecology Observations:**
- BERT's MLM paradigm directly inspired Masked Image Modeling (MIM) in vision (MAE, SimMIM)
- Pre-train then fine-tune is the standard paradigm for all remote sensing foundation models
- Bidirectional context is crucial for dense prediction tasks (segmentation, detection) — parallels in遥感
- NSP task later found less important (RoBERTa showed removing it helps)
- Model scaling (BERT_LARGE 340M) set the pattern for subsequent model families
