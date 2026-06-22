---
slug: "deep-residual-learning-for-image-recognition"
title: "Deep Residual Learning for Image Recognition"
authors:
  - "Kaiming He"
  - "Xiangyu Zhang"
  - "Shaoqing Ren"
  - "Jian Sun"
year: 2016
venue: "CVPR 2016"
tags: [computer-vision, deep-learning, residual-networks, classification, object-detection]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "https://github.com/KaimingHe/deep-residual-networks"
compute: "8×GPU, 60万次迭代, 批量大小256"
dataset_access: public
---

> **Abstract:** 提出残差学习框架，通过恒等快捷连接（identity shortcut connections）让网络学习残差映射，使得极深网络（152层ImageNet，1000+层CIFAR-10）的训练成为可能。在ILSVRC 2015分类、检测、定位以及COCO检测和分割任务上均获得第一名。

## [2026-05-02] Review

**Score:** 5/5
- Contribution: 5/5 — 里程碑式贡献：残差连接解决了深度网络的退化问题（degradation problem），使极深网络的训练变为现实。这一思想渗透到所有现代深度学习架构中，包括Transformer中的残差连接。
- Soundness: 5/5 — 在ImageNet、CIFAR-10、PASCAL VOC、MS COCO等多个数据集上全面验证。消融实验覆盖了恒等映射vs投影快捷连接的比较、不同深度的表现、瓶颈架构设计。
- Relevance: 5/5 — 残差连接是几乎所有现代神经网络的标准组件。遥感基础模型（ResNet-based backbones）直接建立在此工作之上。

**Key Insights:**
- 退化问题：随着网络深度增加，训练误差反而上升，且这不是由过拟合或梯度消失引起的（BN已解决梯度问题）
- 将层堆叠的优化目标从学习原始映射 H(x) 改为学习残差映射 F(x) = H(x) - x，使得恒等映射成为最优时权重自动趋零
- 恒等快捷连接不引入额外参数和计算量，使plain和residual网络的公平比较成为可能
- 瓶颈架构（bottleneck: 1x1→3x3→1x1）在增加深度的同时控制计算量
- 学习到的残差函数响应通常很小（图7），验证了恒等映射作为先验条件的有效性

**Detailed Notes:**
- 34-layer plain net比18-layer训练误差更高，但梯度范数正常（证明不是梯度消失问题）
- 选项A/B/C三种快捷连接方式差异很小，表明投影快捷连接对解决退化问题并非必要
- ResNet-152（11.3 GFLOPs）计算量低于VGG-16/19（15.3/19.6 GFLOPs），但更深
- CIFAR-10上训练了1202层网络，训练误差<0.1%，但测试误差7.93%高于110层的6.43%（过拟合）
- 检测任务：用ResNet-101替换VGG-16，COCO上mAP@[.5,.95]提升28%（6.0个百分点）

**Citation Mining:**
|  - Highway Networks [42, 43] — concurrent work with gated shortcuts
|  - VGG [41] — baseline architecture inspiration
|  - GoogLeNet/Inception [44] — contemporary deep architecture
|  - Batch Normalization [16] — enabler for deep network convergence
|  - Network in Network [25] — micro-architecture inspiration
|
|## [2026-05-27] Re-review (Daily Paperweave Reading Agent)
|
|**Bottleneck架构的效率量化分析:**
|通过深入阅读全文中表1和图5的瓶颈块设计，可以量化其计算效率优势。对于输入/输出均为256维的特征图，瓶颈块(1×1→3×3→1×1)的参数量为：1×1卷积(256→64)=16,384 + 3×3卷积(64→64)=36,864 + 1×1卷积(64→256)=16,384，总计约69,632个参数。若使用同维度的基本块（两2层3×3卷积，256→256），则需要2×3×3×256×256≈1,179,648个参数。**瓶颈块节约约17倍参数量，同时保持相似的FLOPs。** 这使得ResNet-152(11.3 GFLOPs)的计算量低于VGG-16(15.3 GFLOPs)，但深度是后者的近10倍。
|
|**残差函数响应的关键证据（全文图7）：**
|CIFAR-10实验中对各3×3卷积层输出的std分析揭示了一个长期被忽略但至关重要的现象：(1) ResNet层的响应幅度普遍小于对应Plain网络；(2) 越深的ResNet每层响应幅度越小（ResNet-20 > ResNet-56 > ResNet-110）。这直接验证了论文3.1节的假设——恒等映射提供了合理的预条件（preconditioning），残差函数倾向于趋近零。这一发现对理解为什么ResNet能扩展到1202层（训练误差<0.1%）而Plain-110层训练误差>60%提供了关键证据。
|
|**1202层网络的过拟合启示：**
|CIFAR-10上1202层ResNet训练误差<0.1%但测试误差7.93%（110层为6.43%），说明当优化问题被解决后，**过拟合成为更深网络的瓶颈**。论文当时使用简单的正则化策略（无dropout/maxout），提示深度网络的性能天花板可能不在优化而在泛化——这一洞见于近期基础模型研究中被重新发现。
|
|**跨Wiki连接：**
|1. **遥感预训练范式(L3_module/pretraining-paradigm.md):** ResNet的残差连接设计是几乎所有遥感基础模型（RingMo、SatMAE、CROMA、SeaMo等）的backbone基础。该L3页面在讨论MIM和对比学习范式时隐式依赖ResNet架构，但未明确将其列为范式演进的关键节点。建议在"ImageNet监督预训练"部分增加ResNet作为"深而不贵"的架构里程碑。
|2. **地理空间基础模型(L3_module/geo-foundation-models.md):** 当前页面聚焦于预训练策略，但ResNet作为最广泛使用的backbone编码器（ResNet-50/101）是所有评估基准的标配。建议在"评估"部分增加ResNet backbone对GFM baseline的影响讨论。
|3. **效率革命(L3_module/model-efficiency.md):** ResNet-152以11.3 GFLOPs超越VGG-16的15.3 GFLOPs，证明了"聪明的架构设计 > 暴力堆层"——这正是当前遥感FM"效率革命"论点的历史先例。
|4. **Attention Is All You Need (L0):** Transformer中的残差连接直接从ResNet继承。Attention论文的"Add & Norm"层中的"Add"就是残差连接。这一跨领域影响是残差学习普适性的最强证据。
|5. **新的待读论文建议：** "Visualizing the Loss Landscape of Neural Nets" (Li et al., NeurIPS 2018) — 可视化分析残差连接如何平滑损失曲面；"Identity Mappings in Deep Residual Networks" (He et al., ECCV 2016) — ResNet v2的预激活改进版本。
