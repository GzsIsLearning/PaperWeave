---
title: Vision-Language Models (General)
created: 2026-04-29
updated: 2026-05-02
type: lineage
domain: multimodal
task: vision-language
approach: vlm-based
tags: [multimodal, vlm, vision-language, llm]
sources:
  - L0_raw/visual-instruction-tuning
  - L0_raw/improved-baselines-with-visual-instruction-tuning
  - L0_raw/deepseek-vl-towards-real-world-vision-language-understanding
  - L0_raw/qwen-vl-a-versatile-vision-language-model-for-understanding-localization-text-re
  - L0_raw/minigpt-v2-large-language-model-as-a-unified-interface-for-vision-language-multi
  - L0_raw/kimi-vl-technical-report
  - L0_raw/vlmo-unified-vision-language-pre-training-with-mixture-of-modality-experts
  - L0_raw/blip-2-bootstrapping-language-image-pre-training-with-frozen-image-encoders-and-
  - L0_raw/eagle-exploring-the-design-space-for-multimodal-llms-with-mixture-of-encoders
  - L0_raw/from-pixels-to-words----towards-native-vision-language-primitives-at-scale
  - L0_raw/learning-transferable-visual-models-from-natural-language-supervision
  - L0_raw/patching-open-vocabulary-models-by-interpolating-weights
  - L0_raw/qwen-vl-a-versatile-vision-language-model-for-understanding-localization-text-re
  - L0_raw/emu3-next-token-prediction
zotero_keys: []
confidence: high
---

# Vision-Language Models (General)

## Overview

VLM 将视觉编码器与 LLM 连接，使模型能"看懂"图像并回答相关问题。本页面覆盖从 CLIP 基础对比学习到 Q-Former 桥接、MoE 多编码器、原生 VLM 等 12 篇核心工作，形成视觉-语言模型从预训练到指令微调的完整技术谱系。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| CLIP (Radford) | 2021 | 5 | 对比语言-图像预训练 | GPU集群 | 400M图文对(WIT) | true | github.com/openai/CLIP | 自然语言监督实现零样本迁移，ViT编码器成为VLM标配backbone |
| VLMo (Bao) | 2022 | 4 | MoE 统一视觉-语言预训练 | 64×V100 | 1B数据 | — | — | MoME-FFN按模态切换专家，共享self-attention，推理可切换dual/fusion模式 |
| BLIP-2 (Li) | 2023 | 5 | Q-Former 信息瓶颈桥接冻结视觉+LLM | 中等(冻结骨干) | — | true | github.com/salesforce/LAVIS | 可学习query token选择性提取视觉信息，两阶段(表示→生成)训练，54×更少参数超越Flamingo80B |
| LLaVA (Liu) | 2023 | 5 | Visual instruction tuning 范式 | 8×A100 | LLaVA-Instruct (GPT-4生成158K) | true | github.com/haotian-liu/LLaVA | GPT-4生成多模态指令数据，两阶段训练：特征对齐→端到端微调 |
| LLaVA 1.5 (Liu) | 2024 | 4 | 系统化设计选择研究 | 8×A100 | 1.2M公开数据 | true | — | 简单MLP投影+response formatting提示大幅提升，1天训练达11基准SOTA |
| DeepSeek-VL (Lu) | 2024 | 4 | 真实世界VLM，混合视觉编码器 | — | 多源(截图/PDF/OCR) | true | — | SigLIP-L(语义)+SAM-B(高分辨率)混合编码器，三阶段训练保语言能力 |
| EAGLE (Shi) | 2024 | 4 | 多视觉编码器MoE设计空间探索 | — | — | true | — | 系统化探索编码器组合与融合策略，预对齐+高分辨率适配 |
| Qwen-VL (Bai) | 2023 | 4 | Versatile VLM: 定位+理解+OCR | — | 1.4B图文对 | true | — | 位置感知VL adapter(交叉注意力压缩至256 token)，bounding box文本化统一输入输出 |
| MiniGPT-v2 (Chen) | 2023 | 4 | 统一多任务VLM接口 | — | — | true | — | 任务特定标识符统一VQA/grounding等多任务，LLaMA-2骨干 |
| Kimi-VL | 2025 | 4 | MoE高效VLM，2.8B激活参数 | 4.4T tokens | — | true | — | MoonViT原生分辨率编码消除子图切分，128K长上下文，thinking变体强推理 |
| From Pixels to Words (Diao) | 2025 | 4 | 原生VLM: 统一decoder-only架构 | — | 390M图文对 | true | github.com/EvolvingLMMs-Lab/NEO | Native-RoPE解耦高/宽/时间维度，取消模态分离，NEO-2.2B/9B竞争模块化VLM |
|| PAINT (Ilharco) | 2022 | 4 | 权重插值修补开放词汇模型 | — | — | true | — | 微调后零样本权重线性插值，保持泛化同时提升特定任务15-60pp |
|| Emu3 (Wang) / Nature | 2024/2026 | 5 | 纯NTP统一多模态（图像/文本/视频/动作） | 大规模(从头训练) | 混合语言+图像+视频数据 | true | emu.baai.ac.cn | 单一decoder-only Transformer，tokenize所有模态为离散token做NTP，全面超越SDXL/LLaVA-1.6/OpenSora-1.2，消除扩散和组合式架构 |

## Key Design Choices

- **视觉编码器**: CLIP ViT (LLaVA, BLIP-2), SigLIP + SAM-B (DeepSeek-VL), OpenCLIP ViT-bigG (Qwen-VL), MoonViT (Kimi-VL), 多编码器混合 (EAGLE), Emu3: 无独立视觉编码器 — 统一离散tokenizer + Decoder-only NTP
- **连接器**: 线性投影 (LLaVA), MLP (LLaVA-1.5), Q-Former (BLIP-2), 交叉注意力压缩器 (Qwen-VL), 原生统一架构 (NEO, Emu3)
- **训练策略**: 预训练对齐 → 指令微调 (LLaVA); 三阶段: VL表示→LLM连接→SFT (BLIP-2); 阶段预训练: 单模态→多模态 (VLMo); 从头NTP多模态联合训练 (Emu3)
- **效率设计**: MoE (VLMo, Kimi-VL), 冻结骨干 (BLIP-2), 权重插值修补 (PAINT)

## Synthesis

VLM发展呈现四条主线:(1) **连接范式**: CLIP奠定视觉编码器基础→BLIP-2用Q-Former桥接冻结模型→LLaVA/LLaVA-1.5简化连接并系统优化;(2) **MoE路线**: VLMo开创模态特化专家→EAGLE探索多编码器组合→Kimi-VL实现MoE高效推理(2.8B≈7B);(3) **原生统一(NTP)**: Emu3开创纯NTP decoder-only路线，tokenize图像/文本/视频/动作为离散token统一训练，全面超越扩散和组合式架构→NEO跟进并优化Native-RoPE解耦时空维度;(4) **轻量修补**: PAINT权重插值思路。关键趋势:从模块化拼接走向原生统一(NTP)，从密集模型走向稀疏MoE，从单一文本/图像走向全模态(视频+动作)统一。
