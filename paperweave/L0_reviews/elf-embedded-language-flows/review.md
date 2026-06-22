---
slug: elf-embedded-language-flows
title: "ELF: Embedded Language Flows"
authors:
  - Keyue Hu
  - Linlu Qiu
  - Hanhong Zhao
  - Yiyang Lu
  - Tianhong Li
  - Yoon Kim
  - Jacob Andreas
  - Kaiming He
year: 2026
venue: arXiv (cs.CL)
arxiv_id: "2605.10938"
code_url: "https://github.com/lillian039/ELF"
institutions:
  - MIT
tags:
  - diffusion-LM
  - language-model
  - flow-matching
  - continuous-diffusion
type: method
license: Apache-2.0
score:
  contribution: 4
  soundness: 4
  relevance: 3
  overall: 4
---

## TL;DR

ELF is a continuous diffusion language model that applies continuous-time Flow Matching directly in the embedding space, discretizing to tokens only at the final step. It achieves strong generative perplexity (24 @ 32 steps, 105M params) with 10× fewer training tokens than prior discrete/continuous DLMs, and naturally supports classifier-free guidance (CFG) due to its continuous formulation.

## Abstract One-Liner

ELF shows that continuous diffusion language models can be made highly effective with minimal adaptation to the discrete domain — simply denoise in embedding space and decode only at t=1 — outperforming both discrete and continuous DLMs.

## Key Insights

1. **Stay continuous, discretize at the end.** Unlike prior continuous DLMs that apply per-step rounding or cross-entropy losses, ELF trains and samples entirely in the embedding space, only mapping to tokens at the final step via a shared-weight unembedding layer. This maximal flexibility is the core insight.

2. **x-prediction is critical for shared weights.** Predicting clean embeddings (x rather than v or ε) allows the same network weights to serve both the denoising objective (MSE) and the decoding objective (CE at t=1). v-prediction degrades at higher embedding dimensions; ε-prediction collapses entirely.

3. **Shared-weight denoiser-decoder eliminates separate decoders.** The final Flow Matching step (t→1) is naturally repurposed as a decoding step. A binary "mode" token disambiguates denoising vs. decoding, and the two branches are trained jointly in ratio 80:20.

4. **Flow Matching enables natural CFG.** Because ELF operates on continuous velocities/embeddings, classifier-free guidance applies straightforwardly — both inference-time and training-time variants work well, enabling a controllable quality-diversity trade-off. This is harder with discrete DLMs.

5. **SDE-inspired sampling beats ODE in few-step regimes.** Injecting small per-step noise and shifting the time variable backwards substantially reduces generative perplexity at 8-32 steps, likely by correcting error accumulation in deterministic trajectories.

6. **In-context conditioning is parameter-efficient.** Preprending control tokens (time, CFG scale, mode) instead of adaLN-Zero reduces ELF-B from 148M to 105M params while slightly improving generation quality.

7. **Data efficiency is striking but not apples-to-apples.** ELF uses ~45B tokens (≈9B OWT × 5 epochs) vs. ~524B for baselines — but baselines train for more epochs on the same data. The real efficiency gain is in *optimizer+architecture* choices (Muon, bottleneck, contextual embeddings), not data scarcity per se.

## Review

### Contribution

**Score: 4/5 — Strong conceptual contribution with practical impact.**

This paper makes a clean and compelling contribution: it demonstrates that the simplest possible continuous diffusion formulation for language — Flow Matching directly on frozen T5 embeddings, with discretization only at the final step — works surprisingly well. This is a non-trivial finding given the community's widespread belief that discrete DLMs are fundamentally more suitable for language.

The paper's primary contributions are:
1. **A minimalist design** that challenges the status quo in diffusion LMs. The shared-weight denoiser-decoder is elegant and avoids the complexity of separate encoders/decoders.
2. **Empirical demonstration** that continuous DLMs can outperform discrete DLMs (MDLM, Duo) and other continuous DLMs (FLM, LangFlow) at comparable or smaller model sizes.
3. **A clean adaptation of image-domain techniques** (CFG, x-prediction, Flow Matching) to language, showing that the continuous formulation enables direct transfer of these tools.

The value is amplified by the strength of the results: 24 generative perplexity at 32 steps with 105M params and 45B training tokens is genuinely impressive compared to prior work.

However, the contribution is somewhat incremental relative to the concurrent works (FLM, LangFlow, DFM, CFM) that also explore flow-based language modeling. ELF's distinguishing feature — avoiding per-step discretization — is meaningful but not a paradigm shift. The paper would benefit from positioning its *negative result* (that per-step token supervision is unnecessary) more prominently as a scientific finding.

### Soundness

**Score: 4/5 — Thorough experiments, solid methodology, minor concerns.**

The experimental methodology is generally sound:
- **Evaluation protocol** follows established conventions (GPT-2 Large perplexity, unigram entropy on OWT) making results directly comparable to MDLM and Duo.
- **Ablations are comprehensive** — prediction targets (x/v/ε), bottleneck dimensions, embedding choices, decoding strategies, samplers, optimizers, CFG scales, time schedules, denoising probability, conditioning strategies. This is one of the more thoroughly ablated DLM papers.
- **Statistical reporting** includes standard errors over 6 seeds (Tab. 6), though only for the final system-level comparison, not ablations.
- **Conditional generation results** (WMT14 De-En, XSum) are competitive, with careful reproduction of baselines.

**Concerns:**

1. **Data efficiency claim is misleading.** The 10× training token reduction (45B vs 524B) is real but conflates multiple factors: (a) OWT is a smaller dataset (9B tokens) than the full training mixtures used by baselines; (b) baselines train for 1M steps (batch 512, seq 1024 = 524B tokens), while ELF trains 5 epochs on 9B = 45B. The efficiency comes partly from the method and partly from the *choice to train fewer epochs on a smaller dataset*. A controlled ablation where both train for the same number of tokens would clarify this.

2. **Limited task diversity.** Three tasks (unconditional OWT, WMT14, XSum) is a narrow evaluation. No experiments on question answering, code generation, or instruction following. Given the scaling to 652M params, evaluation on standard NLG benchmarks (e.g., MT-Bench, AlpacaEval) would strengthen claims.

3. **No sampling diversity beyond argmax.** The decoding step uses greedy argmax on logits. This discards potentially useful stochasticity in the final discretization. Beam search, nucleus sampling, or temperature scaling at the decoding step are not explored.

4. **Perplexity metric limitations.** Generative perplexity under GPT-2 Large is a reasonable proxy, but GPT-2 is an autoregressive model that may favor autoregressive-like patterns. Reported unigram entropy is a weak diversity metric — n-gram entropy, self-BLEU, or Dist-n would be more informative.

5. **Reproducibility concerns.** Training requires TPU v5p × 64 (≈$10K+/hr), which is inaccessible to most researchers. While the code is clean and checkpoints are released, independent verification of training results is practically infeasible.

### Relevance

**Score: 3/5 — Moderate direct relevance to recommender systems; high indirect relevance.**

**Direct relevance (low):** ELF is a language generation model. Recommender systems typically use discriminative or retrieval-based models (collaborative filtering, content-based, sequence-aware). ELF does not directly apply to rating prediction, item ranking, or user embedding.

**Indirect relevance (high):**
- **Generative models for recommendation** are emerging (e.g., diffusion-based recommender systems, generative retrieval). ELF's flow matching + continuous embedding paradigm could influence how generative recommenders handle discrete user-item interactions.
- **Conditional generation** (text-to-text) is directly relevant for tasks like review generation, explanation generation, and conversational recommendation.
- **The shared-weight encoder-decoder** design could inspire more parameter-efficient architectures for recommendation.
- **CFG-style control** over generation quality vs. diversity is directly applicable to recommendation diversity objectives.
- **The SDE/ODE sampling trade-off** has parallels in exploration/exploitation in RL-based recommendation.

### Overall

**Score: 4/5 — A strong, well-executed paper that makes a clear case for continuous diffusion LMs.**

ELF is a technically solid paper from a top lab (Kaiming He group at MIT) that demonstrates a counterintuitive finding: the simplest continuous formulation works best. The writing is clear, the ablations are thorough, and the results are convincing within their scope. The code release is high quality (JAX/Flax + HuggingFace integration).

The paper's main limitations are the narrow task evaluation and the somewhat inflated data efficiency claim. Scaling to 7B+ parameters and diverse NLG benchmarks would substantially strengthen the case. As a 2026 method paper, it makes a meaningful step forward in the DLM literature and will likely influence subsequent work on continuous diffusion for language.

For recommender systems researchers, the key takeaways are the flow matching framework and the quality-diversity control via CFG — tools that could generalize beyond language to any discrete sequential generation problem.

---

## Code Review

### Overview

The codebase is a well-structured JAX/Flax implementation of ELF, trained on TPUs. It comprises ~2,500 lines across 15 source files, plus YAML configs for training and sampling. A PyTorch branch is also available. The code is MIT-licensed and available at [github.com/lillian039/ELF](https://github.com/lillian039/ELF).

### Architecture & Design

**Strengths:**

1. **Clean factorization.** The model (`modules/model.py`), training loop (`train.py`), training step (`train_step.py`), sampling (`utils/sampling_utils.py`, `utils/generation_utils.py`), and data processing (`utils/data_utils.py`) are well-separated. Each file has a clear responsibility.

2. **Pseudocode matches implementation.** The paper's Algorithm 1-6 pseudocode closely mirrors the actual code in `train_step.py` and `sampling_utils.py`, making the paper an excellent companion for understanding the implementation.

3. **Config system.** The YAML + Python dataclass system (`configs/config.py`) with CLI overrides (`--config_override field=value`) is well-designed for experiment management. Sampling configs are decoupled from training configs, which is a nice touch.

4. **Modern transformer components.** The model uses SwiGLU FFN, RMSNorm, RoPE, and qk-norm — a sensible set of modern improvements. The `ELFBlock` is standard but clean.

5. **In-context conditioning.** Prependling control tokens (time, CFG scale, mode) instead of adaLN-Zero is an interesting design choice that reduces parameter count while maintaining or slightly improving performance. The code handles this elegantly through concatenation.

6. **Efficient sampling.** Uses `jax.lax.scan` for the sampling loop, which compiles to an efficient XLA computation. Both ODE (Euler) and SDE samplers are implemented as scan-compatible step functions.

7. **Checkpointing.** Supports auto-resume from latest checkpoint, HuggingFace upload, and EMA parameter tracking. The `find_latest_checkpoint()` logic handles multi-file checkpoints gracefully.

**Areas for improvement:**

1. **TPU-only constraint.** The code pins `jax[tpu]==0.4.38` and uses TPU-specific operations. While a PyTorch branch exists, the primary codebase is not easily runnable on GPUs. A `jax[cuda]` fallback or clearer GPU setup documentation would help accessibility.

2. **No unit tests.** The repository contains zero test files (`test_*.py`). For a research codebase this is common, but given the complexity of the diffusion pipeline (ODE/SDE steps, self-conditioning, CFG), tests for edge cases (e.g., t=0, t=1, γ=0, CFG weight boundaries, label dropping) would improve reliability and make contributions easier.

3. **Metric computation coupling.** `generation.py` handles both generation *and* metric computation (PPL, BLEU, ROUGE). This is fine for research but could be separated into evaluation-only scripts. The `gpt2-large` PPL evaluation requires loading a separate 774M param model, which may OOM on smaller TPU/GPU setups.

4. **WandB dependency.** Although `use_wandb: false` disables it, wandb is imported at module level in both `train.py` and `generation.py`. A more graceful optional dependency pattern (e.g., lazy import with a wrapper) would be cleaner.

5. **Hardcoded optimizer paths.** The Muon optimizer is implemented inline rather than imported from optax. This is understandable (Muon is recent), but means the code may diverge from optax's implementation as Muon evolves. No test verifies that Muon matches the reference implementation.

6. **Gradient accumulation.** Implemented via manual `jax.lax.cond` on EMA updates rather than using optax's `MultiSteps`. The custom logic (`is_optimizer_step`) works correctly but adds complexity that could be delegated to optax.

7. **Bottleneck projection.** The `BottleneckTextProj` layer is used but located in `layers.py` (not reviewed in full). The projection from 512→128→768 is a critical design element that deserves more visibility in the code structure — perhaps a comment explaining the rationale (low-dimensional manifold hypothesis).

8. **Minor: Label drop masking.** The conditional label dropping logic (lines 47-52 in `train_step.py`) uses `(1 - cond_mask)[:, :, None] * cond_mask[:, None, :]` to create a block mask. This is correct but non-obvious — a brief comment explaining the block-diagonal structure would help.

### Reproducibility Assessment

**What's provided:**
- ✅ Full training code
- ✅ Pre-trained checkpoints on HuggingFace (ELF-B/M/L for OWT, ELF-B for WMT14/XSum)
- ✅ Inference scripts with expected metrics
- ✅ Training configs for all reported models
- ✅ Data loading from pre-tokenized HuggingFace datasets
- ✅ Sampling configs matching paper settings

**What's missing:**
- ❌ No Docker/conda environment file for exact dependency reproduction
- ❌ No training logs or wandb runs linked
- ❌ The T5 encoder checkpoint is distributed as a `.pkl` file — opaque binary format
- ❌ Training requires TPU v5p × 64 (≈1.5h/epoch → ~7.5h total for OWT ELF-B), which is not accessible to most reviewers

**Verdict:** The code is well-structured and the provided checkpoints allow verification of inference results. Full training reproducibility is limited by hardware requirements, which is acknowledged by the authors.

### Verdict: Good research code.

The implementation is clean, matches the paper well, and provides sufficient artifacts (checkpoints, configs) for verification. Missing tests and TPU-specific dependencies are standard trade-offs in research code. The PyTorch branch partially mitigates the hardware concern.

---

## Citation Mining

### Group 1: Direct Precursors — Foundation Methods

**1. Flow Matching for Generative Modeling (Lipman et al., ICLR 2023)**
The theoretical backbone of ELF. Defines continuous-time flow matching with conditional vector fields. ELF directly adopts the rectified-flow interpolant `z_t = t*x + (1-t)*ε`. The x-prediction variant used by ELF builds on extensions of this framework.
- **Citation:** Lipman, Y., Chen, R.T.Q., Ben-Hamu, H., Nickel, M., & Le, M. (2023). Flow matching for generative modeling. *ICLR 2023*.
- **Relation:** Core method — ELF would not exist without this work.

**2. Rectified Flow (Liu et al., ICLR 2023)**
Independently proposes the same linear interpolation framework for flow-based generation. ELF uses the "rectified flow" naming and the straight-path ODE formulation.
- **Citation:** Liu, X., Gong, C., & Liu, Q. (2023). Flow straight and fast: Learning to generate and transfer data with rectified flow. *ICLR 2023*.
- **Relation:** Core method — ELF cites this alongside Lipman et al. as the foundation.

**3. Back to Basics: Let Denoising Generative Models Denoise (Li & He, 2025)**
Direct predecessor from the same lab (Kaiming He group). Shows that simple x-prediction in the data space, with a bottleneck, works better than complex noise schedules or v/ε-prediction for high-dimensional data. ELF directly adopts the bottleneck design and x-prediction from this work, and cites it heavily.
- **Citation:** Li, T., & He, K. (2025). Back to basics: Let denoising generative models denoise. *arXiv preprint arXiv:2511.13720*.
- **Relation:** Immediate precursor — ELF is "language version of Back to Basics."

### Group 2: Discrete Diffusion Language Models — The Baselines

**4. Simple and Effective Masked Diffusion Language Models — MDLM (Sahoo et al., NeurIPS 2024)**
A leading discrete DLM using absorb/replace masks. ELF's primary baseline on unconditional and conditional generation. MDLM achieves Gen. PPL ≈ 40 at 512 steps with 170M params; ELF beats this at 32 steps with 105M params.
- **Citation:** Sahoo, S., Arriola, M., Schiff, Y., Gokaslan, A., Marroquin, E., Chiu, J., Rush, A., & Kuleshov, V. (2024). Simple and effective masked diffusion language models. *NeurIPS 2024*.
- **Relation:** Direct comparison — ELF outperforms MDLM with fewer parameters and steps.

**5. The Diffusion Duality — Duo (Sahoo et al., ICML 2025)**
A uniform-state discrete DLM that diffuses toward uniform categorical distributions. ELF's second primary baseline. Duo allows repeated token revision during sampling. ELF shows better perplexity and efficiency.
- **Citation:** Sahoo, S.S., Deschenaux, J., Gokaslan, A., Wang, G., Chiu, J., & Kuleshov, V. (2025). The diffusion duality. *ICML 2025*.
- **Relation:** Direct comparison — ELF outperforms Duo with 10× fewer training tokens.

**6. Structured Denoising Diffusion Models in Discrete State-Spaces — D3PM (Austin et al., NeurIPS 2021)**
The foundational paper on discrete diffusion models. Defines general categorical corruption processes (absorbing, uniform). ELF discusses this as the origin of discrete DLMs.
- **Citation:** Austin, J., Johnson, D.D., Ho, J., Tarlow, D., & Van Den Berg, R. (2021). Structured denoising diffusion models in discrete state-spaces. *NeurIPS 2021*.
- **Relation:** Background — early discrete DLM that established the paradigm.

### Group 3: Continuous Diffusion Language Models — Competitors and Context

**7. Diffusion-LM (Li et al., NeurIPS 2022)**
The first continuous DLM, adding Gaussian noise to token embeddings and denoising with per-step rounding. ELF improves on this by removing per-step discretization and using Flow Matching instead of DDPM.
- **Citation:** Li, X., Thickstun, J., Gulrajani, I., Liang, P.S., & Hashimoto, T.B. (2022). Diffusion-LM improves controllable text generation. *NeurIPS 2022*.
- **Relation:** Pioneer — ELF is a direct evolution of this approach.

**8. Flow Map Language Models — FLM / FMLM (Lee et al., 2026)**
Concurrent work that also applies Flow Matching to language. Uses per-step token-level cross-entropy along the flow trajectory (unlike ELF). Introduces distillation (FMLM) for few-step generation. ELF shows better data efficiency without distillation.
- **Citation:** Lee, C., Yoo, J., Agarwal, M., Shah, S., Huang, J., Raghunathan, A., Hong, S., Boffi, N.M., & Kim, J. (2026). Flow map language models: One-step language modeling via continuous denoising. *arXiv preprint arXiv:2602.16813*.
- **Relation:** Direct concurrent — key point of differentiation.

**9. LangFlow (Chen et al., 2026)**
Concurrent work on continuous flow-based language modeling. Uses Bregman-divergence regression. Also shows continuous diffusion rivals discrete methods. ELF provides a simpler formulation (standard Flow Matching + MSE) with stronger results.
- **Citation:** Chen, Y., Liang, C., Sui, H., Guo, R., Cheng, C., You, J., & Liu, G. (2026). LangFlow: Continuous diffusion rivals discrete in language modeling. *arXiv preprint arXiv:2604.11748*.
- **Relation:** Direct concurrent — ELF achieves stronger results with simpler design.

**10. Latent Diffusion for Language Generation — LD4LG (Lovelace et al., NeurIPS 2023)**
Applies Latent Diffusion Models (LDM) to language, using a compressed latent space with a separate decoder. ELF contrasts with this approach by not requiring a separate decoder and using Flow Matching instead of DDPM.
- **Citation:** Lovelace, J., Kishore, V., Wan, C., Shekhtman, E., & Weinberger, K.Q. (2023). Latent diffusion for language generation. *NeurIPS 2023*.
- **Relation:** Related paradigm — ELF avoids the separate decoder LD4LG requires.

**11. Continuous Diffusion for Categorical Data — CDCD (Dieleman et al., 2022)**
Early continuous DLM that denoises in embedding space with score-based ODEs. Uses per-step token-level supervision. ELF builds on this direction but removes intermediate discretization.
- **Citation:** Dieleman, S., Sartran, L., Roshannai, A., Savinov, N., Ganin, Y., Richemond, P.H., Doucet, A., Strudel, R., Dyer, C., Durkan, C., et al. (2022). Continuous diffusion for categorical data. *arXiv preprint arXiv:2211.15089*.
- **Relation:** Background — early continuous DLM that ELF improves upon.

### Group 4: Broader Reinforcement Learning & Recommender Systems Context

**12. Denoising Diffusion Probabilistic Models — DDPM (Ho et al., NeurIPS 2020)**
The canonical diffusion paper. ELF departs from DDPM in favor of Flow Matching but the broader diffusion-to-language lineage passes through DDPM. For RS, DDPM-style models have been adapted for sequential recommendation (e.g., DiffRec, DREAM).
- **Citation:** Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. *NeurIPS 2020*.
- **Relation:** Broader context — foundational diffusion paper that underlies all DLM work.

**13. Classifier-Free Diffusion Guidance — CFG (Ho & Salimans, 2021)**
The guidance technique that ELF adopts and shows works naturally with continuous flows. For RS, CFG-style control over generation diversity vs. relevance could be directly adapted to recommendation generation tasks.
- **Citation:** Ho, J., & Salimans, T. (2021). Classifier-free diffusion guidance. *NeurIPS Workshops 2021*.
- **Relation:** Key technique — ELF's ability to use CFG is a primary advantage over discrete DLMs.

**14. Scaling Rectified Flow Transformers for High-Resolution Image Synthesis (Esser et al., ICML 2024)**
FLUX/SD3 paper that establishes the modern Flow Matching + DiT recipe for images. ELF adapts this recipe for language, including the x-prediction, in-context conditioning, and training-time CFG ideas from the broader flow matching literature.
- **Citation:** Esser, P., Kulal, S., Blattmann, A., Entezari, R., Müller, J., Saini, H., Levi, Y., Lorenz, D., Sauer, A., Boesel, F., et al. (2024). Scaling rectified flow Transformers for high-resolution image synthesis. *ICML 2024*.
- **Relation:** Technical inspiration — ELF follows the "rectified flow + DiT" paradigm established for images.
