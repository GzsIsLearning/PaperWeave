---
slug: "visual-instruction-tuning"
title: "Visual Instruction Tuning"
authors:
  - "Haotian Liu"
  - "Chunyuan Li"
  - "Qingyang Wu"
  - "Yong Jae Lee"
score: 5
contribution: 5
soundness: 5
relevance: 5
---

> **Abstract:** 首次多模态指令微调。LLaVA: CLIP ViT-L/14 + Vicuna LLM。GPT-4生成158K多模态指令数据(对话+详细描述+复杂推理)。Science QA SOTA 92.53%。

## [2026-05-02] Wiki rebuild review

**Score:** 5/5
- Contribution: 5/5 — 开创性多模态指令微调范式，影响深远
- Soundness: 5/5 — 两阶段训练，充分评估
- Relevance: 5/5 — 多模态/VLM核心工作

**Key Insights:**
- 纯文本GPT-4利用captions+boxes生成多模态指令数据
- 两阶段训练：特征对齐→端到端微调
- 简单线性投影连接视觉和语言
- LLaVA-Bench评估基准

**Citation Mining:**
- CLIP [Radford et al., 2021] — vision encoder
- Vicuna [Chiang et al., 2023] — LLM backbone (fine-tuned LLaMA)
- GPT-4 [OpenAI, 2023] — used for generating training data
- BLIP-2 [Li et al., 2023] — concurrent VLM with Q-Former

**L1 Ecology Observations:**
- LLaVA established the de facto architecture for modern VLMs: CLIP encoder + projection + LLM
- GPT-4 generated 158K instruction data pioneered the "model-generated training data" paradigm
- Two-stage training (feature alignment → end-to-end fine-tuning) is now standard for all VLM training
- Simple linear projection works surprisingly well — complex cross-attention (Q-Former) not always necessary
- LLaVA's success led to RS-specific VLMs like GeoChat, RSGPT, and LHRS-Bot
- Instruction tuning for vision-language tasks became the dominant fine-tuning paradigm post-LLaVA
