# Review: EAGLE - Exploring The Design Space for Multimodal LLMs with Mixture of Encoders

## Summary
EAGLE is a family of multimodal large language models (MLLMs) from NVIDIA that explores the design space of using a mixture of vision encoders. Through systematic design space exploration, the paper identifies optimal encoder combinations and advanced training recipes including high-resolution adaptation, vision expert pre-alignment, and fusion strategies. Built on Vicuna-7B and Llama3-8B backbones, EAGLE achieves competitive or superior performance across 12 benchmarks compared to existing MLLMs.

## Key Contributions
- Thorough design space exploration for multi-encoder MLLMs
- Mixture of vision encoders strategy for complementary feature extraction
- Pre-alignment strategy for vision experts
- High-resolution fusion adaptation techniques
- Fully open-source release (data + recipe)

## Strengths
- Systematic and rigorous design space exploration
- Strong empirical results across diverse benchmarks
- Open-source commitment (data, code, recipes)
- Evolution roadmap showing incremental improvements
- Practical focus on encoder fusion strategies

## Weaknesses
- Lacks novel architectural innovations beyond encoder combination
- Similar in spirit to other multi-encoder approaches (e.g., LLaVA-NeXT, DeepSeek-VL)
- Limited to vision understanding; no generation
- Relatively standard benchmark evaluations

## Relevance
Valuable reference for MLLM design, particularly around vision encoder selection and fusion. The open-source release of training recipes benefits the community. Well-executed empirical study with practical guidance.

**Citation Mining:**
- LLaVA [Liu et al., 2023] — baseline single-encoder approach
- DeepSeek-VL [DeepSeek, 2024] — concurrent multi-encoder VLM
- SigLIP [Zhai et al., 2023] — vision encoder candidate
- ConvNeXt [Liu et al., 2022] — vision encoder candidate

**L1 Ecology Observations:**
- Mixture of encoders provides complementary features for RS: one encoder for spectral, one for spatial, etc.
- Pre-alignment of vision experts reduces training instability in multi-encoder VLMs
- High-resolution fusion adaptation is valuable for RS where spatial resolution varies
- The systematic design space exploration methodology can guide RS VLM architecture design
