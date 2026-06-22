---
title: Feed-Forward 3D Reconstruction
created: 2026-05-20
updated: 2026-05-20
type: lineage
domain: computer-vision
task: 3d-reconstruction
approach: feed-forward-scaling
tags: [3d-reconstruction, feed-forward, scaling, VGGT, register-attention, power-law, self-supervised-distillation]
sources:
  - arXiv:2605.15195
zotero_keys: []
confidence: high
---

# Feed-Forward 3D Reconstruction

## Overview

Feed-forward 3D reconstruction bypasses per-scene optimization by training neural networks that directly infer 3D structure from one or more images. The paradigm has evolved from per-scene NeRF optimization → sparse-view reconstruction (DUSt3R) → real-time feed-forward (VGGT) → **scaling laws** (VGGT-Ω). VGGT-Ω (Meta AI × Oxford VGG, 2026) demonstrates that feed-forward 3D reconstruction follows a predictable power-law scaling with model size and data, achieving state-of-the-art results with a 10B-parameter single-head transformer trained on 4M scenes via self-supervised distillation from unlabeled video.

## Papers

| Paper | Year | Score | Contribution | Notes |
|-------|------|-------|-------------|-------|
| VGGT-Ω (Wang et al.) | 2026 | 4 | 10B params, register attention, 4M scenes, power-law scaling, single-head decoder | Meta AI × Oxford VGG; arXiv 2605.15195 |
| VGGT (Wang et al.) | 2026 | 3 | First real-time feed-forward 3D reconstruction, single-head architecture | Foundation model showing scalability |
| DUSt3R (Wang et al.) | 2024 | 4 | DUSt3R unified stereo/multi-view 3D reconstruction in a feed-forward manner | Foundational feed-forward approach |
| NeRF (Mildenhall et al.) | 2020 | 5 | Neural Radiance Fields — per-scene optimization | Established volumetric 3D representation |

## Key Concepts

### Register Attention

VGGT-Ω introduces **register tokens** (similar to Darcet et al., 2023 for ViTs) into the transformer decoder. These learnable tokens act as global information sinks, preventing attention collapse in deep transformers. For 3D reconstruction, register tokens:

- Absorb diffuse global context that would otherwise corrupt local geometric features
- Enable stable training at 10B scale without attention entropy collapse
- Improve depth accuracy at occlusion boundaries by decoupling local/global information flow

### Power-Law Scaling

VGGT-Ω establishes that feed-forward 3D reconstruction quality follows a **power-law scaling** relationship with model parameters and training data:

```
Error ∝ (Params)^(-α) × (Data)^(-β)
```

Key findings:
- Scaling data from 1M → 4M scenes yields predictable improvement
- Scaling model from 2B → 10B parameters follows a smooth power law
- No saturation observed at 10B / 4M — further gains expected from larger scale
- Single-head architecture preserves scaling efficiency (no multi-head attention overhead)

### Self-Supervised Distillation from Unlabeled Video

VGGT-Ω replaces supervised 3D ground truth with a **self-supervised distillation** pipeline:

1. **Teacher model** (VGGT-Ω pretrained) processes unlabeled video frames
2. **Cross-view consistency loss** enforces geometric consistency across different viewpoints in the video
3. **Temporal continuity** provides dense supervision signals from frame-to-frame motion
4. No LiDAR, no depth sensors, no human annotations required

This pipeline is the main driver behind the 4M-scene training corpus — it enables orders-of-magnitude more training data than any prior supervised approach.

### Single-Head Decoder

Unlike conventional multi-head attention transformers, VGGT-Ω uses a **single-head decoder**:

- Reduces parameter count and memory footprint at scale
- Register tokens compensate for the capacity lost from removing extra heads
- Faster inference: single-head attention is O(N²d) vs O(N²d·h) for h heads
- Better scaling efficiency: more parameters go into depth (more layers) rather than width (more heads)

## Design Space

### vs VGGT (Predecessor)

| Aspect | VGGT | VGGT-Ω |
|--------|------|--------|
| Parameters | ~2B | 10B (5×) |
| Training data | ~1M scenes | 4M scenes (4×) |
| Attention | Multi-head | Single-head + register tokens |
| Supervision | Some supervised data | Fully self-supervised from video |
| Scaling analysis | None | Power-law validated |

### vs NeRF-based Methods

- **NeRF**: Per-scene optimization, high quality but slow (minutes to hours per scene)
- **VGGT-Ω**: Feed-forward inference in seconds, lower quality on individual scenes but scales to any input
- Both converge in expressiveness as NeRF distillation into feed-forward networks improves

### vs DUSt3R

- **DUSt3R**: Pioneered feed-forward 3D reconstruction, but limited by multi-view aggregation complexity
- **VGGT-Ω**: Simplifies to single-head decoder with register tokens; scales parameters and data by >10×
- **Key delta**: Register attention enables the single-head simplification while maintaining representational power

## Best Practices

1. **Register token placement**: Insert register tokens after every decoder block, not just the first layer — critical for attention stability at 10B scale.
2. **Video data curation**: Prefer videos with smooth camera motion (minimal jumps/cuts) for distillation quality.
3. **Scaling law budgeting**: Use power-law extrapolation to decide whether to allocate compute to more parameters vs more data (VGGT-Ω found model scaling more compute-efficient at current margins).
4. **Single-head width tuning**: The single-head decoder requires wider hidden dimensions than multi-head to compensate — tune width vs depth carefully.
5. **Distillation temperature**: Lower teacher temperatures (τ ≈ 0.5) improve cross-view consistency in self-supervised training.

## Pitfalls

1. **Occlusion boundary artifacts**: Register tokens can oversmooth depth at sharp occlusion boundaries if not carefully regularized.
2. **Video quality sensitivity**: Self-supervised distillation is sensitive to motion blur, rolling shutter, and dynamic objects in training video.
3. **Single-head capacity ceiling**: At extreme scale (>50B), single-head attention may hit representational limits that multi-head architectures handle better.
4. **Metric scale ambiguity**: Feed-forward reconstruction from monocular video has inherent scale ambiguity that distillation cannot fully resolve.
5. **Generalization to out-of-distribution scenes**: Power-law scaling only validated on Internet-sourced video; performance on specialized domains (medical, industrial) unknown.

## Relevance

VGGT-Ω represents a **landmark scaling result** for feed-forward 3D reconstruction, analogous to what GPT-2/3 did for language modeling. Key implications:

1. **Scaling doctrine established**: Feed-forward 3D reconstruction now has a validated scaling law, justifying further compute investment.
2. **Self-supervised data pipeline**: The video distillation paradigm can be replicated for any 3D reconstruction task — the bottleneck shifts from supervision to compute.
3. **Register attention as general technique**: Register tokens proved critical for scaling transformers — likely transferable to other dense prediction tasks (depth, normal, segmentation).
4. **Practical deployment**: 10B model at single-head efficiency makes real-time 3D reconstruction on consumer hardware plausible within 1-2 generations.
5. **Research direction**: Key open questions include multi-head vs single-head scaling at >50B, joint video+3D pretraining, and extending to dynamic scene reconstruction.
