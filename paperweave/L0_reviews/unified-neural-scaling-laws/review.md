---
slug: "unified-neural-scaling-laws"
title: "Unified Neural Scaling Laws"
authors:
  - "Ethan Caballero"
  - "Priyank Jaini"
  - "David Krueger"
  - "Irina Rish"
year: 2026
venue: "arXiv"
tags: [theory, scaling-laws, ml-theory]
score: 4
contribution: 4
soundness: 4
relevance: 4
open_source: false
code_url: "—"
compute: "—"
dataset_access: public
---

> **Abstract:** A hierarchical functional form (UNSL) that accurately models and extrapolates scaling behaviors of deep neural networks as multiple dimensions (model parameters, dataset size, training steps, inference steps, hyperparameters) vary simultaneously, outperforming prior functional forms across vision and language tasks.

## [2026-05-30] Review

**Score:** 4/5
- Contribution: 4/5 — UNSL is the first functional form to unify multivariate scaling across parameters, data, steps, inference, and hyperparameters within a single hierarchical expression. The 8 desiderata provide a principled design framework, and the additive symmetry insight (sum of two power laws) elegantly captures nonmonotonic transitions like overfitting and optimal learning rates. This is a meaningful step beyond prior work (Kaplan, Chinchilla, BNSL) toward a "unified" scaling theory.
- Soundness: 4/5 — Extensive empirical validation across vision (23 bivariate + trivariate configurations spanning ViT, MLP-Mixer, BiT) and language (9 configurations spanning Transformers and Recurrent models). UNSL wins 60.9% of vision tasks and 88.9% of language tasks in RMSLE comparisons. The ablation hierarchy (A1→A2→A3→UNSL) cleanly isolates the contribution of each architectural component. Theoretical grounding via universal approximation theorem for MBNSL (softplus hidden layer) is sound. Main weakness: no peer review yet (arXiv only), and the fitting procedure requires 20,000 KFAC-JAX steps with 20 random seeds — compute-intensive but not prohibitive.
- Relevance: 4/5 — Scaling laws are foundational to modern ML research and practice. For remote sensing multi-modal multi-task learning specifically, UNSL's ability to model multiple input dimensions simultaneously (data volume, model capacity, number of modalities/tasks, training duration) makes it directly applicable for predicting performance trade-offs when scaling remote sensing foundation models. The bottleneck component formalism (Desideratum 3) is particularly relevant for multi-task settings where individual task performance may be bottlenecked by different resources.

**Key Insights:**
- UNSL is built as a 4-layer hierarchy: MBNSL (smoothly connected hyperplanes in multi-log space) → R(r) (non-bottleneck + bottleneck components) → Q(q) (misperformance limits + oppositional forces of hyperparameters) → top-level additive constant + overfitting oppositional force
- The "additive symmetry" (sum of two power laws, Equation 5) is the key mechanism for capturing nonmonotonic transitions — overfitting, learning rate tuning, and weight initialization effects all follow this pattern rather than the more general BNSL form
- All 8 desiderata are satisfied by construction: univariate BNSL recovery, multiplicative break shifting, bottleneck limits, global a0 constant, misperformance via reciprocals, bottlenecked misperformance, nonmonotonic additive symmetry, and oppositional forces opposing both good and bad learning
- A1/A2/A3/UNSL share identical supremal expressivity (universal approximation via softplus), so UNSL's extrapolation advantage comes entirely from the inductive biases encoded in the desiderata — a clean ablation story
- The "limit of predictability" analysis on the sparse parity task reveals that accurate extrapolation past a hyperbreak requires the convex hull of fitting points to be sufficiently close to that hyperbreak
- UNSL accurately extrapolates to scales an order of magnitude larger in multiple dimensions simultaneously (Section 14, Figure 6)

**Notes:**
- Venue: arXiv preprint (no conference acceptance yet as of 2026). Authors are from Mila (Caballero, Krueger, Rish) and Google DeepMind (Jaini)
- Compute: 20,000 KFAC-JAX steps × 20 seeds for fitting; recommended system with at least a dozen CPUs
- Limitations: (1) No public code repository — code is provided inline in Appendix 20 but requires manual assembly and specific JAX/KFAC versions pinned to commits; (2) The fitting procedure requires careful hyperparameter selection (n, S, lambda) via validation split; (3) Only evaluated on vision and language — no multimodal or remote sensing tasks tested; (4) The functional form has many learned parameters, raising potential overfitting concerns (mitigated by the extrapolation evaluation protocol); (5) No comparison to simpler neural network-based extrapolators
- The paper includes reinforcement learning scaling (Appendix 18.1), inference/test-time scaling (Appendix 18.2), width/depth scaling (Appendix 18.3), and batch size scaling (Appendix 18.4)

**Code Review:**
- N/A — Code is provided as inline Python in Appendix 20 but no public repository exists. The implementation requires specific pinned versions of kfac-jax, jax, and flax. The fitting uses KFAC-JAX optimizer with MSLE loss and L2 regularization on exponents.

**Citation Mining (8 papers):**
- Kaplan et al. 2020 / Scaling Laws for Neural Language Models (Kaplan, McCandlish, Henighan, Brown, Chess, Child, Gray, Radford, Wu, Amodei, 2020) — arXiv
- Chinchilla / Training Compute-Optimal Large Language Models (Hoffmann, Borgeaud, Mensch, Buchatskaya, Cai, Rutherford, de Las Casas, Hendricks, Welbl, Clark, et al., 2022) — arXiv
- BNSL / Broken Neural Scaling Laws (Caballero, Gupta, Rish, Krueger, 2023) — ICLR 2023
- Rosenfeld et al. / A Constructive Prediction of the Generalization Error Across Scales (Rosenfeld, Rosenfeld, Belinkov, Shavit, 2019) — arXiv
- Muennighoff et al. / Scaling Data-Constrained Language Models (Muennighoff, Rush, Barak, Le Scao, Piktus, Tazi, Pyysalo, Wolf, Raffel, 2023) — arXiv
- Alabdulmohsin et al. / Revisiting Neural Scaling Laws in Language and Vision (Alabdulmohsin, Neyshabur, Zhai, 2022) — NeurIPS 2022
- Zhai et al. / Scaling Vision Transformers (Zhai, Kolesnikov, Houlsby, Beyer, 2022) — CVPR 2022
- Hestness et al. / Deep Learning Scaling is Predictable, Empirically (Hestness, Narang, Ardalani, Diamos, Jun, Kianinejad, Patwary, Yang, Zhou, 2017) — arXiv

**Cross-wiki Connections:**
- L2: [[L2_lineage/general/theory/scaling-laws]]
- L3: Connect to model-efficiency and pretraining-paradigm topics; relevant for multi-modal scaling in remote sensing foundation models
