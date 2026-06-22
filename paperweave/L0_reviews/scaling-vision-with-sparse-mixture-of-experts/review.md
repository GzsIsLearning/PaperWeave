---
slug: "scaling-vision-with-sparse-mixture-of-experts"
title: "Scaling Vision with Sparse Mixture of Experts"
authors:
  - "Carlos Riquelme"
  - "Joan Puigcerver"
  - "Basil Mustafa"
  - "Maxim Neumann"
  - "Rodolphe Jenatton"
  - "André Susano Pinto"
  - "Daniel Keysers"
  - "Neil Houlsby"
score: 5
contribution: 5
soundness: 5
relevance: 4
---

> **Abstract:** V-MoE: ViT的稀疏MoE版本。JFT-300M预训练，最大15B参数（ImageNet 90.35%）。Batch Prioritized Routing (BPR) 允许推理时动态跳过不重要的patch，节省~20% FLOPs。推理时可平滑trade-off性能与计算。

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — 首次将sparse MoE大规模应用于视觉领域。BPR算法创新性强：利用router权重作为patch重要性代理、允许推理时动态调整计算量。15B参数视觉模型的开创性工作。
- Soundness: 5/5 — 极其全面：JFT-300M上游+ImageNet few-shot/full FT+VTAB 19任务。多尺度模型对比(S/B/L/H)。消融k/C/Last-n vs Every-2/RandAug。专家专业化可视化分析。BPR训练+推理双重验证。
- Relevance: 4/5 — 核心是通用视觉扩展，非遥感专用。但其sparse MoE思路对遥感大模型（数据量巨大、推理效率需求高）有重要迁移价值。Maxim Neumann是共同作者，后续Remote Sensing相关MoE工作引用此基础。

**Key Insights:**
- MoE层替代ViT中每隔一层的MLP，每个patch token独立路由到k个expert (MLP)，保持计算量可控但参数量激增
- Batch Prioritized Routing (BPR): 按max routing weight对所有tokens排序后分配，优先处理重要patch。C≪1时可丢弃背景patch
- 推理时k和C均可调（无需重新训练）：k从2→1节省~50% FLOPs，C=0.5仅处理50% tokens仍保持性能
- 专家在深层专精于特定类别，浅层按patch位置分工——这是首次大规模MoE内部机理分析
- ImageNet-21k预训练表现差（数据量不足），需要JFT-300M级别的数据才能发挥MoE优势

**Citation Mining:**
- ViT [Dosovitskiy et al., 2021] — base architecture
- MoE [Shazeer et al., 2017] — sparse MoE in NLP (Outrageously Large Neural Networks)
- Switch Transformer [Fedus et al., 2021] — simplified MoE routing
- JFT-300M [Sun et al., 2017] — internal Google dataset

**L1 Ecology Observations:**
- V-MoE demonstrates that sparse MoE can scale vision models to 15B parameters efficiently
- BPR routing is relevant for RS: background patches can be skipped at inference time
- MoE's need for massive training data (JFT-300M) is a limitation for RS applications
- Expert specialization analysis provides insight for designing domain-specific RS MoE models
- Principle: keep FLOPs constant while scaling parameters → relevant for deployment on resource-constrained platforms
