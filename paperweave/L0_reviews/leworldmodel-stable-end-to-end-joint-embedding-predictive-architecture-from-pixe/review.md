---
slug: "leworldmodel-stable-end-to-end-joint-embedding-predictive-architecture-from-pixe"
title: "LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels"
authors:
  - "Lucas Maes"
  - "Quentin Le Lidec"
  - "Damien Scieur"
  - "Yann LeCun"
  - "Randall Balestriero"
venue: "Preprint (2025)"
---

## [2026-05-02] Review

### Summary
LeWorldModel (LeWM) is the first Joint Embedding Predictive Architecture (JEPA) that trains stably end-to-end from raw pixels using only two loss terms: a next-embedding prediction loss (MSE) and SIGReg, a regularizer enforcing Gaussian-distributed latent embeddings. This reduces tunable hyperparameters from 6 (in prior end-to-end method PLDM) to just 1 effective parameter (lambda). With only 15M parameters trainable on a single GPU in hours, LeWM achieves competitive control performance across diverse 2D and 3D tasks while planning up to 48x faster than foundation-model-based world models (DINO-WM). The latent space also encodes meaningful physical structure as shown through probing and violation-of-expectation tests.

### Significance
LeWM addresses a key challenge in self-supervised world model learning: preventing representation collapse without relying on heuristics (stop-gradient, EMA), pre-trained encoders, or complex multi-term losses. The simplicity and stability of the approach make it accessible for research and practical deployment.

### Strengths
- Simple two-term objective: prediction loss + SIGReg (anti-collapse)
- Only 1 effective hyperparameter to tune (vs 6 for PLDM)
- Trains stably end-to-end from pixels on a single GPU
- Competitive with foundation-model-based methods at much lower cost
- 48x faster planning than DINO-WM due to compact latents
- Provable anti-collapse guarantees via Cramer-Wold theorem
- Latent space encodes intuitive physics (probing + surprise detection)

### Weaknesses
- 15M parameters is small; scaling behavior not explored
- Planning uses simple CEM solver; more sophisticated MPC not evaluated
- Only tested on relatively simple control tasks (Push-T, OGBench-Cube, Two-Room, Reacher)
- Comparison limited mainly to DINO-WM and PLDM
- No real-world robotic experiments

### Rating
Strong: 4/5 — An elegant, principled solution to the JEPA collapse problem with practical benefits.

**Citation Mining:**
- LeWorldModel [this paper] — builds on JEPA framework
- DINO-WM [2024] — foundation-model-based world model comparison
- PLDM [2024] — prior end-to-end JEPA approach
- CEM [Botev et al., 2017] — planning algorithm used

**L1 Ecology Observations:**
- SIGReg anti-collapse method could improve RS world model training
- JEPA latent space planning is efficient for RS applications needing fast inference
- Compact latent representations benefit RS deployment on resource-constrained platforms
