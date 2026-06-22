---
slug: "graph-convolutional-network-for-image-restoration-a-survey"
title: "Graph Convolutional Network for Image Restoration: A Survey"
authors:
  - "Tongtong Cheng"
  - "Tingting Bi"
  - "Wen Ji"
  - "Chunwei Tian"
score: 3
contribution: 3
soundness: 3
relevance: 3
---

> **Abstract:** Survey of GCN-based image restoration methods covering denoising, super-resolution, and deblurring. Categorizes spectral vs. spatial GCN approaches and compares quantitative performance.

## [2026-05-02] Review

**Score:** 3/5
- Contribution: 3/5 — First survey specifically on GCNs for image restoration; fills a gap but coverage is somewhat surface-level
- Soundness: 3/5 — Good quantitative comparisons (PSNR tables on Set12/BSD68/Urban100), but paper has noticeable text duplication/formatting issues
- Relevance: 3/5 — Relevant for image restoration researchers exploring GCN methods; limited depth on remote sensing specifics

**Key Insights:**
- Covers spectral GCN (SCNN, ChebNet, GCN) and spatial GCN (GraphSAGE, GAT) foundations
- Best denoising: GAiA-Net (PSNR 33.54/31.20/28.18 on Set12 at σ=15/25/50)
- Best SR: SwinIR > HAN > RGCN on most benchmarks; GCN methods competitive but not dominant
- Also covers mesh denoising, point cloud upsampling, and LLM+GCN combinations
- Challenges: over-smoothing in deep GCNs, computational cost of graph construction

**Notes:** Mathematics 2024 (MDPI). Northwestern Polytechnical University. 140 references. Some text quality issues suggest rushed production; survey breadth over depth.

## [2026-05-30] SciJudge Re-Read
**Score:** 3/5
- Contribution: 3/5 — First survey specifically on GCNs for image restoration; adequate breadth (denoising, SR, deblurring, even LLM+GCN) but limited depth. The paper's main value is consolidating scattered GCN restoration works into one reference.
- Soundness: 2/5 — Notable text duplication issues (entire paragraphs repeated word-for-word in Section 2), formatting inconsistencies, and references to LLMs without substantive coverage. PSNR tables are useful but the survey lacks critical analysis of why GCN methods underperform SwinIR in most SR tasks.
- Relevance: 2/5 — Limited relevance to RS foundation model research. GCN-based image restoration is a niche subfield tangential to the main RS FM/VLM research program.

**Key Insights:**
1. GCNs for image restoration are primarily applied to denoising, SR, and deblurring — areas where CNNs (DnCNN, SwinIR) still dominate.
2. Best GCN denoising method (GAiA-Net) achieves 33.54 PSNR on Set12 at σ=15, but SwinIR (CNN+Transformer) outperforms all GCN methods on most SR benchmarks.
3. The paper has severe production quality issues: duplicated paragraphs (Section 2.2 header text appears twice, Section 1 has garbled sentence merging), suggesting rushed or AI-assisted composition with insufficient review.
4. MDPI Mathematics journal — impact factor moderate (~2.4), not top-tier.
5. GCN's main advantage for restoration is capturing long-range dependencies via graph structure, but transformer-based methods already achieve this more effectively on grid-structured image data.
6. Section 5 (Challenges/Future) is generic and could apply to any GCN paper.

**Compared to L2 Lineage:**
- Not directly comparable to RS FM papers in the corpus. If anything, it contrasts with transformer/MAE-based RS FMs (SatMAE, RingMo, Prithvi) that dominate RS feature learning.
- The LLM+GCN section is a thin (<1 page) token effort, not substantive enough to inform RS VLM research.

**Notes:**
- Mathematics 2024 (MDPI), Northwestern Polytechnical University.
- 140 references, but coverage is breadth-over-depth.
- No remote sensing benchmarks used despite mentioning "remote sensing" in intro.
- Published 28 June 2024.
- Text quality issues suggest paper was accelerated through production.

**Citation Mining (3-8 papers):**
- DnCNN (Zhang et al., 2017) — IEEE TIP — Key CNN baseline for image denoising cited extensively.
- SwinIR (Liang et al., 2021) — ICCV — Current SOTA that outperforms GCN methods; the survey's implicit admission that CNNs+Transformers beat GCNs for restoration.
- GraphSAGE (Hamilton et al., 2017) — NeurIPS — Core spatial GCN architecture used by several methods covered.
- Spectral GCN (Kipf & Welling, 2017) — ICLR — Foundational GCN paper cited as architectural basis.
- GAiA-Net — Best GCN denoising method mentioned; could be useful for RS image preprocessing.

**原始 review 验证:**
- Original score of 3/5 is appropriate. The survey fills a gap but execution is mediocre.
- Original review flagged "surface-level coverage" — confirmed upon re-reading; the LLM+GCN section is particularly thin.
- Text duplication issue was noted but understated — in Section 2, nearly every subsection header appears twice (e.g., "2.2. The Fundamentals of GCNs2. The Fundamentals of GCNs"), strongly suggesting a corrupted LaTeX compilation or AI draft without cleanup.
- The survey's relevance to RS is minimal despite "remote sensing" in the introduction — no RS-specific benchmarks are used.

**Cross-Review Diff (vs previous reviews):**
1. Original review rated soundness 3/5 — I would rate it 2/5 given the extensive text duplication and formatting issues.
2. Original review did not detect the severe copy-paste corruption in Section 2 (duplicated section headers, merged sentences).
3. Original review's assessment of "survey breadth over depth" is confirmed and exacerbated by the thin LLM+GCN coverage.
4. The survey's main value proposition (first GCN-for-restoration survey) is accurate but execution significantly undermines its utility.
5. The original missed noting that no RS-specific benchmarks were used — a notable omission given RS is advertised in the intro.
