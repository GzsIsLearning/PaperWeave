---
slug: "emu3-next-token-prediction"
title: "Multimodal learning with next-token prediction for large multimodal models"
authors:
  - "Xinlong Wang"
  - "Yufeng Cui"
  - "Jinsheng Wang"
  - "Fan Zhang"
  - "Yueze Wang"
  - "Xiaosong Zhang"
  - "Zhengxiong Luo"
  - "Quan Sun"
  - "Zhen Li"
  - "Yuqi Wang"
  - "Qiying Yu"
  - "Yingli Zhao"
  - "Yulong Ao"
  - "Xuebin Min"
  - "Chunlei Men"
  - "Boya Wu"
  - "Bo Zhao"
  - "Bowen Zhang"
  - "Liangdong Wang"
  - "Guang Liu"
  - "Zheqi He"
  - "Xi Yang"
  - "Jingjing Liu"
  - "Yonghua Lin"
  - "Zhongyuan Wang"
  - "Tiejun Huang"
year: 2026
venue: "Nature 2026"
tags: [multimodal, vlm, next-token-prediction, vision-generation, video-generation, foundation-model, decoder-only]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "https://emu.baai.ac.cn"
compute: "大规模多模态从头训练 (具体规模未公开)"
dataset_access: partial
---

> **Abstract:** While next-token prediction is considered a promising path towards artificial general intelligence, it has struggled to excel in multimodal tasks, which are still dominated by diffusion models (e.g., Stable Diffusion) and compositional approaches (e.g., CLIP combined with LLMs). In this paper, we introduce Emu3, a new suite of state-of-the-art multimodal models trained solely with next-token prediction. By tokenizing images, text, and videos into a discrete space, we train a single transformer from scratch on a mixture of multimodal sequences. Emu3 outperforms several well-established task-specific models in both generation and perception tasks, surpassing flagship models such as SDXL and LLaVA-1.6, while eliminating the need for diffusion or compositional architectures. Emu3 is also capable of generating high-fidelity video via predicting the next token in a video sequence. We simplify complex multimodal model designs by converging on a singular focus: tokens, unlocking great potential for scaling both during training and inference. Our results demonstrate that next-token prediction is a promising path towards building general multimodal intelligence beyond language.

|## [2026-05-19] Re-review (Full Text Re-read with Figure Analysis)

**Score: 5/5** — 维持原评分

### 新增洞察（基于 full.md 全文精读与图片分析）

**1. 两阶段预训练策略的细节**
- **Stage 1**: 从头开始训练，仅使用文本+图像数据，context length = 5120，无视频数据
- **Stage 2**: 引入视频数据，context length 扩展到 131072，使用 TP + CP + DP 混合并行
- 两阶段均使用 lr=5e-5，cosine annealing 到零
- Vision token 在 loss 中权重为 0.5 以防止视觉 token 主导学习过程

**2. 数据处理管线的工程深度**
- 图像筛选：分辨率≥512×512 → LAION-Aesthetics 评分≥5.5 → 文本检测保留非单色低文本图像 → DenseFusion 补充图表/表格/OCR 图像
- 标注：Emu2 → GPT-4V 生成100万图文对 → 微调 Emu2-17B 作为图像描述器 → vLLM 加速批量标注
- 视频筛选：PySceneDetect 场景分割 → PaddleOCR 去除过多文本 → 光流过滤（排除过小/过大运动）→ LAION-Aesthetics 5+ 三帧评分

**3. 视觉 Tokenizer 架构细节（从 code 分析确认）**
- 基于 SBER-MoVQGAN，3D Causal Conv + VQ codebook (32768, embed_dim=4)
- 编码/解码器各含两个 3D 时间残差层
- 空间压缩 8×，时间压缩 4×，即 4×8×8 压缩比
- 训练损失：L2 + LPIPS + GAN + commitment loss
- 视频重建指标：512×512 PSNR 22.69，SSIM 0.690，LPIPS 0.112

**4. 视频后处理管线**
- **视频稳定化**: 基于 Stable Video Diffusion 的 temporal VAE 训练，输入 pair 为 tokenizer 自编码输出 vs groundtruth (16×256×256)，损失 L1 + LPIPS + GAN + KL penalty
- **超分辨率**: 时空 UNet，4× 上采样，使用 BlurPool 下采样 + sub-pixel 上采样，损失 L2 + LPIPS + GAN

**5. DPO 训练的工程实现**
- 每 prompt 进行 8-10 次推理 → 三投票者评分（视觉吸引+提示对齐）→ 最高 vs 最低组 triplet
- Token 预先存储避免重新 tokenize 的 reconstruction differences
- DPO loss + cross-entropy loss 联合微调 QFT 模型

**6. 关键架构参数（从 code 确认）**
- Vocab size: 184,622 (151643 base + 205 special + 32768 visual)
- 32层, hidden=4096, 32 heads, 8 KV heads (GQA), RoPE base=1e6
- SwiGLU intermediate=14336, RMSNorm, vocab embedding untied

### 交叉 Wiki 关联

- [[L3_module/pretraining-paradigm]] — Emu3 的 NTP 范式是当前预训练范式演进的第6阶段（VLM/NTP）。相比遥感 FM 主导的 MIM/对比学习，NTP 的\"统一 token 空间\"思路对 RS 多模态统一表示有直接启示——如果图像/文本/视频/动作都能 tokenize 为离散 token，那么 SAR/光学/高光谱/LiDAR 理论上也可以统一到同一 token 空间。

- [[L3_module/modality-fusion]] — 当前5种融合范式（输入级/特征级/决策级/交叉注意力/MoE路由）都假设\"不同模态用不同编码器\"。Emu3 提供了第6种可能性：**统一离散 token 空间融合**——所有模态先 tokenize 为同一离散空间的 token，再在单一 Transformer 中做 NTP。这对遥感模态融合有颠覆性启示。

- [[L2_lineage/multimodal/vision-language/vlm-based]] — Emu3 的 NTP 路线与 NEO 的 Native-RoPE 路线共同构成\"原生 VLM\"分支，正在挑战 BLIP-2/LLaVA 的模块化 VLM 统治地位。

### 引文挖掘新增

| 类别 | 论文 | 理由 |
|------|------|------|
| 直接谱系 | SBER-MoVQGAN (arXiv 2209.09002) — Modulating Quantized Vectors for High-Fidelity Image Generation | Emu3 vision tokenizer 直接基于此，理解 tokenizer 质量对 NTP 性能的影响 |
| 范式基础 | Aquila2 Technical Report (Zhang et al., 2024) — arXiv | Emu3 语言数据使用 Aquila，了解预训练语言数据质量 |
| 设计空间 | DenseFusion-1M (Li et al., 2024) — arXiv | Emu3 图像理解的补充数据来源 |

### to-read.md 建议新增
- SBER-MoVQGAN (Zheng et al., 2022) — arXiv — 1
- Emu/Gen-erative multimodal models are in-context learners (Sun et al., 2024) — CVPR 2024 — [already listed]
- Emu3.5: Native Multimodal Models are World Learners (arXiv:2510.26583) — 1
- Contribution: 5/5 — 证明了 next-token prediction 可以统一多模态感知与生成，淘汰扩散模型和组合式架构，是继 ViT/CLIP 之后多模态领域最根本的范式转变
- Soundness: 5/5 — 实验设计严谨：与 SDXL、LLaVA-1.6、OpenSora-1.2 在 12+ benchmark 上对比；展示了清晰的 scaling law；NTP loss 训练曲线优于扩散和 encoder+LLM 方案
- Relevance: 5/5 — 直接相关：统一多模态基础模型，对遥感基础模型范式也有启发（NTP vs MAE/对比学习）

**Key Insights:**
1. **NTP 统一多模态架构** — 将图像、文本、视频、机器人动作全部 tokenize 为离散 token，单一 Transformer decoder 以 NTP 目标从头训练，彻底消除扩散模型和 CLIP+LLM 组合式架构
2. **Token-centric 基础设施** — Tokenization 可在边缘设备完成，仅传输 token ID 到服务器进行训练/推理，显著降低带宽
3. **Scaling laws 跨模态验证** — T2I、I2T、T2V 均呈现清晰的幂律 scaling，7B 模型性能与 extrapolation 高度吻合，证明 NTP 在多模态场景也可预测性扩展
4. **统一视频 tokenizer** — 540×960 分辨率、8fps 视频重建只需 4× 少于独立图像 tokenizer 的 token 数，且重建质量保持
5. **零样本图像修补** — 利用螺旋 token order 实现零样本 inpainting，无需任务特定微调
6. **机器人动作预测** — 将动作也作为 token 类型，在语言指令下进行视觉预测和操控，NTP 框架自然延伸至具身智能

**Notes:**
- arXiv: 2409.18869 (2024-09, cs.CV)
- Nature 2026, 650(8101):327-333, DOI: 10.1038/s41586-025-10041-x
- 作者团队：北京智源人工智能研究院 (BAAI) + 清华 + 北大，通讯作者 Wang Xinlong
- 关键开放资源：视觉 tokenizer (此前无公开可用方案)、DPO 可直接应用于自回归视觉生成
- 后续工作：Emu3.5 (arXiv:2510.26583) — Native Multimodal Models are World Learners，进一步扩展为世界模型

**Comparison with Peers:**
- vs SDXL: Emu3 在人类评估、MSCOCO-30K、GenEval、T2I-CompBench、DPG-Bench 上全面超越
- vs LLaVA-1.6: 在 SEED-Bench、RealWorldQA、OCRBench 等 12 项 benchmark 上竞争
- vs OpenSora-1.2: VBench 视频生成超越
- vs NEO ("From Pixels to Words"): 同为 decoder-only 路线，Emu3 是首个大规模验证，NEO 跟进并优化 Native-RoPE

**Key Open Questions:**
1. 高分辨率图像生成的 token 效率：当前 512×512 图像需要大量 token，是否有更高效的图像 tokenizer？
2. 与 MAE/对比学习等自监督范式在遥感领域的对比：RS FM 的 NTP 路线是否优于现有 MAE 和对比学习方案？


## Code Review

Code location: `/mnt/disk1/Gongzs/paperweave/wiki/L0_raw/emu3-next-token-prediction/code/`

### Top-Level Structure

```
code/
├── emu3/
│   ├── mllm/          # Main transformer model (decoder-only)
│   │   ├── modeling_emu3.py        (#1343 lines) Core: LLaMA-like decoder
│   │   ├── configuration_emu3.py   (#213 lines) Emu3Config
│   │   ├── tokenization_emu3.py    (#294 lines) tiktoken-based tokenizer
│   │   ├── processing_emu3.py      (#335 lines) Multimodal processor
│   │   ├── utils_emu3.py           (#68 lines)  Prefix-constrained logits helper
│   │   └── __init__.py
│   ├── tokenizer/     # Vision tokenizer (VQ-VAE)
│   │   ├── modeling_emu3visionvq.py   (#822 lines) 3D causal Conv + VQ-VAE
│   │   ├── configuration_emu3visionvq.py
│   │   ├── image_processing_emu3visionvq.py
│   │   └── __init__.py
│   └── train/         # SFT training pipeline
│       ├── train.py           (#97 lines)  HuggingFace Trainer-based
│       ├── datasets.py        (#88 lines)  Pre-tokenized feature dataset
│       ├── prepare_data.py    (#81 lines)  Vision tokenization pipeline
│       └── __init__.py
├── scripts/
│   ├── t2i_sft.sh             # DeepSpeed ZeRO-3 training launch script
│   ├── t2i_sft_offload.sh
│   ├── zero3.json
│   └── zero3_offload.json
├── replicate_demo/    # Cog deployment
├── image_generation.py        # Standalone inference script (Emu3-Gen)
├── multimodal_understanding.py # Standalone inference script (Emu3-Chat)
├── autoencode.py              # Vision tokenizer encode/decode demo
├── gradio_demo.py             # Interactive Gradio demo
├── requirements.txt
└── README.md
```

### Architecture Verification

| Paper Claim | Code Evidence | Status |
|---|---|---|
| **NTP tokenizer (visual)** | `Emu3VisionVQModel` — 3D causal Conv + VQ codebook (codebook_size=32768, embed_dim=4). Encode/decode images and videos. Includes `CausalConv3d` for temporal dimension. | Confirmed |
| **Transformer decoder** | `Emu3Model` — standard decoder-only LLaMA architecture: 32 layers, hidden_size=4096, 32 heads, GQA (8 KV heads), SiLU activation, RoPE, RMSNorm. Vocab size 184,622. Max seq len 9216. | Confirmed |
| **NTP training objective** | `Emu3ForCausalLM` — standard causal LM head with CrossEntropyLoss on shifted logits. | Confirmed |
| **Image generation** | Generation pipeline: processor encodes prompt + size prefix, model autoregressively generates visual tokens under prefix-constrained logits (enforces raster-scan order). CFG via `UnbatchedClassifierFreeGuidanceLogitsProcessor`. | Confirmed |
| **Video generation** | Tokenizer supports temporal dimension (encode/decode video frames as 5D tensors). Paper claims video generation via NTP, but no dedicated video generation script is included in the codebase. The `autoencode.py` demo only shows video tokenization (reconstruction), not generative video. | Partial — tokenizer ready, generation pipeline not included |
| **Vision-language understanding** | Processor supports 'U' mode: image -> visual tokens -> chat template -> model generates text response. | Confirmed |
| **Training (SFT)** | `train.py` uses HuggingFace `Trainer` + DeepSpeed ZeRO-3. Trains on pre-tokenized `.pth` feature files (image tokens + text). `apply_loss_on_only_vision` option. | Confirmed |

### Key Architecture Details

**Model**: LLaMA-like decoder-only transformer with:
- Embedding: `nn.Embedding(vocab_size=184622, hidden_size=4096)`
- 32x `Emu3DecoderLayer`: pre-RMSNorm -> Self-Attention (GQA, 32 heads, 8 KV heads, RoPE) -> residual -> post-RMSNorm -> SwiGLU MLP (14336 intermediate) -> residual
- Final RMSNorm -> LM head (untied weights)
- Supports FlashAttention-2, SDPA, and manual attention

**Vision tokenizer**: MoVQGAN-style 3D causal VQ-VAE:
- Encoder: 3D causal conv + residual blocks + attention at resolution 3
- Quantizer: codebook size 32768, embed_dim 4
- Decoder: symmetric to encoder
- Spatial scale factor: 2^(len(ch_mult)-1) = 2^3 = 8x spatial downsample
- Temporal downsample factor: 4x

**Tokenizer**: tiktoken-based BPE tokenizer with 151643 base tokens + 205 special tokens + 32768 visual tokens in a flat vocabulary of 184622.

**Prefix-constrained generation**: `Emu3PrefixConstrainedLogitsHelper` enforces raster-scan order during image generation by constraining allowed tokens at each position (EOL at line end, EOF after last row, EOI, EOS, or valid visual token).

### Discrepancies & Missing Components

1. **No video generation code** — The README highlights video generation as a feature, and the paper describes it, but no inference script or example for video generation is provided. The tokenizer supports temporal encoding, but the generative decoding of video is absent from the codebase.
2. **No evaluation code** — The README TODO states "Release the evaluation code" as unchecked. No eval benchmarks or scripts are included.
3. **No pretraining code** — The README TODO states "Release training scripts for pretrain and dpo" as unchecked. Only SFT training is provided.
4. **No DPO code** — DPO training is mentioned in the TODO but not implemented.
5. **Tokenizer file missing** — The `emu3.tiktoken` vocab file and `emu3_vision_tokens.txt` are not included in the repo; users must load from HuggingFace.
6. **No video generation script** — Unlike `image_generation.py` and `multimodal_understanding.py`, there is no `video_generation.py`.
7. **No CI/CD** — No tests, no linting config, no GitHub Actions workflow.
8. **Inference-time only** — The model is registered as a Transformers custom model via `trust_remote_code=True` rather than being upstreamed as a native Transformers model (though the API follows HF conventions).

### Summary

The codebase is well-structured, following HuggingFace Transformers conventions. The core paper claims are substantiated by the code: (1) VQ-VAE vision tokenizer, (2) decoder-only LLaMA-style transformer trained with NTP, (3) multimodal processor handling both generation and understanding modes. Major gaps are the missing video generation pipeline and evaluation code, both acknowledged in the README TODO as incomplete.
|