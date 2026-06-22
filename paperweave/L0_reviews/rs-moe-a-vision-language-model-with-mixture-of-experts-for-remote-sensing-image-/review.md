---
slug: "rs-moe-a-vision-language-model-with-mixture-of-experts-for-remote-sensing-image-"
title: "RS-MoE: A Vision-Language Model with Mixture of Experts for Remote Sensing Image Captioning and Visual Question Answering"
authors:
  - "Hui Lin"
  - "Danfeng Hong"
  - "Shuhang Ge"
  - "Chuyao Luo"
  - "Kai Jiang"
  - "Hao Jin"
  - "Congcong Wen"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "Not explicitly stated but implied"
compute: "3x NVIDIA A100 80GB"
dataset_access: true
---

> **Abstract:** First MoE-based VLM for remote sensing. Uses Instruction Router to decompose captioning into theme/object/relationship subtasks. ViT-G/14 vision encoder + Vicuna-7B LLM backbone. Two-stage training with LoRA. RS-MoE-1B matches 13B VLM performance. SOTA on 5 RSIC datasets and 2 RSVQA datasets.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — First MoE-VLM for RS domain; novel Instruction Router design; lightweight LLMs as experts instead of FFN
- Soundness: 4/5 — Thorough ablation studies on router, #experts, LLM types, training strategy; extensive benchmarks
- Relevance: 4/5 — Relevant to RS VLM, captioning, and efficient model design

**Key Insights:**
1. First work applying MoE framework to VLMs in remote sensing domain.
2. Instruction Router dynamically generates subtask-specific prompts (theme, objects, relationships) for each expert LLM.
3. Lightweight LLMs (Llama-3.2-1B/3B, Vicuna-7B) serve as experts instead of traditional FFN experts, enabling efficient task decomposition.
4. Two-stage training strategy: Stage I trains VLM Encoder + LLM Block; Stage II freezes those and trains MoE Block with weight initialization from Stage I.
5. RS-MoE-7B achieves SOTA on RSICap (CIDEr 158.36 vs RSGPT-13B 149.32) and competitive zero-shot on UCM, Sydney, RSICD.
6. RS-MoE-1B variant matches 13B VLM performance, demonstrating efficiency.
7. Strong generalization to RSVQA: 89.12% overall accuracy on RSIVQA, +12.82% on Number category vs previous best.
8. Ablations confirm: Instruction Router is critical (CIDEr +55.85), 3 experts is optimal, two-stage training vastly outperforms one-stage (CIDEr 158.36 vs 98.21).

**Notes:**
- IEEE TGRS 2025, authors from CAS, NYU Abu Dhabi, HIT Shenzhen.
- Trained on RSICap dataset (2,585 images from DOTA, human-annotated).
- ViT-G/14 (frozen, ~2B params) as image encoder based on InstructBLIP architecture.
- LoRA applied to query/value projections in self-attention, all projections in cross-attention, and FFN layers.
- Data: UCM-Captions (2,100), Sydney-Captions (613), RSICD (10,921), VRSBench (29,614) for evaluation.
- Limitations: Predefined subtasks limit adaptability; two-stage training adds overhead.
- RSA-RSICD baseline results only surpasses RSGPT on METEOR; RS-CapRet comparable on some metrics.
- Citation mining: References RSGPT [20], GeoChat [21], H2RSVLM [22], EarthGPT [23], SpectralGPT [24], MoE-LLaVA [36], LIMoE [35], V-MoE [34] as key related works.
