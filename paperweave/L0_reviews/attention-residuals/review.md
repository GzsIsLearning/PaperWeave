---
slug: "attention-residuals"
title: "Attention Residuals"
authors:
  - "Kimi Team (Moonshot AI)"
year: 2025
venue: "arXiv preprint (Technical Report)"
tags: [transformer, LLM, residual-connections, attention, architecture-design]
score: 4
contribution: 4
soundness: 4
relevance: 3
open_source: true
code_url: "https://github.com/MoonshotAI/Attention-Residuals"
compute: "48B参数模型，1.4T tokens预训练"
dataset_access: public
---

> **Abstract:** 提出Attention Residuals (AttnRes)替代标准残差连接中的固定权重累加，用softmax attention对先前层输出进行可学习的、输入依赖的聚合。Block AttnRes变体将内存从O(Ld)降至O(Nd)，实现大规模高效训练。

## [2026-05-02] Weave Review

**Score:** 4/5
- Contribution: 4/5 — 揭示了残差连接的深度聚合功能与序列注意力的形式对偶性，将标准残差和递归变体统一为"深度线性注意力"框架。Full/Block AttnRes设计巧妙实用。Scaling law实验和48B/1.4T tokens大规模验证令人信服。
- Soundness: 4/5 — Scaling law实验覆盖多个计算预算，组件消融充分（query设计、block大小等），训练动态分析显示了PreNorm dilution的缓解。但缺乏与更多baseline的对比。
- Relevance: 3/5 — LLM架构改进，对遥感FM的直接适用性有限。但Block AttnRes的内存优化策略可借鉴于大规模遥感FM训练。

**Key Insights:**
- 标准残差在PreNorm下导致hidden state增长O(L)，深层表示被稀释——AttnRes通过可学习选择缓解这一问题
- Block AttnRes将层分组，跨block做attention，内存从O(Ld)降至O(Nd)，在大规模训练中实现开销可忽略
- 48B模型训练动态分析显示：AttnRes使各层梯度分布更均匀，缓解深层"被遗忘"现象
- 推断开销<2%，作为标准残差的直接替代品

**Notes:**
- Moonshot AI (Kimi)出品
- 与Attention is not all you need (Dong et al. 2021)形成理论呼应：该文揭示了skip connections防止rank collapse的作用，AttnRes进一步优化了skip connection的聚合方式

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.
