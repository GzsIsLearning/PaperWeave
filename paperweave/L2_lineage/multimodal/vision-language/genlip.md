# Generative Language-Image Pre-training (GenLIP)

> Approach page for GenLIP: a minimalist generative pretraining framework for ViTs used as vision encoders in MLLMs. Single Transformer + single autoregressive LM objective.

## Overview

GenLIP departs from the dominant contrastive (CLIP/SigLIP) and encoder-decoder generative (CapPa/AIMv2) paradigms by training a ViT to **directly predict language tokens** from visual tokens, without an additional text decoder or contrastive batch construction. This removes the objective mismatch between pretraining and MLLM usage.

## Key Papers

| Paper | Architecture | Objective | Data | ALL AVG (Qwen2.5-7B frozen) | Code |
|-------|-------------|-----------|------|------|------|
| **GenLIP (Fang et al., 2026)** | Single ViT + LM head | NTP on text tokens | 8B samples | **73.6** (g/16) | ✅ Open |
| SigLIP2 (Tschannen et al., 2025) | Dual-encoder (SigLIP + text) | Contrastive (sigmoid) + generative | 40B pairs | 68.9 (g/16) | ✅ Open |
| AIMv2 (El-Nouby et al., 2024) | ViT + multimodal decoder | NTP on images + text | 12B+ | ~70 (g/16 est.) | ✅ |
| OpenVision2 (2025) | ViT + text decoder | Captioning loss | ~30B | ~69 | ✅ |

## Architecture

### Data Format
Image patches + text tokens concatenated: `S = [v_0,...,v_M, t_0,...,t_L]`

### Key Components
- **Unified Transformer** with Prefix-LM attention: image tokens → bidirectional, text tokens → causal
- **MRoPE** (Multimodal Rotary Position Encoding) replaces absolute position embeddings for image patches
- **Gated attention**: per-token gate (sigmoid) × attention output, mitigates attention sink
- **LM head** for next-token-prediction on text tokens only (discarded at deployment)
- **Stage 2**: native-aspect-ratio, multi-resolution adaptation with variable patch counts [16, 1024]

### Deployment as Vision Encoder
- Extract vision features from last LN layer, feed into 2-layer MLP projector
- Language modules (tokenizer, LM head) discarded
- Prefix-LM → full attention for vision-only input

### Model Configs
| Model | Params | Layers | Dims | Heads | FFN-w |
|-------|--------|--------|------|-------|-------|
| GenLIP-L | 0.3B | 24 | 1024 | 16 | 2816 |
| GenLIP-So | 0.4B | 27 | 1152 | 16 | 3072 |
| GenLIP-g | 1.1B | 40 | 1536 | 24 | 4096 |

## Key Results

| Benchmark | GenLIP-g/16 | SigLIP2-g/16 | Delta |
|-----------|-------------|--------------|-------|
| Doc/OCR Avg (7 benchmarks) | 63.5 | 56.6 | **+6.9** |
| MME-P | 1483 | 1422 | +61 |
| TextCaps | 144.8 | 142.7 | +2.1 |
| ALL AVG (15 benchmarks) | 73.6 | 68.9 | **+4.7** |

## References
- GenLIP paper: [[../L0_raw/let-vit-speak-generative-language-image-pre-training|review.md]]
- SigLIP2: [[../L0_raw/learning-transferable-visual-models-from-natural-language-supervision|CLIP review]] (for contrastive baseline context)
- CapPa (Tschannen et al., 2023) — NeurIPS — captioner-based generative pretraining
