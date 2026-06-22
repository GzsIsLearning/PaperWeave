---
title: 遥感数据稀缺与标注瓶颈 — 解决策略与证据
created: 2026-04-29
updated: 2026-05-02
type: module
problem: data-scarcity
tags: [remote-sensing, data-scarcity, self-supervised, few-shot, transfer-learning, active-learning, synthetic-data, weak-labels]
sources:
  - L0_raw/self-supervised-learning-in-remote-sensing-a-review.md
  - L0_raw/seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data.md
  - L0_raw/change-aware-sampling-and-contrastive-learning-for-satellite-images.md
  - L0_raw/multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre.md
  - L0_raw/few-shot-remote-sensing-image-scene-classification-with-clip-and-prompt-learning.md
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models.md
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining.md
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m.md
  - L0_raw/on-the-foundations-of-earth-foundation-models.md
  - L0_raw/遥感大模型进展与前瞻.md
  - L0_raw/遥感基础模型发展综述与未来设想.md
  - L0_raw/a-two-stage-open-compound-domain-adaptation-framework-for-semantic-segmentation-.md
  - L0_raw/masked-autoencoders-are-scalable-vision-learners.md
  - L0_raw/satmae-pre-training-transformers-for-temporal-and-multi-spectral-satellite-image.md
  - L0_raw/simmim-a-simple-framework-for-masked-image-modeling.md
zotero_keys: []
confidence: high
---

# 遥感数据稀缺与标注瓶颈

## 问题定义

遥感领域面临一个根本性矛盾：**原始影像极度丰富，但高质量标注极度稀缺。**

- 地球观测数据档案正在爆炸式增长：~100 PB 开放数据，预计 2030 年增长至 ~500 PB
- 但标注数据 **不到总数据的 0.1%**（"On the Foundations", Nature 2025）
- 标注一张遥感图像需要领域专家 + 逐像素标注 + 实地验证，成本是 ImageNet 标注的百倍以上
- 多传感器、多季节、多地区标注难以迁移：在 Sentinel-2 上的标注不能直接用于 PlanetScope

这不仅是某个方法的限制——**数据稀缺是整个遥感 ML 的底层约束**，几乎所有 SSL/FM 研究的终极目标都是"用更少标注做更多事"。

---

## 一、自监督预训练：绕过标注的范式革命

### 1.1 为什么 SSL 是遥感的数据答案

**Wang et al. (IEEE GRSM 2022)** 将遥感 SSL 方法分为三类：

| SSL 类别 | 核心思想 | 遥感适配 | 代表工作 |
|----------|----------|----------|----------|
| **生成式 (Generative)** | 重建被破坏的输入 | MAE 掩码重建图像块 | RingMo, SatMAE, Scale-MAE, Prithvi, SeaMo |
| **预测式 (Predictive)** | 预测输入的某些属性 | 地理坐标/光谱/时序预测 (遥感特有) | Geography-Aware SSL |
| **对比式 (Contrastive)** | 拉近正样本、推远负样本 | 季节对比/变化感知对比/多模态对比/软对比 | SeCo, CACo, SoftCon, CROMA |

### 1.2 关键里程碑

**SeCo (ICCV 2021) — 首个证明域内 SSL >> ImageNet:**
- 季节变化 = 自然增强，无需标注
- 多子空间对比 (Z0 全不变 / Z1 季节不变 / Z2 增强不变)
- 自建 100万 Sentinel-2 无标注数据
- BigEarthNet 87.81% vs ImageNet 预训练 ~82% → domain gap 约 6 个百分点

**MAE (CVPR 2022) → SatMAE (NeurIPS 2022) — 掩码重建主导范式:**
- MAE 掩码 75% patches，encoder 仅处理可见块 (3× 加速)
- SatMAE 扩展到时序+多光谱：时间编码+光谱分组编码，独立 masking
- **关键消融**: 独立 masking (各时间/光谱通道独立 mask) > 一致性 masking
- 成为后续 RS MAE 工作的标准范式

**SoftCon (IEEE TGRS 2024) — 终极标签效率:**
- 利用 Dynamic World 自动土地覆盖标签作为"软标签"
- 100 epoch 超越 SkySense 1000 epoch
- SAR 编码器首次在该 benchmark 上超越多光谱
- **"免费标注 + 免费 FM = 极高效率"**

### 1.3 SSL 的边界

PANGAEA benchmark 的关键发现：
- 10% 标签时，GFM (SSL 预训练) 的优势最大
- 100% 标签时，UNet 等简单监督模型追上或超越 GFM
- 印证了基础模型的核心价值主张：**减少标注需求**，而非在充足标注下替代监督学习

---

## 二、少样本/零样本学习

### 2.1 CLIP + Prompt Learning

**Few-Shot CLIP for RS Scene Classification (2025 预印本):**
- 冻结 CLIP + 4 种 prompt learning 方法对比
- 无 RS 预训练，仅靠 prompt 适配
- 16-shot 场景分类达 85-95%
- GTX1080Ti 即可训练
- **关键限制**: 工程性强创新性有限；遥感专用 prompt 设计仍是挑战

### 2.2 Zero-Shot 的遥感困境

**RemoteCLIP 的局限:**
- PANGAEA fine-tuning 后下降 15% (HLS Burn Scars: 76.59→65.13)
- Zero-shot 在遥感中远不如 CV 领域成熟
- 原因：遥感语义与自然语言之间的 gap 远大于自然图像

### 2.3 In-Context Learning 前沿

**SkySense++ (Nature MI 2025):** 首个 RS in-context FM，语义→zero-shot，但目前仅在有限场景验证。

---

## 三、迁移学习与域自适应

### 3.1 持续预训练：从 ImageNet 到遥感

**Towards GFMs via Continual Pretraining:**
- 从 ImageNet-22k 持续预训练替代从头训练
- ImageNet 教师冻结 + 学生 MIM + 特征蒸馏
- 8× 计算节省 vs 从头训练
- **核心洞见**: ImageNet 提供的通用视觉知识是遥感的"免费午餐"

### 3.2 域自适应

**Open Compound Domain Adaptation (两阶段框架):**
- 源域 → 目标域迁移，应对遥感中多传感器/多地区的域偏移
- 需要源域标注，但可显著减少目标域标注需求

### 3.3 域差距的致命性

**PANGAEA 的区域域差距测试 — 所有模型崩溃:**
- CROMA: 无域差 51.83% → 有域差 18.38% (-65%)
- DOFA: 无域差 43.18% → 有域差 16.56% (-62%)
- Prithvi: 无域差 46.81% → 有域差 16.75% (-64%)
- **无一例外，全部崩溃**

这表明当前 SSL/transfer learning 方法的根本局限：训练数据来自美国/欧洲的模型，在亚洲/非洲表现大幅下降。

---

## 四、合成数据：一个被低估的方向

### 4.1 物理模型模拟

遥感有独特的优势：基于物理模型的传感器仿真（辐射传输模型、大气校正模型等）可以生成理论上无限的合成标注数据。

**遥感大模型综述 (2023) 的未来方向：**
- 扩散模型用于遥感数据增强
- 跨传感器仿真：从 Sentinel-2 生成 PlanetScope

### 4.2 当前状态

合成数据在遥感中的使用仍处于早期阶段，缺乏系统性研究。关键挑战：
- 物理模型的逼真度 vs 计算成本
- 合成数据和真实数据的域差距
- 合成标注的语义一致性

---

## 五、免费/弱监督信号

### 5.1 公开土地覆盖产品

**AgriFM (2025):**
- 用 GLC_FCS30D 土地覆盖比例作为预训练监督
- 利用地理坐标自动获取标注 —— **几乎零成本**
- 2500万+ 影像预训练
- EMA teacher 网络减少监督噪声

**SoftCon:**
- Dynamic World 自动土地覆盖标签作为"软标签"
- 多标签软对比损失利用数据内在多义性
- 780K 图像，100 epoch 达到 SOTA

### 5.2 遥感特有的标签优势

遥感数据天然带有地理坐标，这使得：
- 可以自动关联公开 GIS 产品 (土地覆盖、气候、地形等)
- 同一地点的多时序/多传感器数据可以自动配准
- 季节变化本身提供自然的正样本对

**"On the Foundations" (Nature 2025) 观点:**
"主动利用现有产品和知识可能比纯粹 SSL 更实际" —— 遥感领域在利用已有标注资源方面仍有巨大空间。

---

## 六、主动学习

### 6.1 遥感中的主动学习逻辑

主动学习在遥感中的特殊价值：标注成本极高 → 选择"最有信息量"的样本标注 → 最大化每单位标注的收益。

### 6.2 当前状态

主动学习在遥感文献中的覆盖远少于 SSL 和迁移学习。遥感综述中主动学习往往与半监督学习合并讨论，缺乏独立的方法论基准。

---

## 七、策略组合：什么时候用什么？

| 标注预算 | 推荐策略 | 辅助策略 | 风险 |
|----------|----------|----------|------|
| **零标注** | SSL (对比/MAE) + 免费监督 (Dynamic World) | 合成数据 | 域差距可能致命 |
| **极少标注 (<1%)** | SSL 预训练 + few-shot finetune | 主动学习 | 基类选择敏感 |
| **少量标注 (1-10%)** | 持续预训练 (ImageNet→RS) + finetune | 域自适应 | 过度依赖源域 |
| **中等标注 (10-50%)** | FM 预训练 + 全量 finetune | 弱监督 | FM 可能不优于 UNet |
| **充足标注** | 直接监督训练 | - | - |

---

## 八、开放问题

1. **SSL 是否已经到了瓶颈？** 继续 scaling 数据/模型在遥感中还有效吗？PANGAEA 暗示边际收益很低。
2. **合成数据何时超越真实标注？** 基于物理模型的仿真需要达到什么逼真度才能与真实标注竞争？
3. **跨传感器零样本泛化可行吗？** 在 Sentinel-2 上训练，能否直接用于 PlanetScope？
4. **视觉-语言模型的 zero-shot 能力在遥感中为什么下降？** 遥感语义与自然语言之间的映射机制尚未被理解。
5. **免费监督信号的覆盖和精度瓶颈？** Dynamic World 的 9 类土地覆盖能否支持更细粒度的任务？
6. **主动学习为什么在遥感中研究不足？** 理论上最适合"标注成本极高"场景的方法，实践中鲜有突破性成果。
7. **地理平衡的数据集如何构建？** 当前 SSL 预训练数据严重偏向北美/欧洲 (PANGAEA 区域域差测试揭示了灾难性的失败)。

### 2026-06-13 跨引用更新（Daily Reading Agent 重读 PANGAEA + AdaptVFMs）

**PANGAEA 的 few-shot/zero-shot 结果作为数据稀缺场景的证据：**
- PANGAEA 的四种评估协议中，Few-shot（1/5/10/20/50 shot）和 Zero-shot（冻结编码器+线性探测）直接验证了 GFM 在数据稀缺场景下的价值
- 关键发现：GFM 在 1-5 shot 时优势最大，随着标注量增加，有监督模型（UNet）逐渐追平——这定量验证了"FM 的价值在标注稀缺时最大"的直觉
- 但 Zero-shot 表现高度任务依赖：变化检测上差，土地覆盖分类上好——说明预训练表示的"通用性"是任务相关的，而非绝对的
- **启示**：数据稀缺场景下的 GFM 选择应基于任务类型（分割 vs 变化检测 vs 分类），而非盲目使用最大模型

**AdaptVFMs 的 42K 数据集作为"弱监督数据构建"案例：**
- AdaptVFMs 构建的 RS VFM Fine-tuning Dataset（42K 图文对）是数据稀缺问题的工程解决方案：利用 NWPU-RESISC45 + UC Merced + SIRI-WHU + RSSCN7 等现有数据集，通过同义词扩展生成 CLIP 微调所需的文本描述
- 这种"现有数据集重组+文本增强"策略避免了昂贵的遥感图像标注，但代价是语义精度有限（SCD 标签准确率仅 ~70%）
- 与 PANGAEA 的"标准化 benchmark"策略形成对照：AdaptVFMs 选择"构建更多弱标注数据"，PANGAEA 选择"标准化评估现有数据"——两种策略互补

---

## Related Problems

- [[geo-foundation-models]] — FM 的价值在标注稀缺时最大
- [[model-efficiency]] — 数据效率是效率革命的核心组分
- [[pretraining-paradigm]] — SSL 是数据稀缺问题的系统性解
- [[modality-fusion]] — 多模态标注更稀缺
- [[multi-scale-feature-extraction]] — 多尺度标注成本更高
- [[open-source-reproducibility]] — 标注数据不公开阻碍进展
