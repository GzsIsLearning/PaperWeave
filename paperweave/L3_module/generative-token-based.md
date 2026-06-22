---
title: Generative Token-Based Foundation Models for EO
created: 2026-06-07
updated: 2026-06-07
type: module
domain: remote-sensing
task: representation-learning
approach: generative-token-based
tags: [remote-sensing, generative-model, tokenization, any-to-any, earth-observation, multimodal]
confidence: high
---

# 生成式Token基础模型 (Generative Token-Based EO FM)

## 核心思想

将地球观测(EO)模态离散化为token词汇表，通过跨模态token分类学习模态间关联。区别于传统像素级重建(MIM)或对比学习(CL)，该范式将任意模态统一表示为离散token序列，使模型天然支持**any-to-any生成**——输入任意模态组合，输出任意目标模态。

## 代表模型

### TerraMind (ICCV 2025)

- **论文**: "TerraMind: Any-to-Any Generative Multimodal Foundation Model for Earth Observation"
- **arXiv**: 2504.11171
- **机构**: IBM Research, Forschungszentrum Julich, ESA, NASA
- **代码**: https://github.com/ibm/terramind

**架构**:
```
任意EO模态 → 模态特定Tokenizer(FSQ) → 离散Token序列
                                    ↓
         Pixel Patch + Token → 共享Encoder-Decoder → 交叉熵预测目标Token
              ↑ 双尺度输入
```

**关键设计**:
1. **双尺度预训练**: 同时处理原始像素patch和离散token，通过交叉熵损失预测被掩码的目标token
2. **模态特定Tokenizer**: 每种模态(光学/SAR/DEM/NDVI/LULC)有独立FSQ tokenizer，压缩率250x-3000x
3. **共享Encoder-Decoder**: 所有模态共享同一Transformer，通过token ID区分模态来源
4. **Thinking in Modalities (TiM)**: 测试时递归增强——模型先生成中间表示，再基于中间表示优化最终输出

**支持模态**: Sentinel-1/2(多级别)、DEM、NDVI、LULC、图像描述、地理坐标(9模态)

**性能**: PANGAEA 59.29 mIoU (Base), ~61.3 mIoU (Large)

## 与其他范式的对比

| 维度 | MIM (MAE) | 对比学习 (CL) | 生成式Token (TerraMind) |
|------|-----------|--------------|------------------------|
| 输入表示 | 连续像素 | 连续特征 | 离散token |
| 预训练目标 | 像素重建 | 特征对齐 | token分类(交叉熵) |
| 生成能力 | 需额外解码器 | 无 | 天然any-to-any |
| 跨模态关联 | 隐式(共享编码器) | 显式(对比损失) | 显式(token共现) |
| 新模态扩展 | 需重新设计编码器 | 需重新设计投影头 | 需训练新tokenizer |
| 计算效率 | 高分辨率重建昂贵 | 中等 | token序列可复用LLM优化 |
| 时间建模 | 需显式设计 | 需显式设计 | 当前无(局限) |

## 优势

1. **统一生成接口**: 同一模型可做超分辨率、去云、模态转换、图像描述、坐标预测
2. **压缩效率**: 250x-3000x压缩率使高分辨率EO数据可高效处理
3. **LLM技术复用**: 离散token使RS模型可直接复用NLP领域的LLM训练技术(Scaling Law、推理优化等)
4. **TiM增强**: 测试时计算扩展提升性能，无需重新训练

## 局限

1. **模态特定tokenizer**: 每种新模态需单独训练tokenizer，无法像DOFA那样通过波长插值支持新传感器
2. **无时间建模**: 当前版本未显式处理时序数据(对比SeaMo/Prithvi)
3. **信息损失**: 离散化可能丢失精细光谱/相位信息
4. **训练复杂度**: 需先训练各模态tokenizer，再训练共享模型，两阶段流程

## 与相关模块的关系

- [[multi-modal-fm]] — 生成式Token是多模态FM的第六种融合范式
- [[vlm-based]] — TerraMind支持图像描述生成，与VLM方向有交集
- [[moe-based]] — 未来可将MoE路由与token范式结合，实现更细粒度的模态专业化
