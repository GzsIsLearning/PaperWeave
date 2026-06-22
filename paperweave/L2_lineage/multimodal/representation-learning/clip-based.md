---
title: CLIP & Contrastive Vision-Language Representation Learning
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: multimodal
task: representation-learning
approach: clip-based
tags: [multimodal, clip, contrastive-learning, zero-shot, representation-learning]
sources:
  - L0_raw/learning-transferable-visual-models-from-natural-language-supervision
  - L0_raw/patching-open-vocabulary-models-by-interpolating-weights
zotero_keys: []
confidence: high
---

# CLIP & Contrastive Vision-Language Representation Learning

## Overview

CLIP (Contrastive Language-Image Pre-training) 使用 400M 图文对进行对比学习，实现强大的零样本迁移能力。其视觉编码器成为几乎所有现代 VLM 的标准 backbone。PAINT 通过权重插值提供轻量修补方案，在不牺牲泛化的前提下提升特定任务表现。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| CLIP (Radford) | 2021 | 5 | 对比语言-图像预训练 | GPU集群 | 400M图文对(WIT) | true | github.com/openai/CLIP | 自然语言监督替代固定标签，零样本迁移30+数据集，对分布偏移更鲁棒 |
| PAINT (Ilharco) | 2022 | 4 | 权重插值修补开放词汇模型 | — | — | true | — | 微调权重与零样本权重线性插值(α∈[0,1])，9个修补任务提升15-60pp，ImageNet精度损失<1pp |

## Key Design Choices

- **CLIP 核心**: 双编码器(ViT/ResNet + Transformer文本) + 对比损失(对称InfoNCE)，最大化图文匹配对的余弦相似度
- **PAINT 核心**: WiSE-FT思想在CLIP上的应用——fine-tune后在权重空间做线性插值: θ_patched = (1-α)θ_zs + αθ_ft
- **Prompt工程**: "A photo of a [class]" 提示模板对零样本性能至关重要
- **局限**: CLIP在细粒度分类、计数、抽象推理上弱; PAINT需要验证集调α

## Synthesis

CLIP 证明了 web-scale 自然语言监督 + 对比学习可以产生与监督 ImageNet 训练媲美的视觉表示，且天然支持零样本迁移。这一发现直接催生了其后所有 VLM(LLaVA/Qwen-VL/DeepSeek-VL 等)使用 CLIP 视觉编码器的行业惯例。PAINT 揭示了微调与零样本能力之间的帕累托前沿可以通过简单的权重插值调和——无需重训、无额外推理开销的实用修补方案。两者共同确立了"先大规模对比预训练获取通用表示，再轻量适配特定需求"的范式。
