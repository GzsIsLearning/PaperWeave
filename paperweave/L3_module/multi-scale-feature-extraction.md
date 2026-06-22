---
title: Multi-scale Feature Extraction in Remote Sensing
created: 2026-04-29
updated: 2026-04-29
type: module
problem: multi-scale-feature-extraction
tags: [remote-sensing, multi-scale, architecture, open-problem]
sources:
  - L0_raw/change3d-revisiting-change-detection-and-captioning-from-a-video-modeling-perspe.md
  - L0_raw/satswinmae-efficient-autoencoding-for-multiscale-time-series-satellite-imagery.md
  - L0_raw/semantic-aware-remote-sensing-change-detection-with-multi-scale-cross-attention.md
  - L0_raw/ringmo-lite-a-remote-sensing-multi-task-lightweight-network-with-cnn-transformer.md
  - L0_raw/skysense-a-multi-modal-remote-sensing-foundation-model-towards-universal-interpr.md
zotero_keys: []
confidence: medium
---

# Multi-scale Feature Extraction in Remote Sensing

## Problem Definition

遥感图像中物体尺度变化极大——从单个建筑物（米级）到整个农田（公里级），从局部纹理到全局场景语义。单一尺度的特征提取无法同时捕获细粒度细节和全局上下文。

## Why It Matters

- 同一场景中同时存在小目标（车辆）和大目标（森林）
- 不同传感器分辨率差异大（0.5m WorldView vs 10m Sentinel-2）
- 变化检测需要同时比较局部和全局变化

## Methods Attempted

| Method | Papers | Approach | Trade-off |
|--------|--------|----------|-----------|
| Swin Transformer | SatSwinMAE, RingMo-lite | 层次化窗口注意力，逐层扩大感受野 | 计算量随尺度增多增长 |
| Multi-scale cross-attention | Semantic-Aware CD | 不同尺度特征图之间交叉注意力 | 注意力复杂度 O(n²) |
| FPN-like structures | SkySense | 多尺度特征金字塔融合 | 信息丢失在自顶向下路径 |
| 3D video encoder pyramid | Change3D | 视频编码器4层金字塔特征（T×C_i×H/2^{i+1}×W/2^{i+1}），无显式多尺度模块 | 依赖预训练3D视频骨干 |
| Multi-resolution input | RingMo-lite | 同时输入多分辨率图像 | 输入数据量翻倍 |
| Dilated convolution | 传统方法 | 空洞卷积扩大感受野不增加参数 | 网格效应 |

## Gap Analysis

- 当前方法大多在 2-3 个固定尺度上操作，缺乏**连续尺度表示**
- 尺度选择通常是人工设定的超参数，而非数据驱动
- 多尺度与计算效率的矛盾未解决——Swin 比 ViT 慢
- 时序维度的尺度变化（不同季节植被覆盖度不同）被忽略

## Open Questions

- 能否学习一个尺度不变的连续表示？
- 神经辐射场（NeRF）的连续表示思路能否迁移到遥感多尺度？
- 尺度感知的动态路由（MoE）是正确方向吗？

## Related Problems

- [[modality-fusion]] — 不同模态天然具有不同空间分辨率
- [[data-scarcity]] — 多尺度需要更多标注数据

### 2026-06-12 跨引用更新（Daily Reading Agent 重读 AdaptVFMs + HMoE）

**AdaptVFMs-RSCD 的 1×1 Conv 适配器：**
- 在 FastSAM 多尺度特征（1/32, 1/16, 1/8, 1/4）后插入 1×1 卷积适配器，保持空间分辨率的同时进行通道维度重组
- 本质上是"无下采样多尺度融合"策略：避免大核卷积（3×3/5×5）平滑丢失遥感细节，Table 4 验证 1×1 在 OA/F1/mIoU 全面最优（但推理时间翻倍）
- 与 Swin Transformer 层次化窗口注意力的"逐层扩大感受野"形成对比：AdaptVFMs 选择保持空间分辨率，通过通道重组实现适配

**MFG-HMoE 的 MFA 模块：**
- 从 RHAG 层级输出聚合多尺度特征（浅层细节 + 深层语义），经 LayerNorm → Conv → LeakyReLU 生成路由指导特征
- 仅聚合网络内部层级特征，未融合多分辨率输入或空洞卷积等显式多尺度设计——属于"隐式多尺度"策略
- 与 FPN-like 结构（SkySense）的显式金字塔融合形成对比：MFA 更轻量但信息丢失风险更高
