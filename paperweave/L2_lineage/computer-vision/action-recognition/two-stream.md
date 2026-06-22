---
title: Two-Stream Action Recognition (CV)
created: 2026-05-02
updated: 2026-05-02
type: lineage
domain: computer-vision
task: action-recognition
approach: two-stream
tags: [cv, action-recognition, video, two-stream, optical-flow]
sources:
  - L0_raw/two-stream-convolutional-networks-for-action-recognition-in-videos
  - L0_raw/two-stream-convolutional-networks-for-action-recognition-in-videos
zotero_keys: []
confidence: high
---

# Two-Stream Action Recognition

## Overview

Two-Stream (Simonyan & Zisserman 2014) 是视频动作识别的经典范式：空间流处理静态 RGB 帧，时间流处理多帧堆叠的光流，双流融合实现 UCF-101 88.0%、HMDB-51 59.4%。开创了双流架构数十年的主导地位。

## Papers

| Paper | Year | Score | Contribution | Compute | Dataset | Open Source | Code URL | Key Insight |
|-------|------|-------|-------------|---------|---------|-------------|----------|-------------|
| Two-Stream (Simonyan) | 2014 | 5 | 空间流(RGB)+时间流(光流)双流架构 | 4×Titan | UCF-101, HMDB-51 | true | — | 光流堆叠 10 帧显著优于单帧，时间流是关键 |

## Impact

双流架构影响了视频理解领域十余年，后续 TSN、I3D、SlowFast 等工作均受其启发。虽然非遥感直接相关，但双流（外观+运动）的思路对遥感时序分析（如作物生长变化、土地覆盖变迁）有方法论参考价值。
