---
slug: "on-the-foundations-of-earth-foundation-models"
title: "On the Foundations of Earth Foundation Models"
authors:
  - "Xiao Xiang Zhu"
  - "Zhitong Xiong"
  - "Yi Wang"
  - "Adam J. Stewart"
  - "Konrad Heidler"
  - "Yuanyuan Wang"
  - "Zhenghang Yuan"
  - "Thomas Dujardin"
  - "Qingsong Xu"
  - "Yilei Shi"
year: 2025
venue: "Communications Earth & Environment (Nature)"
tags: [remote-sensing, earth-science, foundation-model, perspective, survey, climate]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: false
code_url: "—"
compute: "—"
dataset_access: "—"
---

> **Abstract:** Perspective paper defining 11 essential features for ideal Earth foundation models. Covers geolocation/scale awareness, multi-sensor integration, physical consistency, carbon efficiency, and more. Critiques current approaches as addressing only a few features. Proposes path forward and identifies 8 emerging research directions.

## [2026-05-02] Review — Full-Text Reading

**Score:** 5/5 (Perspective Paper)
- Contribution: 5/5 — Defines the vision and requirements for the field. The 11 features are comprehensive and well-motivated. The paper is already highly cited and influential. Provides a framework for evaluating and designing future Earth FMs.
- Soundness: 5/5 — Well-argued with examples from existing literature. The feature definitions are specific enough to be actionable. Identifies concrete gaps between current FMs and the ideal.
- Relevance: 5/5 — Essential reading for anyone working on Earth/geospatial FMs. Provides the roadmap for the field.

**Key Insights:**
1. **11 features of ideal Earth FM:** (1) Geolocation awareness, (2) Scale awareness, (3) Multi-sensor integration, (4) Temporal awareness, (5) Physical consistency, (6) Uncertainty quantification, (7) Interpretability, (8) Carbon efficiency, (9) Continual learning, (10) Safety/alignment, (11) Accessibility.
2. **Current FMs only address ~3-4 features:** Most RS FMs focus only on feature extraction and ignore physical consistency, uncertainty, interpretability, and carbon efficiency.
3. **After FMs — 8 emerging directions:** Energy-efficient adaptation, adversarial defenses, interpretability, continual updating, physical law embedding, data assimilation, human-in-the-loop, and foundation-model-as-a-service.
4. **Earth FM ecosystem:** Envisions a system with multiple specialized expert models (EO, weather, climate) with feedback loops, connected via LLM reasoning.

**Notes:**
- TUM (Xiao Xiang Zhu) + Munich Center for ML. Published in Nature's Communications Earth & Environment.
- Published in 2025. Already highly influential.
- Does not propose a new model — provides theoretical and design framework.
- Key reference for grant proposals, research agendas, and system design.

---

## [2026-06-08] Re-review — Daily Paperweave Reading Agent

### 新洞察 (New Insights)

**1. 11特性框架的深层结构分析**
重读 full.md 后发现，11个特性并非平行罗列，而是具有内在层次结构：
- **基础功能层 (1-8)**：地理位置嵌入、地理平衡表示、尺度感知、波长嵌入、多传感器、时变、任务无关、碳最小化——这些是"能力"维度
- **信任worthiness层 (9-11)**：不确定性量化、物理一致性、VLM/LLM利用——这些是"可靠性"维度

这一分层设计暗示：**当前RS FM研究过度集中于基础功能层（尤其是1-4），而对9-11层的投入几乎为零**。特别是第10项"物理一致性"——full.md 中明确指出"purely data-driven FMs can make predictions based on non-physical relationships or spurious correlations"——这与近期物理信息神经网络（PINN）在遥感中的兴起形成呼应。

**2. 跨域尺度鸿沟的量化**
Fig. 4a 清晰展示了 EO（米级）、天气（公里级）、气候（百公里级）三个域之间的空间分辨率鸿沟。这一鸿沟不仅是技术挑战，更是组织挑战——当前三个社区（遥感、气象、气候）几乎互不交流，论文、数据集、评估协议完全割裂。Zhu等人提出的"Earth Embedding"概念（统一表示空间）是弥合这一鸿沟的雄心勃勃的愿景。

**3. 数据标注悖论**
Fig. 2a 揭示了一个惊人的事实：标注数据量 < 未标注数据量的 0.1%。这意味着**当前所有监督/半监督评估都可能严重高估了FM的真实能力**——我们在0.1%的数据上评估模型，却期望它在99.9%的未标注数据上表现良好。这为自监督预训练的必要性提供了最强论据。

**4. 天气FM的碳效率被过度简化**
论文提到 FourCastNet 比 IFS 节能12000倍，但忽略了训练成本——NeuralGCM需要256 TPU v4训练3周，ORBIT需要49152 MI250X GPU。"碳最小化"不能仅看推理阶段。

### 引文挖掘 (Citation Mining)

从 full.md 参考文献中提取的新引文（尚未在 to-read.md 中）：

1. **Aardvark Weather (Vaughan et al., 2025) — Nature** — 端到端数据驱动天气预报，已被加入to-read队列（来自Aurora引文挖掘）。本文将其列为减少再分析产品依赖的关键进展。
2. **NeuralGCM (Kochkov et al., 2024) — Nature** — 可微分通用环流模型，物理+ML混合架构。本文将其誉为"unique and promising modeling direction"。
3. **Climate-invariant machine learning (Beucler et al., 2024) — Science Advances** — 将气候过程不变性嵌入数据驱动模型。与本文第10项"物理一致性"直接相关。
4. **Physics-embedded Fourier neural network (Xu et al., 2024)** — 物理嵌入的傅里叶神经网络用于PDE。Xu是本文共同作者，与Qingsong Xu一致。
5. **Retrieval-augmented generation (Lewis et al., 2020) — NeurIPS** — RAG在地球FM中的潜在应用。本文在"Cross-disciplinary inspiration"部分提及。

### 跨Wiki连接 (Cross-wiki Connections)

**与 L2 multi-modal-fm.md 的连接：**
- 本文11特性框架可直接作为 L2 页面中"效率悖论"和"开放问题"的理论基础。特别是"物理一致性"（第10项）与 L2 中"RingMoE的SAR-L1功率重建是少数将物理先验嵌入预训练目标的尝试"形成直接呼应。
- 建议更新 L2：在"开放问题"部分增加"物理一致性"子节，引用本文第10项特性及NeuralGCM/Climate-invariant ML等物理感知方法。

**与 L3 geo-foundation-models.md 的连接：**
- L3 页面中"十个未解的设计问题"第7项"物理一致性如何融入预训练？"可直接引用本文的Physics-informed neural networks/solvers/embedded networks三层分类（Section k）。
- 建议更新 L3：在"预训练目标的演进路线"中增加"物理感知预训练"分支，引用本文和NeuralGCM/ACE/ClimODE。

**与 L3 pretraining-paradigm.md 的连接：**
- 本文提出的"免费知识"概念（公开土地覆盖产品、气候数据等）与 L3 中"监督预训练：被低估的第三条路"直接相关。AgriFM利用GLC_FCS30D正是这一思路的实例。
- 建议更新 L3：在"监督预训练"部分增加"免费知识利用"子节，引用本文和AgriFM/SoftCon。

**与 TerraMind 的连接：**
- 本文Fig. 5中"Unified FM with geographical mixture of experts (GeoMoE)"与 TerraMind 的双尺度预训练+TiM有概念联系——两者都追求统一架构处理异构地球数据。
- 本文引用了 TerraMind 的技术报告（arXiv:2504.11171, [146]），说明作者已关注到生成式多模态EO模型的最新进展。

### 行动建议

1. **优先级更新 to-read.md**：NeuralGCM (Nature 2024) 和 Climate-invariant ML (Science Advances 2024) 应加入待读队列——前者代表物理+ML混合架构的SOTA，后者提供气候不变性嵌入的方法论。
2. **L2/L3 页面更新**：在 multi-modal-fm.md 和 geo-foundation-models.md 中增加"物理一致性"作为独立设计维度，引用本文框架。
3. **个人研究启示**：如果我的研究涉及遥感FM，应重点关注"物理一致性"这一被忽视的特性——它可能是未来2-3年的重要差异化方向。
