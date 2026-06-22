---
title: World Models for Video Generation
created: 2026-05-20
updated: 2026-05-20
type: lineage
domain: computer-vision
task: generation
approach: world-model-sana
---

# World Models for Video Generation — SANA-WM Lineage

> L2 lineage page tracking the emergence of efficient, open-source world models for video generation, anchored by NVIDIA's SANA-WM.

---

## Overview

World modeling — the ability to simulate plausible futures from visual observations — has rapidly converged with video generation. Until recently, world models were either small-scale (game environments, short clips) or required massive compute clusters. **SANA-WM** (NVIDIA NVlabs, arXiv 2605.15178) breaks this trade-off: a 2.6B parameter diffusion transformer that generates **1-minute 720p video on a single GPU**, with full 6-DoF camera control, under the permissive Apache 2.0 license.

This lineage captures the design decisions — hybrid attention, progressive training, dual-branch camera conditioning — that make SANA-WM a milestone for democratized world modeling.

---

## Papers

| Paper | Year | Citations | Key Contributions |
|-------|------|-----------|-------------------|
| **SANA-WM** (NVlabs) | 2026 | 4 | 2.6B open-source, 1-min 720p, single GPU, 6-DoF control |
| Cosmos (NVIDIA) | 2025 | — | Full-stack world foundation model, 8K video, heavy compute |
| Genie 2 (Google DeepMind) | 2024 | — | Interactive world model from internet videos, latent actions |
| GameNGen (Google) | 2024 | — | Real-time game engine simulation via diffusion, DOOM at 20fps |

> Citation counts are approximate as of May 2026. SANA-WM is very recent (May 2026).

---

## Key Concepts

### 1. GDN Hybrid Attention

SANA-WM replaces standard softmax attention with a **Gated Differential Normalization (GDN) / softmax hybrid** mechanism:

- **GDN branch** handles long-range temporal dependencies (>1024 frames) without the quadratic blowup of full attention.
- **Softmax branch** preserves high-fidelity spatial reasoning within local windows.
- The gating mechanism learns to route tokens between the two branches dynamically, giving the model both *global coherence* and *local sharpness*.

This is critical for minute-scale video: standard attention on 1-minute 720p video would be computationally prohibitive.

### 2. Dual-Branch Camera Control

Users can control camera motion via 6-DoF (translation + rotation) parameters:

- **Branch A — Camera Embedding**: Encodes extrinsic camera parameters into the diffusion timestep embedding, providing global conditioning.
- **Branch B — Ray-based Cross-Attention**: Projects camera rays into the latent space and cross-attends with video tokens, providing per-pixel geometric conditioning.
- The two branches are fused via learned multipliers, allowing the model to disentangle *what* moves (scene content) from *how* the camera moves.

### 3. Progressive Training

SANA-WM is trained in three stages:

| Stage | Resolution | Frames | Description |
|-------|-----------|--------|-------------|
| 1 | 256×256 | 64 | Spatial understanding, basic dynamics |
| 2 | 512×512 | 256 | Temporal coherence, camera conditioning |
| 3 | 1280×720 | 2048 (1 min @ ~34fps) | Full-resolution minute-scale video |

Each stage reuses the previous checkpoint, with newly added parameters (e.g., camera branches) initialized from scratch. This avoids catastrophic forgetting while scaling up.

### 4. Open-Source Release (Apache 2.0)

All model weights, inference code, and training recipes are released under Apache 2.0. This is a deliberate departure from the closed-source trend in world modeling (e.g., Cosmos weights available but training details proprietary).

---

## Design Space

### SANA-WM vs. Cosmos (NVIDIA)

| Dimension | SANA-WM | Cosmos |
|-----------|---------|--------|
| **Scale** | 2.6B params | 4B–14B params |
| **Hardware** | 1× GPU (inference) | 8–64× GPUs |
| **Output** | 720p, 1 min | Up to 8K, variable length |
| **Control** | 6-DoF camera | Camera + action + text |
| **License** | Apache 2.0 | NVIDIA proprietary (weights available) |
| **Release** | Open-weight + open-code | Weights only |

**Takeaway**: Cosmos is a full-stack world foundation model for research labs; SANA-WM is the viable minimum for individual researchers and startups.

### SANA-WM vs. Genie 2 (Google DeepMind)

| Dimension | SANA-WM | Genie 2 |
|-----------|---------|---------|
| **Approach** | Diffusion Transformer | Video tokenization + autoregressive |
| **Training data** | Large video corpus | Internet videos (unlabeled) |
| **Interactivity** | Camera control | Full action-conditioned world |
| **Emergent property** | Photorealistic video | Playable consistency |
| **Open source** | ✅ Apache 2.0 | ❌ Closed |

**Takeaway**: Genie 2 learns latent action spaces from unlabeled video, enabling interactive playability. SANA-WM sacrifices interactivity for photorealistic quality and open access.

### SANA-WM vs. GameNGen (Google)

| Dimension | SANA-WM | GameNGen |
|-----------|---------|----------|
| **Target** | General video world | Game-specific (DOOM) |
| **Speed** | Offline (minute-scale gen) | Real-time (20fps) |
| **Model** | DiT (2.6B) | Modified Stable Diffusion (0.9B) |
| **Control** | 6-DoF camera | Game actions + mouse |
| **Open source** | ✅ Apache 2.0 | ❌ N/A |

**Takeaway**: GameNGen showed that diffusion can simulate game logic in real time for constrained domains. SANA-WM generalizes this to open-domain video at the cost of real-time inference.

---

## Best Practices

1. **Start with Stage 2 weights.** For most downstream tasks (5–15 second clips at 512p), Stage 2 weights are sufficient and 4× faster than full Stage 3.

2. **Camera conditioning is subtractive.** Adding aggressive camera motion reduces generation quality. Use smooth, slow trajectories for best results; reserve fast motion for short clips (<10 seconds).

3. **Batch size 1 for 720p.** Even on an A100 80GB, a single 720p frame at full resolution consumes ~40GB VRAM during inference. Use `--offload-cache` to trade speed for memory.

4. **Fine-tune with LoRA for domain adaptation.** The base model is trained on diverse internet video; a rank-64 LoRA on 100–500 domain-specific clips adapts well without overfitting.

5. **Use classifier-free guidance scale 3.0–5.0.** Lower than 3.0 produces blur; higher than 5.0 introduces artifacts in long videos. The paper ablates this carefully.

6. **Always pad videos to 2048 frames.** The position encoding is trained for exactly 2048 tokens. Shorter sequences should be padded (and masked) rather than truncated in position space.

---

## Pitfalls

1. **Don't expect perfect temporal consistency.** Minute-scale video inevitably drifts — backgrounds shift, objects morph. SANA-WM is a *world model*, not a *video editor*. Use short keyframe interpolation for production.

2. **6-DoF camera control ≠ full scene control.** The camera branches condition the generation but do not give you independent object manipulation. You control the viewpoint, not the actors.

3. **VRAM scales superlinearly with resolution.** 720p requires 40GB+; 1080p is infeasible on consumer GPUs without tensor parallelism or model sharding.

4. **Training from scratch is expensive.** Even with progressive training, Stage 3 required 128× H100s for ~2 weeks. Fine-tuning is the practical path.

5. **Evaluation metrics are immature.** FVD, FID, and CLIP score do not capture temporal coherence or physical plausibility. Human evaluation remains the gold standard, but is rarely reported consistently.

6. **Open source ≠ production-ready.** The codebase is research-grade. Expect minimal documentation, limited error handling, and no official serving infrastructure.

---

## Relevance

SANA-WM arrives at a pivotal moment for world models:

- **Democratization**: It proves that minute-scale video generation is feasible on a single GPU, opening world modeling to academic labs and independent researchers.
- **Architectural innovation**: The GDN/softmax hybrid attention is a practical answer to the long-context video problem, likely to influence future video DiT designs.
- **Open-source precedent**: Apache 2.0 release sets a strong norm for the field, countering the trend toward proprietary world models (e.g., OpenAI Sora, Google Veo).
- **Application surface**: From robotics simulation to game prototyping to film previsualization, cheap world models unblock use cases that were previously gated by compute cost.

**Bottom line**: SANA-WM is the "ImageNet moment" for open-world modeling — not the final word, but the point at which the field becomes accessible.

---

*Lineage last updated: 2026-05-20*
*arXiv: [2605.15178](https://arxiv.org/abs/2605.15178)*
