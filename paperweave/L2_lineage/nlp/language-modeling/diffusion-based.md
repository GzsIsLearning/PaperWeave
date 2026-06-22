---
title: Diffusion Language Models
created: 2026-05-20
updated: 2026-05-27
type: lineage
domain: nlp
task: language-modeling
approach: diffusion-based
---

# Diffusion Language Models

## Overview

Diffusion Language Models (DLMs) extend diffusion and flow-based generative processes to text, offering an alternative to autoregressive language modeling. They fall into two main categories: **discrete DLMs**, which define corruption and denoising directly over categorical token distributions (via absorbing, uniform, or masked state transitions), and **continuous DLMs**, which embed tokens into a continuous space and perform denoising there before discretizing back to text. Continuous DLMs can be further subdivided into embedding-space methods, simplex-based methods, and latent diffusion approaches.

Cola DLM (Continuous Latent Diffusion Language Model) advances the hierarchical latent-variable approach: a Text VAE learns a stable text↔latent mapping, a block-causal DiT models the latent prior via Flow Matching, and the conditional decoder realizes tokens. At ~2B parameters, Cola DLM demonstrates strong scaling behavior on reasoning-intensive tasks and includes a preliminary unified text-image extension, validating the generality of the framework beyond pure text.

ELF (Embedded Language Flows) represents a breakthrough in the continuous DLM paradigm: it applies continuous-time Flow Matching directly in a frozen contextual embedding space, keeps the entire denoising trajectory continuous, and discretizes to tokens only at the final decoding step via a shared-weight network. This minimalist design enables ELF to achieve strong generative perplexity (24 at 32 sampling steps, 105M params) using 10× fewer training tokens than leading discrete and continuous DLMs.

## Papers

| Model | Year | Score | Summary |
|-------|------|-------|---------|
| Cola DLM | 2026 | 3 | Hierarchical latent diffusion: Text VAE + block-causal DiT, latent prior transport via Flow Matching, ~2B params, multimodal extension |
| ELF | 2026 | 4 | Continuous DLM breakthrough: Flow Matching in embedding space, no per-step discretization, 10× fewer training tokens, outperforms discrete/continuous DLMs at smaller scale |
| MDLM | 2024 | 4 | Masked discrete DLM using absorbing-state diffusion; Gen. PPL ~40 @ 512 steps, 170M params on OWT |
| Duo | 2025 | 4 | Uniform-state discrete DLM with dual diffusion; allows repeated token revision during sampling |
| FLM / FMLM | 2026 | 3 | Concurrent continuous DLM with per-step token-level cross-entropy along flow trajectory; introduces distillation for few-step generation |
| LangFlow | 2026 | 3 | Continuous flow-based LM using Bregman-divergence regression; rivals discrete methods |
| Diffusion-LM | 2022 | 3 | First continuous DLM; Gaussian noise on embeddings, per-step rounding with cross-entropy |
| CDCD | 2022 | 3 | Early continuous DLM using score-based ODEs in embedding space with per-step token supervision |
| LD4LG | 2023 | 3 | Latent diffusion for language: compressed latent space + separate decoder |
| D3PM | 2021 | 4 | Foundational discrete diffusion framework defining general categorical corruption processes |

## Key Concepts

### Discrete vs Continuous DLM

**Discrete DLMs** (e.g., MDLM, Duo, D3PM) operate directly over categorical token variables. They define corruption processes over discrete states — absorbing into a [MASK] token, diffusing toward a uniform distribution, or transitioning via structured kernels. Generation proceeds by iteratively unmasking or revising tokens. These have been the dominant paradigm for diffusion-based language modeling due to stronger empirical performance prior to ELF.

**Continuous DLMs** (e.g., ELF, Diffusion-LM, CDCD, FLM) map discrete tokens into a continuous embedding space and perform denoising there. The key challenge is the continuous-to-discrete interface. Prior methods used per-step discretization losses (cross-entropy at intermediate steps) or separate decoders. ELF's insight: keep the trajectory entirely continuous and discretize only at the final step.

### x-prediction vs v-prediction

ELF uses **x-prediction** — predicting the clean embedding directly — rather than the standard Flow Matching **v-prediction** (predicting velocity). This is critical for the shared-weight denoiser-decoder design:

- **x-prediction** naturally aligns the denoising objective (MSE on clean embeddings) with the decoding objective (cross-entropy on token logits derived from predicted embeddings). The same network weights serve both purposes.
- **v-prediction** degrades at higher embedding dimensions and compromises weight sharing with the final discretization step.
- **ε-prediction** (noise prediction) collapses entirely in this setting.

Empirically, ELF shows that x-prediction + bottleneck projection (512→128→768) is the optimal combination.

### Mode Token

ELF conditions the shared-weight network on a binary **mode token** that distinguishes between two operating modes:
- **"Denoise" mode** (t < 1): Predict clean embeddings x via MSE loss on the flow trajectory.
- **"Decode" mode** (t = 1): Reconstruct discrete tokens via cross-entropy loss through an unembedding layer.

Both modes share the same transformer weights. Training interleaves the two branches in an 80:20 ratio (denoise:decode). This single-network design eliminates the need for a separately trained decoder.

### Self-Conditioning + CFG

ELF naturally supports **classifier-free guidance (CFG)** because it operates over continuous velocities/embeddings (unlike discrete DLMs where CFG remains challenging). CFG enables a controllable quality-diversity trade-off:

- **Self-conditioning**: A second forward pass conditioned on the previous step's prediction provides the conditioning signal c for CFG without requiring class labels.
- **Training-time CFG**: Adopted from image-domain methods (Mean Flows), ELF trains the network to directly model the post-CFG velocity, avoiding two forward passes at inference.
- **In-context conditioning**: Control tokens (time, CFG scale, mode) are prepended to the sequence instead of using adaLN-Zero, reducing parameter count while maintaining performance.

## Design Space

### Discrete DLM vs Continuous DLM vs Autoregressive

| Dimension | Discrete DLM | Continuous DLM (ELF-style) | Autoregressive |
|-----------|-------------|---------------------------|----------------|
| **State space** | Categorical tokens | Continuous embeddings | Continuous logits (next-token) |
| **Corruption** | Mask/absorb/uniform transitions | Gaussian noise on embeddings | N/A (left-to-right) |
| **Generation order** | Iterative refinement (any order) | Iterative refinement (any order) | Left-to-right (fixed order) |
| **CFG support** | Difficult, limited effectiveness | Natural, straightforward | Requires classifier or RLHF |
| **Sampling steps** | 128-512+ | 32-64 (ELF); 1 (distilled) | 1 token per step (L steps) |
| **Data efficiency** | Low (~500B+ tokens) | High (45B tokens for ELF) | Moderate |
| **Quality (Gen. PPL)** | ~40 @ 512 steps (MDLM) | ~24 @ 32 steps (ELF) | Best (no degradation) |
| **Parameter efficiency** | Moderate | High (shared denoiser-decoder) | High |
| **Training complexity** | Moderate | Moderate (two-branch loss) | Simple (next-token CE) |
| **Inference parallelism** | Full sequence parallel | Full sequence parallel | Sequential (causal) |
| **Distillation needed** | Yes (for few-step) | No (ELF matches distilled at 32 steps) | N/A |

### Key Design Choices Within Continuous DLMs

1. **Embedding strategy**: Frozen pretrained contextual (T5) > trained-from-scratch contextual > pretrained token embeddings > learned embeddings > random Gaussian.
2. **Decoder design**: Shared-weight denoiser-decoder > two-stage separate decoder (both work well, shared is simpler and extends further).
3. **Sampler**: SDE-inspired (with noise re-injection) beats ODE in few-step regimes; ODE is better at many steps.
4. **Prediction target**: x-prediction > v-prediction > ε-prediction (for shared-weight designs).
5. **Bottleneck**: Lower-dimensional bottleneck (e.g., 512→128→768) improves performance by encouraging denoising on a low-dimensional manifold.

## Best Practices

1. **Use frozen pretrained contextual embeddings** (T5 encoder) as the continuous representation space. They provide a rich bidirectional context that learnable embeddings struggle to match, and freezing avoids joint optimization difficulties.

2. **Adopt x-prediction with a bottleneck projection** when sharing weights between denoising and decoding. The bottleneck reduces the effective dimensionality of the embedding space, making denoising easier and improving the x-prediction signal.

3. **Train a shared-weight denoiser-decoder** rather than a two-stage pipeline. Interleave MSE (denoising) and CE (decoding) losses in an 80:20 ratio, using a binary mode token to distinguish branches. This simplifies the pipeline and achieves a better quality-diversity frontier.

4. **Use SDE-inspired sampling for few-step generation** (8-32 steps) and ODE sampling for higher-step budgets. The SDE variant injects small per-step noise that corrects error accumulation in deterministic trajectories.

5. **Apply training-time CFG** with self-conditioning. Randomly sample CFG scales from a power distribution (e.g., [0.5, 5.0]) during training so the model learns to directly output post-CFG velocities, avoiding two forward passes at inference.

6. **Use in-context conditioning** (prepended control tokens) instead of adaLN-Zero when handling heterogeneous conditions (time, CFG scale, mode). This reduces parameter count and maintains or improves generation quality.

7. **Use a logit-normal time schedule** for both training and inference. This concentrates sampling steps at noisier regimes (t near 0), matching the distribution where finer discretization is most beneficial.

8. **Optimize with Muon optimizer.** ELF finds Muon (learning rate 0.002, batch size 512) substantially outperforms AdamW for this setting.

## Pitfalls

1. **Do not use per-step discretization losses.** Applying cross-entropy at intermediate steps ties the continuous trajectory to categorical predictions, reducing the flexibility of flow dynamics. ELF's key finding is that intermediate token-level supervision is unnecessary.

2. **Avoid v-prediction when sharing denoising-decoding weights.** The velocity field does not naturally map to token logits; x-prediction aligns cleanly with the decoding objective. v-prediction with shared weights performs poorly in high-dimensional embedding spaces.

3. **Do not use a separate decoder unless necessary.** Two-stage training (train decoder, freeze, train denoiser) works but adds complexity and slightly underperforms the simpler shared-weight design.

4. **Do not use learnable embeddings.** Jointly optimizing the embedding matrix and the denoiser is difficult and yields the worst performance among embedding choices.

5. **Do not neglect the decoding branch corruption.** At the final step (t=1), clean embeddings produce a trivial input. Apply per-token corruption with a carefully tuned noise schedule to create a nontrivial learning signal for the decoder.

6. **Data efficiency claims require careful attribution.** ELF's 10× training token reduction vs. baselines conflates multiple factors: (a) smaller dataset (OWT: 9B tokens), (b) fewer epochs (5 vs. ~58 for MDLM), and (c) better optimizer/architecture choices. A controlled token-matched ablation would clarify how much comes from the method vs. training budget choices.

7. **Generative perplexity under GPT-2 has limitations.** GPT-2 is an autoregressive model that may systematically favor autoregressive-like generation patterns. Unigram entropy is a weak diversity metric — n-gram entropy, self-BLEU, or Dist-N would be more informative.

8. **Be cautious about TPU-specific results.** ELF was trained on TPU v5p × 64 (~$10K+/hr). Reproducing training results on GPUs may require adaptation, and the reported performance may not transfer exactly.

## Relevance

ELF establishes that **continuous diffusion language models can be highly competitive** with — and even outperform — the discrete DLM paradigm that has dominated recent work. The key takeaway for diffusion-based language modeling is that **keeping the trajectory continuous throughout and discretizing only at the end** is a simple yet effective design principle. This enables direct transfer of well-understood techniques from image-domain diffusion (Flow Matching, CFG, x-prediction, SDE/ODE samplers) to language, opening up a rich design space for future work.

For the broader NLP community, ELF demonstrates:
- **Data efficiency**: Strong language generation quality from 45B training tokens (vs. 500B+ for comparable discrete DLMs), suggesting continuous formulations may be inherently more sample-efficient.
- **Inference efficiency**: 32 sampling steps without distillation matches or exceeds 128-512 step discrete DLMs, lowering the inference cost barrier.
- **CFG for text**: Continuous embedding space makes guidance techniques directly applicable, enabling controllable quality-diversity trade-offs that remain challenging for discrete methods.
- **Scaling potential**: ELF scales well from 105M to 652M parameters, suggesting the approach will benefit from further scaling to 1B+ parameter regimes.

The primary limitations are the narrow task evaluation (unconditional OWT, WMT14 translation, XSum summarization) and the absence of experiments on instruction following, code generation, or QA benchmarks. Future work should extend ELF-style continuous DLMs to larger scales, broader tasks, and integration with multimodal settings.
