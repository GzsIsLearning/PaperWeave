---
slug: "geographically-and-temporally-weighted-regression-for-modeling-spatio-temporal-v"
title: "Geographically and Temporally Weighted Regression for Modeling Spatio-Temporal Variation in House Prices"
authors:
  - "Bo Huang"
  - "Bo Wu"
  - "Michael Barry"
score: 3
contribution: 3
soundness: 4
relevance: 2
year: 2010
venue: "International Journal of Geographical Information Science (IJGIS)"
open_source: false
---

> **Abstract:** GTWR extends GWR by adding temporal distance to the weighting matrix, capturing both spatial and temporal nonstationarity in housing price data from Calgary (2002-2004).

## [2026-05-02] Review

**Score:** 3/5
- Contribution: 3/5 — Clean extension of GWR with temporal dimension; incremental but well-executed
- Soundness: 4/5 — Rigorous statistical tests (ANOVA, McNamara's test), clear methodology
- Relevance: 2/5 — Geographic/spatial statistics, not directly related to remote sensing or deep learning

**Key Insights:**
- GTWR = GWR + temporal distance in kernel weight: d_ST² = λ[(u_i-u_j)²+(v_i-v_j)²] + μ(t_i-t_j)²
- R²: OLS=0.763, TWR=0.779, GWR=0.890, GTWR=0.928 — 46.4% error reduction vs OLS
- Parameter τ=μ/λ optimized via cross-validation; found τ=35 optimal for Calgary data
- When μ=0 → GWR; when λ=0 → TWR; general case → GTWR

**Notes:** International Journal of Geographical Information Science 2010. Chinese University of Hong Kong. 5000 observations, 11 variables. Only 3 years of temporal data — limitation acknowledged.

## [2026-05-18] Re-review — Full-text Re-read + Domain Context Analysis

**核心发现：** GTWR 是一篇经典的时空统计方法论文（IJGIS 2010, 被引 >2000 次），将 GWR 从纯空间扩展到时空联合建模。方法虽简单但统计严谨，是时空变系数建模的奠基工作之一。

### 从 full.md 发现的新 insights

1. **时空核权重的数学解耦**: full.md Sec 3.2 (Eq.12) 证明了时空权重矩阵可分解为空间权重矩阵和时序权重矩阵的乘积：W^ST = W^S × W^T（对应元素相乘）。这意味着 GTWR 的时空权重无需重新实现——可以用已有的 GWR 和 TWR 模块组合。这种数学优雅性解释了该方法的广泛引用。

2. **参数 τ 的物理意义**: full.md 推导 τ=μ/λ 是唯一的自由参数（Eq.13 通过 λ 归一化）。τ 的物理意义是"时间距离与空间距离的换算比"。在 Calgary 数据中 τ=35 意味着 1 天 ≈ 35² 平方米的空间距离？实际换算为：时间距离的单位需乘 τ 以匹配空间距离的尺度。这种跨维度的缩放是时空建模的核心挑战。

3. **变量非平稳性分析细节**: full.md Tab 5 的 F 检验有趣地显示：Age 变量在 GWR 中 F=134.37 (p=0.0000)，在 TWR 中只有 F=0.52 (p=0.7196)。说明房龄影响是高度空间局部的（不同社区房龄与价格关系差异大），但几乎不随时间变化——直观合理（3年窗口内房龄结构不变）。这提供了"在何处配比方法的实证指南"。

4. **McNamara's test 的应用**: full.md 使用 0.1% 和 0.5% 两个误差容限阈值做模型间显著性检验。在 0.5% 时 GTWR vs GWR 的 Z=-9.35（远小于 -1.96），差异高度显著。即使在 0.1% 严格容限下 Z=-2.30 仍显著。这种多重阈值的敏感性分析值得学习。

5. **方法局限**: full.md §6 明确承认 (1) 仅 3 年数据不足以充分展现时序非平稳性；(2) 线性组合的加权方案过于简单；(3) 未与 Calgary 市政府的分区 OLS 模型对比。这些诚实局限为后续工作指明了方向（如 GTWR+深度学习）。

### 引文挖掘（Citation Mining）

从 full.md 参考文献识别出以下重要论文（已确认不在 wiki）：

1. **GWR 原始论文** (Brunsdon, Fotheringham & Charlton, 1996, Geographical Analysis) — GWR 方法的奠基工作，GTWR 的母体方法。
2. **Fotheringham, Brunsdon & Charlton (2002) — GWR: The Book** — GWR 的权威专著，GTWR 直接继承的方法论框架。
3. **McMillen & McDonald (1997, J. Regional Science)** — 非参数局部线性回归在城市模型中的应用，GWR 的重要先驱。
4. **Leung, Mei & Zhang (2000, Environment and Planning A)** — GWR 非平稳性统计检验方法，GTWR 使用的 F 检验来源。

以上 4 篇推荐加入 to-read.md。

### 交叉 wiki 连接 (Cross-wiki)

- [[L2_lineage/general/other/miscellaneous.md]] — GTWR 当前归类在此页面。
- [[L3_module/model-efficiency.md]] — GTWR 的简约设计（一个参数 τ 捕获时空权衡）与遥感 FM 的"效率悖论"形成对比——有时只需简单的统计扩展就足够。
- [[L3_module/data-scarcity.md]] — GTWR 仅用 5000 个观测点和 3 年数据就显著提升了预测精度，展示了核心时空统计方法在数据有限场景下的价值。

### 评分维持

Score 3/5 → **3/5**（维持原判）：
- **贡献 3/5**: 干净的 GWR 扩展，数学优雅，但本质上是增量贡献。已发表 15 年，方法论已被广泛采纳。
- **声音性 4/5**: 统计检验严谨，ANOVA + F 检验 + McNamara's test 三重验证。
- **相关性 2/5**: 与遥感深度学习核心任务（变化检测、语义分割）间接相关，但时空变系数思想（GTWR→地理加权神经网络）有潜在迁移价值。
