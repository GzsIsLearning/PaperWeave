---
slug: "improved-baselines-with-visual-instruction-tuning"
title: "Improved Baselines with Visual Instruction Tuning"
authors:
  - "Haotian Liu"
  - "Chunyuan Li"
  - "Yuheng Li"
  - "Yong Jae Lee"
venue: "CVPR 2024 (Highlight)"
---

## [2026-05-02] Review

### Summary
This paper (LLaVA-1.5) presents a systematic study of design choices for large multimodal models (LMMs) under the LLaVA framework. The authors show that a simple MLP projection layer (replacing the linear projection) combined with CLIP-ViT-L-336px, and adding academic-task-oriented VQA data with response formatting prompts, establishes strong baselines that achieve state-of-the-art across 11 benchmarks. The 13B model uses only 1.2M publicly available data and trains in ~1 day on a single 8-A100 node.

### Significance
LLaVA-1.5 became one of the most widely adopted open-source vision-language models, demonstrating that simple architectural choices (MLP connector, careful data mixture) can outperform more complex designs. It established a strong baseline for the field and democratized multimodal research.

### Strengths
- Systematic ablation of design choices: MLP vs linear projection, data mixture, resolution
- Surprising finding: simple MLP projection is highly data-efficient
- Response formatting prompts significantly improve benchmark performance
- Strong results on 11 benchmarks with minimal data (1.2M examples)
- Open-source release enabling widespread adoption

### Weaknesses
- Limited to single-image understanding (no multi-image support)
- Training takes long for high-resolution inputs
- Still prone to hallucinations in critical applications
- Does not deeply explore scaling beyond 13B

### Rating
Strong: 4.5/5 — Excellent empirical study that established critical baselines for vision-language models.

### Key Takeaways
- MLP projection outperforms linear for vision-language connection
- Task-specific response formatting prompts are an easy win
- Academic VQA data significantly boosts performance
- Data quality and mixture matter more than model complexity
