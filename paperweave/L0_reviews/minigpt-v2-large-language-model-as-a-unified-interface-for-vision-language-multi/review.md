---
slug: "minigpt-v2-large-language-model-as-a-unified-interface-for-vision-language-multi"
title: "MiniGPT-v2: Large Language Model As a Unified Interface for Vision-Language Multi-task Learning"
authors:
  - "Jun Chen"
  - "Deyao Zhu"
  - "Xiaoqian Shen"
  - "Xiang Li"
  - "Zechun Liu"
  - "Pengchuan Zhang"
  - "Raghuraman Krishnamoorthi"
  - "Vikas Chandra"
  - "Yunyang Xiong"
  - "Mohamed Elhoseiny"
score: 4
contribution: 4
soundness: 4
relevance: 4
---

> **Abstract:** MiniGPT-v2: unified model for vision-language tasks via task-specific identifiers. Three-stage training. Strong VQA and visual grounding results. LLM as unified interface for vision-language multi-task learning.

## [2026-05-02] Wiki rebuild review

**Score:** 4/5
- Contribution: 4/5 — clever use of task identifiers to unify diverse vision-language tasks in one model
- Soundness: 4/5 — three-stage training, strong benchmarks across VQA and grounding
- Relevance: 4/5 — influential in vision-language generalist model design

**Key Insights:**
- Task-specific unique identifiers help the model distinguish between different vision-language tasks
- Three-stage training: pretraining, multi-task training, multi-modal instruction tuning
- Strong performance on both visual question answering and visual grounding benchmarks
- Demonstrates LLM can serve as unified interface for vision-language tasks

**Citation Mining:**
- MiniGPT-4 [Zhu et al., 2023] — predecessor
- LLaVA [Liu et al., 2023] — concurrent VLM work
- LLaMA-2 [Touvron et al., 2023] — language backbone
- BLIP-2 [Li et al., 2023] — Q-Former approach

**L1 Ecology Observations:**
- Task-specific identifiers provide a simple way to handle multi-task RS VLM scenarios
- Three-stage training (pretrain→multi-task→instruction tuning) is a standard RS VLM recipe
- Unified model for diverse tasks is valuable for RS where multiple analysis tasks exist
