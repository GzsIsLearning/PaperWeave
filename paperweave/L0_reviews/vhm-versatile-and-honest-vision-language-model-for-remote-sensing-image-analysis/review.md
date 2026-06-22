---
slug: "vhm-versatile-and-honest-vision-language-model-for-remote-sensing-image-analysis"
title: "VHM: Versatile and Honest Vision Language Model for Remote Sensing Image Analysis"
authors:
  - "Chao Pang"
  - "Xingxing Weng"
  - "Jiang Wu"
  - "Jiayu Li"
  - "Yi Liu"
  - "Jiaxing Sun"
  - "Weijia Li"
  - "Shuai Wang"
  - "Litong Feng"
  - "Gui-Song Xia"
  - "Conghui He"
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: true
code_url: "https://github.com/opendatalab/VHM"
compute: "16x NVIDIA A100-80G (pre-train), 8x A100-80G (SFT)"
dataset_access: true
---

> **Abstract:** Versatile and Honest VLM for RS. VersaD dataset (1.4M images with rich-content captions from Gemini-Vision). HnstD dataset (45K factual+deceptive QA pairs for honesty). Multi-level visual features (layers 8/16/24). SOTA on scene classification, VQA, visual grounding. Supports 12+ tasks.

## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — VersaD (rich-content caption dataset) and HnstD (honesty dataset) are novel contributions; honest QA task is new; multi-level feature fusion
- Soundness: 4/5 — Manual quality assessment of VersaD (82.3% accuracy); thorough comparison on multiple tasks
- Relevance: 4/5 — Important for RS VLM honesty/versatility

**Key Insights:**
1. VersaD: 1.4M RS images with Gemini-Vision-generated captions emphasizing metadata, object attributes, scene context. Accuracy 82.3% (comparable to CC3M's 79%).
2. HnstD: 45K QA pairs with factual + deceptive questions about presence, color, absolute/relative position — teaches VLMs to say "I don't know" rather than hallucinate.
3. Multi-level visual features from CLIP-L/14: concatenating tokens from layers 8, 16, 24 improves visual grounding (56.17% vs 44.58% CogVLM on DIOR-RSVG) with only 336x336 input.
4. Two-stage training: Stage I pre-train on VersaD (1 epoch, batch 256); Stage II SFT on VersaD-Instruct + VariousRS-Instruct + HnstD.
5. Supports 12+ tasks: VQA, VG, IC, SC, OC, Image Modality, Image Resolution, Object Recognition, Geometric Measurement, Building Vectorizing, Multi-label Classification, Honest QA.
6. SOTA on scene classification (94.54% NWPU, 91.70% AID, 95.80% WHU-RS19), VQA (89.33% RSVQA-LR avg), VG (56.17% DIOR-RSVG).
7. Honesty: VHM significantly outperforms on deceptive questions for color/position tasks (e.g., 90%+ on deceptive color questions vs <20% for competitors).

**Notes:**
- AAAI 2025, Wuhan University + Shanghai AI Lab + SenseTime.
- CLIP-L/14 vision encoder (336x336) + Vicuna-v1.5-7B LLM.
- VersaD sources: Million-AID, CrowdAI, fMoW, CVUSA, CVACT, LoveDA.
- VariousRS-Instruct: covers VQA, VG, SC, OC, Image Modality, Image Resolution, Geometric Measurement, Building Vectorizing, Multi-label Classification.
- Limitations: Object counting and geometric measurement MAE still high (6.75, 12.82).
- Code and data open-source on GitHub.

## [2026-05-30] SciJudge Re-Read
**Score:** 4/5
- Contribution: 4/5 — VersaD (rich-content caption dataset at 1.4M scale) and HnstD (45K honest QA pairs with deceptive questions) are genuinely novel contributions; the multi-level visual feature fusion from CLIP-L/14 layers 8/16/24 is a practical architectural insight that improves grounding by 9%.
- Soundness: 4/5 — Thorough manual quality assessment of VersaD (82.3% accuracy across 315 samples / 2002 sentences); comprehensive benchmarks across 5 scene classification, 2 VQA, and 1 VG datasets; honest QA task well-designed with factual/deceptive splits.
- Relevance: 5/5 — Directly relevant to RS foundation model / VLM research. VersaD's rich-content caption approach addresses the domain gap between natural and RS pretraining. HnstD tackles hallucination — a critical issue for RS applications like defense and disaster monitoring.

**Key Insights:**
1. Rich-content captions (VersaD) improve VLM performance even with lower accuracy (82.3%) than sparse but accurate datasets like SkyScript (96.1%) — content density > accuracy for RS VLMs.
2. HnstD's deceptive questions expose that most VLMs (LLaVA, CogVLM, Qwen-VL) hallucinate answers to queries about non-existent objects — VHM achieves 90%+ on deceptive color/position tasks vs <20% for competitors.
3. Multi-level visual features: concatenating intermediate CLIP layers 8, 16, 24 dramatically improves VG (56.17% on DIOR-RSVG, +9.21% over single-level) despite only 336×336 input.
4. RS VLMs pretrained on domain-specific data dramatically outperform general VLMs (e.g., 94.54% vs 34.96% on NWPU scene classification).
5. Key limitation: no pixel-wise perception — VHM cannot do semantic segmentation or change detection, which are essential for RS.
6. Building vectorizing at 71.25% complexity-aware IoU shows VLM potential for vector map generation, but geometric measurement (MAE 12.82) and object counting (MAE 6.75) remain weak.

**Compared to L2 Lineage:**
- Fits within the LHRS-Bot / RSGPT lineage of RS-specific VLMs, but extends beyond with honesty and multi-level features.
- Less comprehensive than SkySenseGPT (1.8M instruction pairs) but more focused on dataset quality.
- Complements GeoChat's grounding-focused approach with honesty mechanisms.

**Notes:**
- AAAI 2025, Wuhan University + Shanghai AI Lab + SenseTime.
- Compute: 16× A100-80G (pretrain), 8× A100-80G (SFT), which is modest by 2025 standards.
- Code and data open-source at github.com/opendatalab/VHM.
- Closely related to works in EoE/corpus: LHRS-Bot, RSGPT, EarthGPT, SkyEyeGPT.
- VersaD sources (Million-AID, CrowdAI, fMoW, CVUSA/ACT, LoveDA) overlap significantly with existing RS VLMs.

**Citation Mining (3-8 papers):**
- LHRS-Bot (Muhtar et al., 2024) — ECCV — Direct competitor, first to use VGI-enhanced RS instruction data.
- SkyScript (Wang et al., 2024) — AAAI — Key contrast for VersaD; shows rich-content > high-accuracy for pretraining.
- Evaluating Object Hallucination in Large Vision-Language Models (Li et al., 2023) — Foundation for HnstD's deceptive question generation methodology.
- GeoChat (Kuckreja et al., 2024) — CVPR — Grounded RS VLM, key baseline for VG comparison.
- LLaVA-1.5 (Liu et al., 2023) — Architectural backbone for VHM's two-stage training.
- CogVLM (Wang et al., 2023) — Visual expert model, key VG baseline where VHM shows 11.59% improvement.

**原始 review 验证:**
- Original score of 4/5 holds well. The contributions are clear and well-evaluated.
- The "limitation of no pixel-wise perception" is correctly identified and remains the key gap.
- VersaD's value over SkyScript deserves more emphasis — the ablation study showing rich-content captions beating high-accuracy sparse captions by 43% on VG is the paper's strongest finding.

**Cross-Review Diff (vs previous reviews):**
1. Original review missed the significance of VersaD's caption density over accuracy trade-off — this is a key design insight for RS dataset creation.
2. Original review correctly identified the compute requirements (16/8 A100) but didn't note this is modest for 2025 standards.
3. Honesty evaluation section was under-emphasized — VHM's 90%+ on deceptive questions vs <20% competitors is a breakthrough for RS VLM reliability.
4. Building vectorizing capability (71.25% IoU) was not discussed in original review — this is a novel RS application of VLMs.
5. The paper's positioning among concurrent works (LHRS-Bot, EarthDial, SkySenseGPT) was not analyzed in the original.
