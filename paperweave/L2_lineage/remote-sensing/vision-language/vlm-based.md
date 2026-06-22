---
title: VLM-based Vision-Language Models for Remote Sensing (DEPRECATED)
created: 2026-05-01
updated: 2026-05-02
type: lineage
domain: remote-sensing
task: vision-language
approach: vlm-based
tags: [remote-sensing, vlm, vision-language, llm, clip, deprecated]
sources:
  - L0_raw/mind-the-modality-gap-towards-a-remote-sensing-vision-language-model-via-cross-m
  - L0_raw/vhm-versatile-and-honest-vision-language-model-for-remote-sensing-image-analysis
zotero_keys: []
confidence: medium
deprecated: true
merged_into: evolution.md
---

# VLM-based Vision-Language Models for Remote Sensing

## Overview

非 MoE 架构的遥感 VLM：通过视觉编码器+LLM 的标准架构，聚焦于 RS 领域特有的挑战——丰富描述、诚实问答、跨模态对齐。

与 [[moe-based]] 相比，这类方法更注重**数据质量**和**训练策略**而非架构创新。

> 通用 VLM (LLaVA, DeepSeek-VL, Qwen-VL 等) 在 `multimodal/vision-language/vlm-based` 中覆盖。

## Comparison Table

| Paper | Year | Venue | Score | Visual Enc | LLM | Key Innovation | Tasks | Best Metric | Compute | Code |
|-------|------|-------|-------|-----------|-----|---------------|-------|-------------|---------|------|
| **VHM** | 2025 | AAAI | 5 | CLIP-ViT-L (多层级) | Vicuna-7B | 丰富描述+诚实QA；VersaD 1.4M 图文数据 | 12类 (含诚实评估) | SC avg 85.13% | 16×A100预训练 | [✓](https://github.com/opendatalab/VHM) |
| **Mind the Gap** | 2024 | preprint | 4 | CLIP (patched) | CLIP text enc | PAINT权重插值+跨模态蒸馏 | 零样本分类+跨模态检索 | BigEarthNet-19 74.69% | — | [✓](https://github.com/Orion-AI-Lab/MindTheModalityGap) |

## VHM: Honesty in RS VLM

VHM 首次将 **"诚实性"** 引入 RS VLM 评估。HnstD 数据集包含事实性/欺骗性问题：

| Honest QA 类型 | 示例问题 | VHM 准确率 |
|---------------|---------|-----------|
| 物体存在性 (factual) | "图中是否有汽车？" | 81.50% |
| 物体存在性 (deceptive) | "图中是否有飞机？" (实际没有) | 93.33% ✅ |
| 颜色属性 | "图中的车是什么颜色？" | — |
| 位置属性 | "建筑物在图像的左侧吗？" | — |

**核心发现**：用 Gemini-Vision 生成的**丰富多句描述**（而非稀疏单句）训练，使得 VLM 对 RS 图像建立更全面的理解——视觉定位任务提升超 43%。

## Design Contrast: VHM vs MoE-based

| 维度 | VHM (vlm-based) | RS-MoE/RSUniVLM (moe-based) |
|------|----------------|---------------------------|
| 架构 | 标准 CLIP + Vicuna | Vicuna + MoE 路由层 |
| 训练策略 | 数据驱动 (丰富描述+诚实QA) | 架构驱动 (专家分工) |
| 参数量 | ~7B | 1B-9.36B |
| 任务覆盖 | 12类 (不许像素级) | 2-6类 (含像素级) |
| 可复现性 | ✅ 代码+数据开源 | ❌ 多不开源 |
| 核心哲学 | "让数据教会模型" | "让架构解耦能力" |

## Open Issues

- **VHM 不支持像素级感知**（分割/变化检测）——与 RSUniVLM 互补
- **数据依赖**：VHM 的成功高度依赖 Gemini-Vision 生成的训练数据——数据生成 VLM 的偏见会传导
- **诚实性仅覆盖 4 类问题**——RS VLM 的幻觉问题远未解决

## Related Approaches

- [[moe-based]] — RSUniVLM/RS-MoE/SkyMoE: MoE 架构的 RS VLM
- [[../representation-learning/contrastive-based]] — Mind the Gap 属于跨模态对比+VLM 交叉
- [[../../../multimodal/vision-language/vlm-based]] — 通用 VLM (LLaVA, DeepSeek-VL)
