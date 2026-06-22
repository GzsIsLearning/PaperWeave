---
title: 遥感模型效率 — 如何用更少资源做到更好
created: 2026-05-02
updated: 2026-05-18
type: module
problem: model-efficiency
tags: [remote-sensing, model-efficiency, lightweight, sparse-routing, data-efficiency, training-efficiency, inference-efficiency]
sources:
  - L0_raw/change3d-revisiting-change-detection-and-captioning-from-a-video-modeling-perspe.md
  - L0_raw/ringmo-lite-a-remote-sensing-multi-task-lightweight-network-with-cnn-transformer.md
  - L0_raw/multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre.md
  - L0_raw/seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data.md
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining.md
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-.md
  - L0_raw/scaling-vision-with-sparse-mixture-of-experts.md
  - L0_raw/遥感大模型进展与前瞻.md
  - L0_raw/on-the-foundations-of-earth-foundation-models.md
  - L0_raw/遥感基础模型发展综述与未来设想.md
  - L0_raw/self-supervised-learning-in-remote-sensing-a-review.md
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m.md
zotero_keys: []
confidence: high
---

# 遥感模型效率：更小、更快、更便宜，但不牺牲性能

## 核心问题

遥感基础模型正在经历"规模军备竞赛"——RingMoE 14.7B 参数 + 512×Ascend，SkySense 2.06B 参数 + 80×A100-80G。然而，越来越多的证据表明：**架构设计和预训练策略远比参数规模重要**。本文围绕四种效率策略组织证据，揭示"效率悖论"——更小、更聪明的模型如何经常击败更大、更昂贵的模型。

---

## 一、"效率悖论"：当300M 击败 2B+

### 1.1 核心证据

**遥感大模型综述 (2023) 明确指出：**"亿级规模模型显示出边际收益递减——架构设计比纯规模更重要"。

| 模型 | 参数规模 | 计算量 | 关键结果 | 可复现性 |
|------|----------|--------|----------|----------|
| **SoftCon** | ViT-S/B (~22M/86M) | 8×A100/15h | 100 epoch > SkySense 1000 epoch (BigEarthNet 86.8 mAP) | 代码开源 |
| **SeaMo** | ViT-B (~86M) | 200 GPU-h | SOTA, 单张RTX4090可复现 | 代码开源 |
| **msGFM** | Swin-Base (89M) | 未明确 | 跨传感器MIM，性能有竞争力 | 部分开源 |
| RingMo-lite | 28.3M | 4.5G FLOPs | 参数减少60%+，精度降<2% | 闭源 (MindSpore) |
| **Change3D** | X3D-L (1.60M) | 1×RTX 3090 | 8个benchmark SOTA, 6-13%参数/8-34%FLOPs of SOTA | 代码开源 |
| SkySense | 2.06B | 80×A100-80G | 被SoftCon/SeaMo在多个任务超越 | 闭源 |
| RingMoE | 14.7B | 512×Ascend | 非NVIDIA生态，无法社区验证 | 闭源 |

**关键张力：** 14.7B 参数的 RingMoE 和 2.06B 的 SkySense 投入了学术界无法企及的计算资源，但 300M 级的 SoftCon/SeaMo/DINOv2 持续预训练模型在多数基准上持平或超越。**遥感 FM 的边际收益拐点可能远低于 CV/NLP。**

---

## 二、架构效率：用更少的参数做更多的事

### 2.1 CNN-Transformer 混合架构

**RingMo-lite (IEEE TGRS 2024, 中科院空天院):**

核心思想：Transformer 本质是低通滤波器（捕获全局上下文），CNN 本质是高通滤波器（保留局部细节）。遥感目标同时需要两者。

- **FIFB (Frequency-domain Interactive Fusion Block)**: CNN 分支和 Transformer 分支并行提取高低频特征后融合
- **FD-MIM (Frequency Domain MIM)**: DFT 频域分析 → 高低频分类 → 滤波 → 随机像素掩码 —— 比标准 MIM 更高效的预训练
- **结果**: 28.3M 参数 vs RingMo 87.8M (-67.7%), FLOPs 4.5G vs 15.4G (-70.8%)，精度仅降 <2%

**设计启示**: 混合架构在遥感边缘部署场景有巨大价值。CNN 的低延迟和 Transformer 的高表达能力的组合是最优的。

**Change3D (CVPR 2025 Highlight):** 将双时相变化检测重定义为视频建模。X3D-L 视频编码器 + 可学习感知帧在 1.60M 参数下（6-13% of SOTA）统一覆盖 BCD/SCD/BDA/CC 四个任务。关键设计：感知帧作为可学习参数在 3D 卷积中与双时相特征直接交互，省掉了所有显式变化提取器。在 LEVIR-CD 上 F1 91.82（SOTA），仅用 1×RTX 3090。详见[[L0_raw/change3d-revisiting-change-detection-and-captioning-from-a-video-modeling-perspe]]。

**设计启示**: 视频编码器的运动感知能力可迁移到变化检测——预训练数据量-性能饱和在 K400 的 75%（~1.4M 帧），远低于 CLIP 的 400M。这为遥感提供了一条"从视频理解借力"的高效路径。

### 2.2 多尺度高效架构

**SatMAE++ (NeurIPS 2023):** 卷积上采样块替代 Scale-MAE 的 Laplacian 金字塔解码器，标准正弦编码替代 GSD 位置编码 —— 简化架构同时加速下游收敛 20→12 epoch。

### 2.3 MoE 稀疏路由

**V-MoE (NeurIPS 2021 Spotlight):** 首次大规模视觉 MoE。核心贡献：
- MoE 层替代 ViT 中每隔一层的 MLP，每个 patch token 独立路由到 k 个 expert
- **Batch Prioritized Routing (BPR)**: 推理时可动态跳过不重要 patch，节省 ~20% FLOPs
- ImageNet-21k 预训练表现差（数据量不足），需要 JFT-300M 级别数据 —— **MoE 需要大规模数据才能发挥稀疏计算优势**

**遥感 MoE 应用 (RingMoE, 2025):**
- 模态专家/协作专家/共享专家三元体系
- 14.7B 参数，512×Ascend
- **关键问题**: 路由正则化不足可能导致"赢者通吃"的专家退化

**MoE 的划算性争议:**
> geo-foundation-models.md 指出："14.7B MoE vs 300M DINOv2 持续预训练——目前证据不支持大 MoE"

但 msGFM (89M Swin-Base, 跨传感器 MIM+MoE) 证明 **小规模 MoE 也有竞争力**。

---

## 三、数据效率：用更少/更便宜的数据做预训练

### 3.1 持续预训练：8× 计算节省

**Towards GFMs via Continual Pretraining (WACV 2024?):**

核心思想：从 ImageNet 预训练权重出发做持续预训练，而非从头训练遥感模型。
- 教师-学生架构：ImageNet-22k 教师冻结 + 学生 MIM + 特征蒸馏
- **8× 计算节省** vs 从头训练
- GeoPile 多源数据 (60万) 优于单一 Sentinel-2

### 3.2 免费监督信号

**AgriFM (2025):**
- 用 GLC_FCS30D 土地覆盖产品提取土地覆盖比例作为预训练监督
- 利用地理坐标自动获取标注 —— **几乎零成本获取监督信号**
- 2500万+ 影像预训练，无需人工标注

**SoftCon (IEEE TGRS 2024):**
- 利用 Dynamic World 自动土地覆盖标签作为"软标签"
- 多标签软对比损失替代硬正负样本对比
- **"免费标注 + 免费 FM = 极高效率"**
- 780K 图像，100 epoch 超越 SkySense 1000 epoch

### 3.3 未标注/未整理数据的使用

**Seasonal Contrast (SeCo, ICCV 2021):**
- 自建 100万 Sentinel-2 无标注数据
- 城市周边高斯采样 + 季节变化作为自然增强
- **首个证明**: 域内 SSL (BigEarthNet 87.81%) 远优于 ImageNet 预训练 (~82%)

---

## 四、训练效率：用更少的 GPU 时达到 SOTA

### 4.1 效率配方

从高效模型中提炼的共同要素：

| 策略 | 代表工作 | 效率来源 | 量化收益 |
|------|----------|----------|----------|
| **持续预训练** | Towards GFMs via Continual Pretraining | 复用 ImageNet 权重 | 8× 计算节省 |
| **软对比替代硬对比** | SoftCon | 多标签软对比利用数据内在多义性 | 100ep vs 1000ep |
| **渐进式训练** | SeaMo | Phase1: 空间MIM → Phase2: 时序融合MIM | 200 GPU-h = SOTA |
| **免费监督信号** | SoftCon, AgriFM | Dynamic World, GLC_FCS30D 自动标注 | 零标注成本 |
| **复用开源权重** | SoftCon | DINOv2 作为起点 | 训练时间大幅缩短 |
| **数据增强创新** | SeCo | 季节变化 = 自然增强 | 无需额外标注 |

### 4.2 渐进式训练

**SeaMo (2025):** Phase 1 空间 MIM → Phase 2 时序融合 MIM，逐阶段引入复杂度。最终 **200 GPU-h 达到 SOTA**，单张 RTX4090 即可复现 —— 这在遥感 FM 领域极为罕见。

---

## 五、推理效率：部署到边缘和设备端

### 5.1 轻量化部署

**RingMo-lite 的部署设计:**
- 基于华为 MindSpore 框架，集成华为 AI 芯片
- 28.3M 参数适合星载/机载/边缘设备推理
- FLOPS 4.5G vs RingMo 15.4G (70% 节省)

### 5.2 推理时动态计算

**V-MoE BPR 机制:**
- 推理时 k (expert 数) 和 C (capacity) 均可调，无需重新训练
- k 从 2→1 节省 ~50% FLOPs
- C=0.5 仅处理 50% tokens 仍保持性能
- 为遥感推理场景（星上处理、实时监测）提供重要方向

---

## 六、效率悖论的深层含义

### 6.1 遥感 FM 的边际收益拐点

遥感 FM 与 CV/NLP 的规模定律不同：

1. **遥感数据的信息密度有限**: 单张遥感图像的自然变化低于自然图像（nadir 视角的约束），大规模预训练的收益递减更快
2. **域内 SSL 的关键性**: SeCo 证明 100万 域内数据 > ImageNet 1400万 通用数据 —— 数据质量（域匹配）> 数据规模
3. **开源权重复用**: ImageNet/DINOv2 提供了强大的起点，持续预训练比从头训练高效得多

### 6.2 什么时候大模型确实必要？

从 PANGAEA benchmark 的发现：
- **简单任务（少类、清晰边界）**: UNet 就够了
- **充足标注（100%标签）**: 监督训练追上或超越 FM 预训练
- **预训练-下游域差距大**: FM 崩溃 47-65%
- **标注稀缺（≤10%标签）**: 大 FM 的核心价值场景
- **多任务泛化/跨传感器**: 大 FM 的优势场景

### 6.3 不效率的代价

> "On the Foundations" (Nature 2025) 指出：碳足迹被系统性忽略。SkySense 80×A100-80G、RingMoE 512×Ascend 的碳成本未被任何论文报告。

---

### 2026-06-14 更新：CTM 时间自适应计算 + MiniMind-O 训练配方

**CTM 的时间自适应计算：推理效率的新维度**

CTM (Continuous Thought Machines, Darlow et al., NeurIPS 2025) 提出了一种与空间稀疏（如 V-MoE BPR）互补的推理效率策略：**时间自适应计算**。

- **核心机制**：CTM 的损失函数同时优化"最小损失 tick"和"最大确定性 tick"，使模型在每个样本上自动学习"何时停止思考"。简单任务在 10 tick 内即可达到 0.8 确定性阈值停止，复杂任务持续计算至 50 tick。
- **与空间稀疏的互补性**：V-MoE BPR 跳过不重要 patch（空间维度节省），CTM 减少不必要的内部 tick（时间维度节省）。两者结合可实现**二维推理效率优化**：空间稀疏 + 时间自适应。
- **遥感应用潜力**：遥感推理场景（星上处理、实时监测）中，输入数据的复杂度差异极大（均匀农田 vs 复杂城市）。时间自适应计算可以根据输入复杂度动态分配计算资源，而非对所有输入使用固定计算量。

**MiniMind-O 的 4×3090/~4 小时训练配方**

MiniMind-O (Gong, 2026) 在 0.1B 活跃参数规模下，实现了完整的 text-speech-image omni 循环训练：

| 阶段 | 数据 | 模式 | 时间 (4×3090) |
|------|------|------|---------------|
| T2A | 1.25M 样本, 1636h 语音 | Full-model | ~45 min |
| A2A proj | 414K 样本 | Projector-only | ~25 min |
| A2A full | 414K 样本 | Full-model | ~75 min |
| I2T proj | ~100K 样本 | Projector-only | ~varies |
| I2T full | ~100K 样本 | Full-model | ~45 min |
| **总计** | | | **< 4 小时** |

- **效率来源**：0.1B 活跃参数 + bf16 混合精度 + 渐进式解锁（先 projector 后 full-model）
- **可复现性**：完整代码 + 权重 + Parquet 训练数据发布，Apache-2.0 许可
- **与遥感 FM 的对比**：SeaMo (200 GPU-h) 和 SoftCon (8×A100/15h) 是遥感领域的高效标杆，但 MiniMind-O 展示了在**多模态 omni 领域**同样可以实现消费级 GPU 可复现的研究。

**低秩接口的参数效率**

MiniMind-O 的 TalkerHead/TalkerEmbedding 使用 rank-256 低秩适配器处理 8 个 Mimi codebook：
- 共享 base（不重复 8 次）+ 轻量 per-codebook adapter
- 论文消融显示：moderate ranks 已恢复大部分收敛增益
- 为边缘部署的模型压缩提供了新思路：低秩分解不仅适用于 LoRA 微调，也适用于多码本/多头的输出接口设计

---

## 七、设计决策：什么时候选什么效率策略？

| 场景 | 推荐策略 | 避免 |
|------|----------|------|
| 边缘/星载部署 | 混合架构 (CNN+Transformer) 轻量化 | 大 ViT, MoE |
| 学术界有限预算 | 持续预训练 + 软对比 | 从头训练, 大 MoE |
| 标注极度稀缺 | 免费监督信号 (Dynamic World, GLC) | 纯无监督 MIM |
| 多传感器泛化 | 通道感知架构 (AOM, msGFM) | 单一传感器固定编码 |
| 时序任务 | 渐进式训练 (SeaMo) | 全量端到端 |
| 大算力工业场景 | 稀疏 MoE (但注意边际收益) | 盲目扩展密集参数 |

---

### 8.6 归一化效率：移除 LayerNorm 的 bias/gain 节省参数**

> **2026-05-20 更新**：LayerNorm 分析（Xu et al., 2019, NeurIPS）发现 bias 和 gain 参数增加了过拟合风险且在多数数据集上不工作。LayerNorm-simple（移除 bias 和 gain）在 4/8 数据集上超过标准 LayerNorm。对于遥感模型（如 AgriFM 的 Video Swin 使用 PreNorm），可直接采用 LayerNorm-simple 在不损失性能的前提下减少参数和过拟合风险。详见 [[L0_raw/understanding-and-improving-layer-normalization]]。

## 开放问题

1. **遥感 FM 的最优效率边界在哪？** 300M 是否已经足够？还是 1B+ 仍有关键能力未被挖掘？
2. **MoE 在遥感中是否划算？** 14.7B MoE 的证据不充分 —— 需要更大规模的持续预训练 vs 大 MoE 的公平对比
3. **边缘推理的最优架构？** CNN-Transformer 混合 vs 纯 ViT 知识蒸馏 vs NAS
4. **碳成本如何量化？** 如何建立遥感 FM 训练的碳足迹报告标准？
5. **持续预训练是否会遭遇灾难性遗忘？** SoftCon 的成功暗示不会，但缺乏系统研究
6. **数据效率和方法效率的最优组合？** SoftCon (数据效率 + 训练效率) 是目前最佳配方

> **2026-06-11 更新**：Nested Learning (Behrouz et al., NeurIPS 2025) 提出的 Deep Momentum Gradient Descent (DMGD) 为遥感 FM 训练提供了"免费午餐"——用 MLP 替代线性的 momentum 矩阵，在不改变架构的情况下仅通过更换优化器提升收敛速度和最终性能。这与 SoftCon 的"免费标注+免费 FM"效率哲学一致：SoftCon 利用外部免费资源（Dynamic World 标注 + DINOv2 权重），DMGD 利用更强大的优化器内部机制。两者代表了效率革命的两种路径：外部资源利用 vs 内部机制改进。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

---

## Related Problems

- [[geo-foundation-models]] — 基础模型设计的完整框架
- [[data-scarcity]] — 数据稀缺是效率革命的底层驱动力
- [[pretraining-paradigm]] — 预训练目标的演进与效率的关系
- [[modality-fusion]] — 多模态融合的效率权衡
- [[open-source-reproducibility]] — 闭源模型无法验证效率声明

### 2026-05-27 跨引用更新

**历史先例：ResNet (CVPR 2016) 的效率革命雏形**
ResNet-152 (11.3 GFLOPs) 以低于 VGG-16 (15.3 GFLOPs) 的计算量达到了近 10 倍深度。瓶颈块 (1×1→3×3→1×1) 的设计节约约 17 倍参数量，是"聪明的架构设计 > 暴力堆层"的经典先例。这一历史案例表明，深度网络的效率革命并非遥感领域的独特现象，而是深度学习发展的底层规律。当前遥感 FM 的"效率革命"论点（SoftCon、SeaMo）可以视作这一规律的延续。详见 [[../L0_raw/deep-residual-learning-for-image-recognition/review.md]]。

**新例证：ERA (Nature 2025) 的纯规则方法超越深度模型**
ERA 在 GIFT-Eval 时间序列基准上，用纯规则构造方法（不使用任何深度学习库）超越了所有基础模型和深度学习方法。这进一步支持了"效率革命"论点——在可评分任务的设定下，精心设计的简单算法可以击败庞然大物。详见 [[../L0_raw/an-ai-system-to-help-scientists-write-expert-level-empirical-software/review.md]]。
