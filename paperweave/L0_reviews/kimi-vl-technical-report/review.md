---
slug: "kimi-vl-technical-report"
title: "Kimi-VL Technical Report"
authors:
  - "Kimi Team (Moonshot AI)"
venue: "Technical Report (2025)"
---

## [2026-05-01] Wiki rebuild review
## [2026-05-02] Verified

### Verified Review (2026-05-02)
Read full paper (904 lines, 116KB). This technical report from Moonshot AI presents Kimi-VL, an efficient open-source MoE vision-language model activating only 2.8B parameters (16B total) paired with a 400M MoonViT native-resolution vision encoder.

### Summary
Kimi-VL uses a Mixture-of-Experts architecture with Moonlight as the language backbone and MoonViT (based on SigLIP-SO-400M with 2D RoPE) as the vision encoder. Training proceeds through 4 stages: ViT training (2T tokens), joint pre-training (1.4T), joint cooldown (0.6T), and joint long-context activation (0.3T) to achieve 128K context. Post-training includes SFT, long-CoT SFT, and RL. A thinking variant, Kimi-VL-Thinking-2506, achieves strong reasoning (64.0 MMMU, 56.9 MathVision, 65.2 VideoMMMU).

### Significance
Kimi-VL demonstrates that efficient MoE VLMs can compete with much larger dense models, achieving competitive or superior performance to GPT-4o-mini, Qwen2.5-VL-7B, and Gemma-3-12B-IT on many benchmarks while using far fewer activated parameters.

### Strengths
- Efficient MoE architecture (2.8B activated, 16B total)
- Native-resolution vision encoding via MoonViT eliminates sub-image splitting
- Strong long-context capabilities (128K, verified via NIAH)
- Comprehensive evaluation across college-level, general, math, OCR, agent, video benchmarks
- Long-thinking variant with CoT + RL significantly boosts reasoning
- Strong agent performance (OSWorld, WindowsAgentArena)

### Weaknesses
- Large-scale training (4.4T tokens) requires significant compute
- Thinking variant still behind larger models on some hard reasoning tasks
- Limited comparison to other MoE VLMs beyond DeepSeek-VL2
- Technical report format; not peer-reviewed

**Citation Mining:**
- SigLIP [Zhai et al., 2023] — base ViT architecture
- DeepSeek-V2 [DeepSeek-AI, 2024] — MoE language backbone
- Moonlight — MoE LLM variant

## [2026-05-22] Daily paperweave re-review — 新洞察与跨维基连接

### 新洞察

**1. 4D 并行策略的技术价值**
Kimi-VL 使用 Data Parallelism + Expert Parallelism (MoE特有) + Pipeline Parallelism (含 VT 分配优化) + Context Parallelism 的四维并行策略。相比 7B 密集 VLM，训练吞吐量高出约 60%。这一工程贡献被原始 review 低估——专家并行(EP)与上下文并行(CP)的结合对于 128K 长序列训练的 scalability 至关重要，可直接启发遥感基础模型的长序列训练（如多时相 Sentinel 序列）。

**2. Muon 优化器的引入**
Kimi-VL 使用增强版 Muon 优化器（基于 Jordan et al. 2024），在 Adam 之外提供了另一选择。Muon 在 LLM 训练中展现出更好的扩展性(J. Liu et al. 2025b)，且通过 ZeRO-1 分布式实现了最优内存效率。这是原始 review 未提及的关键技术选择——对于遥感领域的持续预训练，Muon 可能比 Adam 更高效。

**3. 数据构建的六类策略**
论文详细描述了六类预训练数据：Caption、Interleaving、OCR、Knowledge、Agent、Video，并特别强调了对合成 caption 数据的严格限制（<50%）以减少幻觉风险。这一数据配比策略对遥感 VLM 的数据构建有直接参考价值。

**4. MoonViT 连续训练到 320 万像素**
Kimi-VL-Thinking-2506 版本将 MoonViT 连续训练到支持单张图像 320 万像素（原始版本的 4 倍），直接提升了高分辨率感知能力（V*: 83.2%, ScreenSpot-Pro: 52.8%）。这验证了"高分推理需要高分辨率感知"的假设。

**5. 测试时 scaling**
Figure 13 展示了测试时计算资源分配（thinking token 长度）与性能的关系：MathVision 从 1K tokens 的 18.7% 升到 16K 的 36.8%，而 MathVista 在 4K 处饱和。这表明不同任务的最优推理计算量差异很大——简单任务早饱和，复杂任务持续受益。

### 引用挖掘

- NaViT (Dehghani et al., 2023) — MoonViT 的 packing 方法来源
- Muon optimizer (Jordan et al., 2024; J. Liu et al., 2025b) — 替代 Adam 的优化器
- CoCa (J. Yu et al., 2022) — 对比+caption 联合损失函数设计
- OCR 2.0 (Wei et al., 2024) — 多类型图像 OCR 数据构建
- DeepSpeed Ulysses (Jacobs et al., 2023) — 上下文并行参考
- Aria (D. Li et al., 2024) — MoE VLM 对照模型
- Aguvis (Yiheng Xu et al., 2024) — 多步桌面 agent 轨迹合成方法

### 跨维基连接

1. **L3_model-efficiency**: Kimi-VL 的 MoE 架构（2.8B active / 16B total）是效率范式的重要证据——稀疏 MoE 可以在 1/5 激活参数下匹敌 7B 密集模型。更新 MoE 划算性争议讨论。
2. **L3_modality-fusion**: MoonViT 的原生分辨率编码（packing + 2D RoPE）消除了子图像切分伪影，这对遥感大场景图像处理有直接意义。可加入"分辨率原生编码"融合范式。
3. **L3_pretraining-paradigm**: 四阶段渐进式训练（ViT→joint→cooldown→long-context）是可行的训练配方模板。遥感领域可参考。
4. **L2_lineage/.../vlm-based.md**: 已包含 Kimi-VL 条目，但表格中缺少 open_source=True 标注（代码在 github.com/MoonshotAI/Kimi-VL 开源）。

**L1 Ecology Observations:**\n- MoE VLM architecture (2.8B active / 16B total) demonstrates efficient scaling — relevant for RS deployment\n- Native-resolution encoding via MoonViT eliminates image splitting artifacts in RS images\n- Long context (128K) is crucial for RS: large scene images, multi-temporal analysis, videos\n- 4-stage progressive training (ViT→joint→cooldown→long context) provides a training recipe template\n\n## [2026-06-03] Daily paperweave batch-read re-review — 图像驱动的新洞察与跨维基连接\n\n### 图像分析发现\n\n**Figure 3 (模型架构图) 分析：**\n\nKimi-VL 架构由三个组件构成：(1) MoonViT（原生分辨率视觉编码器）：可处理从 20×50px 小图标到 1008×672px 精细图、800×1731px 手机截图、800×1113px 长宽比特殊 OCR 图像乃至 270×480px 视频帧序列等不同分辨率和模态的视觉输入，无需子图切分；(2) MLP Projector：2层 MLP + pixel shuffle 下采样（2×2空间压缩+通道扩展）；(3) MoE 语言解码器：包含共享专家（红色边框，对所有 token 激活）和非共享专家（黑色边框，稀疏路由），Router 决定每个 token 去哪些专家。输出端生成包含 `<think>` 推理 token 的序列。\n\n关键架构创新：\n- **原生分辨率视觉编码**：MoonViT 基于 NaViT 的 packing 方法 + 2D RoPE + 插值绝对位置编码，实现了变分辨率/长宽比图像的同批次高效处理\n- **共享+非共享专家双层路由**：不同于 DeepSeek-VL2 的纯稀疏专家，Kimi-VL 同时拥有共享专家（处理通用知识）和非共享专家（稀疏激活处理特定 token 类型），平衡了专业化与稳定性\n- **视觉token颜色分异**：图中不同颜色的视觉token方块（蓝/绿/红/橙）暗示 MoonViT 输出已经包含语义类别信息——不同图像区域的 patch embedding 在接入 LLM 前已隐含模态类型标签\n\n**Figure 4 (预训练阶段) 分析：**\n\n四阶段渐进式训练配方：\n1. **Text Pre-training**（5.2T tokens）：Moonlight MoE LLM 纯文本预训练，激活 8K 上下文\n2. **ViT Training**（2.0T → 0.1T tokens）：CoCa 式对比+Caption 联合损失训练 MoonViT，再用 0.1T tokens 对齐到 LLM 嵌入空间\n3. **Joint Pre-training**（1.4T tokens）：渐进增加多模态数据比例（最高40%），恢复 LR scheduler\n4. **Joint Cooldown**（0.6T tokens）：高质量文本+多模态数据，Re-warmup LR，合成 QA 数据\n5. **Joint Long-context**（0.3T tokens）：RoPE base 从 50,000→800,000，序列从 8K→128K，长数据占 25%\n\n关键洞察：此配方中 Cooldown 阶段并非单纯降学习率，而是 Re-warmup 到更高 LR——这是一种\"重训练\"策略，与标准 cosine decay 的 cooldown 有本质区别。长上下文阶段分两子阶段逐步扩展 4×4=16 倍。\n\n### 新洞察\n\n**6. Native-resolution 编码对遥感场景的直接价值**\n\nMoonViT 的原生分辨率编码（NaViT packing + 2D RoPE）对遥感VLM有特殊价值：遥感图像分辨率差异极大（0.3m 到 30m），且场景包含小目标（车辆/船只）和大范围上下文（地表覆盖）。固定分辨率切分会导致小目标信息损失或大场景上下文碎片化。MoonViT 的变分辨率同批次处理能力——不同图像可以有不同patch数（论文中 KIVI-VL-Thinking-2506 支持单张 320 万像素）——为遥感 VLM 提供了直接可用的架构方案。\n\n**7. 共享专家设计的未公开有效性**\n\n架构图中明确显示了共享专家（红色边框）的存在，但论文正文对此着墨不多。共享专家被所有 token 路由，而不仅仅是少数 token。这与 Mixtral 8×7B 等纯稀疏 MoE 模式不同——Kimi-VL 的混合路由可能是其在多模态任务上保持稳定性能的关键工程设计，值得在 L3_model-efficiency 中重点标注。\n\n**8. MoE + Muon 优化器的组合效应**\n\nKimi-VL 使用增强版 Muon 优化器优化所有参数（包括视觉编码器）。Muon 在 LLM 训练中已被证明比 Adam 更具扩展性(J. Liu et al. 2025b)，但其在 MoE 架构中与专家并行(EP)协同的分布式实现是一个未被深入分析的工程贡献。结合 ZeRO-1 的分布式 Muon 实现了最优内存效率——这对遥感领域在有限 GPU 资源下训练 MoE VLM 有直接参考价值。\n\n**9. <think> token 的架构意义**\n\n架构图输出端显示 `<think>` token 作为推理起始标记。Kim-VL-Thinking 的推理是通过在标准自回归生成中插入 `<think>` token 实现的，而非通过独立的规划模块。这种\"隐式推理路径编码\"方法（论文§2.4 RL部分）与 DeepSeek-R1 的 long-CoT 范式一致，但 Kim-VL 将其压缩到仅 3B 激活参数内，证实了小模型通过 RL 也能获得元推理能力。\n\n**10. 测试时 scaling 的非对称性**\n\nFigure 13 展示了三种benchmark的测试时 scaling 曲线：MathVision 从 1K tokens (18.7%) 持续提升到 16K tokens (36.8%)，而 MathVista 在 4K 处饱和（~70.9%）。这表明不同任务的最优推理计算量差异极大——简单视觉数学任务（MathVista）早饱和，高难度推理（MathVision）持续受益。这一非对称性对于遥感领域的推理计算预算分配有重要参考——简单场景分类不应使用长推理链，复杂变化检测/地物识别可能需要更长推理。\n\n### 引用挖掘\n\n新增引用（不在现有 to-read.md 中，或需要重强调）：\n\n- **NaViT (Dehghani et al., 2023)** — MoonViT 的 packing 方法直接来源，变分辨率 ViT 训练的关键技术\n- **FlashAttention (Dao et al., 2022)** — 变长序列注意力机制的基础设施依赖\n- **DeepSpeed Ulysses (Jacobs et al., 2023)** — 上下文并行(CP)参考实现\n- **RoFormer (Su et al., 2023)** — 2D RoPE 基础\n- **Online Policy Mirror Descent** — RL 算法基础（与 Kimi k1.5 共享）\n- **Aria (Li et al., 2024)** — 直接对照的 MoE VLM\n- **Aguvis (Xu et al., 2024)** — 多步 agent 轨迹合成方法\n\n### 跨维基连接\n\n1. **L3_model-efficiency**: Kimi-VL 的 MoE 混合路由（共享+非共享专家）与纯稀疏 MoE (Mixtral, DeepSeek-VL2) 的设计对比缺失。更新建议：在\"稀疏路由\"效率策略下新增\"混合专家路由\"子类。\n2. **L3_modality-fusion**: MoonViT 的原生分辨率编码对遥感大场景融合的特殊价值——不同于固定分辨率切分(ViT-22B/LLaVA)造成的上下文断裂。更新建议：在融合范式表格中新增\"原生分辨率编码\"融合策略条目。\n3. **L3_pretraining-paradigm**: Cooldown阶段的 Re-warmup LR 策略是非常规设计。更新建议：在\"训练配方\"部分新增\"Cooldown Re-warmup\"作为长上下文适应的有效变体。\n4. **L2_lineage/.../vlm-based.md**: 已在表格中覆盖 Kimi-VL，但缺少对共享专家设计的讨论和 open_source=True 标注建议。
