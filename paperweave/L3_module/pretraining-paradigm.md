---
title: 遥感预训练范式 — 目标、数据与规模的演进
created: 2026-05-02
updated: 2026-05-02
type: module
problem: pretraining-paradigm
tags: [remote-sensing, pretraining, MIM, contrastive-learning, multi-modal, MoE, VLM, supervised-pretraining, scaling]
sources:
  - L0_raw/遥感大模型进展与前瞻.md
  - L0_raw/遥感基础模型发展综述与未来设想.md
  - L0_raw/on-the-foundations-of-earth-foundation-models.md
  - L0_raw/self-supervised-learning-in-remote-sensing-a-review.md
  - L0_raw/seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data.md
  - L0_raw/multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre.md
  - L0_raw/masked-autoencoders-are-scalable-vision-learners.md
  - L0_raw/simmim-a-simple-framework-for-masked-image-modeling.md
  - L0_raw/satmae-pre-training-transformers-for-temporal-and-multi-spectral-satellite-image.md
  - L0_raw/rethinking-transformers-pre-training-for-multi-spectral-satellite-imagery.md
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining.md
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m.md
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-.md
  - L0_raw/scaling-vision-with-sparse-mixture-of-experts.md
  - L0_raw/ringmo-lite-a-remote-sensing-multi-task-lightweight-network-with-cnn-transformer.md
  - L0_raw/any-optical-model-a-universal-foundation-model-for-optical-remote-sensing.md
  - L0_raw/learning-transferable-visual-models-from-natural-language-supervision.md
  - L0_raw/momentum-contrast-for-unsupervised-visual-representation-learning.md
  - L0_raw/针对多模态遥感数据的自监督策略模型预训练方法---中国知网.md
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models.md
zotero_keys: []
confidence: high
---

# 遥感预训练范式：目标、数据与规模的演进

## 核心问题

遥感模型应该用什么预训练目标？什么数据？多大尺度？这三大设计轴构成了预训练范式的设计空间。本文追踪从 ImageNet 监督迁移到多模态 VLM 的完整演进路线，揭示每个范式的 trade-off 和最佳实践。

---

## 一、五阶段范式演进

```
ImageNet 监督        对比学习 (2021)          MAE (2022-2023)        高效范式 (2024-2025)     VLM/Agent (2025+)
AlexNet/VGG ──→ MoCo/SimCLR ────────→ RingMo, SatMAE ────→ SoftCon, SeaMo ────→ SkySense++
                SeCo (域内SSL)           MAE (CVPR 2022)        AgriFM (监督预训练)     Earth AI
                Geography-Aware         SimMIM, Scale-MAE     持续预训练               RemoteCLIP
                                        CROMA (SAR+光学)
```

关键趋势：**从"堆算力堆数据"到"聪明地设计预训练策略"**。

---

## 二、设计轴一：预训练目标

### 2.1 监督预训练 (ImageNet 范式, pre-2021)

**特点:** ImageNet 1.2M 标注图像 → 遥感任务迁移

**关键发现 — 域差距远超预期:**
- SeCo (ICCV 2021) **首个系统性证据**: 域内 SSL (BigEarthNet 87.81%) 远优于 ImageNet 预训练 (~82%)
- 遥感大模型综述确认："预训练数据必须是遥感图像"已被多次验证
- 原因: 遥感图像 nadir 视角 vs 自然图像地面视角；遥感对象的尺度和纹理分布不同

**现状:** ImageNet 预训练在遥感中作为初始化仍有价值，但作为唯一预训练策略已基本被淘汰。

### 2.2 对比学习范式 (2020-2021, 2024 复兴)

**CV 基础:** MoCo (queue + momentum encoder), SimCLR (大 batch + NT-Xent), BYOL, SimSiam

**遥感适配:**

| 对比学习方法 | 核心创新 | 关键结果 |
|-------------|----------|----------|
| **SeCo** (ICCV 2021) | 季节变化=自然增强, 多子空间对比 (Z0全不变/Z1季节不变/Z2增强不变) | BigEarthNet 87.81%, 域内SSL>>ImageNet |
| **Geography-Aware SSL** (ICCV 2021) | GPS 分类 pretext + 时序正样本 | fMoW 74.42%, 追平监督 |
| **SkySense** (CVPR 2024) | 因子化编码器 + Geo-Context Prototype + 多粒度对比 | 2.06B 参数, 16 数据集 7 任务 |
| **SoftCon** (IEEE TGRS 2024) | 多标签软对比 + Dynamic World 免费标注 + DINOv2 持续预训练 | **100ep 超越 SkySense 1000ep** |

**SoftCon 重新定义了对比学习的效率:**
- 硬对比 → 软对比：利用遥感图像的内在"多义性"（一张图包含多种土地覆盖）
- 对比例子来自 Dynamic World 自动标注，而非手工增强
- 证明了 **对比学习+持续预训练 > MIM 从头训练** (在特定条件下)

### 2.3 MIM (掩码图像建模) 范式 (2022-2023 主导)

**CV 基础:**
- MAE (CVPR 2022): 非对称 encoder-decoder, 掩码 75% patches, encoder 仅处理可见块
- SimMIM (CVPR 2022): 简化到本质——随机掩码大 patch, L1 像素回归, 轻量线性预测头

**SimMIM 的关键消融对遥感有直接启示:**
- AvgDist (masked→visible pixel 平均距离) 是 MIM 质量的最佳预测器, 最佳区间 [10, 20]
- 随机掩码 + patch 大小 32 + 60% 掩码率表现最佳
- 线性预测头 = 逆 Swin-B 性能, 但 2.3× 更快
- **仅预测被掩码部分 ≫ 重建全图**: 82.8% vs 81.7%

**遥感 MIM 谱系 (估计覆盖 70%+ 遥感 FM):**

| MIM 变体 | 代表工作 | 核心设计 | 范式贡献 |
|---------|----------|----------|----------|
| 基础 MIM | RingMo (IEEE TGRS 2022) | PIMask 策略: 避免密集小目标丢失 | 首个 RS 生成式 MIM |
| 时序+光谱 MIM | **SatMAE** (NeurIPS 2022) | 时间编码+光谱分组编码, 独立 masking | **设定后续标准范式**, 代码开源 |
| 多尺度 MIM | SatMAE++ (NeurIPS 2023) | 卷积上采样块多尺度重建 | 加速下游收敛 20→12 epoch |
| 频域 MIM | RingMo-lite (IEEE TGRS 2024) | DFT 频域分析→高低频分类→滤波→掩码 | 轻量化 (28.3M 参数) |
| 3D MIM | SpectralGPT, Prithvi | 3D 张量掩码/3D patch embedding | 光谱/时序维度感知 |
| 渐进式 MIM | SeaMo (2025) | Phase 1: 空间 MIM → Phase 2: 时序融合 MIM | 200 GPU-h = SOTA |
| 跨模态 MIM | CROMA, msGFM, RingMoE | SAR-光学交叉重建/MoE 路由 | 多模态统一表示 |

**SatMAE 的关键消融（影响整个领域）:**
- 独立 masking (各时间/光谱通道独立 mask) > 一致性 masking
- 光谱分组编码优于逐波段编码
- 时间位置编码对时序任务至关重要

### 2.4 多模态预训练 (2023-2025)

遥感从单模态走向多模态预训练：

| 多模态策略 | 代表工作 | 数据组合 | 关键发现 |
|-----------|----------|----------|----------|
| 跨模态 MIM+对比 | CROMA (NeurIPS 2023) | SAR+光学 | 联合训练优于单独训练 |
| MoE 路由 | RingMoE (2025), msGFM | 多传感器 | 模态专家+共享专家三元体系 |
| 波长感知编码 | DOFA, AOM | 多波段/任意波段 | 波长→动态权重, 通道索引 |
| 因子化编码器 | SkySense (CVPR 2024) | 多模态+多时序 | 模块化组合设计 |

**PANGAEA 的关键警告:** 添加 SAR 并不总是有帮助——纯光学常优于光学+SAR。**有效利用 SAR 信息仍然是一个开放挑战。**

### 2.5 监督预训练：被低估的第三条路 (2024-2025)

| 方法 | 代表工作 | 监督信号 | 特点 |
|------|----------|----------|------|
| 土地覆盖监督 | AgriFM | GLC_FCS30D 土地覆盖比例 | 利用地理坐标自动获取, 零成本 |
| 多标签软监督 | SoftCon | Dynamic World 自动标签 | "软标签" 处理遥感多义性 |
| 跨模态监督 | - | 公开 GIS 产品 | 待探索 |

**"On the Foundations" (Nature 2025) 核心观点:**
遥感领域存在大量可利用的"免费知识"——公开土地覆盖产品、气候数据、地形数据等。主动利用这些已有知识可能比纯粹的自监督更实际。

### 2.6 VLM / In-Context Learning 前沿 (2025+)

| 方向 | 代表工作 | 能力 |
|------|----------|------|
| 视觉-文本对比 | RemoteCLIP | 双流对比, RS5M 数据集 165K |
| In-context FM | SkySense++ (Nature MI 2025) | 语义→zero-shot, 首个 RS in-context FM |
| LLM agent | Earth AI (Google 2025) | Gemini 驱动, 跨模态推理 agent |

**当前状态:** VLM 的 zero-shot 能力在遥感中远不如 CV 领域成熟。RemoteCLIP 的 zero-shot 与监督学习差距仍然很大。

---

## 三、设计轴二：预训练数据

### 3.1 数据源谱系

| 数据源 | 代表数据集 | 规模 | 地理分布 | 公开 |
|--------|-----------|------|----------|------|
| ImageNet | ImageNet-1k/22k | 1.2M/14M | 全球 (自然图像) | ✓ |
| 通用网络图像 | JFT-300M, IG-1B | 300M/1B | 全球偏西方 | ✗ |
| 遥感域内 - 中型 | BigEarthNet, SSL4EO-S12, fMoW-Sentinel | 60万-100万 | 欧洲/北美中心 | ✓ |
| 遥感域内 - 大型 | RingMo 210万, SkySense 2150万, AgriFM 2500万 | 百万-千万级 | 多数地理分布不公开 | 多数 ✗ |
| 多源数据 | GeoPile 60万 (Mendieta et al.) | 60万 | 多源组合 | ✓ |

### 3.2 核心发现

**1. 域内数据 >> ImageNet**
- SeCo: +6 个百分点
- 遥感综述: 被多次验证

**2. 数据多样性 > 数据规模**
- GeoPile 多源组合 > 单一 Sentinel-2
- 四季节数据 (SeaMo, SSL4EO) > 单季节
- SkySense 2150万 → 边际收益递减

**3. 地理平衡是致命弱点**
- PANGAEA 区域域差测试: 所有模型崩溃 47-65%
- 当前数据集严重偏向北美和欧洲
- 全球南方 (雨林、极地、海洋) 严重欠采样

**4. 数据质量 + 域匹配 > 纯数据量**
- 预训练分辨率/光谱与下游不匹配时性能显著下降
- PANGAEA: 高分辨率预训练 (Scale-MAE) 的高分数据与低分下游任务不匹配 → 性能下降

### 3.3 数据策略的开放问题

- 最优的数据配方：多源混合 vs 单一高质量源？地理平衡 vs 专注特定区域？
- 数据治理：大多数大规模 RS 数据集不公开 (RingMo, SkySense, RingMoE)
- 时序数据的处理：动态采样 vs 固定窗口？

---

## 四、设计轴三：规模的影响

### 4.1 规模定律在遥感中的证据

**遥感大模型综述 (2023):** "亿级规模模型（Cha et al.）显示出边际收益递减——架构设计比纯规模更重要"

| 模型规模 | 代表 | 关键表现 |
|----------|------|----------|
| 22M-89M (Small) | SoftCon, msGFM, SeaMo | 高效，在多数基准有竞争力 |
| 86M-300M (Medium) | ViT-B, Swin-B, DINOv2 | 遥感 FM 的"甜点区间" |
| 2.06B (Large) | SkySense | 在部分任务被 300M 级超越 |
| 14.7B (Very Large) | RingMoE | 512×Ascend, 无法独立验证 |

### 4.2 规模军备竞赛 vs 效率革命

六条证据质疑遥感中的"越大越好"：

1. **SoftCon (22M-86M):** 100 epoch > SkySense (2.06B) 1000 epoch
2. **SeaMo (86M):** 200 GPU-h = SOTA, RTX4090 可复现
3. **msGFM (89M):** 跨传感器 MIM, 有竞争力
4. **PANGAEA:** UNet (简单卷积) 在简单任务上压倒所有 FM
5. **遥感综述:** 规模收益递减
6. **持续预训练:** 8× 计算节省，300M 级模型与 2B+ 持平

### 4.3 遥感规模的特殊性

遥感 FM 与 NLP/CV 的核心差异：
- 遥感图像的信息密度和多样性有限于 nadir 视角
- 域内数据的关键性 > 数据规模
- 遥感缺乏类似 NLP 的"互联网级"文本多样性

**结论:** 遥感 FM 的最优规模可能在 300M-1B 之间，超过此范围的收益急剧递减。

> **2026-06-11 更新**：Nested Learning (Behrouz et al., NeurIPS 2025) 的"增加嵌套层级 > 增加层数"洞见为遥感预训练的效率革命提供了理论支撑。SeaMo 的渐进式训练（Phase 1→Phase 2）可被重新理解为"增加预训练阶段的嵌套层级"——第一阶段学习空间表示（高频知识），第二阶段学习时序融合（低频知识），与 HOPE 的 Continuum Memory System 多频率更新机制在概念上同构。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

---

## 五、预训练范式的设计决策

### 5.1 目标选择矩阵

| 场景 | 推荐目标 | 理由 |
|------|----------|------|
| 标注极稀缺 | SSL (MAE 或对比) + 持续预训练 | SeCo/SoftCon 路线 |
| 多传感器泛化 | 跨模态 MIM + 通道感知 | CROMA, DOFA, AOM |
| 时序任务 | 时序 MIM (SatMAE 范式) + 渐进式 | SatMAE, SeaMo |
| 既有标注产品可用 | 监督预训练 (AgriFM 路线) | "免费" 监督信号 |
| 边缘部署 | 频域 MIM (RingMo-lite 路线) | 轻量化架构 |
| 多任务统一 | 对比+多粒度 (SkySense 路线) | 但需权衡计算成本 |
| 未来前沿 | VLM / In-context (SkySense++ / RemoteCLIP) | 仍在快速演进 |

### 5.2 目标的组合

**CROMA 的设计哲学:** MAE + 对比学习联合训练
- 跨模态 MIM 学习重建
- 跨模态对比学习对齐表示
- trade-off: 额外超参调优负担

**SeaMo 的渐进式设计:**
- Phase 1: 空间 MIM → 学习空间表示
- Phase 2: 时序融合 MIM → 学习时序表示
- 优势: 每阶段目标单一，训练稳定

---

## 六、预训练范式的演进规律

### 6.1 三条主线

1. **从通用到领域**: ImageNet → 域内 SSL (SeCo) → 域内 MAE (SatMAE) → 持续预训练 (SoftCon)
2. **从单模态到多模态**: 光学 → SAR+光学 (CROMA) → 多传感器 MoE (RingMoE) → 波长感知 (DOFA/AOM)
3. **从"更多"到"更聪明"**: 大规模 MIM → 渐进式 (SeaMo) → 软对比 (SoftCon) → 免费监督 (AgriFM)

### 6.2 未解决的张力

| **MIM vs 对比学习**: SatMAE 范式设定者 vs SoftCon 效率证明者——尚无公平的 head-to-head 系统对比
2. **从头训练 vs 持续预训练**: SoftCon/Towards GFMs 暗示持续预训练更优，但需要更多证据
3. **纯 SSL vs 弱监督**: "On the Foundations" 认为弱监督可能更实际，但 AgriFM 的监督预训练与 SSL 的直接对比有限
4. **统一范式 vs 任务定制**: SkySense 的通用性 vs SeaMo 的针对性——哪个更有前途？

> **2026-05-20 更新**：AgriFM 的同步时空降采样效率消融（表 10）为"效率革命"论点提供了直接的量化证据——同步降采样在减少 40-45% 训练时间、60-70% FLOPs 的同时，还改善了复杂分类任务（LULC 制图 mF1 57.58 → 60.49）的性能。详见 [[L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m]]。

---

## 七、开放问题

1. **MIM 和对比学习的最优组合是什么？** CROMA 的 MAE+CL 联合训练有前途，但超参调优负担重
2. **何时从零训练 vs 何时持续预训练？** 需要更大规模的 fair comparison
3. **SAR 编码的最优预训练范式？** PANGAEA 显示 SAR 反而降低性能——SAR 编码存在根本性挑战
4. **VLM 预训练在遥感中能否达到 CV 中的 zero-shot 水平？** 当前差距仍然巨大
5. **MoE 预训练在遥感中是否可持续？** 14.7B MoE 需要 512×Ascend——这在碳意识和可复现性方面都是问题
6. **预训练数据的"最优配方"？** 多源 vs 纯规模, 地理平衡 vs 专注特定区域
7. **物理一致性如何融入预训练？** "On the Foundations" 将物理一致性列为 11 大必备特征之一，但当前 0 个模型满足

### 2026-06-14 跨引用更新（Daily Reading Agent 重读 CTM + MiniMind-O）

**CTM 的神经元级模型（NLMs）扩展预训练目标到神经元动态：**

当前所有预训练范式（MIM、对比学习、next-token prediction）都假设神经元是**静态激活函数**（ReLU、GELU）。CTM (Darlow et al., NeurIPS 2025) 的 Neuron-Level Models (NLMs) 将预训练目标扩展到了**"神经元动态的学习"**——每个神经元学习如何处理自己的历史 pre-activation。

- **NLMs 的核心设计**：每个神经元拥有私有权重（深度 1 MLP），处理 M 维 pre-activation 历史，生成复杂的神经元级活动动态
- **预训练含义**：如果 NLMs 成为标准组件，预训练目标需要从"学习表示"扩展到"学习动态"——即不仅学习静态特征，还要学习如何利用时序信息
- **遥感应用潜力**：遥感数据天然具有时序维度（卫星重访周期）。当前时序预训练（SatMAE、SeaMo）将时序作为输入结构，但神经元处理仍然是静态的。NLMs 可以将时序处理下沉到神经元级别，实现更细粒度的时序建模
- **开放问题**：NLMs 增加了参数量（每个神经元私有 MLP），在遥感 FM 的"效率优先"语境下，这种代价是否值得？

**MiniMind-O 的渐进式解锁训练策略：**

MiniMind-O (Gong, 2026) 的代码揭示了 `all`/`audio_proj`/`vision_proj` 三种训练模式，暗示了一种**渐进式解锁**策略：
- 先 projector-only 训练建立模态对齐（低学习率 5e-4，快速收敛）
- 再 full-model 训练优化完整循环（低学习率 5e-6，精细调整）
- 这种"先粗后细"的策略在 0.1B 规模下有效，但在更大规模模型中可能需要更复杂的渐进方案

- **与 SeaMo 渐进式训练的对比**：SeaMo 的 Phase 1→Phase 2 是"目标渐进"（空间 MIM → 时序融合 MIM），MiniMind-O 的 projector→full 是"参数渐进"（先部分参数后全部参数）。两者代表了渐进式训练的不同维度
- **启示**：遥感 FM 的渐进式预训练可以借鉴这种"参数渐进"思路——例如，先训练模态 projector 建立跨传感器对齐，再 full-model 训练多任务头

### 2026-06-13 跨引用更新（Daily Reading Agent 重读 PANGAEA + AdaptVFMs）

**PANGAEA 的"Standard vs Few-shot"交叉点作为预训练范式选择参考：**
- PANGAEA 的核心发现：当训练样本 >1000 时，有监督模型（UNet）往往优于或匹敌 GFM；当样本 <100 时，GFM 优势显著
- 这定量定义了"预训练价值"的边界条件：预训练不是 universally beneficial，而是 data-regime dependent
- **启示**：预训练范式的选择应基于下游任务的数据量——小数据场景优先 GFM（MIM/对比预训练），大数据场景可考虑从头训练或轻量持续预训练
- Zero-shot 表现的高度任务依赖性（变化检测差、分类好）暗示：预训练表示的"通用性"是任务相关的，需要更精细的预训练-任务匹配策略

**AdaptVFMs 的"冻结编码器+轻量适配器"作为高效微调范式：**
- AdaptVFMs 采用"冻结 FastSAM/CLIP 编码器 + 1×1 Conv 适配器 + SCDM 头"的三级架构，仅训练适配器和 SCDM（~1-2% 参数可训练）
- 这与 PANGAEA 的"冻结编码器+UPerNet 解码器"评估协议一致，但 AdaptVFMs 的适配器更轻量（1×1 Conv vs UPerNet 的多级融合解码器）
- **启示**：在数据极度稀缺（如 42K 图文对微调 CLIP）时，轻量适配器（1×1 Conv）比重型解码器（UPerNet）更高效——因为预训练编码器的知识需要最小干扰
- 但 AdaptVFMs 的 12×3090 GPU 需求（Table 4 消融实验）提示：即使参数高效，遥感 FM 微调仍需大量计算——这是"参数效率≠计算效率"的实例

---

## Related Problems

- [[geo-foundation-models]] — 预训练范式的全景框架
- [[model-efficiency]] — 效率革命正在解构规模军备竞赛
- [[data-scarcity]] — SSL 是数据稀缺的系统性解
- [[modality-fusion]] — 多模态预训练是当前演化方向
- [[open-source-reproducibility]] — 范式对比需要开源权重

### 2026-05-27 跨引用更新

**ResNet 的残差连接是遥感预训练范式的基石：**
在所有五个预训练阶段（监督→对比→MIM→监督预训练→VLM），ResNet 架构或其变体都是最广泛使用的 backbone。残差连接使得极深网络（ResNet-152）的训练成为可能，并间接为 ViT（Transformer in Vision）的残差块提供了设计灵感。该 L3 页面在讨论 MIM 和对比学习范式时隐式依赖 ResNet 架构，但未将其明确列为范式演进的关键节点。详见 [[../L0_raw/deep-residual-learning-for-image-recognition/review.md]]。
