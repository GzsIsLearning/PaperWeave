---
slug: "vlmo-unified-vision-language-pre-training-with-mixture-of-modality-experts"
title: "VLMO: Unified Vision-Language Pre-Training with Mixture-of-Modality-Experts"
authors:
  - "Hangbo Bao"
  - "Wenhui Wang"
  - "Li Dong"
  - "Qiang Liu"
  - "Owais Khan Mohammed"
  - "Kriti Aggarwal"
  - "Subhojit Som"
  - "Furu Wei"
score: 3
contribution: 3
soundness: 4
relevance: 2
open_source: true
code_url: "https://aka.ms/vlmo"
compute: "64-128 V100 GPUs"
dataset_access: true
---

> **Abstract:** Unified VLM with Mixture-of-Modality-Experts (MOME) Transformer. Vision expert, language expert, vision-language expert. Stagewise pre-training on image-only + text-only + image-text data. Can be used as dual encoder (retrieval) or fusion encoder (classification). SOTA on VQA, NLVR2, retrieval.

## [2026-05-02] Comprehensive Review

**Score:** 3/5
- Contribution: 3/5 — MOME Transformer is novel; stagewise pre-training effective; unified dual/fusion encoder design
- Soundness: 4/5 — Strong results on VQA (82.88), NLVR2 (89.54), COCO/Flickr30K retrieval
- Relevance: 2/5 — General-domain VLM paper; foundational for MoE in VLMs but not RS-specific

**Key Insights:**
1. MOME Transformer: three modality experts (V-FFN, L-FFN, VL-FFN) replacing FFN in standard Transformer with shared self-attention.
2. Stagewise pre-training: BEIT vision pre-training -> MLM language pre-training -> vision-language pre-training.
3. Unified architecture: dual encoder for retrieval (separate encoding) or fusion encoder for classification (joint encoding).
4. Global hard negative mining across all GPUs for better image-text matching.
5. VLMo-Large++ (1B noisy web pairs): SOTA on VQA (82.88) and NLVR2 (89.54).
6. Faster inference than fusion-only models for retrieval tasks.

**Notes:**
- Microsoft Research, NeurIPS 2022.
- Not RS-specific but foundational MOME concept influential for RS VLMs.
- BEIT-based image encoder, BERT-based text encoder.

## [2026-05-30] Re-review — Daily Paperweave Reading Agent

**Score:** 3/5 (不变)

### 重新精读后发现的补充见解

#### 1. 全局硬负例挖掘的关键洞见

VLMo 提出的全局硬负例挖掘 (Global Hard Negative Mining) 相比 ALBEF 的本地方案（同一 GPU 内 32 个候选）将候选规模扩大至全部 1024 个样本。Table 6 显示这一改进在 NLVR2 dev 上带来 +1.84 的显著提升（77.70→79.54）。**关键机制**：ITM 任务的难负例采样依赖于 ITC 对比学习中的相似度排序——全局更广的候选集意味着更可能找到"视觉上相似但语义不同"的挑战性负例，迫使融合编码器学到更细粒度的跨模态对齐。这一策略后来被广泛应用于后续 VLM（如 BLIP-2 的 Q-Former 训练）。

#### 2. MOME 共享自注意力的消融证据

Table 7 提供了共享自注意力 vs 分离自注意力的消融：共享版本在 NLVR2 (80.13 vs 78.92, +1.21) 和 Flickr30K 检索 (TR 95.17 vs 94.63) 上全面超越分离版本。这意味着**自注意力层的跨模态参数共享有助于在底层建立视觉-语言的对齐**，而不需要等到顶部 VL-FFN 层才进行融合。这一设计对 RS VLM 的设计启示是：在多模态 RS 数据中，共享自注意力层可能帮助模型学习 SAR-光学传感器的空间对应关系。

#### 3. 阶段预训练的具体数据配置

文本预训练阶段：Wikipedia + BookCorpus，500k steps (base) / 200k steps (large)，sequence length 196，与 BERT 预训练配置一致。视觉预训练直接使用 BEIT 权重初始化。值得注意的是，视觉专家 (V-FFN) 和自注意力模块在文本预训练阶段被冻结——**这种"交替冻结"策略确保了各模态专家在各自的预训练中不会干扰已学到的其他模态知识**。

#### 4. 与 RS 多模态融合的交叉联系

VLMo 的 MoME 设计是 2025 年 RS 多模态 MoE 路由融合范式的直接先驱：

- **vs. RingMoE (2025)**：VLMo 的粗粒度模态专家（vision/text/VL 三类）→ RingMoE 的精细粒度模态/协作/共享专家三元组。RingMoE 在 VLMo 的基础上增加了跨模态协作专家和全局共享专家，将 RS 模态数从 2（VLMo 的 vision/language）扩展到 4（光学/MS/SAR）。
- **vs. SkySense (2024)**：VLMo 的统一 dual/fusion 编码器思想与 SkySense 的因子化编码器形成对比——VLMo 通过共享参数实现灵活切换，SkySense 通过独立参数实现模态专用化。
- **vs. M3ViT (NeurIPS 2022)**：VLMo 是模态级 MoME，M3ViT 是任务级 MoE——二者正交可组合。

#### 5. 引用挖掘

从 VLMo 的参考文献中挖掘值得阅读的论文：

- **BEIT (Bao et al., 2021)** — VLMo 视觉预训练直接借用的骨干（MIM 先驱，已存在于 wiki 中✅）
- **ALBEF (Li et al., 2021)** — 硬负例挖掘思路的直接来源，VLMo 在其基础上做了全局扩展（已存在于 wiki/bi 中✅）
- **UNITER (Chen et al., ECCV 2020)** — 融合编码器基准方法，覆盖多个 VL 任务
- **SimVLM (Wang et al., 2021)** — 弱监督 VLM，1.8B 图文对预训练，HUGE 规模模型（参数量超大，但被 VLMo-Large 在 VQA 上超越）
- **Florence (Yuan et al., 2021)** — Microsoft 早期 CV FM，900M 图文对 + HUGE 模型，2021 年 SOTA

#### 6. 代码检查

开源代码位于 https://aka.ms/vlmo（重定向至 Microsoft 仓库）。本地无 code/ 目录，跳过克隆。根据论文描述，VLMo 基于 Python + PyTorch 实现，采用与 BEIT 一致的 ViT 配置，使用了 AdamW + cosine decay + 线性 warmup。
