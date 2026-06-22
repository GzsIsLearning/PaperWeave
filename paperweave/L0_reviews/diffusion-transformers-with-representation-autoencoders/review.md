---
slug: "diffusion-transformers-with-representation-autoencoders"
title: "Diffusion Transformers with Representation Autoencoders"
authors: ["Boyang Zheng", "Nanye Ma", "Shengbang Tong", "Saining Xie"]
year: 2025
venue: "ICLR 2026 Conference / Technical Report"
tags: [computer-vision, generative-models, diffusion, representation-encoder, rae]
score: 4
contribution: 5
soundness: 4
relevance: 3
open_source: true
code_url: "https://github.com/bytetriper/RAE"
compute: "—"
dataset_access: public
---

> **Abstract:** RAE replaces VAE encoder-decoder with frozen pretrained representation encoders (DINO, SigLIP, MAE) + trained decoders for diffusion transformers, achieving faster convergence and better generation quality. The paper identifies three key challenges — DiT width must match token dimensionality, noise scheduling must be dimension-dependent, and decoders need noise augmentation — and proposes DiTDH, a shallow-but-wide diffusion transformer head that scales width without quadratic compute. SOTA results: 1.51 FID @256 (no guidance) and 1.13 FID @256 and @512 (with guidance) on ImageNet.

## [2026-06-01] Review

**Score:** 4/5

**Contribution:** 5/5 — This is a genuinely paradigm-shifting paper. The central insight — that frozen pretrained representation encoders (DINOv2, SigLIP, MAE) can directly replace the VAE encoder in diffusion transformers — is both simple and transformative. It unifies the previously separate lines of visual representation learning and generative modeling. The paper makes three concrete technical contributions: (1) identifying and proving (Theorem 1) that DiT width must match latent token dimensionality, (2) dimension-dependent noise schedule shift for high-dimensional latents, and (3) noise-augmented decoder training to handle diffusion output distribution. The DiTDH architecture (shallow wide head on top of DiT) is a pragmatic extension of DDT that works particularly well in this high-dimensional regime.

**Soundness:** 4/5 — The paper is generally rigorous. Theorem 1 provides a clean theoretical lower bound explaining why DiT width must ≥ token dimension — a rare and welcome theoretical contribution in a field dominated by empirical work. Ablation studies are thorough across encoder/decoder sizes, noise augmentation strength, DDT head depth/width, and sampling strategies. One concern: the best results (1.13-1.51 FID) use AutoGuidance (Karras et al., 2025) with a small guiding model, which introduces an auxiliary component. The FID evaluation methodology is carefully documented (balanced vs. random sampling creates ~0.1 FID differences), but this also means some comparison numbers for baselines were re-evaluated rather than taken from original papers. The compute requirements for training DiTDH-XL for 800 epochs with careful hyperparameter tuning are nontrivial.

**Relevance:** 3/5 — Directly relevant to the computer vision generation community and anyone working with diffusion transformers. The RAE concept has obvious applications beyond ImageNet to text-to-image, video, and multimodal generation. However, the experiments are confined to ImageNet class-conditional and unconditional settings, without text-to-image or large-scale validation.

### Key Insights

1. **VAE → RAE is a cleaner paradigm than REPA-style alignment.** Prior work (REPA, REG) kept the VAE encoder and added auxiliary losses to align latents with semantic features. RAE directly trains diffusion on semantic latents, eliminating alignment loss complexity and achieving faster convergence (47× over SiT, 16× over REPA at same model size).

2. **DiT width must match token dimensionality — proven theoretically.** Theorem 1 shows that when DiT width d < token dimension n, the flow-matching training loss has a lower bound of (n-d)/n that cannot be overcome. This explains why standard DiT fails on high-dimensional latents and provides design guidance for future architectures.

3. **Reconstruction quality ≠ generation quality.** MAE-B achieves the best rFID (0.16, vs DINOv2-B's 0.49) but the worst gFID (16.14 vs 4.81 without noise augmentation). Semantic structure in the latent space matters more than reconstruction fidelity for generation — DINOv2's structured features are far more diffusion-friendly.

4. **Decoder noise augmentation is essential.** RAE decoders trained on clean latents fail to handle the slightly noisy outputs of diffusion models. Adding noise during decoder training (sampling σ from |N(0, τ²)|) significantly improves gFID (4.81→4.28 for DINOv2-B, 16.14→8.38 for MAE-B) at a small cost in rFID.

5. **Wide-and-shallow > deep for diffusion heads.** The DDT head works best at 2 layers wide (2048-dim) rather than deeper (4-6 layers) with similar FLOPs. This design scales width without the quadratic cost of full DiT width increase.

6. **Resolution upsampling via decoder is a free lunch.** By setting decoder patch size p_d = 2·p_e, the same 256-token diffusion model generates 512×512 images without retraining. This yields only slightly worse FID (1.61 vs 1.13) while being 4× more efficient than quadrupling tokens.

### Notes

- **Venue:** ICLR 2026 Conference (Technical Report)
- **Compute:** Trained on Google TPU (v6e-8) via PyTorch/XLA; final model DiTDH-XL for 800 epochs. Exact compute budget not reported.
- **Code:** Open source under MIT license at github.com/bytetriper/RAE (1.9k stars, PyTorch GPU + XLA branch for TPU, JAX version at willisma/diffuse_nnx). Well-documented with OmegaConf configs, training/sampling scripts, and pretrained model downloads.
- **Limitations:** (1) Only evaluated on ImageNet — no text-to-image, no LAION/CC, no video. (2) DINOv2's output depends on 224×224 input resolution requiring interpolation. (3) DiTDH introduces optimization sensitivity (separate LR schedule, EMA weight, gradient clipping vs. standard DiT). (4) The decoder's noise augmentation and the DDT head add architectural complexity. (5) The AutoGuidance method uses an auxiliary small model, complicating the "single model" simplicity.
- **Relation to REPA/REG:** This work is best understood as an alternative to the REPA line. REPA keeps VAE + adds alignment loss; RAE drops VAE entirely. The paper shows RAE converges faster and reaches better final FID. DiTDH is a modification of DDT (Wang et al., 2025c), but this paper importantly shows that DDT head only helps in high-dimensional latent spaces — it hurts performance on standard VAE latents (11.70 vs 7.13 FID).

### Code Review

The official PyTorch implementation at [github.com/bytetriper/RAE](https://github.com/bytetriper/RAE) is well-structured with:
- Clean OmegaConf-based YAML configs for all experiments
- Separate Stage 1 (decoder training) and Stage 2 (diffusion training) pipelines
- DDP support for multi-GPU training
- W&B logging integration
- Pretrained model download scripts
- Online evaluation during training
- TorchXLA branch for TPU training

The repo has 1.9k stars, 84 forks, 14 open issues — active community interest. There is also a JAX/TPU implementation at [willisma/diffuse_nnx](https://github.com/willisma/diffuse_nnx). The code appears well-maintained with recent updates (Dec 2025 refactoring). License is MIT.

### Citation Mining

1. **DiT / Scalable Diffusion Models with Transformers — ICCV 2023** (Peebles & Xie): The foundational DiT architecture that this work modifies. Most directly compared baseline.
2. **REPA / Representation Alignment for Generation — ICLR 2025** (Yu et al.): The closest concurrent approach — aligns DiT features with DINO features via auxiliary loss. RAE is positioned as a cleaner alternative.
3. **DDT / Decoupled Diffusion Transformer** (Wang et al., 2025c): Source of the DDT head architecture that DiTDH is based on.
4. **SD-VAE / LDM / High-Resolution Image Synthesis with Latent Diffusion Models — CVPR 2022** (Rombach et al.): The VAE that RAE replaces and compares against.
5. **DINOv2 / Learning Robust Visual Features without Supervision — TMLR 2023** (Oquab et al.): Primary representation encoder used in RAE.
6. **MAE / Masked Autoencoders Are Scalable Vision Learners — CVPR 2021** (He et al.): One of three representation encoders evaluated.
7. **SigLIP2 / Multilingual Vision-Language Encoders** (Tschannen et al., 2025): Language-supervised encoder evaluated in RAE.
8. **SiT / Flow and Diffusion-Based Generative Models with Scalable Interpolant Transformers — ECCV 2024** (Ma et al.): Flow matching baseline compared against.
9. **AutoGuidance / Guiding a Diffusion Model with a Bad Version of Itself — NeurIPS 2025** (Karras et al.): Guidance method used for best results.
10. **REG / Representation Entanglement for Generation** (Wu et al., 2025): Related approach adding learnable tokens aligned with representations.

**Missing citations check:** The paper covers the major relevant works — VA-VAE, MAETok, DC-AE, l-DEtok, REPA-E, ReDi, MaskDiT, MDTv2, StyleGAN-XL, VAR, MAR, xAR, ADM, etc. Comprehensive related work section in Appendix A.

### Cross-wiki Connections

- L2: [[L2_lineage/computer-vision/generation/representation-autoencoder]]
- Strong connections to: [[L2_lineage/computer-vision/generation/diffusion-transformer]], [[L2_lineage/computer-vision/representation/dinov2]], [[L0_raw/diffusion-transformer]], [[L0_raw/representation-alignment-for-generation]]

{"slug": "diffusion-transformers-with-representation-autoencoders", "score": 4, "contribution": 5, "soundness": 4, "relevance": 3, "new_authors": ["Boyang Zheng", "Nanye Ma", "Shengbang Tong", "Saining Xie"], "new_institutions": ["New York University"], "venue": "ICLR 2026 Conference / Technical Report", "citation_papers": ["DiT / Scalable Diffusion Models with Transformers — ICCV 2023", "REPA / Representation Alignment for Generation — ICLR 2025", "DDT / Decoupled Diffusion Transformer — Wang et al. 2025", "SD-VAE / LDM / High-Resolution Image Synthesis with Latent Diffusion Models — CVPR 2022", "DINOv2 / Learning Robust Visual Features without Supervision — TMLR 2023", "MAE / Masked Autoencoders Are Scalable Vision Learners — CVPR 2021", "SigLIP2 / Multilingual Vision-Language Encoders — Tschannen et al. 2025", "SiT / Exploring Flow and Diffusion-Based Generative Models with Scalable Interpolant Transformers — ECCV 2024", "AutoGuidance / Guiding a Diffusion Model with a Bad Version of Itself — NeurIPS 2025", "REG / Representation Entanglement for Generation — Wu et al. 2025"]}


## [2026-06-02] SciJudge Re-Read

**Score:** 4/5
- Contribution: 5/5 — The RAE paradigm (replacing VAE with frozen representation encoders) is genuinely novel and paradigm-shifting for generative modeling. The paper's three technical challenges (DiT width matching, noise scheduling, decoder augmentation) are well-identified and convincingly solved. The theoretical Theorem 1 (lower bound when d < n) is a rare rigorous contribution in a field dominated by empirical work.
- Soundness: 4/5 — Theorem 1 is clean; ablations are thorough across encoder types, decoder sizes, noise augmentation, and DDT head configurations. However, results rely on AutoGuidance (auxiliary model), and comparisons are re-evaluated rather than directly from original papers (admits ~0.1 FID methodology discrepancy). The exact compute budget (v6e-8 TPU, 800 epochs for XL model) is not fully characterized.
- Relevance: 3/5 — ImageNet class-conditional only, no text-to-image, no video, no large-scale validation. The RAE concept has clear potential for multimodal generation, but the paper's experiments don't demonstrate this. The frozen encoder approach has immediate applications for RS-specific generation (e.g., using pre-trained RS encoders for conditional generation), but this is speculative.

**Key Insights:**
1. **RAE eliminates the auxiliary alignment loss** used in REPA/REG — training diffusion directly on semantic latents is simpler and converges 47× faster than SiT, 16× faster than REPA at matched model size. This is a meaningful practical advantage.
2. **Reconstruction quality ≠ generation quality.** MAE-B has the best reconstruction (rFID 0.16) but worst generation (gFID 16.14). DINOv2 has worse reconstruction (rFID 0.49) but best generation (gFID 4.81). Semantic structure in latent space is what matters for diffusion, not pixel fidelity.
3. **DiT width must match token dimensionality — Theorem 1** provides a clean lower bound: when width d < token dim n, flow-matching loss has a lower bound of (n-d)/n. This directly explains why standard DiT fails on high-dimensional RAE latents and provides actionable design guidance.
4. **Decoder noise augmentation is essential** — training decoders on clean latents fails to handle diffusion output noise. Adding Gaussian noise (σ ∼ |N(0, τ²)|) during decoder training improves gFID from 4.81→4.28 (DINOv2-B) at a small rFID cost.
5. **Resolution upsampling via decoder is essentially free** — by setting decoder patch size p_d = 2·p_e, the same 256-token diffusion model generates 512×512 images. This yields 1.61 FID (vs 1.13 at 256) while being 4× more efficient than quadrupling tokens.
6. **The L2 lineage page (created 2026-06-01) correctly identifies RAE's core design taxonomy** but omits a key limitation: DiTDH introduces optimization sensitivity (separate LR schedule, EMA, gradient clipping) that complicates the "simple replacement" narrative somewhat.

**Compared to L2 Lineage:**
- The L2 representation-autoencoder page (created 2026-06-01, only 2 days old) provides a clean summary of RAE's design dimensions but is light on cross-paper synthesis. The comparison table (RAE vs VAE vs VQ-VAE) is useful but simplistic — VAE's latent dim range (4-16) undersells SD-VAE (4-128 in practice).
- RAE's relationship to the broader generation lineage (DiT → REPA → RAE) is not fully captured in the L2 page. The L2 page lists only one paper in its table. Future work should add REPA, DDT, and AutoGuidance as co-references.
- The L2 page correctly notes the DDT head architecture but doesn't highlight that the DDT head only helps in high-dimensional latent spaces and hurts performance on standard VAE latents (11.70 vs 7.13 FID) — an important boundary condition.

**Notes:**
- Venue: ICLR 2026 Conference (Technical Report) — interestingly, this paper is from the *future* relative to most of the corpus (2025). The exact acceptance status at ICLR 2026 is unclear.
- Compute: Google TPU v6e-8 via PyTorch/XLA; the exact compute budget for 800-epoch DiTDH-XL training is not reported, making reproduction cost estimation difficult.
- Code: Open source MIT license, 1.9k stars, well-documented with configs and pretrained models. Active community.
- Discrepancy: The original review notes venue as "ICLR 2026 Conference / Technical Report" — this dual designation is unusual. If it's a full conference paper, the venue is strong; if a technical report, it's more tentative. This ambiguity should be resolved.

**Citation Mining (3-8 papers):**
- 直接谱系: DiT: Scalable Diffusion Models with Transformers — ICCV 2023 — The foundational architecture RAE modifies; most directly compared baseline.
- 范式基础: REPA: Representation Alignment for Generation — ICLR 2025 — The closest concurrent approach; RAE positions itself as a cleaner alternative to REPA's alignment-loss paradigm.
- 关键对手: SD-VAE in LDM: High-Resolution Image Synthesis with Latent Diffusion Models — CVPR 2022 — The VAE encoder that RAE replaces; comparison shows RAE's semantic latent advantage.
- 设计空间对比: DDT: Decoupled Diffusion Transformer — Wang et al., 2025 — Source of the DDT head architecture DiTDH is based on; comparison shows DDT head only helps in high-dimensional latents.
- 评估基准: AutoGuidance: Guiding a Diffusion Model with a Bad Version of Itself — NeurIPS 2025 — The guidance method used for best RAE results (1.13 FID); introduces an auxiliary model component.
- 远程遥感交叉: SkySense: A Multi-Modal Remote Sensing Foundation Model — not directly cited — RAE's frozen encoder approach could be directly applied using pre-trained RS encoders (e.g., RingMo, SatMAE) for RS-specific generation tasks.

**原始 review 验证:**
- [HOLDS] Score of 4/5 — appropriate. The paper is genuinely innovative but limited to ImageNet experiments.
- [HOLDS] Contribution score of 5/5 — justified by the paradigm-shifting nature of VAE→RAE replacement.
- [HOLDS] All 5 Key Insights from the original review remain accurate and well-articulated. The reconstruction vs generation quality insight (#3) and wide-and-shallow > deep (#5) are particularly valuable.
- [HOLDS] Notes about limitations (5 points), code review assessment, and citation mining (10 papers) are thorough and accurate.
- [NEEDS UPDATE] The original L2 lineage cross-wiki connection is listed as "L2_lineage/computer-vision/generation/representation-autoencoder" — this page was created on 2026-06-01 and needs expansion (currently only 50 lines with one paper).
- [NEEDS UPDATE] The paper's relationship to downstream RS generation is not mentioned — a missed opportunity for cross-domain relevance assessment.

**Cross-Review Diff (vs previous reviews):**

1. **L2 lineage synthesis**: The original review (2026-06-01, just yesterday) did not have access to the L2 lineage page (also created 2026-06-01). This re-review adds the lineage comparison, noting that the L2 page needs expansion with REPA, DDT, and AutoGuidance co-references.
2. **Optimization sensitivity flagged**: The original review's "Notes" section mentions "DiTDH introduces optimization sensitivity" as limitation #4, but doesn't develop this point. This re-review frames it as a meaningful practical concern — the "simple replacement" narrative somewhat understates the tuning required.
3. **Venue ambiguity noted**: The dual designation "ICLR 2026 Conference / Technical Report" was not flagged as ambiguous in the original review. This re-review identifies it as needing resolution — if the paper is a full ICLR 2026 paper, it's among the year's strongest; if a tech report, it lacks peer review.
4. **Missing citation pathways**: The original review doesn't include any RS-related citation mining. This re-review adds SkySense and the speculative connection to RS-specific encoder reuse, identifying an unexplored application pathway.
5. **Decoder noise augmentation quantification**: The original review notes that noise augmentation helps but doesn't quantify the rFID vs gFID trade-off explicitly. This re-review provides specific numbers (4.81→4.28 gFID improvement at small rFID cost), grounded in the paper's Table 3 data.

## [2026-06-21] Daily Reading Agent Re-Read (第二轮重读)

**Score:** 4/5 （维持）— 论文的范式贡献在更广泛的 L3 模块语境下获得新的意义，但 ImageNet-only 的实验范围仍然是硬上限。

### 新洞察（第二轮）

1. **RAE 代码仓库验证（github.com/bytetriper/RAE）**：已克隆到 `code/` 目录。代码结构清晰：
   - **Stage1** (`src/stage1/`): RAE decoder 训练——`rae.py` 中 `RAE` 类实现 frozen encoder + noise-augmented decoder，`noise_tau` 参数控制噪声增广强度
   - **Stage2** (`src/stage2/`): 扩散训练——`DDT.py` 中 `DiTwDDTHead` 实现编码器-解码器分离架构（默认 hidden_size=[1152, 2048], depth=[28, 2]），确认了"宽而浅"的 head 设计（2 层 2048-dim vs 28 层 1152-dim backbone）
   - **DDTModulate/DDTGate** 机制：代码中的 gate 机制（`x * gate`，无 shift）与 modulate 机制（`x * (1 + scale) + shift`）分离，head 层使用 gate 而非传统 AdaLN shift——这是 DDT 设计的核心差异
   - **噪声增广实现**：`RAE.noising()` 方法（L73-76）实现 $\sigma \sim |N(0, \tau^2)|$ 的逐样本噪声注入——与论文描述完全一致
   - **多编码器支持**：`encoders/` 目录包含 `dinov2.py`, `siglip2.py`, `mae.py`，证实了 DINOv2/SigLIP2/MAE 三编码器的即插即用设计

2. **L3 generative-token-based.md 与 RAE 的深层关联**：虽然 RAE 和 TerraMind 表面上是不同的生成范式（连续扩散 vs 离散 token），但两者共享一个核心洞察——**用语义丰富的表示取代纯重建驱动的 VAE 编码器**。RAE 的 DINOv2 编码器输出高维语义 latent，TerraMind 的 FSQ tokenizer 将模态离散化为语义 token。两者都证明了"语义 > 重建"的生成质量优势。但 TerraMind 的 any-to-any 能力（9 模态互转）远超过 RAE 的 ImageNet 单模态设置。

3. **Theorem 1 的理论贡献被低估**：当 DiT 宽度 $d < n$（token 维度），流匹配损失有下界 $\frac{n-d}{n}$ 无法克服。这不是一个渐近界——它是一个精确的、在任何有限宽度下都成立的下界。在深度学习的理论文献中，这种"架构约束导致的不可约损失"非常罕见。它直接解释了为什么标准 DiT 在 RAE latent 上失败，并为未来的扩散 transformer 设计提供了明确的宽度设计指南。建议 L2 lineage 页面将此列为 RAE 的核心理论贡献。

4. **L3 model-efficiency.md 的效率革命与 DiTDH 的互补关系**：model-efficiency.md 记录的"效率悖论"（300M 击败 2B+）集中在预训练策略的效率上（持续预训练、软对比、免费监督信号）。RAE/DiTDH 提供了一种互补的效率视角——**架构层面的效率**（宽头设计避免 O($d^2$) 的宽度扩展成本）。两者结合（RAE 的高效 latent + 持续预训练）可能进一步降低遥感 FM 的训练成本。

5. **DiTDH 仅在 RAE 高维 latent 上有益——在 VAE latent 上反而有害**（Table 10：DiTDH on VAE = 11.70 FID vs DiT = 7.13）。这是一个重要的**边界条件**，L2 lineage 页面未强调。这意味着 DiTDH 不是一个通用改进——它只在"宽度瓶颈"存在时才有价值。对于标准 VAE 的低维 latent（4-16 通道），额外的宽 head 引入了优化难度而无收益。

6. **分辨率上采样解码器的"免费午餐"局限**：Table 9 显示 decoder 上采样（patch size $p_d = 2p_e$）在 4× token 效率下实现 1.61 FID（vs 直接训练 1.13）。但 rFID 从 0.53 退化到 0.97——**生成质量与重建质量的差距扩大**。对于遥感应用（通常需要高分辨率输出），这一 trade-off 需要仔细评估：遥感中的地理精度可能比感知质量（FID）更重要。

7. **未探索的遥感应用路径**：RAE 的 frozen encoder 设计天然适合遥感场景——可以直接使用预训练的遥感编码器（SatMAE、DOFA、SkySense 编码器）作为 RAE 的 encoder，训练一个遥感特定的 decoder。这将产出一个 RS-RAE：能够生成逼真遥感图像的扩散模型。当前 paperweave 中没有任何遥感生成模型使用 RAE 范式——这是一个明确的空白。

### 与 L2 Lineage 的对比（第二轮）

- **representation-autoencoder.md（2026-06-01，仅 50 行）**：该 L2 页面创建于原始 review 同一天，至今未更新。对比表（RAE vs VAE vs VQ-VAE）准确但过于简化——未反映 RAE 论文中 3 个核心挑战（宽度匹配、噪声调度、解码器增广）和 DiTDH 架构创新。
- **缺失的交叉引用**：L2 页面未链接到 `L3_module/generative-token-based.md`——后者讨论了类似的"语义表示驱动生成"范式，交叉引用将加强两个 L2/L3 之间的 coherence。
- **建议**：L2 页面应增加 (1) Theorem 1 的宽度下界作为理论贡献，(2) DiTDH 的边界条件（仅在高维 latent 有益），(3) 与 TerraMind 的 token 范式的对比。

### 代码深度评审（新增）

| 维度 | 评估 |
|------|------|
| **模块化** | ★★★★☆ Stage1/Stage2 完全分离，编码器/解码器/判别器/扩散模型各自独立模块 |
| **可复现性** | ★★★★☆ OmegaConf YAML 配置 + HuggingFace 预训练权重 + 详细 README |
| **代码质量** | ★★★☆☆ DDT.py 中存在重复 import（`from torch import nn` 出现两次）、`from regex import B` 无用 import |
| **文档** | ★★★★☆ README 详细，包含环境配置、数据准备、训练/采样命令 |
| **扩展性** | ★★★★☆ 新编码器仅需 ~50 行 wrapper + 注册到 `ARCHS` 字典 |

### 引文挖掘（新增 5 篇）

1. **SD-VAE / LDM (Rombach et al., CVPR 2022)**：RAE 直接替换的基线。已被 paperweave 引用。
2. **DINOv2 (Oquab et al., TMLR 2024)**：RAE 的默认编码器。已在 paperweave 中（L0_raw 及 L2 引用）。
3. **REPA (Yu et al., ICLR 2025)**：RAE 对比的"alignment loss"范式。已在 paperweave 中。
4. **TerraMind (Bermejo et al., ICCV 2025)**：离散 token 范式的生成模型——与 RAE 的连续扩散范式形成互补。已在 paperweave 中（L0_raw/terramind）。
5. **DDT (Wang et al., 2025c)**：DiTDH 的架构来源。paperweave 中尚未有独立 review——建议作为 to-read 候选。

### 跨 Wiki 连接（第二轮）

- **L2**: [[L2_lineage/computer-vision/generation/representation-autoencoder]] — 需扩展（增加 Theorem 1 理论贡献 + DiTDH 边界条件）
- **L3**: [[generative-token-based]] — RAE 连续扩散 vs TerraMind 离散 token 的范式对比
- **L3**: [[model-efficiency]] — DiTDH 的宽头架构效率与持续预训练的策略效率互补
- **L3**: [[pretraining-paradigm]] — RAE 的 frozen encoder 设计是"持续预训练"思想的极端版本（编码器完全冻结）
- **L0**: [[L0_raw/terramind]] — 跨范式对比引用

### 与遥感 FM 的关系（第二轮扩展）

RAE 对遥感生成的潜在影响：
- **RS-RAE 构想**：用 SatMAE/DINOv2-RS 编码器 + 训练的遥感 decoder → 遥感图像扩散生成
- **多模态条件生成**：在 RAE latent 空间中加入 SAR/光学条件 → 跨模态遥感图像翻译
- **分辨率可扩展性**：decoder 上采样在遥感中尤其有价值——从低分辨率 Sentinel-2 latent 生成高分辨率输出
- **但遥感缺乏 ImageNet 级的"美学质量"评估基准**——FID 在遥感中的意义有限（遥感图像的地理精度比感知质量更重要）
