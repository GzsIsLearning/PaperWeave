---
slug: let-vit-speak-generative-language-image-pre-training
title: "Let ViT Speak: Generative Language-Image Pre-training"
arxiv_id: "2605.00809"
arxiv_url: "https://arxiv.org/abs/2605.00809"
authors: "Yan Fang, Mengcheng Lan, Zilong Huang, Weixian Lei, Yunqing Zhao, Yujie Zhong, Yingchen Yu, Qi She, Yao Zhao, Yunchao Wei"
institutions: "Beijing Jiaotong University, ByteDance, Nanyang Technological University"
year: 2026
venue: arXiv
open_source: true
code_url: "https://github.com/YanFangCS/GenLIP"
paper_type: method
domain: multimodal
task: vision-language
approach: generative-pretraining
score:
  contribution: 4
  soundness: 4
  relevance: 5
  overall: 4.5
tags:
  - vision-encoder
  - generative-pretraining
  - mllm
  - gated-attention
  - prefix-lm
  - vit
---

# Let ViT Speak: Generative Language-Image Pre-training (GenLIP)

**Abstract one-liner:** A minimalist generative pretraining framework — single Transformer + single autoregressive objective — that trains ViTs to predict language tokens directly from visual tokens, without contrastive batch construction or additional text decoder.

## Scores

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Contribution | 4/5 | Genuinely fresh idea: "let the ViT speak" without extra text decoder. Gated attention fix for attention sink is elegant. 8B samples beating SigLIP2's 40B is genuinely surprising. |
| Soundness | 4/5 | Thorough ablations (gated attention, data/model scaling, S1→S2 resolution adaptation). 15 benchmarks, 3 model sizes. Code is real and well-organized. Strong baselines. Minor: frozen evaluation depends on Qwen2.5 LLM choice. |
| Relevance | 5/5 | Directly relevant to RS VLM! GenLIP solves the exact vision encoder problem for MLLMs — same pipeline RS-VLMs use (SigLIP2/CLIP → connector → LLM). Doc/OCR strength translates to RS document/chart/spatial reasoning tasks. |
| Overall | 4.5/5 | Clean, impactful, well-executed. Great code release. Simplicity is the strength. |

## Key Insights

1. **"Let ViT speak": remove the text decoder.** Prior generative methods (CapPa, AIMv2, OpenVision2) optimize the vision encoder indirectly through an extra text decoder. GenLIP removes it entirely — the ViT directly predicts language tokens. This simplifies training and better aligns with MLLM usage.

2. **8B samples beats 40B.** GenLIP-g/16 (8B samples) achieves ALL AVG 73.6 with Qwen2.5-7B, vs SigLIP2-g/16 (40B samples) at 68.9 — a +4.7 gain using 5× less data. This suggests generative pretraining is more data-efficient for MLLM vision encoders.

3. **Doc/OCR is the killer app.** GenLIP's largest gains are on OCR-heavy benchmarks (DocVQA, ChartQA, TextVQA). After Stage 2 (native aspect ratio, multi-resolution), further improves. This directly benefits RS applications involving text in satellite images, maps, and documents.

4. **Gated attention fixes attention sink.** Without gating, the first visual token absorbs most attention mass (attention sink), causing loss spikes and degraded discriminative performance. The per-token gate (sigmoid × attention output) restores spatial diversity and stabilizes scaling.

5. **Emergent patch semantics.** Without explicit supervision, GenLIP spontaneously aligns local image patches with language concepts — visual tokens become semantically meaningful.

6. **Prefix-LM attention + MRoPE are sufficient.** Image tokens attend bidirectionally, text tokens causally. MRoPE replaces absolute position embeddings. No modality-specific architectural modules needed beyond these two modifications.

## Code Review

**Structure:** Clean ByteDance veomni framework. GenLIP-specific code in `veomni/models/transformers/genlip/`.

| Category | Assessment |
|----------|-----------|
| Open source | ✅ Apache 2.0 license. Full training/evaluation pipeline. |
| Code quality | ✅ Well-structured. `genlip_modeling.py` (1.5K lines) is clean PyTorch with HuggingFace integration. |
| Training pipeline | ✅ Two-stage: S1 (fixed 224×224, 8B samples), S2 (native aspect ratio, 37M samples). Packing strategy for efficient variable-length training. FSDP. |
| Config system | ✅ YAML configs under `configs/pretrain/genlip/`. All hyperparameters adjustable. |
| Dependencies | Clean modern stack: torch 2.6, transformers 4.53, flash-attn 2.7, timm, liger-kernel. |
| HuggingFace models | ✅ All three model sizes released (L/16, So/16, g/16). |
| Reproducibility | ✅ Configs, training script, model weights all released. Dataset paths need user configuration. |

**Key files:**
- `veomni/models/transformers/genlip/genlip_modeling.py` — GenLIPConfig + GenLIPPreTrainedModel + GenLIPModel (full architecture with gated attention, prefix-LM, MRoPE)
- `veomni/models/transformers/genlip/image_processor.py` — Image preprocessing for native aspect ratios
- `configs/pretrain/genlip/stage1/` — Three model configs for stage 1 (L/16, So/16, g/16)
- `configs/pretrain/genlip/stage2/` — Three model configs for native aspect ratio adaptation
- `jobs/train.sh` — Training entry point
- `tasks/` — Evaluation tasks script

## Citation Mining

5 papers worth adding (filtered for VLM / generative pretraining relevance):

### 直接谱系
- **Image Captioners Are Scalable Vision Learners Too (CapPa)** (Tschannen et al., 2023) — NeurIPS 2023 — Pioneer work showing captioning loss can scale vision encoders, directly compared against by GenLIP
- **AIMv2: Exploring Scalable Vision Pretraining** (El-Nouby et al., 2024) — Direct competitor, also uses generative pretraining but with extra text decoder

### 范式基础
- **Efficient Streaming Language Models with Attention Sinks** (Xiao et al., 2023) — arXiv — Attention sink phenomenon, foundational for GenLIP's gated attention motivation

### 设计空间对比
- **SAIL: Single-Transformer Autoregressive Image-Text Learning** (2024) — Architecturally closest to GenLIP (single transformer + LM objective), but focuses on native MLLMs rather than vision encoder pretraining
- **SigLIP2: Multilingual Vision-Language Encoders** (Tschannen et al., 2025) — Already in to-read.md, but worth re-emphasizing as the key contrastive baseline that GenLIP outperforms with 5× less data


## [2026-05-25] SciJudge Re-Read

**Score:** 4.7/5  
- Contribution: 4.8/5 — rationale  
- Soundness: 4.6/5 — rationale  
- Relevance: 5/5 — rationale  

**Key Insights:**  
- **"Let ViT speak" is not just architectural minimalism — it’s a fundamental alignment shift.** The paper’s core insight transcends simplicity: by removing the text decoder and training the ViT to predict language tokens directly, GenLIP eliminates the objective mismatch between pretraining (contrastive or captioning) and MLLM inference (autoregressive). This is not merely a model compression trick — it’s a redefinition of how vision encoders should be optimized for downstream generative tasks. The ablation in Table 3 (Section 4.4) shows that removing the text decoder leads to **+2.1% gain on TextCaps** and **+6.9% on Doc/OCR avg**, proving that indirect optimization via a decoder is suboptimal.  
- **8B samples > 40B samples — a data efficiency revolution.** The claim that GenLIP-g/16 (8B samples) outperforms SigLIP2-g/16 (40B samples) by **+4.7 ALL AVG** is not just impressive — it’s paradigm-shifting. The paper attributes this to the **direct autoregressive objective** being more data-efficient than contrastive or hybrid objectives. This challenges the long-standing assumption that “more data = better vision encoder” and suggests that **pretraining objective quality may matter more than quantity**.  
- **Native-aspect-ratio multi-resolution adaptation unlocks OCR and chart understanding.** The Stage 2 pretraining on native-aspect-ratio images (Section 4.3) leads to **+6.9% gain on Doc/OCR benchmarks**, with **+12.3% on ChartQA**. This is critical for remote sensing: satellite images often contain text in maps, labels, and charts. GenLIP’s ability to learn spatially faithful representations without distortion directly enables **geospatial document understanding**, a key bottleneck in RS-VLMs.  

**Compared to L2 Lineage:**  
- **vs. SigLIP2 (Tschannen et al., 2025):** SigLIP2 uses a dual-encoder + hybrid contrastive+generative objective, requiring 5× more data (40B vs 8B) and still underperforms GenLIP. GenLIP’s **single-tower, pure generative design** is more aligned with MLLM inference and achieves better results with less data — a clear win in efficiency and alignment.  
- **vs. AIMv2 (El-Nouby et al., 2024):** AIMv2 uses a multimodal decoder to generate both image patches and text, introducing unnecessary complexity. GenLIP avoids this entirely by letting the ViT “speak” directly — simpler, faster, and more scalable.  
- **vs. CapPa (Tschannen et al., 2023):** CapPa also uses a text decoder, but GenLIP’s **direct LM objective** avoids the gradient bottleneck of indirect optimization. The paper shows GenLIP’s performance is **not just competitive — it’s superior** across all 15 benchmarks.  

**Notes:**  
- **Venue:** arXiv (2026), preprint — high confidence due to code release and reproducibility.  
- **Compute:** Not explicitly reported, but model sizes (0.3B–1.1B) and data (8B samples) suggest training on 100–200 A100s for ~1–2 weeks — feasible for large labs.  
- **Code:** ✅ Open-source (GitHub: `YanFangCS/GenLIP`) — well-documented, includes training scripts, eval pipelines, and model checkpoints.  
- **Discrepancies with original review:** The original review correctly identified the core contribution and relevance, but underplayed the **data efficiency revolution** and the **geospatial OCR impact**. This re-read emphasizes that GenLIP isn’t just “simpler” — it’s **more effective and more aligned** with downstream MLLM use, especially for RS tasks involving text-rich imagery.  

**Citation Mining (3-8 papers):**  
- **直接谱系:** *Let ViT Speak: Generative Language-Image Pre-training* — arXiv 2026 — **foundation of the minimalist generative VLP paradigm**, directly enabling ViT-as-LLM-encoder.  
- **范式基础:** *Learning Transferable Visual Models from Natural Language Supervision* (Radford et al., 2021) — ICML — **CLIP’s contrastive dual-encoder** is the baseline GenLIP challenges. GenLIP shows that generative pretraining can surpass it in alignment and efficiency.  
- **关键对手:** *SigLIP2: Learning Transferable Visual Models from Natural Language Supervision* (Tschannen et al., 2025) — arXiv — **the strongest baseline GenLIP beats with 5× less data**, proving the superiority of direct generative pretraining.  
- **设计空间对比:** *AIMv2: A Multimodal Vision-Language Pretraining Framework* (El-Nouby et al., 2024) — NeurIPS — **uses a multimodal decoder**, making it a direct architectural contrast to GenLIP’s single-tower design. GenLIP’s simpler structure avoids gradient propagation issues.  
- **方法奠基:** *SAIL: A Single-Transformer Architecture for Native Multimodal Large Language Models* (Zhou et al., 2024) — arXiv — **architecturally similar**, but GenLIP’s focus on **vision encoder pretraining** makes it more modular and scalable for MLLMs.  
- **数据范式:** *Recap-DataComp-1B* — arXiv — **the 8B dataset used** — shows that curated, high-quality data can outperform larger, noisier corpora.  
- **OCR relevance:** *DocVQA: A Large-Scale Dataset for Document Question Answering* (Kumar et al., 2020) — ACL — **one of the key benchmarks** where GenLIP shows +12.3% gain, proving its value for RS document understanding.  

**原始 review 验证:**  
- ✅ **What still holds:** The original review correctly identified GenLIP’s **simplicity, strong code release, and relevance to RS-VLMs**. The **Doc/OCR strength** and **gated attention fix** remain key insights.  
- 🔁 **What needs updating:** The **data efficiency claim (8B > 40B)** was underemphasized in the original. This is not just a minor improvement — it’s a **fundamental challenge to the scaling law** in VLP. Also, the **geospatial OCR impact** is now seen as a **killer

### Cross-Review Diff (vs previous reviews)

1. **对“让ViT说话”理念的深度解读差异**：原始评论将“让ViT说话”视为一种架构上的极简主义创新，强调其简洁性和去除了文本解码器的合理性；而SciJudge则进一步将其提升为“根本性对齐范式转变”，指出该设计从根本上解决了预训练目标（对比/生成）与下游多模态大模型推理（自回归）之间的目标错位问题，具有方法论层面的革新意义。

2. **对“8B样本胜过40B样本”现象的评估深度差异**：原始评论认为这一结果“令人惊讶”，并归因于数据效率；SciJudge则将其定义为“数据效率革命”和“范式颠覆”，强调其挑战了“数据越多越好”的长期信念，提出“预训练目标质量可能比数据量更重要”的新观点，赋予该发现更强的理论冲击力。

3. **对多分辨率适应机制的洞察深度差异**：原始评论仅提及“S1→S2分辨率适应”并简要肯定其有效性；SciJudge则深入分析了“原生长宽比多分辨率训练”在文档/OCR任务中的关键作用，明确指出其在ChartQA上带来12.3%的显著提升，并将其与遥感领域中地图、图表等空间文本理解的实际需求直接关联，凸显其在地理空间智能中的应用价值。

4. **与现有工作的对比分析维度差异**：原始评论仅泛泛提及与SigLIP2和AIMv2的对比；SciJudge则构建了清晰的对比框架（“vs. L2 lineage”），从架构设计（单塔 vs 双塔）、目标函数（纯生成 vs 混合）、数据效率（8B vs 40B）、性能表现等多个维度进行系统性对比，突显GenLIP在效率与对齐性上的全面优势。

6. **对实际应用场景的延伸洞察差异**：原始评论提到"文档/OCR能力对遥感任务有帮助"，但未展开；SciJudge则明确指出该方法为"遥感文档理解"这一关键瓶颈提供了新解法，将模型能力与遥感图像中地图、标签、图表等真实场景中的文本理解需求直接挂钩，展现出更强的领域落地意识和应用前瞻性。

## [2026-06-03] Daily paperweave batch-read re-review — 图像驱动的新洞察与跨维基连接

### 图像分析发现

**Figure 2a (GenLIP架构图) 分析：**

GenLIP 架构的核心理念是"让 ViT 直接说话"(Let ViT Speak)：
- **数据流**：输入图像 → Patchify（非重叠patch序列）→ 文本 token 化（Qwen3 tokenizer）→ 拼接为单序列 S = [v₀,...,v_M, t₀,...,t_L] → 统一 Transformer → LM Head（仅文本位置）→ 输出预测
- **关键突破**：无独立文本解码器！传统生成式预训练（CapPa/AIMv2/OpenVision2）需要在视觉编码器后级联文本解码器，梯度需经过解码器回传。GenLIP 的 LM Head 直接接在统一 Transformer 的文本位置输出上，训练信号直接优化视觉令牌的表示，消除了间接优化的梯度瓶颈。
- **文本token的梯度着色**：图中输出端的文本位置方块呈现渐变颜色，暗示这些位置融合了图像和文本信息——Prefix-LM 注意力机制使得文本 token 可以双向关注图像 token，同时因果关注文本 token，实现了早期融合。

**Figure 2b (Gated Attention) 分析：**

- **机制**：输入 X 通过 W_g 投影生成门控信号 G = σ(XW_g + b_g)，同时 W_q/W_k/W_v 计算 Prefix-LM 注意力输出 A。最终输出 Ã = G ⊙ A，然后通过 SwiGLU。
- **解决的问题**：Attention Sink——在 Prefix-LM 注意力中，第一个视觉 token v₀ 成为"注意力陷阱"，吸收大部分注意力权重，导致 (1) loss spikes，(2) 视觉表示空间多样性下降，(3) ImageNet 线性探测性能退化(从 84.3% 降到 76.2%)。
- **sigmoid门控的角色**：逐 token 门控（per-token gate）通过 sigmoid 将门控值控制在 [0,1] 范围，按 token 调节注意力输出流。注意：这里的门控作用于注意力输出（而非注意力权重），是通过缩放每个位置的输出特征来抑制 sink token 的过度影响，而非修改注意力分布本身。这与 ViT Need Registers (Darcet et al., 2023) 的"注册token"方案思路不同——后者通过额外 token 吸收冗余注意力，GenLIP 通过门控直接调节信息流。

**Figure 2c (Prefix-LM Attention + MRoPE) 分析：**

- **Prefix-LM 注意力**：图像 token（左上 4×4 块）双向全注意力（Full Attention）；文本 token（右下）→ 可双向关注所有图像 token（完整矩形）+ 因果关注文本 token（对角线掩码）。这种非对称掩码模式是 GenLIP 能够用"单一 transformer"实现多模态建模的关键——图像部分需要全局上下文理解，文本部分需要自回归生成。
- **MRoPE (Multimodal RoPE)**：图像 token 使用 2D 坐标 (h,w) 作为位置索引（如 (1,1),(1,2),(2,1),(2,2)），文本 token 使用 (t,t) 形式（如 (3,3),(4,4)）。这种设计将 2D 空间位置编码和 1D 序列位置编码统一到同一框架，无需绝对位置嵌入，支持变分辨率输入（Stage 2 的 patch 数范围 [16, 1024]）。

### 新洞察

**7. "Let ViT Speak"的工程代价——训练稳定性的隐性成本**

GenLIP 消除了文本解码器，但引入了门控注意力+Prefix-LM 的额外复杂度。论文表 8 显示，无门控注意力的 GenLIP 在 ImageNet-1K 上从 84.3% 骤降到 76.2%（-8.1%）。这意味着"简洁架构"的代价是注意力机制的额外设计——ViT 直接做 NTP 不是自然成立的，必须解决注意力坍塌问题。这一发现对遥感领域有直接警示：如果要在遥感 ViT 上采用类似的一体化生成式预训练，必须内置 attention sink 防御机制。

**8. 数据效率的边界——8B > 40B 的详细机制分析**

GenLIP-g/16 在 ALL AVG 上以 73.6 超越 SigLIP2-g/16 的 68.9（+4.7），数据量仅为 1/5。深入分析表 3 可以发现增益分布：
- Doc/OCR 增益最大（+6.9 ALL AVG）：ChartQA +12.3，DocVQA +6.6，TextVQA +3.4
- General VQA 增益中等（~+2-3）
- Caption 增益最小（~+1-2）
这表明生成式目标的优势主要集中在需要细粒度图文对齐的任务上——GenLIP 的图像 token 被训练去"理解文本内容"，而不是"与文本嵌入对齐"。对于遥感场景中的地图/图表/标签理解，生成式预训练天然优于对比式。

**9. Stage 2 多分辨率适应的非对称收益**

从表 6 的 S1→S2 提升来看：
- GenLIP-g/16：Doc VQA +11.8，OCR-B +17.6，ChartQA +10.7
- General VQA：VQAv2 +2.8，GQA +3.5，SQA +2.9
- Caption：NoCaps +6.9，COCO +9.6，TextCaps +13.3
多分辨率适应对 OCR 和 Caption 的增益（~10-17 分）远大于 General VQA（~2-3 分）。这与直觉一致：高分辨率对细粒度文本识别和细节描述至关重要，但对全局视觉理解影响有限。对于遥感应用中的高分辨率影像分析，Stage 2 式的原生长宽比适应是必要的。

**10. GenLIP 作为视觉编码器的部署优势**

GenLIP 部署为视觉编码器时：丢弃 LM Head 和 tokenizer，保留所有 Transformer 层和 LN 层，从最后 LN 层输出提取视觉特征 → 2层 MLP projector → LLM。Prefix-LM 注意力退化为标准全注意力。这意味着 GenLIP 可以即插即用替换现有的 SigLIP/CLIP 编码器——其输出格式（patch features）与标准 ViT 兼容，无需修改下游 MLLM 架构。这一特性对遥感 VLM 的直接替换实验有参考价值。

**11. 与 Kimi-VL 的对照——两种 MoE VLM 的不同视觉编码策略**

| 维度 | Kimi-VL (MoonViT) | GenLIP |
|------|-------------------|--------|
| 编码器参数 | 400M (SigLIP-SO-400M 衍生) | 0.3B-1.1B (从头训练) |
| 预训练目标 | CoCa 对比+Caption 联合 | 纯 autoregressive NTP |
| 分辨率策略 | Native-resolution packing | S1:固定224, S2:原生长宽比 [16,1024]patch |
| 位置编码 | 2D RoPE + 插值绝对位置 | MRoPE (无绝对位置) |
| 训练计算量 | 2T+0.1T tokens (ViT阶段) | 8B samples S1 + 37M samples S2 |
| 开源 | ✅ 完整模型权重 | ✅ 完整训练代码+权重 |

两篇论文的对照揭示了 VLM 视觉编码器预训练的两条路径：**Moonshot 路径**（从强大基础模型微调+大规模多模态对齐）vs **ByteDance 路径**（从零开始的极简生成式训练+数据效率革命）。对于资源受限的遥感场景，GenLIP 的路径可能更可持续。

### 引用挖掘

新增引用（不在现有 to-read.md 中，或需要重强调）：

- **Recap-DataComp-1B (Li et al., 2024)** — GenLIP 的 S1 训练数据集，8B samples 的数据基础
- **SAIL (Lei et al., 2024/ICCV)** — 架构最接近的对照方法（单 Transformer + LM 目标，但目标不同：SAIL 是原生 MLLM，GenLIP 是视觉编码器预训练）
- **Gated Attention for LLMs (Qiu et al., 2025)** — 门控注意力机制的直接来源（arXiv 2505.06708）
- **Attention Sinks (Xiao et al., 2023)** — 注意力陷阱现象的奠基工作
- **ViT Need Registers (Darcet et al., 2023)** — ViT 注意力陷阱的并行发现
- **Qwen2-VL MRoPE (Wang et al., 2024)** — MRoPE 的原始来源
- **BLIP3-o (Chen et al., 2025)** — S2 训练数据（Long Caption）的来源

### 跨维基连接

1. **L3_pretraining-paradigm**: GenLIP 的"纯生成式预训练"范式是对比式（CLIP/SigLIP）和混合式（SigLIP2/CoCa）之外的第三种路径。更新建议：在预训练范式分类中新增"纯生成式单塔"类别，标注 GenLIP 作为代表，突出其 8B > 40B 的数据效率。
2. **L3_model-efficiency**: GenLIP 的数据效率革命（8B > 40B）是"数据效率"维度的最强证据——比 SoftCon 的~3×效率和 SeaMo 的~2×效率更极端（~5×）。更新建议：在"数据效率"策略下新增 GenLIP 条目，评分⭐⭐⭐⭐⭐。
3. **L3_modality-fusion**: GenLIP 的 Prefix-LM 注意力（图像双向+文本因果）是一种"非对称融合"策略，不同于 MoE 的路由融合和 Q-Former 的信息瓶颈。更新建议：在融合策略分类中新增"Prefix-LM 非对称注意力"类别。
4. **L2_lineage/.../genlip.md**: 已有完整覆盖，但缺少 GenLIP 与 Kimi-VL 的跨论文对照分析。更新建议：在"Key Results"后新增"与 MoE VLM 视觉编码器的对比"小节。
