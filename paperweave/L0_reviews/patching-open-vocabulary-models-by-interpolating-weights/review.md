---
slug: "patching-open-vocabulary-models-by-interpolating-weights"
title: "Patching Open-Vocabulary Models by Interpolating Weights (PAINT)"
authors:
  - "Gabriel Ilharco"
  - "Mitchell Wortsman"
  - "Samir Yitzhak Gadre"
  - "Shuran Song"
  - "Hannaneh Hajishirzi"
  - "Simon Kornblith"
  - "Ali Farhadi"
  - "Ludwig Schmidt"
score: 4
contribution: 4
soundness: 5
relevance: 3
open_source: true
code_url: "https://github.com/ilharco/patching"
compute: "Single GPU"
dataset_access: true
---

> **Abstract:** PAINT method: fine-tune CLIP on a "patching" task, then linearly interpolate weights with original zero-shot model. Improves accuracy on underperforming tasks without degrading supported tasks. Effective on ImageNet distribution shifts, EuroSAT, etc. Larger models easier to patch.

|## [2026-05-02] Comprehensive Review

**Score:** 4/5
- Contribution: 4/5 — Simple but effective method for adapting open-vocabulary models; weight interpolation theory
- Soundness: 5/5 — Rigorous theoretical and empirical analysis across diverse distribution shifts
- Relevance: 3/5 — Not RS-specific but foundational method used by "Mind the Modality Gap" paper in this batch

**Key Insights:**
1. PAINT: fine-tune CLIP image encoder on patching task using frozen text encoder as classifier, then interpolate weights between zero-shot and fine-tuned.
2. Mixing coefficient alpha balances patching vs supported task performance.
3. Larger ViT models easier to patch (less parameter movement needed).
4. Effective on diverse distribution shifts: ImageNet variants, satellite imagery (EuroSAT).
5. Zero additional inference cost after patching.
6. Foundational method used by "Mind the Modality Gap" RS paper for cross-modal alignment.

**Notes:**
- NeurIPS 2022, University of Washington + Columbia + Google Research.
- Not RS-specific but widely used in RS domain adaptation.
- Code open-source (https://github.com/mlfoundations/patching).
- Key insight: weight interpolation avoids catastrophic forgetting while adding new capabilities.

## [2026-05-16] Re-review: Full Paper Deep Reading + Code Inspection

**阅读范围:** full.md (962行完整论文), code/ (pytorch实现), L2 Lineage (clip-based.md, vlm-based.md), L3 Modules (model-efficiency.md, pretraining-paradigm.md)

### 新发现的深层洞察

**1. 方法论的更深入理解**

PAINT 的核心不仅仅是简单的权重插值。论文提供了三重评估指标体系：`accuracy distance to optimal`（式1）、`accuracy distance to endpoints` 和 `path correction cost`（附录D.1）。这三个指标从不同角度量化了"修补效果"——不仅看最终的帕累托前沿位置，还关注距离"零损失理想曲线"有多远。这种多维度的评估方法值得在遥感的模型适配研究中借鉴。

**2. Scale 效应的机理剖析（Section 4.1 + 附录D）**

论文对"大模型更容易修补"的机理进行了三重交叉验证：
- **权重空间**: 大模型的零样本权重与微调权重的余弦相似度更高（cos角更小）
- **表示空间**: CKA（中心核对齐）显示大模型的表示在微调前后更相似
- **参数移动**: L1 范数差随规模增大而减小（Appendix D.2）
    
这意味着大模型的"惰性训练"（lazy training, Chizat et al. 2019）特性使得微调几乎不改变其内部表示，仅需微调末层就足以适配新任务。

**3. Broad Transfer 的机制（Section 6 + Table 1-2）**

我发现了一个关键细节：broad transfer 在两个卫星数据集 EuroSAT↔RESISC45 之间的表现不对称——EuroSAT→RESISC45 反而下降了1.3pp（表2）。这说明broad transfer不是自动发生的，它依赖于任务间的表示相似性。论文将这种不对称归因于"卫星遥感场景识别中缺乏共享类别"，但这实际上揭示了**遥感领域的域间迁移比数字识别（MNIST↔SVHN）更难**。

**4. 多任务修补的关键权衡（Section 5 + Figure 5）**

Joint patching（联合数据集训练）≈ Sequential patching（顺序修补，大模型时）> Parallel patching（并行合并）。Joint patching 仅比多个专用模型差 0.5pp。这意味着 PAINT 可以替代为每个任务单独微调的方式，尤其适合遥感中的多任务场景。

### 代码审查

源码仓库结构清晰（src/patch.py 是核心），核心实现在 `README.md` 的代码示例中仅需 10 行。关键发现：
- 使用冻结的文本编码器输出作为分类头，不引入新参数（`heads.py` 中实现）
- 支持多种模型架构（`modeling.py`）：ViT 和 ResNet
- 环境依赖（`environment.yml`）基于 OpenCLIP + PyTorch
- 附带字型攻击数据集（`typographic_attack_data.zip`, 16MB）
- 代码质量良好，适合作为遥感微调实验的模板

### 跨 Wiki 连接

| 相关概念 | Wiki 页面 | 连接关系 |
|---------|----------|---------|
| CLIP 对比学习 | L2: clip-based.md | PAINT 是 CLIP 的轻量适配方法，直接继承 CLIP 的双编码器架构和零样本推理能力 |
| 模型效率 | L3: model-efficiency.md | PAINT 是一种极致的效率策略：零额外推理开销、单 GPU 可运行、无需大规模重新训练。与 model-efficiency.md 中"效率悖论"论点一致 |
| VLM 谱系 | L2: vlm-based.md | PAINT 被列为 VLM 谱系中"轻量修补"路线的代表方法 |
| 持续预训练 | L3: pretraining-paradigm.md | PAINT 与持续预训练（Towards GFMs via Continual Pretraining）共享"复用已有权重"的理念，但 PAINT 更轻量（不需要大规模预训练数据） |
| 遥感域适应 | L0: mind-the-modality-gap-towards-a-remote-sensing-vision-language-model-via-cross-m | "Mind the Modality Gap" 将 PAINT 的权重插值思想引入遥感跨模态对齐 |

### 引文挖掘（被引情况）

论文自 2022 年发表后被以下 wiki 内论文引用或提及：
1. **"Mind the Modality Gap"** (L0_raw/mind-the-modality-gap-towards-a-remote-sensing-vision-language-model-via-cross-m) — 直接将 PAINT 的权重插值用于遥感跨模态对齐
2. **"Model Soups"** (Wortsman et al. ICML 2022) — 同作者组的孪生工作，模型平均的另一种形式
3. **"WiSE-FT"** (Wortsman et al. CVPR 2022) — PAINT 直接继承 WiSE-FT 的权重插值思想，但拓展到开放词汇场景

### 对遥感领域的启示

**直接可迁移的贡献：**
1. **遥感域适应（Domain Adaptation）**: PAINT 的权重插值可以直接用于遥感 CLIP 模型（如 RemoteCLIP）在特定遥感数据集上的修补
2. **多任务遥感分析**: Joint patching 策略适用于同时修补多个遥感任务（如同时提升土地覆盖分类、目标检测、场景分类）
3. **零成本冷启动**: PAINT 仅需一张 GPU 和 2000 次迭代微调，适合遥感领域的快速原型验证
4. **合成数据到真实数据迁移**: 字型攻击实验中展示了从合成数据到真实数据的 broad transfer，这对遥感中合成数据→真实卫星影像的迁移有直接启示

**局限性：**
1. 论文实验局限于 CLIP 系列模型，未在遥感专用基础模型（如 RingMo, SkySense）上验证
2. EuroSAT↔RESISC45 的 broad transfer 失败暗示遥感中不同数据集间的迁移效果有限
3. 需要验证集来选择最优 α 系数——在标注稀缺的遥感场景中可能受限

## [2026-05-31] Re-review: Full Paper Deep Reading + Code Inspection + Figure Analysis

**阅读范围:** full.md (962行完整论文, 含附录A-M), images/ (经过哈希处理的图像文件), code/ (src/ 完整实现), L2 Lineage (clip-based.md, vlm-based.md), L3 Modules (model-efficiency.md, pretraining-paradigm.md)

### 新发现的深层洞察

**1. 三重评估指标体系（Section 4.1 + Appendix D.1）**

PAINT 提出了三个评估指标，从不同角度量化"修补效果"：
- **Accuracy distance to optimal**（式1）：单修补模型与两个专用模型（一个在修补任务最优，一个在支持任务最优）之间的准确率差距。越小表示修补越有效。
- **Accuracy distance to endpoints**：比较单模型与零样本+微调两个端点模型的平均准确率
- **Path correction cost**（Appendix D.1）：测量插值曲线与"理想曲线"（零损失曲线）之间的L2距离，仅对同时低于两端的点计算

这三个指标的**核心优势**在于它们共同揭示了帕累托前沿的形状——不仅看最终结果，还看插值路径是否平滑。对于遥感研究，这种多维评估方法可类比用于评估"遥感域适应"方法的性能——不仅要看最终分类精度，还要看模型在不同源域和目标域之间的过渡是否平滑。

**2. 冻结文本编码器——维持开放词汇的关键设计决策**

论文在 Section 3 中做出一个被 review 章节未充分强调的设计选择：微调冻结 CLIP 文本编码器的输出作为分类头（Appendix C, Figure 7）。这意味着：
- **不引入任何任务特定参数**——模型保持开放词汇能力
- 文本特征可以**预计算一次**（per task），大幅加速微调
- Appendix C 证明冻结文本编码器对下游准确率的影响可以忽略（Figure 7，MNIST/EuroSAT/SUN397）
- 这是 PAINT 区别于 Model Soups 和 WiSE-FT 的核心差异——后两者改变分类头

这种"零参数适应"策略对遥感领域特别有价值：遥感标签空间频繁变化（不同数据集有不同土地覆盖类别），冻结文本编码器意味着无需为每个新任务设计分类头。

**3. Broad Transfer 的非对称性——遥感域间迁移的挑战**

Table 2 揭示了最有趣的发现之一：EuroSAT→RESISC45 的 broad transfer 失败了（-1.3pp），而 RESISC45→EuroSAT 却成功（+10.2pp）。论文将此归因于"缺乏共享类别"，但深入分析后可发现更多：

- EuroSAT 是 10 类土地覆盖（森林、农田等），RESISC45 是 45 类遥感场景（机场、港口、公园等）
- **从粗粒度到细粒度的迁移更难** — EuroSAT 的粗粒度类别缺乏 RESISC45 所需的细粒度区分信息
- 对应的，MNIST↔SVHN 的跨域数字识别（Table 1 中+19.4pp/+17.0pp）显示当任务域高度相似时 broad transfer 效果最好

这与遥感中"预训练骨干选择"问题直接相关：从 EuroSAT 微调迁移到 RESISC45 的效果不如反向迁移，暗示微调数据的域覆盖范围比数据量更重要。

**4. Scale 效应的三重交叉验证机理（Section 4.1 + Appendix D.2）**

论文对"大模型更容易修补"提供了三重交叉验证，这一机制解释在上次 review 中已有提及，但 full reading 后我发现更深刻的细节：

- **权重空间余弦相似度**：cos(θ_zs, θ_ft) 随模型规模增大而增大（Figure 2 right）
- **表示空间 CKA**：微调前后表示的相似度随规模增大而增大（Figure 2 center）
- **参数移动 L1 范数**：||θ_ft - θ_zs||₁ 随规模增大而减小（Appendix D.2）

这意味着大模型的**"惰性训练"（lazy training）**特性 - 微调几乎不改变内部表示。注意：这一发现对 ViT 尤其显著，对 ResNet 效果差很多（Appendix G），这与 ViT 的全局注意力机制使微调更稳定有关。

**5. 权重插值恢复帕累托前沿——比早停更高效（Section 4.2 + Figure 3）**

Figure 3 展示了一个关键发现：**权重插值可以恢复早停、正则化、不同超参数所获得的准确率权衡前沿**。这意味着：
- 只需要一次完整微调（2000 iterations）+ 多次插值 → 获得与早停数千次相同的帕累托曲线
- 在计算受限的遥感场景中，这意味着可以先用少量数据完整微调一次，再用插值探索最优 α

**6. 代码审查：clean PyTorch + OpenCLIP 实现**

代码仓库结构清晰（src/ 8个文件）：
- `patch.py` — 核心修补逻辑，实际仅需 ~10 行额外代码（README 示例）
- `finetune.py` — 微调循环，使用 cosine annealing + AdamW + warmup
- `heads.py` — 冻结的 CLIP 文本编码器分类头，不引入新参数
- `modeling.py` — 支持 ViT 和 ResNet 两种架构
- 环境依赖基于 OpenCLIP + PyTorch（`environment.yml`）

注意事项：
- 依赖 OpenCLIP 特定模型 checkpoint 格式
- 附带 typographic attack 数据（16MB zip）
- 代码整体质量良好，适合作为遥感 CLIP 微调实验的模板

**7. 多任务修补策略对比（Section 5 + Figure 5）**

三种多任务策略的性能排序：**Joint > Sequential（大模型时≈Joint）> Parallel**
- Joint patching 仅比多个专用模型差 0.5pp（ViT-L/14），是一个非常理想的多任务通用模型方案
- Sequential patching 在 ViT-L/14 上接近 Joint，但在小模型（ViT-B/32）上明显退化
- 对小模型，**不使用插值的 seq fine-tune 导致 combined accuracy 下降 4.6pp**（对比提升 11pp 当使用插值时）

这对遥感的启示：如果同一个 CLIP 模型需要服务多个遥感任务（土地覆盖 + 场景分类 + 目标检测），Joint patching 是最优选择。

### 引文挖掘（补充）

论文引用了以下相关工作，其中部分尚未收录到 Wiki：
- **Model Soups (Wortsman et al., ICML 2022)** — 同组孪生工作，模型平均的另一种形式。PAINT 可看作 Model Soups 在开放词汇场景的特化版本
- **WiSE-FT (Wortsman et al., CVPR 2022)** — PAINT 直接继承 WiSE-FT 的权重插值思想，但扩展到开放词汇和多任务场景
- **Linear Mode Connectivity (Frankle et al., ICML 2020)** — 理论基础：线性插值权重的有效性前提
- **CKA (Kornblith et al., ICML 2019)** — 表示相似性度量的标准工具，用于分析 scale 效应
- **基于 lazytraining 的分析 (Chizat et al., NeurIPS 2019)** — 大模型微调改变小的理论基础
- **EWC (Kirkpatrick et al., PNAS 2017)** — 基线对比方法

### 跨 Wiki 连接（补充）

| 相关概念 | Wiki 页面 | 连接关系 |
|---------|----------|---------|
| CLIP 对比学习 | L2: multimodal/representation-learning/clip-based.md | PAINT 是 CLIP 的轻量适配方法，直接继承双编码器架构和零样本推理能力 |
| VLM 谱系 | L2: multimodal/vision-language/vlm-based.md | PAINT 被列为 VLM 谱系中"轻量修补"路线的代表方法 |
| 模型效率 | L3: model-efficiency.md | PAINT 零额外推理开销、单 GPU 微调，与 model-efficiency.md 中"效率革命"论点一致 |
| 预训练范式 | L3: pretraining-paradigm.md | PAINT 与持续预训练共享"复用已有权重"理念，但更轻量 |
| 遥感跨模态对齐 | L0: mind-the-modality-gap | "Mind the Modality Gap" 直接将 PAINT 的权重插值用于遥感跨模态对齐 |
| 模型平均/合并 | — | Model Soups, Fisher-weighted averaging 等关联工作尚未被收录 |

### 对遥感领域的启示

**补充发现：**
1. **EuroSAT↔RESISC45 的非对称迁移警告** — 在遥感中使用 PAINT 时，修补任务与支持任务之间的域相似度需要先验评估。非对称迁移意味着修补可能只对部分方向有效
2. **合成数据→真实数据迁移的成功经验** — Typographic attack（Section 7）从合成数据迁移到真实世界（+41pp）的经验可以直接应用于遥感中合成数据（如 SimulatedSat）→真实卫星影像的迁移
3. **不需要验证集调 α 的风险** — Figure 4 显示不同支持任务的选择对最优 α 的影响很小（精度损失 <0.5%），但遥感任务可能需要更多验证
4. **大模型更容易修补对遥感 FM 的启示** — 随着遥感基础模型规模增大（300M→2B+），PAINT 这类轻量修补方法的效率会越来越高
