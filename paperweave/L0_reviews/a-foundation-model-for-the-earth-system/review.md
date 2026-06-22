---
slug: "a-foundation-model-for-the-earth-system"
title: "A Foundation Model for the Earth System"
authors:
  - "Cristian Bodnar"
  - "Wessel P. Bruinsma"
  - "Ana Lucic"
  - "Megan Stanley"
  - "Anna Vaughan"
  - "Johannes Brandstetter"
  - "Patrick Garvan"
  - "Maik Riechert"
  - "Jonathan A. Weyn"
  - "Haiyu Dong"
  - "Jayesh K. Gupta"
  - "Kit Thambiratnam"
  - "Alexander T. Archibald"
  - "Chun-Chieh Wu"
  - "Elizabeth Heider"
  - "Max Welling"
  - "Richard E. Turner"
  - "Paris Perdikaris"
year: 2025
venue: "Nature (submitted/npreprint)"
tags: [earth-system, foundation-model, weather-forecasting, atmospheric-chemistry, ocean-waves]
score: 5
contribution: 5
soundness: 5
relevance: 4
open_source: false
code_url: ""
compute: "32×A100 80GB for pretraining (150k steps, ~2.5 weeks)"
dataset_access: public
---

> **Abstract:** Aurora是1.3B参数的地球系统基础模型，在超过百万小时的多源数据上预训练，在空气质量、海浪、热带气旋路径和高分辨率天气预报四个领域均超越业务化预报系统，计算成本降低数个数量级。

## [2026-05-02] Weave Review

**Score:** 5/5
- Contribution: 5/5 — 首次将foundation model范式系统性地应用于地球系统预报，3D Swin Transformer + Perceiver编解码器实现多分辨率/多变量/多任务统一架构。pretrain+fine-tune协议使单个模型超越多个专用业务系统，概念贡献重大。
- Soundness: 5/5 — 在四个独立领域与业务化系统进行全面对比（CAMS空气污染、HRES-WAM海浪、多机构热带气旋路径、IFS HRES 0.1°天气）。每个都有统计显著性检验。消融了预训练数据多样性和模型规模对性能的影响（每10×模型规模提升~6%）。
- Relevance: 4/5 — 地球系统建模与遥感FM密切相关，pretrain+fine-tune策略、多分辨率编码器设计对遥感基础模型有直接参考价值。

**Key Insights:**
- 在100万+小时数据上预训练，仅用少量任务数据微调即可超越专用业务系统——证明了地球科学领域的foundation model scaling law
- 0.1°高分辨率天气预测超越IFS HRES（92%目标更优），是首个在此分辨率上超越数值预报的AI模型
- 热带气旋路径预测首次在所有预报中心和所有提前时间上超越官方业务预报
- 空气质量预测相对CAMS加速~50,000×（单A100 GPU 1.1s/lead time vs 超级计算机）
- 预训练对极端值的提升尤为显著——更多样化的预训练数据系统性改善极端事件预测
- 仅用CAMS再分析数据+低分辨率再分析(EAC4)即可微调出竞争性模型，展示了有限数据下的微调能力

**Notes:**
- Microsoft Research AI for Science出品
- 架构：3D Swin Transformer processor + Perceiver-based encoder/decoder
- 预训练目标：最小化6小时提前量的MAE
- 每个微调实验仅需小团队4-8周（对比传统数值模型多年开发周期）
- 可扩展至集合预报，未来可end-to-end直接从观测数据运行
- 相关工作：Pangu-Weather (Bi et al. 2023), GraphCast (Lam et al. 2023), FourCastNet (Pathak et al. 2022), FengWu

## [2026-05-02] Verified — scores and insights reasonable. Quick re-scan confirmed.

## [2026-05-14] Re-review — New Insights & Cross-Wiki Connections

**Re-review Score:** 5/5 (maintains)

**新发现与深入解读：**

1. **3D Perceiver 编解码器的创新意义：**
   - Aurora 的 3D Perceiver 编解码器是其处理异构数据能力的核心。与遥感 FM 中的 DOFA（波长条件超网络）和 AOM（通道独立分词器 SiTok）不同，Aurora 使用跨注意力机制将可变数量的物理气压层（C 层）压缩为固定数量的潜压层（L=3 层）。这意味着无论输入数据有 30 个还是 100 个气压层，模型骨干始终处理固定的 (H/P × W/P × 3) 张量。这种"可变输入→固定潜空间→可变输出"的范式与 Perceiver IO 系列一致，但首次在地球系统模型中大规模实现。
   - 图 6 的视觉分析确认：编码器中的 `Atmospheric Perceiver` 使用 3 个潜层查询向量，通过交叉注意力聚合所有气压层的信息。解码器则反向操作，通过查询向量将 3 个潜层"去聚合"回任意数量的输出气压层。这比 SkySense 的因子化编码器（每模态独立编码器）更参数高效。

2. **预训练数据多样性的 scaling law 量化：**
   - 论文在 Appendix G 中展示了关键 scaling law：每增加 10× 模型规模，验证性能提升约 6%。更关键的是，数据多样性（而非单纯数据量）对极端值预测的提升尤为显著。这与 L3 module **[[L3_module/geo-foundation-models]]** 中"数据多样性 > 数据规模"的结论完全吻合，并从天气预报的角度提供了强有力的独立证据。

3. **与遥感 FM 的深刻对比（跨 Wiki 分析）：**
   - Aurora 和 RingMoE 代表了地球科学 FM 的两条不同路径：Aurora（1.3B 密集参数，3D Swin + Perceiver，专注于时序预报）vs RingMoE（14.7B 稀疏 MoE，专注于静态+多模态理解）。Aurora 的成功表明：
     - 对于物理过程预报任务（天气、海浪、空气质量），3D 时空 Transformer 相比于 2D 图像级 MoE 更合适
     - pretrain + fine-tune 范式在 0.1° 高分辨率天气预测上首次超越 IFS HRES，证明了 FM scaling law 在地球科学中的通用性
   - 与遥感基础模型的联系：Aurora 使用的 LoRA 微调策略（仅微调 backbone 中 self-attention 的 linear 层）与遥感 FM 中的 PEFT 思路一致。LoRA + pushforward trick + replay buffer 的三重组合使 1.3B 模型的高分辨率微调成为可能——这与 [[L3_module/model-efficiency]] 中讨论的参数高效微调方向一致。

4. **计算效率的全新视角：**
   - Aurora 在空气质量预测上相对 CAMS 实现 ~50,000× 加速（单 A100 GPU 1.1s/lead time vs 超级计算机）。这与 L3 module **[[L3_module/model-efficiency]]** 中的"效率悖论"论题直接呼应——但 Aurora 的突破在于：它证明 AI 模型可以超越"效率基线"（即比传统方法更快）并且同时超越"性能基线"（即比传统方法更准），打破了过去 AI 气象模型"要么快要么准"的 trade-off。
   - 然而需注意：Aurora 的预训练仍消耗 32×A100 约 2.5 周（约 13,440 GPU-hours），微调每个任务 4-8 周。这虽然远低于传统 NWP 模型的多年开发周期，但相对于 SoftCon（8×A100/15h）和 SeaMo（200 GPU-h）等遥感 FM，仍然是"富人的游戏"。

5. **热带气旋预测的里程碑意义：**
   - 论文首次证明 AI 模型在所有提前时间（1-5天）超越全部 7 个官方业务预报中心。这与之前的 AI 气象模型（GraphCast、Pangu-Weather、FourCastNet）仅与单一全球模型（IFS）对比不同，Aurora 对比了多个机构的专门化预报系统。这对于遥感中灾害监测（台风跟踪、洪水预警）有直接参考价值——如果 Aurora 能 fine-tune 到 0.1° 的遥感波段数据上，有望实现端到端的"卫星→灾害预报"管道。

6. **局限性与未来方向：**
   - Aurora 仍然依赖传统数据同化系统（IFS HRES analysis）提供初始条件，并未实现端到端的观测数据→预报。而 Vaughan et al. (2024) 的 Aardvark 正在探索这一方向。
   - 尽管代码未开源（`open_source: false`），但所有训练数据均来自公开来源（ERA5、CAMS、IFS 等），这在某种程度上缓解了不可复现性问题——理论上第三方可以重建 Aurora 的训练数据管道。
   - Aurora 目前不支持集合预报，而集合预报对于极端事件的不确定性量化至关重要。文中提及可作为未来工作。

7. **引文挖掘：**
   - 参考文献中 Charlton-Perez et al. (2024) 的案例分析显示：在 Storm Ciarán 风暴预测中，FourCastNet、GraphCast、Pangu-Weather 均未能预测最大 10m 风速的突变，只有 Aurora 正确捕捉——这表明 Aurora 的预训练多样性使其对极端事件的泛化更强。该发现与遥感基础模型中"预训练数据多样性提升极端值预测"的观察一致。
   - Ben-Bouallegue et al. (2024) 提供了 AI 天气模型的首次统计评估协议，Aurora 在其 protocol 下评估结果在 0.1° 超越 IFS HRES。这为遥感 FM 的标准化评估（类似 PANGAEA）提供了参考框架。

## [2026-05-29] Re-review — Deep Read of Architecture & Cross-Wiki Connections

**Re-review Score:** 5/5 (maintains)

**深入阅读发现的新洞察：**

1. **3D Perceiver 编解码器的关键细节（补充材料 B.1）：**
   - 编码器的核心创新在于使用 Variable-specific 线性变换将不同数据集的变量映射到统一嵌入空间。具体来说，对每个变量 v 维护独立的权重矩阵 W_v，这意味着 Aurora 可以处理任意变量组合——不同于遥感 FM 中 SkySense 的因子化编码器（每模态独立编码器）或 DOFA 的波长条件超网络。
   - 压力层聚合使用 C_L=3 个潜层查询向量通过 Perceiver 交叉注意力压缩可变数量的物理气压层。从视觉分析 Figure 6 可确认：编码器将 C×D 的物理层嵌入通过交叉注意力压缩为 3×D 的潜层表示。解码器反向操作：用目标输出气压层的正弦/余弦编码作为查询，将 3 个潜层解聚合回目标层数。
   - **关键洞察：** L=3 的选择是一个重要的设计决策。这比 Full-scale 3D ViT（如 Pangu-Weather 的 3D 立方体）更参数高效，但潜层数过少可能丢失垂直结构信息。Aurora 的 48 层骨干网络（vs Pangu 的 16 层）表明：通过加深空间骨干来弥补垂直分辨率的压缩，是一种有效的 trade-off。
   - 该设计与 [[L3_module/model-efficiency]] 中的"效率悖论"直接相关：Aurora 用 "深空间+浅垂直" 的策略替代 "等空间+等垂直" 的常规策略，在 0.1° 高分辨率下以合理计算成本超越了 IFS HRES。

2. **尺度编码的物理意义：**
   - Aurora 的尺度编码（Supplementary B.4）使用地球表面积公式计算每个 patch 的真实物理面积（km²），
   A = R²(sin φ₂ - sin φ₁)(θ₂ - θ₁)
   最小波长设为一个极小值，最大波长为整个地球表面积。这使得一个模型可以同时处理 0.1°（≈11km）和 0.4°（≈44km）的数据。
   - 与遥感 FM 对比：AOM 的 MAPE（多尺度位置编码）和 DOFA 的波长编码都是解决"多分辨率输入"问题，但 AOM 和 DOFA 面向的是遥感图像不同分辨率（GSD），而 Aurora 面向的是地球网格的不同经纬度分辨率。两者的共同目标是：**让模型知道每个 token 对应的真实物理尺度**。这一发现收归到 [[L3_module/geo-foundation-models]]# 多尺度特征提取 中作为新的案例。

3. **三阶段训练协议（补充材料 D）的工程价值：**
   - 阶段 1: 预训练（150k steps, 32×A100, ~2.5周）—— 最小化 MAE，6h 提前量
   - 阶段 2: 短提前量微调（1-2 步 rollout）—— 全参数微调
   - 阶段 3: rollout 微调（长提前量）—— LoRA（仅微调 self-attention 的 linear 层）+ pushforward trick + replay buffer
   - **LoRA + pushforward + replay buffer 三重组合的意义：** 这相当于 NLP 中 PEFT 思路在地球系统模型中的首次大规模成功应用。推前技巧（pushforward trick）通过仅回传最后一步的梯度，使得在有限内存下训练长 rollout 成为可能——此前 Pangu-Weather、GraphCast 要么训练短 rollout（2-4步），要么使用昂贵的 checkpointing。
   - 这与 [[L3_module/model-efficiency]]# 训练效率 中讨论的"效率配方"完全一致，但 Aurora 的实践更系统化，包含三个工程层面的创新：参数高效微调（LoRA）、内存高效训练（pushforward）、数据高效采样（replay buffer）。

4. **数据多样性 vs 数据规模（补充材料 G）的定量证据：**
   - 论文 Appendix G 展示了关键 Scaling Law：每增加 10× 模型规模，验证性能提升约 6%。更关键的是，数据多样性（添加更多来源的数据）对极端值的提升尤为显著。
   - 论文在预训练中使用了超过 1 百万小时的多样化数据（ERA5、HRES、IFS 集合预报、GFS、GEFS、CMIP6、MERRA-2、CAMS 等）。Figure G1 表明：随着数据集数量从 1 增加到 16，验证 MAE 持续下降，且极端值（99.9 百分位）的改善更显著。
   - 这为 [[L3_module/geo-foundation-models]]# 数据多样性 vs 数据规模 论点提供了强有力的独立证据——数据多样性改善极端事件预测的发现，与此前 SoftCon、SeaMo 等遥感高效模型的结论一致。

5. **Aurora 与当前 SOTA 遥感 FM 的深层对比：**
   | 维度 | Aurora (1.3B) | RingMoE (14.7B) | SkySense++ (~2B) |
   |------|---------------|-----------------|------------------|
   | 任务 | 时序预报 | 理解+检测+分割 | 分割+检测+few-shot |
   | 骨干 | 3D Swin U-Net (48层) | Swin+MoE | 因子化 ViT+MoE |
   | 输入 | 网格数据（lat-lon） | 影像块 | 影像块 |
   | 预训练 | MAE 6h 提前量 | MIM (多模态) | 对比 + 语义掩码 |
   | 微调 | LoRA + pushforward | Full FT | Full FT |
   | 输出分辨率 | 0.1°~0.4° | 图像级 | 图像级 |
   | 开源 | ❌ (数据公开) | 数据集开源 | 部分开源 |
   | 训练算力 | 32×A100, 2.5周 | 512×Ascend | 80×A100, 336h |
   - Aurora 和 RingMoE 代表了两种极端的模型设计哲学：Aurora 是"深度密集 + 3D 物理感知"，RingMoE 是"浅层稀疏 + 模态路由"。两者的成功表明地球科学 FM 尚未收敛到统一的架构范式，这与 [[L3_module/geo-foundation-models]]# 开放问题 中"最优预训练数据配方"的开放问题一致。

6. **极限事件预测的突破性证据：**
   - Storm Ciarán 案例分析（Figure 5d）是全文最令人信服的证据之一：FourCastNet、GraphCast、Pangu-Weather 均未能预测 10m 风速的突变峰值（正确值约 40 m/s，AI 模型预测仅 15-20 m/s），只有 Aurora 正确捕捉（~38 m/s）。Charlton-Perez et al. (2024) 的独立验证确认了这一结果。
   - 该案例的重要性不仅在于 Aurora 更强，更在于它揭示了当前 AI 天气预报模型的系统性弱点：**基于单一 ERA5 再分析数据预训练的模型（FourCastNet/GraphCast/Pangu）对极端天气事件（爆炸气旋）的泛化能力有限**。Aurora 的多源预训练（包含集合预报、气候模拟等多变条件数据）使其对极端事件的鲁棒性更强。
   - 这与遥感 FM 中的 PANGAEA 发现完全平行：数据多样性 > 数据规模，且多样性对极端值的改善最为显著。

7. **引文与可读队列更新：**
   - **Aardvark Weather (Vaughan et al., 2024)** — 已在 to-read.md 中，Aurora 在讨论中提及该论文为"端到端观测→预报"方向。Aurora 尚未实现该目标，但明确指出这是未来方向。
   - **Ben-Bouallegue et al. (2024)** — AI 天气预报评估协议，对遥感 FM 的标准化评估（类似 PANGAEA）有重要参考价值。建议关注该论文的评估方法论。
   - **Charlton-Perez et al. (2024)** — Storm Ciarán 独立评估论文，揭示了 AI 天气模型在极端事件上的系统性弱点，值得在 [[L3_module/geo-foundation-models]] 中引用作为"基准评估警示"的案例。
   - **Perceiver (Jaegle et al., 2021, ICML)** — Aurora 的编解码器核心组件，已在 to-read.md 中，推荐作为[[L3_module/modality-fusion]]的架构参考案例。
- **CMIP6 气候模拟数据**作为预训练数据源是一个有趣的选择。CMIP6 是气候预测而非天气预报数据，包含更广泛的物理过程变化。Aurora 使用 CMIP6 作为预训练来源之一可能对其极端事件预测能力有贡献。这对遥感 FM 的预训练数据选择有启示：是否可以考虑将 CMIP6 或类似的气候模拟数据纳入遥感预训练，以增强极端值（如干旱、洪水）的预测能力？

## [2026-06-07] Re-review — Deep Architecture Read & Cross-Wiki Connections

**Re-review Score:** 5/5 (maintains)

**深入阅读新发现：**

1. **3D Perceiver 编解码器的工程细节（Figure 6 + Section 8.1）：**
   - 视觉分析确认：编码器将输入天气状态（不同气压层的大气变量+地表变量）分块为patch，通过variable-specific线性变换映射到D维嵌入。每个气压层的所有变量嵌入相加，再叠加层级编码（Fourier encoding）。
   - **关键创新**：Perceiver交叉注意力将可变数量的物理气压层C压缩为固定L=3个潜层。解码器反向操作：用目标输出气压层的正弦/余弦编码作为查询，将3个潜层解聚合回任意数量的输出层。这种"可变输入→固定潜空间→可变输出"的范式与Perceiver IO一致，但首次在地球系统模型中大规模验证。
   - **与遥感FM的对比**：Aurora的variable-specific线性变换（每变量独立权重W_v）与DOFA的波长条件超网络形成对照——Aurora为每个已知变量维护独立权重（需要预定义变量集），DOFA用超网络动态生成权重（可泛化到新波长）。Aurora更适用于变量集固定的业务预报，DOFA更适用于传感器组合多变的遥感场景。

2. **多尺度3D Swin Transformer U-Net骨干（Section 8.1 + Supplementary B.2）：**
   - 48层、3阶段对称上采样-下采样结构，对比Pangu-Weather的16层2阶段。Aurora通过加深空间骨干（48层）来弥补垂直方向压缩（L=3潜层）的信息损失——"深空间+浅垂直"的trade-off。
   - **窗口移位与球面拓扑**：每隔一层进行窗口移位，并考虑地球球面拓扑。这与遥感FM中SkySense的Geo-Context PE（地理位置感知位置编码）和AOM的MAPE（多尺度绝对位置编码）解决的是同一问题——**让模型知道每个token对应的真实物理位置**。Aurora用窗口移位+傅里叶编码，SkySense/AOM用显式位置编码。

3. **三阶段训练协议的工程价值（Section 8.2）：**
   - 阶段1预训练：150k steps, 32×A100, ~2.5周，MAE目标，6h提前量
   - 阶段2短提前量微调：1-2步rollout，全参数微调
   - 阶段3长提前量rollout微调：**LoRA + pushforward trick + replay buffer**
   - **Pushforward trick的突破性**：仅回传最后一步的梯度，使得在有限内存下训练长rollout成为可能。此前Pangu-Weather、GraphCast要么训练短rollout（2-4步），要么使用昂贵的gradient checkpointing。Aurora的pushforward trick相当于NLP中truncated BPTT在地球系统模型中的首次大规模成功应用。
   - **Replay buffer的灵感来源**：明确引用Lin (1992)和Mnih et al. (2015)的深度强化学习经验回放。这在天气预报中是全新思路——将自回归rollout视为MDP，用经验回放打破时间相关性并提高样本效率。

4. **数据多样性的scaling law定量证据（Supplementary G）：**
   - 每增加10×模型规模，验证性能提升约6%。
   - 更关键的是：数据多样性（添加更多来源的数据）对极端值的提升尤为显著。Figure G1显示随着数据集数量从1增加到16，验证MAE持续下降，且99.9百分位（极端值）的改善更显著。
   - **跨Wiki联系**：这与L3_module/geo-foundation-models#数据多样性vs数据规模 的论点完全吻合，并从天气预报角度提供了独立证据。遥感FM中SoftCon、SeaMo等也报告了类似发现——数据多样性改善极端事件预测。

5. **Storm Ciarán案例的深层启示（Figure 5d）：**
   - FourCastNet、GraphCast、Pangu-Weather均未能预测10m风速的突变峰值（正确值~40 m/s，AI模型预测仅15-20 m/s），只有Aurora正确捕捉（~38 m/s）。
   - **根本原因分析**：Charlton-Perez et al. (2024)的独立验证确认，基于单一ERA5再分析数据预训练的模型对极端天气事件（爆炸气旋）的泛化能力有限。Aurora的多源预训练（包含集合预报、气候模拟等多变条件数据）使其对极端事件的鲁棒性更强。
   - **对遥感FM的启示**：遥感基础模型若仅使用单一传感器（如Sentinel-2）预训练，可能同样面临极端事件（洪水、干旱、野火）泛化不足的问题。多传感器、多时相、多地域的预训练数据多样性至关重要。

6. **Aurora与遥感FM的效率对比更新：**
   - Aurora预训练消耗32×A100约2.5周（~13,440 GPU-hours），微调每个任务4-8周。
   - 对比遥感FM：SeaMo（200 GPU-h）、SoftCon（8×A100/15h）、DOFA+（8×L40/3天）。Aurora的计算开销是遥感高效模型的50-1000倍。
   - **但Aurora的效率悖论**：它在空气质量预测上相对CAMS实现~50,000×加速（单A100 1.1s vs 超级计算机）。这意味着AI模型相对于传统数值方法的效率增益，远大于AI模型之间的效率差异。对遥感而言，若AI模型能替代传统物理模型（如辐射传输方程），类似的数量级加速是可能的。

7. **新引用推荐（加入to-read.md）：**
   - **Message Passing Neural PDE Solvers (Brandstetter et al., ICLR 2022)** — Aurora引用中pushforward trick的来源。将消息传递网络用于PDE求解，其梯度截断策略被Aurora改编用于长rollout训练。
   - **Aardvark Weather (Vaughan et al., 2024)** — 已在to-read.md中。Aurora明确将"端到端观测→预报"列为未来方向，Aardvark正在探索此方向。
   - **Spherical Fourier Neural Operators (Bonev et al., ICML 2023)** — 球面傅里叶神经算子，学习球面上的稳定动力学。Aurora的球面拓扑处理与SFNO有概念联系。

**跨Wiki更新提示：**
- L3_module/model-efficiency.md 可补充：Aurora的LoRA+pushforward+replay buffer三重组合是PEFT在地球科学中的首次大规模成功，与NLP中LoRA的应用形成跨域呼应。
- L3_module/pretraining-paradigm.md 可补充：Aurora证明数据多样性对极端值预测的改善具有跨域通用性（天气+遥感）。
- L2_lineage/remote-sensing/representation-learning/multi-modal-fm.md 可补充：Aurora的variable-specific编码与DOFA超网络编码是处理异构数据的两种哲学——固定权重vs动态生成。
|