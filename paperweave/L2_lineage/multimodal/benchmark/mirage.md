---
title: "MIRAGE — VLM Evaluation Mirage Effect Benchmark"
created: 2026-05-06
updated: 2026-05-06
type: strand
tags: [multimodal, vlm, benchmark, evaluation]
confidence: high
sources:
  - L0_raw/mirage-the-illusion-of-visual-understanding
---

# MIRAGE: VLM Visual Understanding Evaluation

> **Question:** Are current VLM benchmarks actually measuring visual understanding, or are they measuring models' ability to exploit textual shortcuts and hidden patterns while ignoring images entirely?

## Overview

MIRAGE introduces the "mirage effect" — a systematic failure mode in VLMs where models generate detailed visual descriptions, confident reasoning traces, and competitive benchmark scores *without any image input*. This challenges the foundational assumption that high benchmark accuracy implies genuine visual understanding.

**Key findings:**
1. Average mirage rate >60% across all tested frontier models (GPT-5, Gemini-3-Pro, Claude Opus 4.5)
2. Models retain 70-80% of their image-enabled accuracy without any images (Mirage Score)
3. Medical benchmarks are most susceptible (60-99% mirage scores)
4. A 3B text-only model (super-guesser) trained on question-answer pairs alone beats all frontier VLMs and human radiologists on a chest X-ray benchmark

## Comparison Table

| Paper | Year | Score | Core Finding | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| MIRAGE | 2026 | **5** | VLMs achieve >60% benchmark accuracy without images; B-Clean removes 75-77% questions; super-guesser beats radiologists | API eval (Azure/GCP) + 1×DGX Spark | Phantom-0 (200q, 20 cat) + 6 benchmarks | ✅ | [github.com/masadi-99/MIRAGE](https://github.com/masadi-99/MIRAGE) | Mirage ≠ hallucination: VLMs construct false epistemic frames indistinguishable from genuine visual reasoning |

## Design Taxonomy

### 1. Benchmark Failure Modes Identified

| Failure Mode | Description | Detection |
|-------------|-------------|-----------|
| Over-text priors | Questions answerable from text statistics alone | Identified in VQA-CP (Agrawal 2018) |
| Language shortcuts | Specific keywords leak answers | Manual detection |
| Weak distractors | Wrong options clearly implausible | LLM-judge analysis |
| Hidden patterns | Latent cues not manually detectable | Mirage-mode evaluation |
| Data contamination | Benchmark leakage into pretraining | Super-guesser experiment |
| Structural priors | Models learn benchmark-level patterns | Benchmark-name experiment |

### 2. Evaluation Methodologies

| Method | What it measures | Limitation |
|--------|-----------------|------------|
| Original benchmark | Raw accuracy with images | Cannot distinguish visual vs text-based reasoning |
| Guess-mode | Accuracy when told "image missing, take best guess" | Underestimates vulnerability — mirage-mode is HIGHER |
| Mirage-mode | Accuracy when image silently omitted | Reveals true non-visual inference capability |
| B-Clean | Union-removing all questions any model answers correctly without images | Enables fair visual-grounded comparison |

## Evolution Timeline

```
2017 — "Making the V in VQA Matter" (Goyal, CVPR)
       ├── First identification of VQA text bias
       └── Introduced VQA-CP concept (train/test distribution shift)

2018 — "Don't Just Assume; Look and Answer" (Agrawal, CVPR)
       └── VQA-CP v2: Changing priors dataset

2018 — "Shifting the Baseline" (Thomason)
       └── Text-only models achieve competitive scores on visual tasks

┄┄┄┄ gap in systematic evaluation methodology ┄┄┄┄

2024 — "Are We on the Right Way for Evaluating LVLMs?" (Chen, NeurIPS)
       └── Systematic analysis of VLM evaluation failure modes

2025 — "Vision Language Models Are Blind" (Rahmanzadehgervi)
       └── VLMs fail at basic visual perception (counting, overlap, intersection)

2026 — **"MIRAGE" (Asadi et al.)** ★
       ├── Defines and quantifies mirage effect (distinct from hallucination)
       ├── Mirage-mode > Guess-mode (reveals hidden patterns)
       ├── Phantom-0 benchmark
       ├── B-Clean framework (removes 75-77% questions)
       └── Super-guesser: 3B text-only beats all VLMs + radiologists
```

## Cross-Paper Synthesis

- **The field systematically underestimated benchmark vulnerability.** From 2017 (VQA-CP) to 2025, work focused on *manual* identification of text-based shortcuts — but MIRAGE shows that *hidden* patterns enable far more non-visual inference than previously thought.
- **Guess-mode is not a valid control.** Prior approaches used "guess without images" as a baseline, but MIRAGE shows mirage-mode consistently outperforms guess-mode — indicating VLMs access latent patterns that guess-mode's conservative strategy misses.
- **Medical benchmarks are disproportionately affected.** Across all 4 models, medical benchmarks show 60-99% mirage scores — reflecting the statistics-dominated nature of medical QA and the difficulty of creating truly image-necessary medical questions.

## Current SOTA

| Benchmark | Original Acc (Gemini-3-Pro) | B-Clean Acc (Gemini-3-Pro) | Questions Retained |
|-----------|---------------------------|---------------------------|-------------------|
| MMMU-Pro | 81.0% | 72.8% | 24.7% |
| MedXpertQA-MM | 77.8% | 52.3% | 25.7% |
| MicroVQA | 68.8% | 23.2% | 23.0% |

**Note:** Model rankings changed on 2/3 benchmarks after B-Clean cleaning.

## Open Issues

1. **Private benchmarks are the only durable solution.** B-Clean is model-set-dependent; public benchmarks will always be absorbed into pretraining data.
2. **Counterfactual verification at inference time** (MARCUS approach) can reduce mirage rate to zero — but requires architectural changes.
3. **Domain-specific mirage susceptibility varies.** General visual benchmarks (MMMU-Pro, Video-MME) show lower mirage scores than medical benchmarks — how does RS VLM evaluation compare?
4. **Detection vs Prevention.** Can we train VLMs that *refuse* to answer without images? Or is the mirage effect an inevitable consequence of web-scale joint image-text training?

## RS VLM Application Notes

- RS VQA benchmarks (RSVQA, BEN, GeoChat-Bench) will have different mirage profiles depending on question type:
  - "What crop type?" + NDVI/phenology text → high mirage score (textual context leaks)
  - "Count buildings in this 0.5m resolution image" → lower mirage score (genuinely visual)
- B-Clean methodology can be applied directly:
  1. Evaluate RS VLM in mirage-mode (remove images from RSVQA questions)
  2. Compute Mirage Score per question type
  3. Remove compromised questions via union-of-models
  4. Compare models on B-Clean RS benchmark

## Related Approaches

- [[vision-language/vlm-based|VLM Evolution]] — parent domain
- [[../../remote-sensing/benchmark/pangaea|PANGAEA RS FM Benchmark]]
- [[../../../L3_module/open-source-reproducibility|Open Source & Reproducibility]]
- [[../../../L3_module/geo-foundation-models|Geo Foundation Models Design]]
