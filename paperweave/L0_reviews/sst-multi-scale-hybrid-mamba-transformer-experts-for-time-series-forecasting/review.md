---
slug: "sst-multi-scale-hybrid-mamba-transformer-experts-for-time-series-forecasting"
title: "SST: Multi-Scale Hybrid Mamba-Transformer Experts for Time Series Forecasting"
authors:
  - "Xiongxiao Xu"
  - "Canyu Chen"
  - "Yueqing Liang"
  - "Baixiang Huang"
  - "Guangji Bai"
  - "Liang Zhao"
  - "Kai Shu"
year: 2025
venue: "CIKM 2025"
tags: [time-series-forecasting, mamba, transformer, mixture-of-experts, state-space-model]
score: 4
contribution: 4
soundness: 4
relevance: 3
open_source: true
code_url: "https://github.com/ (link in paper)"
compute: "24GB RTX A5000"
dataset_access: public
---

> **Abstract:** SST proposes a multi-scale hybrid Mamba-Transformer experts model for time series forecasting. Mamba expert handles long-range patterns at low resolution; Transformer (LWT) expert captures short-term variations at high resolution. Long-short router adaptively fuses outputs.

## [2026-05-02] Review

**Score:** 4/5
- Contribution: 4/5 — First hybrid Mamba-Transformer architecture for time series forecasting. Identifies "information interference" problem in naive Mamba-Transformer stacking. Proposes decomposition into long-range patterns and short-range variations.
- Soundness: 4/5 — 7 real-world datasets (ETT, Weather, ECL, Traffic). 10-seed averaging. Ablation on patcher, router, components. Memory/speed analysis up to 6k time steps.
- Relevance: 3/5 — Time series forecasting domain. Indirectly relevant to RS temporal forecasting (NDVI, weather). Could be adapted for spatio-temporal RS tasks.

**Key Insights:**
- Naive Mambaformer stacking fails for time series (MSE 0.693 vs DLinear 0.455 on ETTh1) due to information interference
- Time series decomposition: Patterns (trend + seasonality) → Mamba expert at low resolution; Variations (residuals/noise) → LWT expert at high resolution
- New PTS Resolution metric: R_PTS = sqrt(P) / Str, quantifies granularity of patched time series
- Local Window Transformer (LWT) reduces attention complexity from O(S²) to O(w*S) while maintaining large receptive field via layer stacking
- SST scales linearly to 6k time steps; vanilla Transformer OOM at 336, PatchTST at 3k

|**Notes:** CIKM 2025. Illinois Institute of Technology + Emory University. Linear complexity O(L). SOTA on 7 datasets. Mamba inherently encodes position (no positional embedding needed).

## [2026-06-06] Re-review — Daily paperweave batch-read

**新增洞察:**

**代码分析 (https://github.com/XiongxiaoXu/SST):**
- 代码组织清晰，使用 `mamba_ssm` 官方库实现 Mamba block。Long_encoder 使用了 3 层 Mamba，每层包含 Mamba block + FFN (d_ff=256)。Short_encoder (LWT) 使用 3 层 TSTEncoderLayer，每层包含 local window attention (local_ws 可配置) + FFN。
- Router 实现极为简洁：一个线性层 (c_in → d_model) + Flatten + 线性层 (d_model*L → 2) + Softmax，输出两个权重 p_L 和 p_S。不是传统的 MoE token routing（路由到不同 expert），而是用于融合两个 expert 输出的加权系数。
- LWT 的 local mask 通过 `torch.cdist` 计算 1D 坐标距离矩阵，然后与 window_size 比较生成布尔 mask，实现窗口内注意力掩码。这种方法简单高效。
- Fusion Head 支持两种模式：concat（拼接后线性投影）和 additive（long→short 投影后加权求和）。论文中使用 concat 模式。
- 代码使用 PatchTST 风格的 patching (unfold + permute)，但 LWT 分支使用了 positional encoding，Mamba 分支则没有（利用 SSM 的位置编码能力）。
- **关键发现**: 代码中的 `decomposition` 选项实现了一种可选的 STL 分解（series_decomp），将短程输入分解为趋势和残差后分别输入两个 Short_encoder，这与论文中声称的"显式模式/变化分解"不完全一致——实际的分解是 patching 层面通过不同分辨率实现的，而非信号处理层面的 STL。

**架构深层理解:**
- 核心创新是**分辨率感知的专家分配**：低分辨率→Mamba（擅长长程、忽略噪声），高分辨率→LWT（擅长局部细节）。这不是简单的多尺度集成，而是显式利用不同模型架构的归纳偏置匹配不同的时间尺度特征。
- 与 MTST（论文中的强 baseline）的对比显示：MTST 只用不同分辨率 Transformer 分支，而 SST 在不同分辨率使用不同架构（Mamba vs Transformer），验证了\"不同架构适合不同尺度\"的假设。

**引用挖掘:**
- 论文引用了 11 篇本 wiki 已有论文：Mamba [13], PatchTST [30], Transformer [39], DLinear [54], iTransformer [27], Autoformer [45], Fedformer [57], Informer [56], TimeMixer [41], Reversible Instance Norm [20], V-MoE (Scaled MoE) [11]
- 值得关注：未引用 Sundial (Liu et al., ICML 2025，同样是时序预测基础模型，发布时间相近)
- 未引用 S-Mamba [42] 被用作 baseline 但非核心方法

**跨 wiki 连接:**
- **L3 模型效率**: SST 的线性复杂度 O(L) 扩展至 6k 时间步（vs 普通 Transformer 336 步 OOM）是效率设计的典型案例，可补充到 model-efficiency 页面的\"架构效率\"章节（特别是 2.1 节中新增 Mamba-Transformer 混合的效率证据）
- **L3 多尺度特征提取**: SST 的\"不同分辨率使用不同架构\"策略与 L3 multi-scale-feature-extraction 页面讨论的\"尺度感知动态路由（MoE）\"方向高度吻合，可补充到 L3 页面的 Open Questions
- **L2 forecasting/transformer-based**: 已覆盖，但可补充 SST 与 PatchTST、Sundial 在 patch 策略上的对比
- **L2 forecasting/mamba-based**: 已覆盖，较为完整

**与遥感时序任务的关联:**
- SST 的低分辨率→高分辨率的双分支设计可直接迁移到遥感时序预测任务（如 NDVI 预测、作物物候预测），其中长期趋势（生长周期）适合 Mamba，短期波动（天气影响）适合 LWT
- PTS Resolution 指标 R_PTS = sqrt(P)/Str 可能对遥感 patching 策略有参考价值
