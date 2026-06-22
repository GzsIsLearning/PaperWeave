---
slug: "m3vit-mixture-of-experts-vision-transformer-for-efficient-multi-task-learning-wi"
title: "M3ViT: Mixture-of-Experts Vision Transformer for Efficient Multi-task Learning with Model-Accelerator Co-design"
authors:
  - "Hanxue Liang"
  - "Zhiwen Fan"
  - "Rishov Sarkar"
  - "Ziyu Jiang"
  - "Tianlong Chen"
  - "Kai Zou"
  - "Yu Cheng"
  - "Cong Hao"
  - "Zhangyang Wang"
score: 3
contribution: 3
soundness: 3
relevance: 2
open_source: true
code_url: "https://github.com/VITA-Group/M3ViT"
compute: "FPGA (Xilinx ZCU104), single GPU training feasible"
dataset_access: true
---

> **Abstract:** MoE-based ViT for efficient multi-task learning with model-accelerator co-design. Task-dependent gating for expert selection resolves training conflicts. Sparse activation for single-task inference (88% FLOPs reduction). FPGA implementation with 2.40x memory reduction, 9.23x energy efficiency.

## [2026-05-02] Comprehensive Review

**Score:** 3/5
- Contribution: 3/5 — Novel task-dependent gating for MTL with MoE; hardware-software co-design for FPGA
- Soundness: 3/5 — Evaluated on PASCAL-Context, NYUD-v2 only; limited task diversity
- Relevance: 2/5 — General MTL framework, not RS-specific but MoE-for-ViT approach is relevant

**Key Insights:**
1. Task-dependent gating network selects experts based on current task, resolving cross-task gradient conflicts.
2. Sparse expert activation for single-task inference (only task-corresponding experts activated).
3. FPGA co-design: expert-by-expert computation reordering, double-buffered memory access, zero-overhead task switching.
4. 88% FLOPs reduction for single-task inference vs full model.
5. ViT-small backbone evaluated on 2-task (NYUD-v2) and multi-task (PASCAL-Context) settings.

**Notes:**
- UT Austin + Georgia Tech + Microsoft Research, DAC 2022.
- Not RS-specific but relevant for efficient on-device MTL with MoE.
- Code open-source.

## [2026-05-02] Re-review — Deep Analysis

**Score confirmed: 3/5** | Contribution: 3, Soundness: 3, Relevance: 2

**Critical findings not in previous review:**

1. **DAC 2022 (Design Automation Conference), not ML/AI.** Published at DAC — hardware design venue, not a mainstream ML conference. The paper's MTL novelty is modest, with the hardware co-design being the real contribution.
2. **Two gating designs compared.** Multi-gate (per-task router, Eq. 5) outperforms task-conditioned (shared router + task embedding, Eq. 6). Multi-gate: +2.71% Δm vs STL-B on PASCAL-Context; Task-conditioned: +2.22%. The difference is small but consistent.
3. **MoE in every other ViT block, not all blocks.** Expert layers embedded once every 2 ViT blocks. No ablation showing why every-other-block is optimal vs every block or fewer.
4. **Expert scaling: K=4 out of N=16.** Each expert is 4x smaller than standard ViT MLP (scaled down to maintain FLOP parity). This is critical — it means the total parameter count is ~4× a standard ViT FFN (16 small experts × 4 top-2 ≈ 32 expert param units vs standard 1 FFN).
5. **RS relevance is low.** Evaluated only on PASCAL-Context (general CV) and NYUD-v2 (indoor RGB-D). No RS datasets, no remote sensing tasks. The MoE-for-MTL idea is relevant conceptually but not directly applicable.
6. **FPGA practicality.** Xilinx ZCU104 is a mid-range FPGA. 84ms latency on NYUD-v2 (224×224 input) — too slow for real-time but adequate for edge deployment. The computation reordering (expert-by-expert instead of token-by-token) is genuinely clever: reduces on-chip memory from 11.6 MiB to 4.8 MiB, making MoE deployment feasible on resource-constrained hardware.
7. **Key ablation missing.** No study of expert count scaling (2, 4, 8, 16 experts) on MTL performance. Table 7 shows "more tasks benefit more" but doesn't break down why.
8. **Pre-training requirement.** MoE ViT encoder needs ImageNet pre-training (same as DeiT). The MoE experts themselves are initialized by cloning standard FFN weights — not from scratch.

**Cross-wiki connections:**
- Compare with [[L2_lineage/computer-vision/multi-task/moe-based]] — M3ViT is early MoE-for-MTL work (2022), preceding Mod-Squad (CVPR 2023) and RS-specific MoE MTL works. Contributed task-dependent gating paradigm that later works adopted.
- Hardware-aware design relevant to [[L3_module/model-efficiency]] — demonstrates edge deployment feasibility for MoE models.
