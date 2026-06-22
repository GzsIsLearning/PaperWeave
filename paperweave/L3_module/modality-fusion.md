---
title: 遥感多模态融合：范式的演进与未解难题
created: 2026-04-29
updated: 2026-06-07
type: module
problem: modality-fusion
tags: [remote-sensing, multimodal, fusion, open-problem, sar, optical, hyperspectral, lidar, temporal, moe, cross-attention, missing-modality]
sources:
  - L0_raw/croma-remote-sensing-representations-with-contrastive-radar-optical-masked-autoe
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-
  - L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr
  - L0_raw/seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing
  - L0_raw/neural-plasticity-inspired-multimodal-foundation-model-for-earth-observation
  - L0_raw/a-semantic-enhanced-multi-modal-remote-sensing-foundation-model-for-earth-observ
  - L0_raw/bridging-remote-sensors-with-multisensor-geospatial-foundation-models
  - L0_raw/remote-sensing-meta-modal-representation-for-missing-modality-land-cover-mapping
  - L0_raw/summit-a-sar-foundation-model-with-multiple-auxiliary-tasks-enhanced-intrinsic-c
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m
  - L0_raw/rs-moe-a-vision-language-model-with-mixture-of-experts-for-remote-sensing-image-
  - L0_raw/vlmo-unified-vision-language-pre-training-with-mixture-of-modality-experts
  - L0_raw/scaling-vision-with-sparse-mixture-of-experts
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining
  - L0_raw/any-optical-model-a-universal-foundation-model-for-optical-remote-sensing
  - L0_raw/terramind-any-to-any-generative-multimodal-foundation-model-for-earth-observation
  - L0_raw/on-the-foundations-of-earth-foundation-models
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models
  - L2_lineage/remote-sensing/representation-learning/multi-modal-fm
confidence: high
---

# 遥感多模态融合：范式的演进与未解难题

## 问题定义：为什么遥感多模态融合特别困难？

遥感数据的多模态性是**物理层面**的多模态——不同传感器基于截然不同的物理机制观测地球表面：光学传感器捕获太阳辐射的反射（受大气、云层、光照角度的强烈影响），SAR 主动发射微波并接收后向散射（反映地表介电特性和几何结构），LiDAR 测量光子飞行时间（提供精确的三维结构信息），热红外感知地表温度辐射。这使得遥感多模态融合不同于通用视觉中的 RGB-Depth 或 RGB-Text 融合——它是**跨物理机制的信息整合**。

五个根本性困难使其成为开放挑战：

1. **模态缺失是常态而非异常**。云覆盖使光学不可用，SAR 覆盖时空不连续，不同卫星有不同的重访周期和轨道参数。在任何给定时刻、给定位置，很可能只有 1-2 种模态可用。PANGAEA benchmark 证实了这一点：在 11 个下游数据集上的评估中，几乎所有模型都需要处理模态不完整的情况。

2. **分辨率差异可达数量级**。Sentinel-2 光学（10m）、Sentinel-1 SAR（10m-40m）、MODIS（250m-1km）、PlanetScope（3m）、高光谱（30m）——不同传感器的 GSD 差异超过 100 倍，信息粒度完全不同。简单的上采样/下采样会破坏或引入虚假信息。

3. **时间维度异步**。不同传感器有不同的重访周期（Sentinel-1 6-12 天、Sentinel-2 5 天、Landsat 16 天），且各自受云层/轨道影响。要配准一张"同步"的多模态影像，时间窗内可能根本没有配对数据。AgriFM 的"同步时空降采样"策略就是为了处理这种可变长度时序输入——但代价是放弃了精确的时间对齐。

4. **波段/频谱不匹配**。光学传感器可能只有 3 个通道（RGB），也可能有 13 个通道（Sentinel-2 MSI），甚至数百个通道（高光谱）。SAR 是单/双极化（VV/VH）的复数值信号。如何将任意数量的波段映射到统一的特征空间，是 AOM（通道独立分词器 SiTok）和 DOFA/DOFA+（波长条件超网络）试图回答的问题。DOFA+ 的核心洞见是：**波段差异本质上是连续的（波长参数），而非离散的类别——这使单一模型理论上可以泛化到未见过的波段**。

5. **语义鸿沟**。SAR 图像对地物的表示方式与光学截然不同——同一块农田在光学上表现为绿色调纹理，在 SAR 上表现为灰度斑点图案。模型必须学会从这两种表示中提取相同的语义概念（"这是一块玉米田"），但这两种表示在像素空间中几乎没有可辨识的相似性。CROMA 通过跨模态对比学习来对齐 SAR-光学表示空间，但这是代价高昂的——需要 100 万对配对数据，且对齐是在全局 embedding 层面，细粒度的跨模态语义对应仍未完全解决。

## 融合范式的分类学

遥感多模态融合按**信息汇合的位置**可分为五个范式。这个分类并非排它的——最新的大模型往往组合多个范式。

### 范式 1：输入级融合（Early / Input Fusion）

**核心操作**：在输入层将不同模态直接通道拼接或空间叠加，然后由统一骨干网络处理。

- **代表工作**：SkySense（2.06B）的因子化编码器在输入层接受多模态时间序列——通过 HSROI（高分辨率 ROI 编码器）、TMsI（时序多光谱编码器）和 TSARI（时序 SAR 编码器）三个子编码器将光学+SAR+时序拼接为统一 token 序列。
- **优点**：实现简单，所有模态自始至终共享参数，理论上可以学习最低层的跨模态交互。
- **致命缺陷**：模态缺失时无法工作——如果 SAR 不可用，整个输入维度坍缩，模型无法推理。因此，这个范式正在被更灵活的设计取代。

### 范式 2：特征级融合（Intermediate / Feature Fusion）

**核心操作**：各模态有独立的编码器（可以是共享结构不同权重、或完全不同的架构），在中间层进行特征交互。

**子类型 2a：独立编码 + 融合层**。CROMA（NeurIPS 2023）使用三个编码器：SAR 专用 ViT、光学专用 ViT、以及跨模态融合 Transformer。SAR 和光学各自通过 MAE + 对比学习预训练获得模态内表示，然后在多层跨模态 Transformer 中进行交互。

**子类型 2b：共享骨干 + 模态感知层**。msGFM（CVPR 2024）提出跨传感器 MIM + MoE 的设计：Swin-Base 骨干网络共享权重，但在 FFN 层使用模态感知的 MoE 专家。关键发现是：跨传感器 MIM 预训练优于单传感器 MIM——当模型被迫在一种传感器上完成掩码区域重建时，它必须学习跨传感器的几何和语义对应。

**子类型 2c：渐进式融合**。SeaMo（2025）提出渐进式 MIM + TM Fusion Block 交叉注意力方案：先用单模态 MIM 预训练编码器，再通过 TM Fusion 在中间层交替注入另一模态的信息（类似交叉注意力但不增加 O(M²) 的完全成对注意力）。

### 范式 3：决策级融合（Late / Decision Fusion）

**核心操作**：各模态独立完成从编码到分类/分割的全流程，仅在最终决策层融合（如 logit 平均、投票、学习到的加权组合）。

- **代表性场景**：当模态数量和可用性在推理时不可预测时，决策级融合是最稳健的选择。MetaModal（MetaRS）的"元模态"框架实际采用了分层融合：先在元特征空间进行特征级对齐（用协方差矩阵监督来解耦模态特定和模态不变特征），再在决策空间进行任务适应的融合。
- **优点**：模态缺失对系统的影响最小——未被激活的模态分支可以简单跳过后仍正常工作。
- **缺点**：放弃了跨模态低级交互的学习机会。PANGAEA 的实验显示，在多模态信息互补性强的任务上（如 SAR+光学的洪水分割），决策级融合显著弱于特征级融合。

### 范式 4：交叉注意力融合（Cross-Attention Fusion）

**核心操作**：一个模态的 query 对另一个模态的 key/value 进行注意力计算，实现细粒度的模态间信息交换。

- **代表工作**：SkySense 和 SeaMo 内部都使用了交叉注意力机制。SeaMo 的 TM Fusion Block 采用有向的交叉注意力——光学→SAR 和 SAR→光学两个方向独立计算，然后拼接融合。
- **代价**：完全成对的交叉注意力复杂度为 O(M²·N²)（M 模态数，N token 数），不适用于大规模模型和多模态场景。实际中通常使用稀疏或分组的交叉注意力来缓解。
- **Semantic-enhanced FM (SkySense++)** 通过 Geo-Context Prototype（地理上下文原型学习）对空间进行分组，降低交叉注意力的有效 token 数量。

### 范式 5：混合专家路由融合（MoE Routing Fusion）

**核心操作**：不预先设计具体的融合操作，而是让路由器学习"对当前输入，应该激活哪些模态专家、以何种比例"，把融合交给可微的门控网络。

这是 2024-2025 年多模态融合的主导范式转变。MoE 在遥感多模态融合中的演进：

- **VLMO（NeurIPS 2022）**：通用 VL 预训练领域首次提出 Mixture-of-Modality-Experts (MoME)。视觉专家、语言专家、VL 联合专家分别处理各自的 FFN，共享自注意力层。关键设计：阶段预训练——先用图像预训练视觉专家，再用文本预训练语言专家，最后联合。但在 VLMO 中，"模态专家"是粗粒度的（只有 vision/text/VL 三类）。
- **M3ViT（NeurIPS 2022）**：虽非遥感专用，但提出了任务条件 MoE 的核心思想：路由器根据任务类型选择专家，推理时只激活与当前任务相关的专家。这解决了多任务学习中的梯度冲突和推理低效问题。
- **msGFM（CVPR 2024）**：首次在遥感多传感器 FM 中引入 MoE。跨传感器 MIM + MoE 验证了"模态感知的稀疏激活"在 SAR-光学融合中是有效的——不同传感器受益于不同的 FFN 专家。
- **RingMoE（2025 预印本）**：将 MoE 推向 14.7B 参数，首次提出模态/协作/共享专家的三元组设计。模态专家处理模态内信息（SAR 特有物理特性），协作专家处理跨模态交互（SAR 和光学的共同语义），共享专家处理通用视觉特征。这是 RS 领域首个真正为多模态融合设计的 MoE 架构。训练使用 512×Ascend NPU 集群（非 NVIDIA 生态）。
- **RS-MoE（IEEE TGRS 2025）**：将 MoE 路由思想从模态路由扩展到任务路由：Instruction Router 将 Caption 分解为主题/地物/关系三个子任务，各自路由到不同的专家组。1B 参数的 RS-MoE（ViT-G + Vicuna-7B）在遥感图像描述上追平 13B 通用 VLM。
- **SkyMoE（2025 预印本）**：8 专家 MoE + 对比数据增强 + Adaptive Router，在 VQA 上提升 6.56%。独特贡献：Count-Varying Cutout 解决遥感图像中地物计数虚高问题。

**MoE 路由融合的核心优势**：模态缺失时的鲁棒性天然优于其他范式——如果某种模态不可用，路由器可以自动将输入路由到可用模态的专家，而无需显式的"缺失处理"模块。

## 缺失模态的鲁棒性：一个独立但交织的子问题

模态融合的目标是"有多个时如何最好地利用"，而缺失模态鲁棒性则问"缺少一些时如何不崩溃"。这两个问题是同一枚硬币的两面。

### 现有方案的四种思路

1. **训练时随机丢弃（Dropout-based）**。MetaRS 在训练时随机丢弃某些模态的分支，强迫元特征提取器学会从任意模态子集中提取有用信息。结合协方差矩阵监督来解耦模态特定和模态不变特征。

2. **统一参数空间（Unified Parameter Space）**。DOFA+ 的波长条件超网络是最彻底的方案：SAR 和 RGB 和 高光谱的差异被还原为"中心波长"这一连续变量，超网络根据波长值动态生成每层的权重。推理时，任何波长范围的输入都可以被处理——即使训练时从未见过这个波长。AOM 采用不同的思路：通道独立分词器（SiTok）将每个波段单独 tokenize，位置编码用 MAPE（多尺度绝对位置编码）处理分辨率差异。

3. **模态补全（Modality Completion）**。通过可用的模态重建缺失模态的特征或图像，再输入融合网络。msGFM 的跨传感器 MIM 预训练本质上就是这样：模型被迫从 SAR 重建光学，反之亦然。但当前方法的重建质量仍然有限，尤其在异质地物边界处。

4. **零样本模态泛化（Zero-shot Modality Generalization）**。这是最远期但最重要的目标：模型在预训练时见过光学+SAM，但从未见过热红外——推理时来了热红外数据，模型能工作吗？目前没有任何工作系统性地解决这个问题。DOFA+ 的权重插值（对不同波长组进行线性插值）提供了一种实现可能性，但仅在光学波段范围内验证。

### 时序不同步：被忽视的"隐藏缺失模态"

SAR 和光学图像拍摄时间可能相差数天甚至数周。在这段时间内，地表可能发生了根本性变化（作物生长、建筑开工、洪水消退）。简单地将时间不对齐的多模态数据输入融合网络，相当于在融合"不同时刻的同一个地点"——这本质上是信息污染而非信息互补。

AgriFM 通过"同步时空降采样"策略（Video Swin Transformer 的多尺度并列降采样）处理可变长度时序：不假设时间同步，而是让模型从同一位置的不同时间序列中学习时间泛化的特征。但这一方案牺牲了精确的时序对齐——它对付的是"时间融合"而非"时间对齐的多模态融合"。

SeaMo 的时序分支使用 4 个季节的数据（SSL4EO 300 万样本），但季节信息的 3 个月粒度掩盖了季节内部数天至数周的异步问题。

## 演化路线：从手设计到自学习

回顾整个领域的发展，模态融合策略的演进清晰地映射了深度学习本身的范式转移：

| 阶段 | 时间 | 架构 | 融合策略 | 代表工作 | 核心局限 |
|------|------|------|---------|---------|---------|
| 手工特征融合 | 2018 前 | SVM/RF + 手工特征 | PCA/DCA 特征变换后拼接 | — | 特征工程依赖专家知识 |
| CNN 双流融合 | 2018-2021 | 双/多分支 CNN | 中间/后期特征拼接或加权 | Two-Stream CNN | 模态数固定，新增模态需重新设计 |
| Transformer 对齐 | 2022-2023 | ViT 双编码器 + 交叉注意力 | 对比学习对齐 + 层间交叉注意力 | CROMA, msGFM | 计算 O(M²)，且模态对配对数据有强依赖 |
|| 超网络统一 | 2024 | ViT + 条件超网络 | 波长→动态权重生成 | DOFA, DOFA+, AOM | 目前仅限于波段差异较小的模态 |
|| MoE 路由 | 2025 | ViT/Swin MoE | 模态/协作/共享专家 + 可微路由 | RingMoE, SkyMoE, RS-MoE | 路由器可能退化，训练不稳定 |
|| 生成式Token | 2025 | Transformer + FSQ | 模态离散化→统一token序列→交叉熵分类 | TerraMind | 模态特定tokenizer，无时间建模 |
|| **VLM 多模态语义融合** | 2025- | VLM + MoE | 自然语言桥接视觉模态 + MoE 分解任务 | RS-MoE, SkyMoE, VHM | 计算成本极高，遥感图文数据稀缺 |

> **2026-05-20 更新**：AgriFM（详见 [[L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m]]）的非配对多源学习策略（不进行空间对齐的时序序列处理）提供了"模态缺失鲁棒性"的一个新范式——通过共享预训练目标（土地覆盖比例）而非共享架构参数来实现跨模态表示对齐。这一策略特别适用于农业制图场景中不同传感器（MODIS 250m, Landsat 30m, Sentinel-2 10m）的融合，绕开了几何对齐的工程难题。

**2026-06-11 更新**：Nested Learning (Behrouz et al., NeurIPS 2025) 的 HOPE 架构为遥感多模态融合提供了新视角。HOPE 的 Continuum Memory System (CMS) 通过不同频率的 MLP 块实现多时间尺度知识存储，这与遥感时序数据的**多尺度时间结构**天然匹配（高频：日/周尺度作物变化；中频：月/季节物候周期；低频：年/多年土地利用变化）。将 CMS 的频率分层思想应用于遥感时序编码器，可能实现"一次前向传播同时提取多时间尺度特征"，而无需显式的多尺度窗口设计（如 Prithvi 的 3D PE 或 SeaMo 的渐进式训练）。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

这一演进的核心趋势是：**从显式设计融合操作→让模型学习何时/如何融合**。手工设计 → CNN 习得特征融合 → Transformer 习得跨模态注意力 → 超网络习得波段-权重映射 → MoE 路由器习得模态-专家分配。每一步都减少了对先验知识的依赖，增加了模型的适应能力。

## 开放问题

1. **MoE 路由器在模态缺失时的退化问题**

当训练中始终可用的模态在推理时缺失，路由器的输入分布发生了根本性偏移。训练时路由器学会 "SAR + 光学 → 激活专家 A 和 B"，推理时只有 SAR，路由器的 softmax 分布可能完全失效。RingMoE 的模态/协作/共享专家的三元设计提供了一种将"模态缺失"内化到架构中的思路（共享专家始终激活），但目前在没有任何模态缺失数据的训练集上，路由器的泛化能力未经充分检验。

2. **模态无关表示空间的存在性**

是否存在一个"模态无关"的表示空间，任何遥感模态映射进去后，语义概念占据相同的位置？

DOFA+ 的波长条件超网络暗示了这种可能性：如果差异仅在于波长，那么通过学习"作为波长函数的权重映射"，理论上可以将任意波长的输入投影到统一的语义空间。但 SAR 的复数值散射机制与光学反射在物理本质上完全不同——波长超网络能否覆盖这种物理鸿沟，尚无实验验证。

MetaRS 的元模态特征提供了另一种思路：不去"统一"模态，而是学习每个模态到共享元表示的映射，由下游任务自行决定使用哪些模态的元表示。但协方差矩阵监督的解耦能力有限——模态不变特征和模态特定特征之间的边界往往是模糊的、任务依赖的。

3. **时序-空间-模态的三维不对齐**

当前方法通常将问题分解为"空间对齐 + 模态融合"或"时间建模 + 模态融合"，但很少有工作同时处理三者。理想系统应能接受：不同时间、不同分辨率、不同传感器、不同模态的任意组合，输出一致的地表语义。

AgriFM 的视频 Swin Transformer + 同步时空降采样是目前最接近的方案，但其时间维度的处理本质是"多时间点组成视频"而非"对齐特定时间点"——这更适合长序列表征，而非实时监测。

4. **计算可行性的 Moore 法则悖论**

以 RingMoE 的 14.7B 参数 + 512×Ascend 集群为标志，多模态融合正在进入大规模预训练时代。但 PANGAEA 的结论令人警醒：GFM 在充分标注数据下并不始终优于有监督 UNet 基线。

这引发了一个尖锐的问题：**在多模态融合中，大规模预训练带来的收益是否超过了其计算和工程成本？** SeaMo 提供了一个积极的信号：200 GPU-h（ViT-Base）即可达到与百倍计算开销接近的性能。但 SeaMo 仅涉及 2 种模态（SAR+光学时序），当模态数从 2 扩展到 5+，其渐进式预训练策略能否保持高效尚无证据。

5. **零样本模态泛化的现实路径**

下一个关键突破可能来自零样本模态泛化：**一个在光学+SAR 数据上预训练的模型，能否在推理时理解热红外、LiDAR、或者来自全新卫星的数据，而无需任何微调？**

DOFA+ 的权重插值提供了技术原语：如果超网络学会了"波长→权重"的连续映射，那么对未见过的波长值进行线性插值可能是一种可行的零样本泛化方式。但这要求超网络的泛化性在训练-未见波长的分布外场景下成立——这需要更深入的理论和实验验证。

AOM 的 SiTok 提供了互补的思路：只要将输入表达为"波段索引+分辨率"的形式，任何光学传感器都可以被视为同构输入。但 SiTok 的 token 独立处理放弃了波段间的光谱结构——这在高光谱数据中尤其问题，因为相邻波段高度相关。

6. **Nested Learning 视角下的融合架构设计**

Nested Learning (Behrouz et al., NeurIPS 2025) 的 HOPE 架构提出了 Continuum Memory System (CMS)——通过不同频率的 MLP 块实现多时间尺度知识存储。这为遥感多模态融合提供了新的设计维度：**不同模态的信息可能具有不同的时间尺度特征**（光学：日尺度变化；SAR：周尺度变化；DEM：年尺度不变）。将 CMS 的频率分层思想与模态融合结合，可能实现"模态×时间尺度"的二维路由——每个模态在每个时间尺度上由专门的专家处理。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

### 2026-06-14 跨引用更新（Daily Reading Agent 重读 CTM + MiniMind-O）

**CTM 同步调制注意力为动态查询生成提供新思路：**
- CTM 的注意力 query 来自神经同步矩阵 $S^t$（神经元活动的时间相关性），而非静态向量。这意味着注意力权重反映的是"哪些神经元的历史活动与当前数据最相关"——一种全新的注意力语义。
- 在遥感多模态融合中，是否可以用类似的"时序动态查询生成"替代静态交叉注意力？例如，对于时序 SAR-光学融合，是否可以用 SAR 序列的神经动态来生成对光学特征的查询，而非使用固定的交叉注意力权重？
- 这代表了从"静态融合操作"到"动态融合过程"的范式转变，与 CTM 的整体哲学一致。

**MiniMind-O 的 middle-layer bridge 为"最佳融合深度"提供实证：**
- MiniMind-O 的 bridge_layer 默认选择 `num_hidden_layers // 2 - 1`（第 3/8 层），因为"embedding 太浅（无上下文），最后一层太噪（受 LM-head 分类器污染）"。
- 这一发现对遥感多模态融合有启示：在 SAR-光学融合中，是否在中间层（而非输入层或输出层）注入另一模态的特征可能更有效？当前遥感 FM 的融合策略（SkySense 输入层拼接、CROMA 多层交叉注意力）中，缺少对"最优融合深度"的系统消融。
- MiniMind-O 的代码显示 bridge_layer 是可配置参数——这暗示最优融合深度可能是任务/架构依赖的，而非固定公式。

### 2026-06-13 跨引用更新（Daily Reading Agent 重读 PANGAEA + AdaptVFMs）

**PANGAEA 揭示的"光学优先"模态偏见：**
- PANGAEA 评估的 7 个 GFM 全部为光学（RGB/多光谱）预训练，SAR/LiDAR/热红外/高光谱的预训练知识无法直接迁移
- 多模态任务（如 SEN12MS 的 SAR+光学）上，GFM 优势不如纯光学任务明显——因为 GFM 的预训练表示缺乏 SAR 知识
- **当前 GFM 的"通用性"本质上是"光学通用性"**——真正的跨模态通用表示（如 DOFA+ 的波长条件超网络）尚未实现
- 这强化了模态融合中的"零样本模态泛化"开放问题的重要性

**AdaptVFMs-RSCD 的 RGB-only 限制与多模态融合的对照：**
- AdaptVFMs 仅支持 RGB 图像，尚未适配多光谱/高光谱/SAR——这是典型的"单模态适配"范式
- 当场景需要多模态融合（如 SAR+光学变化检测）时，AdaptVFMs 的架构需要根本性重构：FastSAM 和 CLIP 均为 RGB 预训练，无法直接处理 SAR 或高光谱输入
- 这与 PANGAEA 发现的"光学-only 往往优于 optical+SAR fusion"形成有趣对照：AdaptVFMs 的 RGB-only 设计在纯光学场景下是合理的，但在多模态场景下是致命限制
- **启示**：未来的遥感 FM 适配方法必须考虑"模态可扩展性"——架构设计应预留多模态扩展接口，而非绑定到单一模态

## 关联问题

- [[multi-scale-feature-extraction]] — 不同模态天然具有不同的空间分辨率，多尺度处理和模态融合是交织的挑战
- [[data-scarcity]] — 多模态标注数据的稀缺性进一步限制了融合模型的训练和评估
- [[open-source-reproducibility]] — 大规模多模态 FM 的闭源趋势（RingMoE 未开源、SkySense 权重未公开）使融合策略的独立评估几乎不可能
