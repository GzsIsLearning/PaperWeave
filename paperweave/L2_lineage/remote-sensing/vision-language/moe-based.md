---
title: MoE-based Vision-Language Models for Remote Sensing
created: 2026-04-29
updated: 2026-05-01
type: lineage
domain: remote-sensing
task: vision-language
approach: moe-based
tags: [remote-sensing, vlm, moe, multimodal, vision-language, mixture-of-experts]
sources:
  - L0_raw/rs-moe-a-vision-language-model-with-mixture-of-experts-for-remote-sensing-image-
  - L0_raw/rsunivlm-a-unified-vision-language-model-for-remote-sensing-via-granularity-orie
  - L0_raw/skymoe-a-vision-language-foundation-model-for-enhancing-geospatial-interpretatio
zotero_keys: []
confidence: high
---

# MoE-based Vision-Language Models for Remote Sensing

## Overview

遥感 VLM 利用 MoE 架构解耦不同粒度、不同模态、不同子任务的视觉语言能力。核心思路：让不同专家各司其职（粒度/子任务/局部vs全局），通过路由机制动态分配，在不显著增加推理成本的前提下提升多任务性能。

## Evolution Timeline

```
2024  RSUniVLM (PKU)               ← G-MoE: 按粒度 (图像/区域/像素) 分专家，端到端统一
  │
2025  RS-MoE (IEEE TGRS)           ← Instruction Router: 按子任务 (主题/地物/关系) 分解Caption
  │   SkyMoE (JLU)                 ← Adaptive Router + 对比数据增强引导专家解耦局部/全局
```

## Comparison Table

| Paper | Year | Venue | Score | Visual Enc | LLM | MoE Strategy | Tasks | Key Metric | Compute | Code |
|-------|------|-------|-------|-----------|-----|-------------|-------|------------|---------|------|
| **RSUniVLM** | 2024 | arXiv | 5 | SigLIP-400M | Qwen2-0.5B (~1B) | G-MoE 按粒度 (图像/区域/像素) | 6类 (SC+VQA+VG+CC+CD+Seg) | RSVQA-LR 92.05% | 4×A40/30h | ✗ |
| **RS-MoE** | 2025 | TGRS | 4 | ViT-G/14 | Vicuna-7B | Instruction Router 按子任务分解 | 2类 (Caption+VQA) | RSICap BLEU4 42.55 | — | [✓](https://github.com/CongcongWen1208/RS-MoE) |
| **SkyMoE** | 2025 | arXiv | 4 | CLIP-ViT-L | Vicuna-7B | Adaptive Router + 8 Experts | 5类×21数据集 | RSVQA-LR 93.13% | 6×A800 | ✗ |

## MoE Strategy Taxonomy

```
┌─────────────────────────────────────────────────────────────┐
│                  RS VLM MoE 三种路由策略                       │
│                                                             │
│  RSUniVLM G-MoE:          RS-MoE Router:      SkyMoE:       │
│  按粒度分专家              按子任务分解         数据增强引导     │
│  ┌──────┐                ┌──────┐            ┌──────┐       │
│  │Image │ ← scene cls    │主题  │ ← scene    │局部  │ ← obj │
│  ├──────┤                ├──────┤            ├──────┤       │
│  │Region│ ← VG, VQA      │地物  │ ← object   │全局  │ ← ctx │
│  ├──────┤                ├──────┤            └──────┘       │
│  │Pixel │ ← Seg, CD      │关系  │ ← spatial  Count-Varying  │
│  └──────┘                └──────┘            Cutout控制密度  │
│                                                             │
│  Training-free gate        Training-free gate   Data-driven  │
└─────────────────────────────────────────────────────────────┘
```

## Key Insight per Paper

| Paper | 一句话 |
|-------|--------|
| **RSUniVLM** | 第一个端到端统一图像/区域/像素三级 RS VLM；Text4Seg 将分割掩码表示为文本描述符 |
| **RS-MoE** | 第一个 RS MoE-VLM；Caption 分解为子任务让 1B 模型追上 13B 通用 VLM |
| **SkyMoE** | 数据增强+MoE 联合设计产生超加和增益；Count-Varying Cutout 解决计数虚高问题 |

## Cross-Paper Observations

- **全部用 Vicuna/Qwen 作 LLM 骨干**（未出现 Llama-3 或 DeepSeek）→ 可探索更现代的开源 LLM
- **视觉编码器不统一**：SigLIP、ViT-G、CLIP-ViT-L——哪个对 RS 最优尚无定论
- **数据瓶颈**：RSUniVLM 用 1.2M 指令数据、VHM 用 1.4M，SkyMoE 仅 251K——数据量差 5×
- **MoE 训练技巧趋同**：Stage I LoRA 适配 RS → Stage II 仅训练 MoE 层

## Open Issues

- **多轮对话**：三篇论文均不支持——RS VLM 的多轮交互能力待开发
- **幻觉**：VHM (非 MoE) 首次关注 RS VLM 的 honesty 问题，MoE 是否因专家解耦而降低幻觉？
- **开源**：3 篇仅 1 篇开源——RS VLM 领域比 FM 领域更封闭

## Related Approaches

- [[vlm-based]] — 非 MoE 的 RS VLM (VHM 等通用架构)
- [[../representation-learning/multi-modal-fm]] — 多模态 FM 的视觉编码器可迁移到 VLM
