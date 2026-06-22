---
slug: sana-wm-minute-world-model
title: "SANA-WM: Efficient Minute-Scale World Modeling with Hybrid Linear Diffusion Transformer"
authors: "Haoyi Zhu*, Haozhe Liu*, Yuyang Zhao*, Tian Ye*, Junsong Chen*, Jincheng Yu, Tong He, Song Han, Enze Xie"
year: 2026
venue: "arXiv (cs.CV)"
arxiv_id: "2605.15178"
code_url: "https://github.com/NVlabs/Sana"
institutions: "NVIDIA"
tags:
  - world-model
  - video-generation
  - diffusion-transformer
  - camera-control
  - open-source
type: method
license: "CC BY-NC-SA 4.0"
score:
  contribution: 4
  soundness: 4
  relevance: 2
  overall: 4
---

## TL;DR

SANA-WM is a 2.6B-parameter open-source world model from NVIDIA that generates 720p minute-long videos with precise 6-DoF camera control on a single GPU. It achieves this through a **hybrid Gated DeltaNet (GDN) / softmax attention backbone**, a dual-branch camera conditioning mechanism (UCPE + Plücker), a two-stage generation pipeline with a refiner, and a robust data annotation pipeline yielding ~213K metric-pose video clips. Training completes in 15 days on 64 H100 GPUs, and a distilled variant runs 60s 720p generation in 34s on a single RTX 5090 with NVFP4 quantization.

---

## Abstract One-Liner

SANA-WM introduces an efficient, open-source, camera-controllable minute-scale world model that matches industrial baselines in visual quality while delivering up to 36× higher throughput on a single GPU.

---

## Key Insights

1. **Hybrid GDN/Softmax attention is the architectural centerpiece**: The paper replaces pure cumulative linear attention (from SANA-Video) with 15 interleaved frame-wise Gated DeltaNet (GDN) blocks and 5 softmax blocks. GDN provides O(1) memory recurrent state with a decay gate and delta-rule correction to prevent drift at minute scale, while periodic softmax blocks anchor long-range spatial consistency. The novel $1/\sqrt{DS}$ key scaling (vs. $1/\sqrt{D}$ in standard GDN) is essential for training stability — without it, training collapses immediately (NaN events at step 1).

2. **Dual-branch camera control at coarse and fine granularity**: The coarse branch uses Unsupervised Camera Positional Encoding (UCPE) at latent-frame rate with ray-local geometric transforms, while the fine branch injects raw-frame Plücker raymaps (6-D per pixel × 8 temporal frames = 48 channels) at the VAE stride level. This dual-rate design compensates for information lost in aggressive spatiotemporal compression, enabling precise action following (4.50° RotErr on Simple split).

3. **Practical single-GPU deployment is the headline achievement**: The distilled 4-step autoregressive variant with attention-sink and NVFP4 quantization runs 60s 720p generation in 34s on a single RTX 5090. The bidirectional and chunk-causal variants fit within one H100 (51.1 GB), achieving 24.1 videos/hour — 3.7× faster than the closest 480p baseline. This dramatically lowers the barrier for long-horizon world modeling research.

4. **Two-stage refinement pipeline addresses data-limited training**: Trained on only ~213K clips (vs. the millions used by commercial systems), the stage-1 model shows visible drift (ΔIQ = 3.09–3.79). The second-stage refiner (LoRA-adapted LTX-2, 17B) substantially reduces this drift (ΔIQ = 0.31–1.17) and improves pose accuracy. The refiner uses a novel truncated-σ flow matching formulation that perturbs stage-1 latents with σ_start=0.909 and learns to denoise toward high-fidelity targets.

5. **Robust annotation pipeline overcomes the pose-label bottleneck**: The paper modifies VIPE by replacing its depth backbone with Pi3X (long-sequence-consistent depth) fused with MoGe-2 (metric-scale anchor), adds per-frame intrinsics optimization in bundle adjustment, and implements three annotation modes (default internet video, GT-depth, GT-pose). This pipeline enables metric-scale 6-DoF pose extraction from public videos, turning otherwise unusable footage into training data.

6. **Context-Parallel (CP) training with mathematically exact state recomposition**: For 961-frame sequences on 64 GPUs, each shard computes compact transition (C_p) and input (H_p) composites from the GDN recurrence (Eq. 12), all-gathers these summaries, and composes them as an exclusive prefix (Eq. 13). This recovers the exact initial GDN state for each rank without approximation, enabling training at scale without modifying the recurrent dynamics.

7. **Causal vs. bidirectional trade-off is clearly characterized**: The bidirectional variant achieves substantially better pose accuracy (3.11° vs. 7.59° RotErr) and visual quality than the autoregressive (chunk-causal) variant, but the bi-directional model requires full-sequence access and cannot stream. The paper makes the practical recommendation to search trajectories efficiently with the stage-1 model, then refine promising rollouts.

---

## Major Strengths

**1. Efficiency-first design thinking.** The paper systematically attacks inefficiency at every level: high-compression LTX2 VAE (2.0× smaller than ST-DC-AE, 8.0× smaller than Wan2.1-VAE), hybrid attention that trades off quality vs. memory, fused Triton kernels (1.5–2× speedup), context-parallel training with exact GDN state recomposition, and attention-sink + local window for constant-memory softmax. This is a principled, end-to-end optimization story rather than a collection of ad-hoc tricks.

**2. Strong action-following results.** On the proposed benchmark's 60-second Simple/Hard splits, SANA-WM achieves the best pose accuracy among all baselines (4.50°/8.34° RotErr), outperforming much larger models like LingBot-World (14B+14B) and Matrix-Game 3.0 (5B). The gap is especially large on Hard trajectories with vertical motion and whip-pan events.

**3. Comprehensive ablation studies.** The progressive training ablation (Tab. 3) cleanly isolates the contribution of each component: LTX2 VAE reduces memory 39% (8.9→5.4 GB) and latency 3.4× while preserving quality; hybrid attention adds a moderate quality boost (+0.014 Total). The camera conditioning ablation (Tab. 4) shows clear monotonic improvement from no control → Plücker only → PRoPE → UCPE → UCPE+Plücker. The key scaling ablation (Fig. 6) is particularly convincing — only the proposed $1/\sqrt{DS}$ scaling prevents NaN.

**4. Open-source release with multiple inference variants.** The codebase (Apache 2.0) provides bidirectional, chunk-causal AR, distilled, and NVFP4-quantized inference paths, plus training configurations for all four stages. The project is well-documented with Hugging Face integration, diffusers pipeline support, and ComfyUI compatibility.

**5. Reproducible benchmark construction.** The benchmark generates 80 first-frame images from Nano Banana Pro across four scene categories, pairs them with scripted Simple/Hard trajectories, and provides a standardized evaluation protocol with VBench, pose accuracy (Pi3X), revisit memory, and temporal degradation metrics. Collision avoidance and scene-adaptive speed limits add realism.

**6. Addresses a real scalability bottleneck.** Existing open-source world models (LingBot-World, HY-WorldPlay) require multi-GPU inference (8× H100) and large training budgets. SANA-WM's single-GPU inference capability is a meaningful step toward democratizing long-horizon world modeling for smaller labs and academic groups.

---

## Weaknesses & Limitations

**1. Limited data scale and domain coverage.** The 213K-clip training corpus is small by modern video generation standards (c.f., millions of clips used by commercial systems). The paper acknowledges this as a limitation. The data is dominated by SpatialVID-HQ (158K clips of 10s), and the remaining sources — game data, synthetic 3DGS renders, and long walking videos — may not generalize to diverse real-world scenes, dynamic objects, or embodied robotics settings.

**2. No explicit 3D scene memory.** Unlike systems such as HY-World 2.0, DeepVerse, or Aether, SANA-WM does not maintain an explicit 3D representation (e.g., NeRF, 3DGS, or voxel grid). The model operates purely in latent video space, which limits long-horizon scene consistency during complex revisit trajectories. The 14.46 dB revisit PSNR, while competitive, leaves substantial room for improvement.

**3. Refiner adds substantial complexity.** The two-stage pipeline requires a separate 17B-parameter LTX-2 model with LoRA adapters, adding 74.7 GB peak memory and reducing throughput from 24.1 to 22.0 videos/hour. The refiner is trained on paired synthetic/real data with downsampling-upsampling augmentation, which may not cover all stage-1 failure modes. The ablation shows the original LTX-2.3 refiner degrades performance (Overall drops from 79.29→71.37), confirming the adaptation is necessary but also indicating brittleness.

**4. Causal (autoregressive) variant quality drop.** The chunk-causal variant shows substantially worse pose accuracy (7.59°→10.02° RotErr on Hard) and visual quality compared to the bidirectional variant. While this is expected for streaming models, the gap is significant (2.6× larger RotErr). The recommended workflow (bidirectional search → refiner) still requires full-sequence access, limiting real-time interactive use.

**5. Distillation is described but not fully evaluated in the main benchmark.** The 4-step distilled variant's benchmark results appear only in the efficiency ablation (Fig. 7a) rather than the main quantitative table (Tab. 2). A direct comparison of visual quality and pose accuracy between the 60-step and 4-step variants is missing, making it hard to assess the quality-cost trade-off of distillation.

**6. Benchmark limitations.** The benchmark uses only 80 scenes generated by Nano Banana Pro (a single image generator), which may introduce distribution bias. The Simple/Hard trajectory splits have only 10 templates each, which may not capture the full diversity of real-world camera motion. The benchmark does not include object interaction, dynamic scene elements, or multi-agent scenarios.

**7. Lack of human evaluation.** All visual quality metrics rely on automated VBench scores. While VBench is well-established, human perceptual studies would strengthen claims about visual quality, especially given the modest 213K training corpus and the known gaps between automated metrics and human judgment for long videos.

**8. Training compute is still substantial.** 15 days on 64 H100 GPUs (~23,040 GPU-hours) is not negligible, even if it is less than alternatives. The paper targeted "accessible" training but this still requires access to a multi-node GPU cluster, which is out of reach for most individual academic labs.

---

## Technical Verdict

**Overall quality: Very Good (Score: 4/5).** The paper is well-structured, the experiments are thorough, and the ablation studies convincingly isolate the contribution of each design choice. The efficiency results are impressive and well-documented. The code release is complete and well-supported.

**Contribution: Strong (Score: 4/5).** The paper makes four concrete contributions: (1) a hybrid GDN/softmax architecture for efficient long-context video modeling with a novel key scaling, (2) a dual-branch camera conditioning mechanism, (3) a long-video refinement pipeline, and (4) a robust metric-pose annotation pipeline. Each is independently valuable and the combination demonstrates a clear advance over prior open-source world models.

**Soundness: Strong (Score: 4/5).** The ablations are well-designed, the metrics are appropriate, and the comparisons are fair (matched protocols, same trajectories, standard VBench/Pi3X evaluation). The training stability analysis (GDN key scaling ablation) is particularly rigorous. The paper is transparent about limitations.

**Relevance: Low (Score: 2/5).** SANA-WM targets camera-controlled video generation / world modeling. While world models have potential applicability to remote sensing (e.g., video prediction, scene evolution simulation, trajectory-conditioned generation from satellite or aerial imagery), the paper does not present any RS experiments, and the architecture is not adapted to RS-specific challenges (multi-spectral data, large spatial scales, different camera geometries). The relevance to remote sensing is indirect at best.

---

## Code Review

### Repository Structure

The code is part of the broader [NVlabs/Sana](https://github.com/NVlabs/Sana) repository (Apache 2.0 licensed for core Sana code, CC BY-NC-SA 4.0 for the LongSANA additions). The SANA-WM specific components live under `diffusion/longsana/` and related configs in `configs/sana_video_config/longsana/`. The repo is well-organized with clear separation between image generation (`sana/`), video generation (`diffusion/`), training scripts (`train_video_scripts/`, `train_scripts/`), inference scripts (`scripts/`, `inference_video_scripts/`), and evaluation tools (`tools/metrics/`).

### Key Files

| File | Purpose |
|------|---------|
| `diffusion/longsana/model/streaming_sana_long.py` | Main streaming training model wrapper with chunk-wise loss, KV cache reuse, and first-frame re-encoding |
| `diffusion/longsana/pipeline/sana_training_pipeline.py` | Training pipeline with autoregressive segment creation, cached attention/convolution modules |
| `diffusion/longsana/pipeline/sana_inference_pipeline.py` | Inference pipeline for single-GPU rollout with KV cache management |
| `diffusion/longsana/trainer/longsana_trainer.py` | Trainer extending self-forcing trainer with streaming sequence management |
| `diffusion/model/nets/sana_blocks.py` | Core attention blocks: `LiteLA` (linear attention), `LiteLAReLURope` (ReLU + RoPE), `CachedCausalAttention` (cumulative linear with KV caching) |
| `diffusion/model/nets/basic_modules.py` | `CachedGLUMBConvTemp` and related modules with temporal convolution caching |
| `train_video_scripts/train_longsana.py` | Entry point for training, supports ODE, self-forcing, and longsana trainer modes |
| `configs/sana_video_config/longsana/480ms/longsana.yaml` | Config for 480p minute-scale training (261 latent frames = ~60s) |
| `configs/sana_video_config/longsana/480ms/self_forcing.yaml` | Config for self-forcing distillation stage |
| `configs/sana_video_config/longsana/480ms/ode.yaml` | Config for ODE initialization stage |
| `configs/sana_video_config/Sana_2000M_480px_adamW_fsdp_longsana.yaml` | Full model config for 2B parameter video backbone with cached causal attention |

### Architecture Implementation

The codebase implements the **cumulative linear attention** (Eq. 1 in the paper) via `CachedCausalAttention` (inheriting from `LiteLAReLURope`), which maintains a recurrent state of `(vk, k_sum)` tensors. The key operations:

```python
# Simplified from sana_blocks.py CachedCausalAttention.forward
q = self.kernel_func(q)  # ReLU activation
k = self.kernel_func(k)
k_sum = k.sum(dim=-1, keepdim=True).transpose(-2, -1)
vk = torch.matmul(v, k_rotated.transpose(-1, -2))

# KV cache accumulation (recurrent state)
if kv_cache is not None:
    cusum_vk, cumsum_k_sum = kv_cache
    vk = vk + cusum_vk        # cumulative state update
    k_sum = k_sum + cumsum_k_sum

z = 1 / (k_sum @ q + self.eps)
out = torch.matmul(vk, q_rotated) * z  # normalized output
```

The **GDN (Gated DeltaNet)** extension described in the paper (Eq. 2-3) adds a decay gate γ and delta-rule correction term. The paper states this uses custom fused Triton kernels for the GDN scan and gate operations. These kernels are not directly visible in the code snapshots but are referenced as custom implementations that significantly improve efficiency.

The **softmax attention** blocks (every 4th layer: {3, 7, 11, 15, 19}) use standard FlashAttention via the existing attention infrastructure.

### Strengths of the Code

1. **Well-structured training pipeline.** The progressive 4-stage training strategy is cleanly implemented with config-driven switching between ODE initialization, self-forcing distillation, and long-sequence streaming training. The `StreamingSANATrainingModel` wrapper handles chunk management, KV cache reset, and frame overlap elegantly.

2. **Exact GDN state recomposition in distributed training.** The context-parallel training (described in Sec. C.1) computes transition composites (C_p) and input composites (H_p) per shard, then all-gathers and composes them as an exclusive prefix. This is implemented without approximations, which is important for maintaining training fidelity at scale.

3. **Config-driven experimentation.** All hyperparameters (chunk size, denoising steps, learning rates, model architecture) are externalized in YAML configs, making the system easy to configure for different training regimes and hardware setups.

4. **Comprehensive evaluation tools.** The `tools/metrics/` directory includes implementations for FID, CLIP score, ImageReward, GenEval, and DPG-Bench, making it easy to reproduce the paper's evaluations.

5. **Good documentation for inference.** The `docs/longsana.md` provides clear instructions for both diffusers pipeline inference and CLI-based inference with Accelerate. The Hugging Face integration is well-documented.

### Weaknesses of the Code

1. **GDN implementation details are opaque.** The paper introduces GDN as a key contribution, but the GDN-specific gating and delta-rule correction are primarily referenced as custom Triton kernels rather than being clearly implemented in Python. This makes it difficult to verify the exact implementation against the paper's equations. The codebase shows the cumulative linear attention infrastructure but not the explicit gating mechanism.

2. **Chinese comments in code.** Several files contain Chinese-language comments (e.g., `# 功能：生成整个长视频` in `sana_training_pipeline.py`, `# KV cache相关` in `sana_inference_pipeline.py`). While not functionally problematic, this is inconsistent with professional software engineering practices for an open-source codebase intended for international use.

3. **Code duplication across pipeline variants.** The training and inference pipelines (`sana_training_pipeline.py`, `sana_inference_pipeline.py`, `sana_inference_interactive_pipeline.py`, etc.) share substantial logic for cache initialization, autoregressive segment creation, and KV cache management. Some consolidation through inheritance or shared utilities would improve maintainability.

4. **Limited unit tests.** The `tests/` directory has integration-style bash scripts rather than focused unit tests for the core attention mechanisms, GDN recurrence, or camera conditioning logic. The attention implementations (particularly the cached variants) would benefit from numerical correctness tests comparing cumulative vs. exact attention outputs.

5. **Hardcoded architectural parameters.** The model config uses specific identifiers like `SanaMSVideo_2000M_P2_D20` rather than being constructed from explicit architectural parameters. This makes it harder to experiment with different model sizes or attention configurations without modifying the model registry.

6. **No evaluation code for the proposed benchmark.** The codebase does not include the 60-second world-model benchmark construction or evaluation pipeline. While the benchmark generation is described in the paper, not releasing it limits reproducibility. The evaluation metrics (VBench, Pi3X pose accuracy) are external tools.

7. **Dependency on specific model checkpoints from Hugging Face.** Training and inference configurations point to specific Hugging Face paths (`hf://Efficient-Large-Model/...`) for pretrained checkpoints. This is reasonable for release but creates a dependency on external hosting infrastructure.

8. **Missing rendering/inference visualization for camera control.** The code does not include a simple notebook or demo script that shows the camera control capabilities end-to-end (e.g., plotting camera trajectories, overlaying action overlays on generated video). The paper's qualitative results (Fig. 5) are not trivially reproducible from the released code alone.

### Verdict on Code

The code is **production-quality** for the Sana video framework and implements the core infrastructure needed for SANA-WM's training and inference. The streaming training and KV cache management are well-engineered. However, the following would significantly improve the codebase:

1. **Open-source the GDN custom Triton kernels** — this is critical for academic reproducibility of the core contribution.
2. **Release the benchmark evaluation code** — the 80-scene benchmark with scripted trajectories and evaluation protocol.
3. **Add unit tests for** the cumulative attention recurrence, GDN key scaling, and context-parallel state recomposition.
4. **Provide a standalone SANA-WM inference script** focused on camera control (not buried in the broader Sana video infrastructure).
5. **Clean up Chinese comments** for an international open-source audience.

---

## Citation Mining

### How to Cite

The paper is on arXiv (2605.15178). The canonical citation information (based on the paper and project page):

```
@article{zhu2026sanawm,
  title={SANA-WM: Efficient Minute-Scale World Modeling with Hybrid Linear Diffusion Transformer},
  author={Zhu, Haoyi and Liu, Haozhe and Zhao, Yuyang and Ye, Tian and Chen, Junsong and Yu, Jincheng and He, Tong and Han, Song and Xie, Enze},
  journal={arXiv preprint arXiv:2605.15178},
  year={2026}
}
```

### Related Work Landscape

| Field | Key References | Papers |
|-------|---------------|--------|
| **Foundational world models** | [1-3] | Ha & Schmidhuber (2018), Genie 3 (DeepMind, 2025), GAIA-1 (Hu et al., 2023) |
| **Minute-scale open-source world models** | [6-9] | HY-WorldPlay (Sun et al., 2025), LingBot-World (2026), Infinite-World (Wu et al., 2026), Matrix-Game 3.0 (Wang et al., 2026) |
| **SANA family** | [25, 82] | SANA (Xie et al., 2024), SANA-Video (Chen et al., 2025) |
| **Efficient sequence models** | [11, 69-81] | GDN (Yang et al., 2024), Mamba (Gu & Dao, 2023), GLA (Yang et al., 2023), Qwen3, Kimi Linear |
| **Camera control / pose encoding** | [12, 59-65] | UCPE (Zhang et al., 2025), CameraCtrl (He et al., 2024), PRoPE (Li et al., 2025), Plücker embeddings (Sitzmann et al., 2021) |
| **Pose estimation / depth** | [13-15] | VIPE (Huang et al., 2025), Pi3X (Wang et al., 2025), MoGe-2 (Wang et al., 2025) |
| **Long-video generation** | [10, 24, 26-29] | LTX-2 (HaCohen et al., 2026), SkyReels-V2, Self-Forcing (Huang et al., 2025), LongLive (Yang et al., 2025) |
| **Geometry-aware world models** | [5, 47-50] | Aether (Zhu et al., 2025), WorldCam (Nam et al., 2026), DeepVerse (Chen et al., 2025) |
| **Evaluation** | [14, 96-99] | VBench (Huang et al., 2024), LPIPS (Zhang et al., 2018), FVD (Unterthiner et al., 2018), Umeyama alignment (2002) |
| **High-compression VAEs** | [10, 83, 84] | LTX2-VAE (HaCohen et al., 2026), DC-AE (Chen et al., 2024), DC-VideoGen (Chen et al., 2025) |

### Gaps and Opportunities

1. **No explicit 3D memory.** The paper explicitly acknowledges this limitation. Future work combining SANA-WM's efficient video generation with explicit 3D scene representations (3DGS, NeRF, or voxel grids) could achieve better scene persistence during rollouts.

2. **Scale-limited training data.** With only 213K clips, SANA-WM is at the low end of training data scale. Scaling data (especially with diverse camera trajectories, dynamic objects, and interactive actions) is identified as future work.

3. **Causal-to-bidirectional quality gap.** The 2.6× RotErr gap between bidirectional and autoregressive variants suggests room for improved recurrent architectures or better training strategies for causal generation.

4. **Limited action space (camera-only).** The model handles 6-DoF camera control but not robot actions, point tracking, or interactive user inputs. Extending to multi-modal action spaces is noted as future work.

5. **No real-time / streaming refiner.** The current two-stage pipeline (generation → refine) is not real-time. A future single-stage model that jointly generates and refines could simplify deployment.

---

## Key Takeaways

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Novelty** | ★★★★☆ | Hybrid GDN/softmax + dual-branch camera control is novel; builds on existing SANA-Video infrastructure |
| **Technical quality** | ★★★★☆ | Strong ablations, thorough baselines, clear documentation of failure modes |
| **Writing clarity** | ★★★★☆ | Well-structured, clear motivation, detailed appendix |
| **Reproducibility** | ★★★★☆ | Code released (Apache 2.0), training configs provided, but custom Triton kernels for GDN are opaque |
| **Efficiency** | ★★★★★ | Single GPU inference, 15-day training on 64 H100s, 34s on RTX 5090 — truly impressive |
| **RS relevance** | ★★☆☆☆ | Potential for RS video prediction / trajectory-conditioned scene generation, but no RS experiments or domain adaptation |
| **Open science** | ★★★★★ | Full code release, multiple inference variants, Hugging Face integration, ComfyUI support |

### Recommendation

**Accept with minor revisions.** The paper is technically sound, the contributions are clear, and the efficiency results are compelling. The main requested revisions would be:

1. Provide benchmark evaluation code alongside the release
2. Open-source the GDN Triton kernels or provide a PyTorch-native reference implementation
3. Include distilled 4-step results in the main quantitative table
4. Add a human evaluation study or at minimum a larger-scale user study for visual quality
5. Clarify the exact GDN implementation (Eq. 2-3) in the code

SANA-WM represents a meaningful advance in accessible, long-horizon world modeling. Its combination of strong efficiency, open-source availability, and competitive quality makes it a valuable contribution to the field.

---

## [2026-06-20] Re-Review (Daily Reading Agent 批量重读)

### 触发背景
本次为SANA-WM首次重读。在完整阅读full.md（783行）、检查已clone代码仓库、阅读L2 lineage（world-model-sana.md）和L3模块页面（model-efficiency.md, open-source-reproducibility.md, generative-token-based.md）后，发现了review.md初评未覆盖的多个深层技术洞察和跨wiki连接。

### 新洞察

**1. 代数稳定化（Eq. 5）— 被低估的核心贡献**

初评将GDN key scaling视为"消融研究中的一个细节"，但深入阅读Appendix C.1后发现了其数学深度：

- GDN的transition矩阵M_t = γ_t(I - K̂_t β_t K̂_t^⊤)中，tr(A_t) = Σ_s β_{t,s} ‖k̄_{t,s}‖²是有O(S)量级的，如果不对key进行空间归一化，I - A_t可能变得expansive（||M_t||₂ > 1），导致状态爆炸。
- 论文提出的1/√(DS) scaling（vs 标准GDN的1/√D）在数学上等价于"空间均值归一化"——额外除以√S将每个空间token的key能量抑制，使得tr(Â_t) ≤ 1，从而保证||M_t||₂ ≤ γ_t ≤ 1。
- **训练稳定性消融（Fig. 6）**：1/√D（L2归一化）在step 16触发NaN，无归一化在step 1触发NaN，**只有1/√(DS)稳定收敛**。

**连接**：这一发现对遥感时序模型有直接启示——当处理多时相SAR/光学序列时，patch token数S可能极大（如每帧256个patch × 100帧 = 25600），标准的GDN key scaling可能导致不稳定。遥感社区在使用Mamba/GLA/GDN等线性注意力时，应借鉴1/√(DS)的空间归一化。

**2. Context-Parallel训练的数学精确性（Eq. 12-13）**

初评将CP训练列为"效率贡献"，但其数学优雅性值得特别强调：

- 由于GDN的状态更新S_t = S_{t-1}M_t + U_t是**仿射的**，每个GPU shard可以独立计算transition composite C_p = ∏_{t∈T_p} M_t和input composite H_p。
- 前一个rank的状态前缀S̄_{p} = S̄_{p-1}C_{p-1} + H_{p-1}通过all-gather小矩阵（D×D，而非全激活N×S×D）传递，然后在本地作为初始状态。
- **这是"零近似"的分布式训练方案**——与常见的FSDP/Tensor Parallelism不同，CP训练恢复了逐token精确的GDN状态，不引入任何数值误差。

**连接**：遥感FM训练中的分布式策略（如RingMoE的512×Ascend）可以采用类似的"精确前缀组合"来高效处理长时序数据，避免激活通信瓶颈。

**3. Truncated-σ Flow Matching（Eq. 7-11）—— 新颖的refiner公式**

初评将refiner描述为"LoRA-adapted LTX-2"，但Eq. 7-11揭示了一个精巧的数学设计：

- 传统flow matching在[0, σ_max]采样σ_t，但SANA-WM的refiner使用**truncated区间**(0, σ_start]且σ_start = 0.909。
- 源点x_1 = (1-σ_start)x_l + σ_start ε（≈90%噪声+10% stage-1 latent）
- 训练方向v* = (x_1 - x_h)/σ_start指向：从**接近stage-1 latent的噪声**向**高保真目标**的方向

**解释**：这确保refiner学习的是"纠正stage-1的剩余缺陷"而非"从纯噪声重建整个视频"。在数学上，σ越高表示越接近噪声——训练样本集中在σ∈(0, 0.909]意味着模型把所有训练时间花在学习"精化"而非"重建"上。

**Tab. 5的消融**完美验证了这一点：原始LTX-2.3 refiner使用标准flow matching（≈全重建），在简单轨迹上VBench Overall从79.29降至71.37，rotation error从7.59升至8.65。**这是truncated-σ设计必要性的直接证据。**

**4. 修改版VIPE管线的三个"正交"改进**

Appendix B.1揭示的VIPE修改体现了精致的工程设计：

- **深度后端替换**：Pi3X（长序列一致性）+ MoGe-2（逐帧度量尺度）→ 通过加权最小二乘求解逐帧scale factor（逆深度权重w_i = 1/d_i，时间平滑momentum=0.99）。这解决了原始VIPE的"深度估计不稳定"问题。
- **逐帧内参优化**：将(f_x, f_y, c_x, c_y)扩展为(N, V, D) tensor独立优化每帧内参。**关键应用场景**：Internet视频中常见非方形像素和变焦镜头，标准BA共享内参会导致错误。
- **三种标注模式**：默认（Internet视频）、GT-depth（OmniWorld）、GT-pose（Sekai Game, DL3DV），每种模式定制Pi3X/MoGe-2/Umeyama Sim(3)的组合。

**连接**：遥感数据的位姿标注面临类似挑战——不同卫星平台的传感器模型差异巨大（推扫式vs frame式）、光学/SAR的几何模型根本不同。VGGT-Ω + SANA-WM的数据标注管线经验（多级过滤+监督几何分类器+深度融合+BA改进）可以直接指导遥感视频的3D标注。

**5. 3DGS增强管线的"覆盖测试"（Appendix B.2）**

初评未提及的3DGS渲染管线的覆盖保证：

- Splat-coverage test：每10帧子采样Gaussian centers，确保>70%的采样帧有足够splat投影
- Tile coverage check：32×32 tile格点，排除>65%空tile的视角
- >30%近空白帧的clip被丢弃

这一设计确保3DGS渲染的伪训练数据不会产生大量"空白帧"，避免模型学会"无中生有"。

**6. 四阶段渐进训练的数据适配策略**

初评只概述了Stage 1-4，但Appendix C.2的Tab. 7揭示了精细的资源分配：

| 阶段 | 目的 | 数据 | 时长 | 训练步数 | 计算天数 |
|------|------|------|------|----------|----------|
| Stage 1 | Frame-wise GDN | SANA-Video SFT数据 | 5s | 30K | ~2.75天 |
| Stage 2 | Hybrid Attention | SANA-Video SFT数据 | 5s | 30K | ~2天 |
| Stage 3 | Minute-Scale + CamCtrl | SANA-WM数据 | 1min | 31K | ~8天 |
| Stage 4 | SFT | ~50K高质量clips | 1min | 10K | ~2.5天 |

**关键洞察**：Stage 1-2使用SANA-Video的短视频数据（仅为架构适配使用），Stage 3才引入213K SANA-WM数据。Stage 3独占55%的训练计算（8/15天），但使用的数据量最小（仅213K clips）。这意味着**训练时间分配与数据量不成正比**——长序列训练即使在小数据集上也需要大量计算。

**连接**：遥感FM的多阶段训练（如SkySense的3阶段预训练）尚未公布如此精细的资源分配表。SANA-WM的透明报告为遥感FM训练策略提供了方法论模板。

**7. 双向 vs 自回归的质量鸿沟量化（Tab. 9）**

初评注意到"causal variant quality drop"，但Tab. 9提供了精确量化：

| 维度 | Bidirectional | AR (chunk-causal) | 比率 |
|------|--------------|-------------------|------|
| Simple RotErr | 3.11° | 7.59° | 2.44× |
| Hard RotErr | 3.17° | 10.02° | 3.16× |
| Simple ΔIQ | 2.25 | 3.79 | 1.68× |
| Hard ΔIQ | 2.13 | 3.09 | 1.45× |

**关键发现**：RotErr的退化（2.44-3.16×）远大于ΔIQ的退化（1.45-1.68×），即在自回归模式下**相机控制的退化远大于视觉质量的退化**。这暗示GDN的recurrent state在逐chunk重置时丢失的主要是相机运动信息而非外观信息。

**对遥感的启示**：遥感时序预测（如多时相变化检测）中的自回归范式可能面临类似问题——模型在维持长期时序一致性上的退化可能在"空间布局"维度和"传感器变化"维度上不均衡。

### 代码重检（补充review.md已有代码评审）

在重新检查已clone代码仓库后，补充以下观察：

1. **`train_video_scripts/train_longsana.py`的CP训练实现**：该文件实现了Sec. C.1的Context-Parallel训练。代码中的`_compute_gdn_composite`函数仅在80行左右实现了Eq. 12-13的完整数学推导——这种简洁性是良好工程设计的标志。

2. **GDN自定义Triton kernel的缺失确认**：review.md代码评审已指出GDN实现"opaque"，重检确认**代码仓库中未见独立的GDN triton kernel源文件**。`diffusion/model/nets/sana_blocks.py`中的`CachedCausalAttention`是Python实现的cumulative linear attention，而非论文描述的GDN with gating + delta rule。**GDN的核心贡献在代码层面不可复现。**

3. **`configs/sana_video_config/longsana/`的多配置系统**：三个分离的YAML配置文件（`ode.yaml`, `self_forcing.yaml`, `longsana.yaml`）对应Stage 1/2/3-4，互不耦合。这种config-driven设计使不同阶段的超参数隔离清晰。

4. **SANA-WM代码是更大Sana仓库的一部分**：`diffusion/longsana/`仅是`NVlabs/Sana`仓库的一个子目录。关键的Sana-Video backbone（`diffusion/model/nets/sana_blocks.py`）在仓库顶层，而非longsana子目录。这意味着**无法独立评估"仅SANA-WM"的贡献**——它们深度依赖于Sana-Video的全栈基础设施。

### 引文挖掘（补充review.md已有citation mining）

从深入阅读Appendix和实验细节中，发现以下初评遗漏的高价值论文：

1. **DC-VideoGen (Chen et al., 2025)** [84] — SANA-WM使用其高压缩VAE的前身，是高效视频生成的另一条路径
2. **Self-Forcing (Huang et al., 2025)** [28] — SANA-WM的蒸馏方案的基础，bridging autoregressive diffusion的train-test gap
3. **LongLive (Yang et al., 2025)** [29] — 实时交互长视频生成，可对比SANA-WM的实时部署方向
4. **Flow Matching (Lipman et al., 2022)** [101] — SANA-WM训练框架的数学基础
5. **DiT (Peebles & Xie, 2023)** [100] — SANA-WM backbone的DiT架构基础
6. **Hybrid Attention LLMs (Qwen3-Next, Kimi Linear, etc.)** [79-81] — SANA-WM的GDN/softmax混合设计的LLM先例

**已被收录的跨引用确认：**
- DC-AE (Chen et al., 2024) [83] — review已引用
- GDN (Yang et al., 2024) [11] — review已引用
- UCPE (Zhang et al., 2025) [12] — review已引用

### 跨Wiki连接

**L2_lineage/computer-vision/generation/world-model-sana.md**
- 补充GDN key scaling的1/√(DS)代数稳定化作为"关键概念"
- 补充Context-Parallel训练的精确状态前缀组合作为"训练最佳实践"
- 补充truncated-σ flow matching的数学设计
- 增加双向/自回归质量鸿沟的精确量化数据

**L3_module/model-efficiency.md**
- SANA-WM的混合GDN/softmax注意力（15个GDN+5个softmax块）作为"架构效率"的新案例
- 单GPU推理（51.1GB H100, 34s RTX 5090 NVFP4）作为"推理效率"的标杆数据
- 15天64 H100训练作为"训练效率"的中等门槛（低于RingMoE的512×Ascend但高于SoftCon的8×A100）
- 蒸馏4步+attention-sink+local window+NVFP4的多层效率叠加策略

**L3_module/open-source-reproducibility.md**
- SANA-WM作为**Apache 2.0许可的完全开源世界模型**与遥感FM闭源趋势形成对比
- **但**GDN核心（gating + delta rule）在代码中不可见→"部分可复现"的灰色地带
- HuggingFace权重可用（2.6B checkpoints），训练configs完整→训练可复现但需要64 H100集群
- Benchmark构建代码未发布（仅论文描述）→评估不可完全复现

**L3_module/generative-token-based.md**
- SANA-WM的diffusion-based视频生成范式与TerraMind的token-based生成范式形成对比
- SANA-WM使用连续latent（LTX2 VAE）+ diffusion，TerraMind使用离散token（FSQ）+ 交叉熵
- 两种范式的"相机控制"设计对比：SANA-WM的UCPE+Plücker双分支 vs TerraMind的any-to-any条件生成
- **连接**：SANA-WM的refiner概念——"在扩散latent空间中纠正剩余缺陷"——可能启发TerraMind的"递归测试时增强"

**L3_module/pretraining-paradigm.md**
- SANA-WM的四阶段渐进训练（VAE适应→架构适应→长序列+相机控制→SFT）作为遥感FM多阶段预训练的方法论参考
- Stage 1-2使用非目标数据（SANA-Video的短视频）做架构适配→遥感FM可在ImageNet或多模态数据上做"架构预热"
- 213K clips的数据规模vs 64 H100的15天训练→明确显示计算瓶颈在序列长度而非数据量

### 跨论文连接（与同批次VGGT-Ω的对比）

1. **数据标注管线的保守主义共性**：VGGT-Ω "优先质量而非数量"（40M→0.8M, 2%通过率）和SANA-WM的多级过滤+手工阈值管线的共享哲学：宁可少量高质量标注，不要大量噪声。两个团队在不同领域独立得出相同结论。

2. **选择性注意力瓶颈**：VGGT-Ω的register attention（25%全局注意力→register bottleneck）与SANA-WM的GDN/softmax混合（20层中15个GDN+5个softmax）都是"选择性信息交换"的体现——不总需要所有token互相attend。

3. **失败实验的透明度**：VGGT-Ω在Section 5中报告了多个失败的self-supervised方案，SANA-WM在Tab. 5中报告了原始LTX-2.3 refiner如何破坏性能。两篇论文共享了**科学坦诚**——这在顶会论文中仍然罕见。

4. **"简单性优先"vs"效率优先"**：VGGT-Ω放弃4-6%额外性能以保持架构简单性；SANA-WM在每个设计层面优先考虑效率。两条路径的差异源于目标：前者追求"社区可构建的基础模型"，后者追求"单GPU可运行的实用模型"。

5. **合成数据的互补角色**：VGGT-Ω推荐80%合成+20%真实，SANA-WM的3DGS增强从DL3DV静态场景生成合成训练视频。两个独立工作都发现合成数据在训练中的关键作用不可替代。

### 评分确认
Score维持4/5。本次重读的最重要发现是：(1)GDN key scaling 1/√(DS)的代数设计对长序列稳定性的决定性作用——这对遥感时序模型有直接方法论启示；(2)truncated-σ flow matching作为"精化"而非"重建"的数学优雅性；(3)GDN核心实现在代码中的缺失——在开源声明与实际可复现性之间存在显著差距。

---

*Re-review from full close-reading (full.md 783行 + Appendix全部 + 代码重检 + L2/L3交叉分析)*
