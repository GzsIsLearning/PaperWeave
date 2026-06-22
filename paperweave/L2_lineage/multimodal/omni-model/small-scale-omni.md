# Small-Scale Omni Model — Thinker-Talker Architecture

> Method page for small-scale speech-native omni models using a separated semantic path (Thinker) and acoustic path (Talker).

## Overview

This line of work studies omni (text+speech+image input, text+streaming speech output) models at the 0.1B–0.5B scale, using a **Thinker–Talker architecture** where the language backbone (Thinker) handles semantic understanding and the acoustic module (Talker) generates streaming speech via discrete audio codec tokens.

## Key Papers

| Paper | Scale | Talker | Codec | Bridge | Vision | Venue |
|-------|-------|--------|-------|--------|--------|-------|
| Mini-Omni (Xie & Wu, 2024) | 0.5B | Language model head | SNAC (4) | Last layer | No | arXiv |
| Mini-Omni2 (Xie & Wu, 2024) | 0.5B | Language model head | SNAC | Last layer | SigLIP | arXiv |
| **MiniMind-O (Gong, 2026)** | **0.1B** | **MiniMind blocks (4-layer)** | **Mimi (8)** | **Middle layer (3/8)** | **SigLIP2** | **arXiv** |

## Architecture Distillation

### Thinker
Full transformer backbone handling text + projected modality features:
- **MiniMind-O**: 8-layer, 768 hidden, 8Q/4KV heads, vocab 6400
- Frozen encoders: SenseVoice-Small (speech), SigLIP2 (vision)
- MLP projectors (2-layer: LayerNorm → Linear → GELU → Linear) inject modality features at placeholder positions

### Talker
Independent module initializable from Thinker blocks:
- **MiniMind-O**: 4 MiniMind blocks, own RMSNorm, 768 hidden (required — ablation shows 512/384 fail)
- Reads: bridge state (middle Thinker layer) + autoregressive Mimi-code history
- Low-rank interface: shared base + per-codebook low-rank adapters (rank 256 default)
- 8 codebook heads with staggered delay schedule

### Speaker Conditioning
- No separate TTS module
- Reference Mimi codes right-aligned before target speech region (masked from loss)
- 192-dim CAM++ embedding at `<|audio_spk|>` position
- Five built-in voices + seven held-out

### Training Pipeline
| Stage | Data | Mode | LR | Time (4×3090) |
|-------|------|------|----|---------------|
| T2A | sft_t2a (1.25M, 1636h) | Full-model | 5e-6 | ~45 min |
| A2A proj | sft_a2a | Projector only | 5e-4 | ~25 min |
| A2A full | sft_a2a (414K, 423h) | Full-model | 5e-5 | ~75 min |
| I2T proj | sft_i2t (~100K) | Projector only | 5e-5 | ~varies |
| I2T full | sft_i2t | Full-model | 5e-6 | ~45 min |

### Key Design Choices
1. **Middle-layer bridge (layer 3 of 8)**: embedding too shallow (no context), last layer too noisy (LM-head classifier bias). Middle layer balances context vs. acoustic-friendliness.
2. **Low-rank 8-codebook interface**: output head rank matters more than embedding rank (decoupled rank ablation).
3. **Nine-stream sequence format** (8 audio + 1 text): makes the exact training layout reproducible.
4. **Talker hidden 768 is mandatory**: 512→CER 0.1745, 384→CER 0.2767 (vs 768→0.0897).

## 2026-06-14 更新：MiniMind-O 重读新发现

### 可拆卸组件设计

实际代码阅读揭示 MiniMind-O 具有清晰的模块化边界：
- **Thinker**: `model_minimind.py` — 完整 MiniMind Transformer
- **Talker**: 独立 4 层 MiniMind 块，可从 Thinker 最后 4 层拷贝权重初始化
- **Projectors**: 统一的两层 MLP 模板（LayerNorm→Linear→GELU→Linear），音频/视觉共用同一结构
- **低秩接口**: TalkerHead/TalkerEmbedding 使用 `base + per-codebook adapters` 设计

这意味着 MiniMind-O 可以被视为**"可拆卸的 omni 框架"**——替换任何组件（如用 Whisper 替代 SenseVoice、用 CLIP 替代 SigLIP2）只需修改对应 projector 和配置，无需改动核心架构。

### 可配置 bridge_layer

代码中 `bridge_layer = self.num_hidden_layers // 2 - 1` 默认选择第 3/8 层，但这是一个**可配置参数**。对于更深的模型（如 24 层），简单的 `// 2 - 1` 公式是否仍然最优是一个未探索的问题。

### 低秩接口的工程实现

代码实现揭示了论文 Figure 8 中 "output head rank > embedding rank" 现象的工程根源：
- **TalkerHead**: `base Linear + adapter(Linear→GELU→Linear)` — 需要将隐藏状态映射到 8 个 codebook 的分布，任务更复杂
- **TalkerEmbedding**: `base Embedding + adapter(Embedding→GELU→Linear)` — 只需将离散 code 映射到隐藏空间，相对简单

### 渐进式解锁训练策略

代码中的 `all`/`audio_proj`/`vision_proj` 三种训练模式暗示了**渐进式解锁**策略：先训练 projector 建立模态对齐，再 full-model 微调。这种策略在 0.1B 规模下有效，但在更大规模模型中可能需要更复杂的渐进方案。

## References
- MiniMind-O: [[../L0_raw/minimind-o-technical-report-an-open-small-scale-speech-native-omni-model|review.md]]
- Mini-Omni: arXiv 2408.16725
- Mini-Omni2: arXiv 2410.11190
- Moshi: arXiv 2410.00037 (Mimi codec origin)
