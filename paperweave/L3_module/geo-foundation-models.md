---
title: Geospatial Foundation Models — Design Questions Answered by Evidence
created: 2026-05-02
updated: 2026-05-06
type: module
problem: geo-foundation-models
tags: [remote-sensing, foundation-model, pretraining, multimodal, benchmark, design-tradeoffs]
sources:
  - L0_raw/mirage-the-illusion-of-visual-understanding
  - L0_raw/遥感大模型进展与前瞻.md
  - L0_raw/遥感基础模型发展综述与未来设想.md
  - L0_raw/on-the-foundations-of-earth-foundation-models.md
  - L0_raw/foundation-models-in-remote-sensing-evolving-from-unimodality-to-multimodality.md
  - L0_raw/self-supervised-learning-in-remote-sensing-a-review.md
  - L0_raw/seasonal-contrast-unsupervised-pre-training-from-uncurated-remote-sensing-data.md
  - L0_raw/geography-aware-self-supervised-learning.md
  - L0_raw/ringmo-a-remote-sensing-foundation-model-with-masked-image-modeling.md
  - L0_raw/satmae-pre-training-transformers-for-temporal-and-multi-spectral-satellite-image.md
  - L0_raw/rethinking-transformers-pre-training-for-multi-spectral-satellite-imagery.md
  - L0_raw/croma-remote-sensing-representations-with-contrastive-radar-optical-masked-autoe.md
  - L0_raw/seamo-a-season-aware-multimodal-foundation-model-for-remote-sensing.md
  - L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr.md
  - L0_raw/ringmoe-mixture-of-modality-experts-multi-modal-foundation-models-for-universal-.md
  - L0_raw/a-semantic-enhanced-multi-modal-remote-sensing-foundation-model-for-earth-observ.md
  - L0_raw/bridging-remote-sensors-with-multisensor-geospatial-foundation-models.md
  - L0_raw/any-optical-model-a-universal-foundation-model-for-optical-remote-sensing.md
  - L0_raw/multi-label-guided-soft-contrastive-learning-for-efficient-earth-observation-pre.md
  - L0_raw/towards-geospatial-foundation-models-via-continual-pretraining.md
  - L0_raw/agrifm-a-multi-source-temporal-remote-sensing-foundation-model-for-agriculture-m.md
  - L0_raw/pangaea-a-global-and-inclusive-benchmark-for-geospatial-foundation-models.md
  - L0_raw/foundation-models-for-generalist-geospatial-artificial-intelligence.md
  - L0_raw/earth-ai-unlocking-geospatial-insights-with-foundation-models-and-cross-modal-re.md
zotero_keys: []
confidence: high
---

# 地理空间基础模型：设计问题与证据

## 核心问题

什么是一个"好"的地理空间基础模型？本文不逐篇描述论文，而是围绕 6 个关键设计问题组织证据，展示每条路径的 trade-off 和未解之谜。

---

## 一、用什么数据做预训练？

### 1.1 从 ImageNet 到领域专用数据

**核心发现：遥感域内预训练远优于 ImageNet 迁移。**

| 数据策略 | 代表工作 | 规模 | 核心发现 |
|----------|----------|------|----------|
| ImageNet→遥感 | 基线 | 1.2M | 域差距大，遥感图像非自然视角 (nadir) |
| fMoW | Geography-Aware SSL | 36万 | 时序正样本+GPS→74.42%，追平监督 |
| SSL4EO-S12 | CROMA, SeaMo, SoftCon | 100万对 | 标准化benchmark，但地理分布不均 |
| BigEarthNet | SeCo, DOFA | 59万 | 多标签CLC标注，欧洲中心 |
| 自建大规模 | RingMo 210万, SkySense 2150万, AgriFM 2500万 | 百万-千万级 | 数据质量/覆盖>规模，但多数不公开 |

**关键证据：**
- SeCo (ICCV 2021) **首个证明**：域内SSL（BigEarthNet 87.81%）远优于 ImageNet 预训练（~82%），domain gap 约6个百分点
- RingMo 自建210万张光学图像（0.1-30m分辨率），PIMask针对小目标——但**数据不公开**
- 遥感大模型综述指出："预训练数据必须是遥感图像"已被 Chen et al. 和 Risojević et al. 多次验证
- PANGAEA benchmark: 预训练分辨率/光谱与下游任务不匹配时，性能显著下降

### 1.2 数据的地理平衡问题

**核心发现：当前数据集严重偏向北美和欧洲，全球南方欠采样。**

- "On the Foundations of Earth Foundation Models" (Zhu et al., 2025 Nature) 明确指出：SeCo、SSL4EO 等预训练数据集"倾向于从城市密集区域过度采样，而欠采样雨林、极地和海洋等生态关键区域"
- PANGAEA: 引入区域域差距测试——所有GFM在跨区域测试中性能下降47-65%（CROMA -65%, DOFA -62%, Prithvi -64%）
- Prithvi 仅用美国本土 HLS 数据预训练，其他地区泛化有限
- Earth AI 覆盖全球但模型不开源

### 1.3 数据多样性 vs 数据规模

**核心发现：数据多样性（多传感器、多季节、多地域）> 原始数据量。**

| 策略 | 实例 | 效果 |
|------|------|------|
| 多源数据混合 | GeoPile 60万 (Mendieta et al.) | 多源>单一Sentinel-2 |
| 四季节数据 | SeaMo, SSL4EO 300万 | 季节感知提升时序任务 |
| 多传感器融合 | DOFA (S1+S2+Gaofen+NAIP+EnMAP) | 支持最广传感器范围 |
| 纯规模 | SkySense 2150万时序样本 | 2.06B参数，但边际收益递减 |

---

## 二、用什么预训练目标？

### 2.1 MIM（掩码图像建模）—— 当前主导范式

**核心发现：MIM是遥感FM最主流的预训练目标（估计70%+），但变体众多。**

| MIM变体 | 代表工作 | 核心设计 | 关键优势 |
|---------|----------|----------|----------|
| 基础MIM | RingMo | PIMask策略：避免密集小目标丢失 | 首个RS生成式MIM，IEEE TGRS 2022 |
| 时序+光谱MIM | SatMAE | 时间编码+光谱分组编码，独立masking | **NeurIPS 2022，代码开源**，设定后续标准范式 |
| 多尺度MIM | SatMAE++, Scale-MAE | 多尺度重建（卷积上采样/GSD PE） | 加速下游收敛 20→12 epoch |
| 3D MIM | SpectralGPT | 3D张量mask重建高光谱 | 光谱维度感知 |
| 时序3D MIM | Prithvi | 3D位置+3D patch embedding | HLS多时序，公开权重 |
| 渐进式MIM | SeaMo | Phase 1: 空间MIM → Phase 2: 时序融合MIM | **200 GPU-h=SOTA**，RTX4090可复现 |
| 跨模态MIM | CROMA, msGFM, RingMoE | SAR-光学交叉重建/MoE路由 | 多模态统一表示 |

**关键消融发现（SatMAE）：**
- 独立masking（各时间/光谱通道独立mask） > 一致性masking
- 光谱分组编码优于逐波段编码
- 该发现成为后续RS MAE工作的标准范式

### 2.2 对比学习 —— 第二范式但效率更高

**核心发现：对比学习方法在效率上显著优于MIM，100 epoch可超越MIM 1000 epoch。**

| 对比学习方法 | 代表工作 | 核心设计 | 关键结果 |
|-------------|----------|----------|----------|
| 季节性对比 | SeCo (ICCV 2021) | 多子空间对比(Z0全不变/Z1季节不变/Z2增强不变) | BigEarthNet 87.81% |
| 地理感知对比 | Geography-Aware SSL (ICCV 2021) | 时间正样本+GPS分类pretext | fMoW 74.42% |
| 多粒度对比 | SkySense (CVPR 2024) | 因子化编码器+Geo-Context Prototype+多粒度对比 | 2.06B参数，16数据集7任务 |
| **软对比+持续预训练** | **SoftCon (IEEE TGRS 2024)** | 多标签软对比+Dynamic World免费标注+DINOv2持续预训练 | **100 epoch超越SkySense 1000 epoch**，8×A100/15h |

**SoftCon 的关键启示：**
- "免费标注+免费FM=极高效率"——利用 Dynamic World 自动土地覆盖标签 + DINOv2 预训练权重
- 100 epoch 训练超越 SkySense 1000 epoch（BigEarthNet 86.8 mAP）
- SAR编码器首次在该benchmark上超越多光谱——意味着多模态互补的有效性
- 证明了"持续预训练"（从DINOv2→遥感）比从头训练更高效

### 2.3 监督预训练 —— 被低估的第三条路

**核心发现：用公开土地覆盖产品作为监督信号，几乎零成本获取标签。**

- **AgriFM**: 用 GLC_FCS30D 土地覆盖比例作为回归监督信号，利用地理坐标自动获取标注——"免费"监督，2500万影像
- "On the Foundations"指出：遥感领域<0.1%的数据被标注，主动利用现有产品和知识可能比纯粹SSL更实际

### 2.4 VLM / In-Context Learning —— 前沿方向

| 方法 | 代表工作 | 能力 |
|------|----------|------|
| 视觉-文本对比 | RemoteCLIP | 双流对比，RS5M数据集165K |
| 语义预训练 | SkySense++ (Nature MI) | 首个RS in-context FM，语义→zero-shot |
| LLM agent | Earth AI | Gemini驱动，跨模态推理agent |

### 2.5 预训练目标的演进路线

```
对比学习 (2021)          MAE (2022-2023)        高效范式 (2024-2025)      VLM/Agent (2025+)
SeCo ─────────────→ RingMo ──────────→ SoftCon (100ep=SOTA) ──→ SkySense++
Geography-Aware      SatMAE (范式设定)   SeaMo (200GPU-h=SOTA)    Earth AI
                     CROMA (SAR+光学)   AgriFM (免费监督)        RemoteCLIP
                     Scale-MAE             
```

关键趋势：**从"堆算力堆数据"到"聪明地设计预训练策略"**。

---

## 三、如何处理多模态？

遥感数据天然多模态：光学(RGB/多光谱/高光谱)、SAR、时序、文本。

### 3.1 五种主流多模态架构范式

| 架构 | 代表工作 | 设计思路 | 优势 | 劣势 |
|------|----------|----------|------|------|
| **通道堆叠** (Early Fusion) | SkySense | 多模态数据堆叠后统一编码 | 简单，模态间低级交互充分 | 模态缺失时代码崩溃 |
| **独立编码器+融合** (Late Fusion) | CROMA | SAR编码器+光学编码器+融合编码器三路 | 同时学单/多模态表示 | 无法学习低级跨模态交互 |
| **波长感知编码** | DOFA, AOM | 波长→动态权重生成 / 通道独立分词 | 支持未见过的波段/传感器 | 训练复杂 |
| **MoE路由** | RingMoE, msGFM | 模态专家/协作专家/共享专家三元设计 | 模态感知动态路由 | 路由器可能退化，参数开销大 |
| **因子化编码器** | SkySense | HSROI+TMsI+TSARI灵活组合 | 模块化组合 | 设计复杂度高 |

### 3.2 模态缺失的鲁棒性

**核心发现：添加SAR并不总是有帮助——在PANGAEA上，纯光学常优于光学+SAR。**

| 处理方式 | 工作 | 方案 |
|----------|------|------|
| 训练时随机丢弃模态 | RS Meta Modal | 元表示学习→对缺失鲁棒 |
| 共享模态无关backbone | AOM | 通道索引使任意波段可处理 |
| MoE动态路由 | RingMoE | 14.7B MoE，512×Ascend |

**PANGAEA的关键发现：**
- CROMA在多模态数据上，纯光学 mIoU 83.76% > 光学+SAR 82.42%
- DOFA同样：纯光学 80.47% > 联合 80.63%（几乎无差异）
- "有效利用SAR信息仍然是一个开放挑战"

### 3.3 MoE在遥感中的特殊角色

| MoE工作 | 关键设计 | 规模 |
|---------|----------|------|
| RingMoE | 模态专家/协作专家/共享专家三元体系；SAR-L1物理信息重建（复数值） | 14.7B |
| msGFM | 跨传感器MIM+MoE路由；从头预训练>ImageNet蒸馏 | 89M Swin-Base |
| SkySense++ | 语义融入+MoE | ~2B |

**MoE的关键张力：**
- 路由正则化不足时，可能出现"赢者通吃"的专家退化
- 14.7B参数的RingMoE需要512×Ascend，学术界无法复现
- msGFM 89M Swin-Base证明：小规模MoE也有竞争力

---

## 四、如何评估？

### 4.1 四种评估范式的生态

| 评估方式 | 优点 | 缺点 | 谁在用 |
|----------|------|------|--------|
| **Linear Probing** | 公平比较表示质量，快速 | 不能反映full潜力 | 几乎所有工作 |
| **Fine-tuning** | 反映实际应用能力 | 超参敏感，不同论文不可比 | 所有工作 |
| **Few-shot** | 贴近标注稀缺的现实 | 基类选择影响大 | Prithvi, PANGAEA |
| **Zero-shot** | 终极泛化测试 | 目前仅VLM能做 | SkySense++, RemoteCLIP |

### 4.2 PANGAEA Benchmark 的关键发现

> **PANGAEA (2025)**: 首个综合性GFM标准化benchmark，11数据集跨越城市/农业/海洋/森林/灾害，评估9个GFM vs 监督基线 (UNet, ViT)，在10%/50%/100%标签比例下测试。

**发现1: GFM并不总是优于简单基线**

| 数据集 | 最佳模型 | 是GFM? |
|--------|----------|--------|
| HLS Burn Scars | UNet (84.51% mIoU) | **否** |
| Sen1Floods11 | UNet (91.42% mIoU) | **否** |
| AI4SmallFarms | UNet (46.34% mIoU) | **否** |

> "对于简单的单类分割任务，卷积UNet比所有GFM都好。"

**发现2: 预训练分辨率/光谱匹配至关重要**

- 在MADOS等需要丰富光谱信息的任务上，宽光谱预训练的模型（CROMA, SpectralGPT）表现最佳
- 高分辨率预训练（Scale-MAE, RemoteCLIP）的高分数据与低分下游任务不匹配→性能下降

**发现3: 少标签场景是GFM的主场**

- 10%标签时，GFM的优势最大（如SpectralGPT在HLS Burn Scars 10%标签时 mIoU 83.35%）
- 100%标签时，UNet等简单模型追上甚至超越GFM
- 印证了GFM的核心价值主张：**减少标注需求**

**发现4: 区域域差距是致命弱点**

- CROMA: 无域差 51.83% → 有域差 18.38% (-65%)
- DOFA: 无域差 43.18% → 有域差 16.56% (-62%)
- Prithvi: 无域差 46.81% → 有域差 16.75% (-64%)
- **所有模型都崩溃，无一例外**

**发现5: Fine-tuning的影响不一致**

- RemoteCLIP fine-tuning后下降15%（HLS Burn Scars: 76.59→65.13）
- 其他模型变化±3%以内
- 没有统一的fine-tuning magic bullet

### 4.3 评估的缺失维度

"On the Foundations" 提出的11维评估框架中，当前最欠缺的是：
1. **物理一致性**: 模型预测是否符合物理规律（能量守恒等）
2. **不确定性量化**: 模型是否知道自己不知道
3. **碳足迹**: SkySense 80×A100-80G, RingMoE 512×Ascend——碳成本被系统性忽略

---

## 五、效率 vs 规模：一个悖论

### 5.1 更小/更聪明的模型凭什么赢？

**核心发现：架构设计和预训练策略 > 参数规模。**

| 模型 | 参数规模 | 计算量 | 关键结果 |
|------|----------|--------|----------|
| **SoftCon** | ViT-S/B | 8×A100/15h | 100ep > SkySense 1000ep |
| **SeaMo** | ViT-B (~86M) | 200 GPU-h | SOTA, RTX4090可复现 |
| SkySense | 2.06B | 80×A100-80G | 很多任务被SoftCon/SeaMo超越 |
| RingMoE | 14.7B | 512×Ascend | 非NVIDIA生态，无法社区验证 |
| msGFM | 89M Swin-Base | 未明确 | 跨传感器MIM，有竞争力 |

**遥感大模型综述 (2023)明确指出：**
> "亿级规模模型（Cha et al.）显示出边际收益递减——架构设计比纯规模更重要"

### 5.3 效率配方

从高效模型中提炼的共同要素：

1. **持续预训练而非从头训练**: ImageNet→遥感持续预训练，8×计算节省 (Towards GFMs via Continual Pretraining)
2. **软对比替代硬对比**: SoftCon多标签软对比利用数据内在多义性
3. **渐进式训练**: SeaMo Phase 1→Phase 2, 逐阶段引入复杂度
4. **免费监督信号**: Dynamic World标注(SoftCon)、GLC_FCS30D土地覆盖(AgriFM)
5. **复用开源权重**: DINOv2作为起点(SoftCon)

> **2026-06-11 更新**：Nested Learning (Behrouz et al., NeurIPS 2025) 的 HOPE 架构提供了第六种效率配方：**嵌套层级替代线性扩展**。HOPE 的 Continuum Memory System (CMS) 通过不同频率的 MLP 块实现多时间尺度知识存储，在 1.3B 参数规模下达到与 Transformer++ 可比性能。将 CMS 的频率分层思想迁移到遥感时序编码器，可能实现"一次前向传播同时提取多时间尺度特征"，而无需显式的多尺度窗口设计（如 Prithvi 的 3D PE 或 SeaMo 的渐进式训练）。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

### 5.3 效率悖论

> 遥感FM的"规模军备竞赛"正在被"效率革命"解构。14.7B参数的RingMoE和2.06B的SkySense投入了学术界无法企及的计算资源，但300M级的SoftCon/SeaMo/DINOv2持续预训练模型在多数基准上持平或超越。**遥感FM的边际收益拐点可能远低于CV/NLP。**

> **2026-06-11 更新**：Nested Learning (Behrouz et al., NeurIPS 2025) 的"幻觉"隐喻为效率悖论提供了理论解释——深度学习架构的**表面复杂性**（层数、参数量）掩盖了其底层的**统一结构**（嵌套优化、联想记忆）。RingMoE（14.7B）和 SkySense（2.06B）追求表面复杂性，而 SoftCon（86M）和 SeaMo（86M）通过聪明的设计（软对比、渐进式训练）达到同等或更好的性能。NL 的理论框架暗示：**增加"嵌套层级"（更多频率、更深记忆）可能比单纯增加层数/参数量更有效**。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。

---

## 六、"基础模型神话" —— FM什么时候真正有用？

### 6.1 四个什么时候FM不如简单baseline的情况

**场景1: 简单任务（少类、清晰边界）**
→ UNet就够了。PANGAEA: 单类洪水/火灾检测，UNet全面压制GFM

**场景2: 充足标注（100%标签）**
→ 随机初始化的监督训练追上甚至超越GFM预训练。Prithvi论文也承认："充分微调后，预训练和非预训练 performance 收敛"

**场景3: 预训练-下游域差距大**
→ 性能崩溃47-65%（PANGAEA区域域差测试）。训练数据来自美国/欧洲的模型，在亚洲/非洲表现大幅下降

**场景4: Fine-tuning不当**
→ RemoteCLIP fine-tuning后下降15%，说明fine-tuning策略对最终结果有决定性影响

### 6.2 四个FM确实有价值的情况

**场景1: 标注稀缺（≤10%标签）**
→ GFM的核心价值。Prithvi: "用一半标注数据保持同等性能"，洪水检测从252张减到126张

**场景2: 多任务泛化**
→ 单一GFM编码器服务于多种下游任务，降低部署和维护成本

**场景3: 预训练域与下游域匹配**
→ 光谱匹配的预训练模型（如CROMA在Sentinel-2任务上）明显优于不匹配的

**场景4: 跨传感器泛化**
→ 波长感知设计（DOFA, AOM）使模型能处理训练时未见过的传感器

### 6.3 神话的根源

1. **选择性报告**: 论文倾向于报告GFM赢的场景，忽略输的场景
2. **baseline不充分**: 很多论文只与弱baseline比较，不与UNet等强baseline对比
3. **开放性问题**: 闭源模型无法被独立验证——声称的SOTA可能经不起第三方检验
4. **任务偏见**: 目前FM评估集中在分类/分割，在回归/检测/变化检测任务上的价值未被充分验证

---

## 七、开放问题与未来方向

### 7.1 十个未解的设计问题

1. **最优预训练数据配方是什么？** 多源 vs 纯规模？地理平衡 vs 专注特定区域？
2. **MIM和对比学习的最优组合？** MAE+CL联合训练（CROMA）似乎有前途，但会引入额外的超参调优负担
3. **SAR信息如何有效利用？** PANGAEA显示添加SAR反而可能降低性能——SAR编码还存在根本性挑战
4. **MoE在遥感中是否划算？** 14.7B MoE vs 300M DINOv2持续预训练——目前证据不支持大MoE
5. **VLMs在遥感中能否达到CV中的zero-shot水平？** RemoteCLIP的zero-shot与监督学习差距仍然很大
6. **跨区域泛化如何实现？** 当前所有模型在区域域差测试中崩溃（-47%~-65%）
7. **评估标准碎片化如何解决？** PANGAEA是好的开始，但被采纳率仍然低
8. **物理一致性如何融入预训练？** 当前FM在物理规律方面是零知识
9. **时序建模的最优方式？** 3D ViT (Prithvi) vs L-TAE (PANGAEA) vs Video Swin (AgriFM)
10. **开源与商业化的平衡？** 12个RS FM中仅2个完全开源——社区进步严重受限

### 7.2 最值得跟进的方向

- **高效预训练**: SoftCon/SeaMo路线——100-200 GPU-h取得SOTA
- **免费监督信号**: 利用现有土地覆盖产品、Dynamic World等公开数据作为"免费标签"
- **地理平衡数据集**: 解决全球南方数据空白
- **标准化评估**: PANGAEA + 开源排行榜

---

## 论文索引

### 综述/框架
- 遥感大模型进展与前瞻 (Wuhan Univ., 2023)
- 遥感基础模型发展综述与未来设想 (J. Remote Sensing, 2024)
- On the Foundations of Earth Foundation Models (Zhu et al., 2025, Nature Comm. Earth & Env.)
- Foundation Models in RS: Unimodality to Multimodality (Hong et al., 2026, IEEE MGRS)
- Self-supervised Learning in RS: A Review (Wang et al., 2022, IEEE GRSM)

### MIM系列
- RingMo (Sun et al., 2022, IEEE TGRS) — 首个RS MIM
- SatMAE (Cong et al., 2022, NeurIPS) — 时序+光谱MIM标准范式
- SatMAE++ (Noman et al., 2023, NeurIPS) — 多尺度MIM
- Prithvi (Jakubik et al., 2023) — NASA/IBM, HLS预训练

### 对比学习系列
- SeCo (Mañas et al., 2021, ICCV) — 首个域内SSL>>ImageNet
- Geography-Aware SSL (Ayush et al., 2021, ICCV) — GPS+时序pretext
- SoftCon (Wang et al., 2024, IEEE TGRS) — 100ep=SOTA
- SkySense (Guo et al., 2024, CVPR) — 2.06B多模态对比

### 多模态系列
- CROMA (Fuller et al., 2023, NeurIPS) — SAR-光学MAE+对比
- RingMoE (Bi et al., 2025) — 14.7B MoE
- msGFM (Han et al., 2024) — 跨传感器MIM
- SeaMo (Li et al., 2025) — 200GPU-h SOTA
- Any-Optical-Model (Li et al., 2025) — 任意波段/分辨率光学

### 评估
- PANGAEA (2025) — 标准化GFM benchmark

### 前沿
- SkySense++ (Wu et al., 2025, Nature MI) — In-context FM
- Earth AI (Google, 2025) — 多领域FM+Gemini agent
- AgriFM (Li et al., 2025) — 监督预训练路线

---


---

## Open Problem: VLM Evaluation Mirage Effect (2026-05-06)

> **Source:** [[../L2_lineage/multimodal/benchmark/mirage|MIRAGE: The Illusion of Visual Understanding]] (Asadi et al., 2026)

MIRAGE demonstrates that frontier VLMs achieve 70-80% of their image-enabled benchmark accuracy without ANY image input — i.e., current VLM benchmarks are not measuring visual understanding. This is a critical open problem for RS Geo-Foundation-Models:

### Evidence from MIRAGE

- **Mirage Score** (acc_no_image / acc_with_image): average 70-80% across 4 models × 6 benchmarks
- **Medical benchmarks most susceptible:** 60-99% mirage scores (RS benchmarks may be similarly susceptible due to rich textual context in questions)
- **Mirage-mode > Guess-mode:** VLMs access hidden patterns unavailable to conservative guessing
- **B-Clean removes 75-77% of benchmark questions** (union-removing all compromised questions)
- **3B text-only super-guesser beats** all frontier VLMs AND human radiologists on chest X-ray QA

### Implications for RS FM Evaluation

1. **RS VQA benchmarks (RSVQA, BEN, GeoChat-Bench) may share the same vulnerability.** Questions like "what crop type is this?" provide textual context (location, season, climate) that models can exploit without images.
2. **Modality-ablation should become standard.** For multi-modal RS FMs (SAR+Optical), evaluate each modality's contribution via counterfactual ablation — not just report final accuracy.
3. **Mirage Score as a diagnostic.** For any RS FM evaluated on RS VQA, compute (acc_no_image / acc_with_image) — a high score indicates the benchmark fails to isolate visual understanding.
4. **B-Clean for RS benchmarks.** Apply the same union-based cleaning to RSVQA/BEN questions to create vision-necessary RS evaluation sets.

### Related Design Questions

- **Q:** Given this evidence, are current RS VLM benchmarks (GeoChat, RSGPT, LLaVA-Geo evaluations) measuring visual understanding or text-based inference?
- **Q:** Should RS FM papers report modality contribution scores (Δaccuracy when each modality is removed)?
- **Q:** Can we create private/held-out RS VLM benchmarks that are not web-crawlable?

## Related Problems

- [[modality-fusion]] — 多模态融合的架构选择
- [[data-scarcity]] — 数据稀缺是FM范式的根本驱动力
- [[multi-scale-feature-extraction]] — 多尺度是遥感FM的固有挑战
- [[open-source-reproducibility]] — 开源危机严重限制FM评估和进步


### ~~ViT Lazy Aggregation~~ (rejected for BioGFM, 2026-05-06)

[[../L2_lineage/computer-vision/feature-analysis/vit-lazy-aggregation|Shi et al. (CVPR 2026)]] 发现 ViT 的多 patch 聚合存在 lazy aggregation 行为。**但对 BioGFM (8×8 → 1 patch) 不适用**——单 patch 输入下不存在前景/背景区分，Patch Score 恒为 1.0，PiB 无意义。Lazy aggregation 发生在 encoder 层的 multi-patch 聚合级，与 fusion 层的 TemporalSoftmax→0.2 不在同一作用域。仅有 CS 知识价值。

**2026-05-06 补充 — LaSt-ViT 不适用于 BioGFM（但诊断价值保留）：**

---

**2026-05-27 跨引用更新**

**ResNet 作为 GFM backbones 的基石：**
当前几乎所有遥感基础模型（RingMo、SatMAE、CROMA、SeaMo、DOFA 等）的 backbone 编码器都源于 ResNet 架构或其衍生（ResNet-50/101、ResNeXt、Res2Net）。虽然 L3 页面聚焦于预训练策略，但预训练策略的承载者是 backbone 架构。ResNet 的残差连接设计使得极深网络（152 层以上）的训练成为可能，而 GFMs 对深度的依赖（编码丰富多尺度特征）直接受益于此。详见 [[../L0_raw/deep-residual-learning-for-image-recognition/review.md]]。

**ERA 作为 GFM 评价的新基线：**
ERA (Nature 2025) 在 DLRSD 语义分割上达到 mIoU >0.80，超过专门设计的 SOTA 模型（0.762）。这为"GFM vs 简单 baseline"的讨论提供了新视角——通用代码搜索系统可在特定遥感任务上超越专门基础模型。详见 [[../L0_raw/an-ai-system-to-help-scientists-write-expert-level-empirical-software/review.md]]。

**2026-06-11 更新 — GFM 持续预训练的代码实现洞察：**

通过阅读 Towards Geospatial Foundation Models via Continual Pretraining (Mendieta et al., ICCV 2023) 的源码，发现以下工程细节：

1. **教师分支的低分辨率处理**：`models/teacher.py` 中教师接收 224×224 双线性插值图像，学生接收 192×192 MIM 掩码图像——分辨率差异本身构成"软正则化"。
2. **双分支计算效率**：`SwinTransformerForSimMIM` 的 `forward` 返回 `(r, x)`，Stage 3 蒸馏特征和 Stage 4 MIM 特征从**同一前向传播分叉提取**，计算效率很高。
3. **波段适配的工程智慧**：`load_pretrained()` 通过 `temp[:,[3,2,1],:,:]` 将 ImageNet RGB 映射到 Sentinel-2 BGR，额外通道随机初始化——这与论文中"多光谱潜力被低估"的表述一致。
4. **蒸馏权重 alpha 未消融**：代码中 `alpha` 默认 1.0 但可调，论文未报告消融——这是一个未被充分探索的超参空间。

这些代码细节揭示了"持续预训练"范式的工程复杂性，补充了论文中未充分展开的实现层面。详见 [[../L0_raw/towards-geospatial-foundation-models-via-continual-pretraining]]。

LaSt-ViT 的频域 Top-K 聚合假设「前景 = 低 channel 方差 = 有用」，本质上丢弃所有背景信息。在 object-centric 任务（ImageNet 分类）合理，但对 BioGFM 的多任务回归场景是根本性缺陷：
- Yield/AGB 回归需要土壤背景（周边土地利用、土壤湿度）
- 频域平滑先验会误判 RS 中的大面积均质区域（水体、裸土被当作"前景"，复杂作物纹理被丢弃）
- LaSt-ViT 的硬 Top-K mask 不可直接替换 CROMA 的 CLS/GAP pooling

**修正后的行动框架：**
1. ✅ **用 Patch Score + PiB 诊断 CROMA** — 检测是否存在 lazy aggregation（诊断价值不变）
2. ❌ **不要直接用 LaSt-ViT 替换 CROMA pooling** — 会损害需要背景信息的回归任务
3. 🔧 **若确认 lazy aggregation 存在，设计保留背景的修正方案：**
   - Soft attention reweighting（用 stability score 调制 Attention 而非硬 mask）
   - Task-conditional gate（VWC/Height 多用前景，Yield/AGB 多留背景）
   - 在 fusion 层而非 encoder 层处理 lazy aggregation 的后果


**⚠️ 2026-05-06 最终判断 — LaSt-ViT 完全不适用于 BioGFM：**

两步分析明确了不适用性：
1. **单 patch 输入** (8×8) → 不存在前景/背景区分 → lazy aggregation 在结构上不可能发生
2. **即使改为多 patch 输入** → LaSt-ViT 硬丢弃背景 → 损害需要上下文的多任务回归

结论：Patch Score/PiB 诊断和 LaSt-ViT 方案均不适用于当前 BioGFM 架构。论文仅有 CS 知识价值。

**2026-06-11 补充 — Nested Learning 为 Transformer 理论提供第三块拼图：**

Dong et al. (2021, NeurIPS) 从**前向动力学**证明 skip connection 阻止 rank collapse；Xu et al. (2019, NeurIPS) 从**反向动力学**证明 LayerNorm 稳定梯度；Behrouz et al. (2025, NeurIPS) 从**优化动力学**证明 Transformer 的每一层都是嵌套优化问题，skip connection + LayerNorm + MLP 共同构成多频率更新的记忆系统。三者共同构成 Transformer 的"完整理论解剖"。详见 [[L0_raw/nested-learning-the-illusion-of-deep-learning-architectures]]。
