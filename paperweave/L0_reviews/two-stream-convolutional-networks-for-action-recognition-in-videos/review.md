---
slug: "two-stream-convolutional-networks-for-action-recognition-in-videos"
title: "Two-Stream Convolutional Networks for Action Recognition in Videos"
authors:
  - "Karen Simonyan"
  - "Andrew Zisserman"
score: 5
contribution: 5
soundness: 5
relevance: 4
---

> **Abstract:** 经典视频动作识别。双流架构：空间流(静态帧)+时间流(多帧光流)。光流堆叠输入ConvNet。多任务学习结合UCF-101/HMDB-51。UCF-101 88.0%, HMDB-51 59.4%。

## [2026-05-02] Wiki rebuild review

**Score:** 5/5
- Contribution: 5/5 — 开创性双流架构，影响深远
- Soundness: 5/5 — 实验详尽，多种输入配置消融
- Relevance: 4/5 — 视频理解经典，但非遥感/多模态直接相关

**Key Insights:**
- 光流堆叠10帧优于单帧和轨迹堆叠
- 时间流ConvNet显著优于空间流(83.7% vs 73.0%)
- 多任务学习有效利用小数据集
- 均值减法补偿相机运动

**Citation Mining:**
- Krizhevsky et al. [2012] — spatial stream CNN baseline
- Optical flow [Horn & Schunck, 1981] — motion representation
- UCF-101 [Soomro et al., 2012] — evaluation dataset
- HMDB-51 [Kuehne et al., 2011] — evaluation dataset

**L1 Ecology Observations:**
- Two-stream architecture (spatial + temporal) is relevant for RS video analysis (e.g., change detection in satellite video)
- Optical flow as motion representation can be used for RS temporal change detection
- Multi-task learning for small datasets is applicable to RS domain adaptation
