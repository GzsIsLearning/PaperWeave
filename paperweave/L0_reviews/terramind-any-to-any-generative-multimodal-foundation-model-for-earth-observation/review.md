---
slug: "terramind-any-to-any-generative-multimodal-foundation-model-for-earth-observation"
title: "TerraMind: Large-Scale Generative Multimodality for Earth Observation"
authors:
  - "Johannes Jakubik"
  - "Felix Yang"
  - "Benedikt Blumenstiel"
  - "Erik Scheurer"
  - "Rocco Sedona"
  - "Stefano Maurogiovanni"
  - "Jente Bosmans"
  - "Nikolaos Dionelis"
  - "Valerio Marsocci"
  - "Niklas Kopp"
  - "Rahul Ramachandran"
  - "Paolo Fraccaro"
  - "Thomas Brunschwiler"
  - "Gabriele Cavallaro"
  - "Juan Bernabe-Moreno"
  - "Nicolas Longépé"
year: 2025
venue: "ICCV 2025"
tags: [remote-sensing, foundation-model, multimodal, generative, any-to-any, tokenization, fsq, transformer, earth-observation, pangaea, thinking-in-modalities]
score: 5
contribution: 5
soundness: 4
relevance: 5
open_source: true
code_url: "https://github.com/ibm/terramind"
model_url: "https://huggingface.co/ibm-esa-geospatial"
compute: "32x NVIDIA A100, ~9,216 GPU hours (v1-B); ~15,360 GPU hours (v1-L)"
dataset_access: "public (TerraMesh to be open-sourced)"
lineage_pages:
  - lineage/remote-sensing/representation-learning/multi-modal-fm
---

> **Abstract:** TerraMind is the first any-to-any generative multimodal foundation model for Earth Observation. It pretrains on dual-scale (token-level + pixel-level) representations across 9 modalities (optical SAR, radar, DEM, LULC, NDVI, coordinates, text) using FSQ-based tokenizers and a Transformer encoder-decoder. The cross-modal patch classification objective enables both discriminative and generative capabilities. TerraMind achieves SOTA on PANGAEA benchmark, introduces Thinking-in-Modalities (TiM) recursive augmentation, and demonstrates zero-shot generation capabilities. Models and code are open-sourced.

## [2026-06-07] Review — Full-Text Reading

**Score:** 5/5
- Contribution: 5/5 — First any-to-any generative multimodal model for EO. Dual-scale pretraining paradigm (token + pixel) is a genuine architectural innovation. TiM (Thinking-in-Modalities) extends chain-of-thought reasoning to multimodal EO. Open-sourced weights, code, and dataset.
- Soundness: 4/5 — Strong PANGAEA benchmark evaluation with frozen encoder + UperNet head. Comprehensive ablations on tokenizer design (FSQ vs VQ), scaling behavior (B vs L), dual-scale vs single-scale, and generation quality metrics (SSIM, PSNR, MAE, RMSE). However, some generation metrics (especially DEM altitude levels) show room for improvement. Limited comparison with concurrent generative RS models like DiffusionSat.
- Relevance: 5/5 — Represents a paradigm shift in EO AI: from discriminative-only GFMs to generative any-to-any models. The ability to generate missing modalities unlocks entirely new application patterns (data imputation, cross-modal translation, synthetic training data). Directly relevant to multi-modal-fm lineage and addresses key open problems (modality missing robustness, cross-modal generation).

**Key Insights:**
1. **Dual-scale pretraining is the core innovation.** TerraMind processes both discrete tokens (16K vocabulary per modality, 16x16 patch → 1 integer) and raw pixel patches (16x16 patch → floating-point sensor data) simultaneously. Tokens enable cross-modal correlation learning and scaling (compression 250x–3000x); pixels preserve fine-grained spatial nuances. This is not simply "multi-resolution" — it is multi-abstraction: the same 16x16 region represented at two semantic levels.

2. **FSQ tokenizers + diffusion decoders enable any-to-any generation.** Finite Scalar Quantization (FSQ) replaces VQ-VAE codebooks, eliminating codebook loss terms and improving training stability. Each image-like modality (S-1, S-2, LULC, NDVI, DEM) gets its own tokenizer with modality-specific vocabulary (16K for most, 4K for LULC). The diffusion decoder maps tokens back to images, enabling chained conditional generation: input → tokens → decoder → any modality.

3. **Cross-modal patch classification as pretraining objective.** Rather than pixel reconstruction (MAE) or contrastive alignment, TerraMind predicts masked target tokens from randomly sampled input tokens and pixel patches. The objective is pure cross-entropy over discrete token vocabularies. This forces the model to learn structured latent spaces where cross-modal relationships are explicit — evidenced by strong few-shot performance (70.83% EuroSAT 1-shot 5-way, +10pp over CLIP).

4. **Thinking-in-Modalities (TiM) is a genuine new capability.** Inspired by chain-of-thought in LLMs, TiM recursively generates synthetic modalities during finetuning/inference and feeds them back as additional input. On Sen1Floods11, TiM improves water IoU by up to 2.5pp (S-1 + gen. LULC: 72.25 vs 68.00 without TiM). On SA Crop dataset, TiM improves mIoU from 41.87 to 42.74. The mechanism is simple but effective: the model hallucinates missing context that guides downstream reasoning.

5. **PANGAEA SOTA with frozen encoder.** TerraMindv1-B achieves 59.29 avg. mIoU on PANGAEA (9 datasets), outperforming CROMA (55.29), DOFA (53.59), and all other GFMs by at least 3pp. Crucially, it is the **first GFM to outperform task-specific U-Nets** on PANGAEA (+1pp avg. mIoU). TerraMindv1-L pushes this further to ~61.3 avg. mIoU, with peak gains of +5pp on multimodal datasets.

6. **Zero-shot generation unlocks new EO workflows.** TerraMind can generate S-1 SAR from S-2 optical (SSIM 0.531, PSNR 28.68), DEM from optical (SSIM 0.942), and even geolocate from visual content. The zero-shot water body mapping IoU of 45.4% (v1-B) and 69.8% (v1-B-single with DynamicWorld LULC pretraining) demonstrates that generative pretraining transfers to segmentation without task-specific finetuning.

**Notes:**
- IBM Research Europe (lead) + ETH Zurich + Forschungszentrum Jülich + ESA Φ-Lab + NASA IMPACT + University of Iceland. Strong cross-institutional collaboration.
- Pretraining data: TerraMesh — 9M globally distributed, spatiotemporally aligned samples across 9 modalities at 10m resolution. Built from SSL4EO-S12 + MajorTOM-Core + ESRI LULC + Copernicus DEM + LLaVA-Next captions + coordinate tokens.
- Three model variants: v1-B (base, dual-scale, 500B tokens, 6 days on 32 A100), v1-L (large, dual-scale, 500B tokens, 10 days on 32 A100), v1-B-single (base, single-scale/token-only + S-2 L2A pixels, 500B tokens, 6 days on 32 A100).
- Tokenizer architecture: ViT-B encoder → FSQ quantizer (codebook 8-8-8-6-5, latent dim 5) → diffusion UNet decoder. Trained 100 epochs per modality on 4 GPUs.
- Text tokenizer: modified WordPiece with special coordinate tokens (latitude/longitude discretized to quarter-degree).
- Masking strategy: Dirichlet-distributed sampling of input/target tokens. The model is agnostic to whether inputs are tokens or patches; targets are always tokens.
- Total pretraining compute: ~30K GPU hours including ablations; final runs ~9,216 GPU hours (v1-B) and ~15,360 GPU hours (v1-L).
- Generation quality asymmetry: radar→optical achieves better structural fidelity (SSIM 0.750) than optical→radar (SSIM 0.531). DEM generation is structurally strong (SSIM 0.942) but noisy in altitude levels (MAE 215.8m).
- Geolocation prediction works by similarity-based retrieval: the model outputs coordinates of training samples most similar to the query, even for unseen locations.

## [2026-06-07] Re-review — Deep Technical Analysis

**Re-read confirms score: 5/5** (Contribution 5, Soundness 4, Relevance 5)

### Technical Architecture Deep Dive

**Tokenizer design decisions (from supplementary):**
- FSQ vs VQ: Both reach similar reconstruction MSE, but FSQ converges smoother with stable gradient norms (Figure 11). VQ exhibits gradient norm spikes early in training (102 → 42 → 8 → 10 → 3 → ... → 1.0), while FSQ stays flat at ~1.0 from step 0. This stability is critical when training 6+ modality tokenizers in parallel.
- Codebook size paradox: Increasing beyond 16K for multi-channel modalities (e.g., 12-band S-2) introduces artifacts despite lower compression bottleneck. The authors hypothesize that larger codebooks are harder to use effectively — consistent with VQ-VAE literature but counterintuitive.
- EMA updates harm reconstruction: EMA-smoothed tokenizers lose fine-grained features (bridges disappear in reconstructions). The authors explicitly omit EMA, accepting noisier but more detailed reconstructions.
- Spatial bias analysis: Tokenizer MSE is low and geographically uniform across validation data (Figures 12-14). Minor degradation in snowy/icy Northern Asia due to extreme reflectance values (up to 12,000 vs normal [0,255]) — a long-tail distribution challenge.

**Scaling behavior:**
- v1-L outperforms v1-B after ~10% of training (50B tokens). Validation loss gap persists across all modalities: S-2 L2A (5.67→5.34), S-1 GRD (7.84→7.69), DEM (2.19→2.14), NDVI (6.42→6.25). The gap is modest (~5% relative improvement) suggesting diminishing returns from model size at fixed data scale.
- v1-B-single (token-only + S-2 L2A pixels) underperforms v1-B on most tasks, validating the dual-scale hypothesis. However, v1-B-single achieves better zero-shot water mapping (69.8% vs 45.4%) because it was pretrained with DynamicWorld LULC pseudo-labels — a data augmentation effect, not architecture effect.

**Pretraining efficiency:**
- 500B tokens sounds large but each token is highly compressed. For S-2 L2A (12 bands, 264x264 pixels), tokenization achieves >3000x compression. The effective "pixel-equivalent" pretraining is ~1.5M samples × 500B tokens / (264×264/16×16 tokens per sample) ≈ 1.7B pixel-patch equivalents — comparable to other large-scale RS pretraining efforts.
- Batch size search: Tested 2K, 4K, 8K global batch sizes. Final: 4K with base LR 2e-4, cosine annealing.
- GPU utilization: 85%+ for v1-L, 99% for single-channel tokenizer training.

### Generation Quality Analysis

| Direction | MAE | RMSE | SSIM | PSNR | Assessment |
|-----------|-----|------|------|------|------------|
| S-1 GRD → S-2 L2A | 0.074 | 0.116 | 0.750 | 26.21 | Good structural fidelity, some perceptual degradation |
| S-2 L2A → S-1 GRD | 2.942 | 3.877 | 0.531 | 28.68 | Visually plausible but structurally misaligned |
| S-2 L2A → DEM | 215.8 | 745.5 | 0.942 | 20.62 | Structurally excellent, altitude noisy |
| S-1 GRD → DEM | 163.0 | 320.8 | 0.878 | 20.69 | Better altitude than optical→DEM |

Key observation: The generation asymmetry (radar→optical better than optical→radar) likely stems from information theory — SAR contains speckle noise that provides less constraint on optical appearance than optical texture provides on SAR backscatter. DEM generation is structurally strong because topography correlates strongly with both optical texture and SAR geometry.

### TiM Mechanism Analysis

TiM is formally: x̃^(k+1) = x̃^(k) ∪ f_gen(x̃^(k)), y = f(x̃^(K))

This is recursive data augmentation via the model's own generative prior. The effectiveness depends on:
1. **Quality of generated modalities**: Generated LULC improves water mapping (+4.25pp IoU for S-1 input) because LULC provides semantic context about land cover that complements SAR's water sensitivity.
2. **Modality complementarity**: TiM works best when the generated modality provides orthogonal information to the input. S-1 (water-sensitive) + gen. LULC (land-cover context) is complementary; S-2 (optical) + gen. LULC provides less gain because S-2 already contains similar semantic information.
3. **Chaining depth**: The paper only evaluates K=1 (one generated modality). Deeper chaining (K>1) is mentioned but not evaluated — an open question.

### Limitations (from full text and supplementary)

1. **Generation fidelity ceiling**: Generated modalities do not surpass pseudo-label quality (Table 12: DynamicWorld LULC 71.98 IoU vs TerraMind generation < 70). This is expected — the tokenizer compression loses fine details.
2. **No temporal modeling**: TerraMesh contains single timestamps (except SSL4EO-S12 subset). The model cannot handle time-series or change detection natively.
3. **Fixed resolution**: All pretraining at 10m GSD. No multi-resolution or super-resolution capabilities demonstrated.
4. **Limited spectral flexibility**: Each modality has its own tokenizer. Unlike DOFA/AOM, TerraMind cannot handle arbitrary wavelengths or new sensors without training a new tokenizer.
5. **Text modality is synthetic**: Captions generated by LLaVA-Next with 69% hallucination-free rate (evaluated on 1.3k samples). This introduces noise into the text modality.
6. **Coordinate discretization**: Quarter-degree grid (~27.8km at equator) is coarse. The model cannot predict precise sub-degree locations.
7. **Computational cost**: 9K-15K GPU hours for pretraining is substantial, though comparable to other large GFMs. The tokenizer training adds additional compute (100 epochs × 6 modalities × 4 GPUs).

### Citation Mining

| Category | Paper | Reason |
|----------|-------|--------|
| Direct lineage | 4M (Mizrahi et al., 2023) — arXiv | Architecture basis: symmetric Transformer encoder-decoder for multimodal masked modeling |
| Direct lineage | FSQ (Mentzer et al., 2023) — arXiv | Tokenization basis: finite scalar quantization replaces VQ-VAE codebooks |
| Direct lineage | SSL4EO-S12 (Wang et al., 2023) — IEEE GRSM | Data basis: multimodal SAR-optical dataset for pretraining |
| Direct lineage | MajorTOM-Core (Francis & Czerkawski, 2024) — arXiv | Data basis: global coverage SAR-optical dataset |
| Paradigm basis | ViT-VQGAN (Yu et al., 2021) — NeurIPS | Tokenizer architecture: ViT encoder + VQGAN decoder with tanh MLP |
| Paradigm basis | ViT (Dosovitskiy et al., 2021) — ICLR | Backbone: patch embedding and Transformer architecture |
| Key competitor | CROMA (Fuller et al., 2023) — NeurIPS | Direct PANGAEA benchmark competitor; contrastive SAR-optical approach |
| Key competitor | DOFA (Xiong et al., 2024) — arXiv | Direct PANGAEA benchmark competitor; wavelength-conditioned unification |
| Key competitor | Prithvi 2.0 (Jakubik et al., 2024) — arXiv | Same first author; predecessor GFM; direct comparison on PANGAEA |
| Key competitor | MetaEarth (Yu et al., 2024) — IEEE TPAMI | Generative RS model (optical-only); TerraMind extends to any-to-any multimodal |
| Key competitor | DiffusionSat (Khanna et al., 2023) — arXiv | Generative RS diffusion model; TerraMind uses diffusion only in tokenizer decoders |
| Key competitor | MMEarth (Nedungadi et al., 2024) — arXiv | Concurrent multimodal RS pretraining (masked autoencoder); not generative |

### Cross-Wiki Connections

- [[multi-modal-fm]] — L2 lineage page. TerraMind represents a **new fusion paradigm** beyond the 5 categories currently documented (alignment-based, unification-based, hybrid, dynamic routing, temporal-aware). It is best described as **"generative token-based"** — a 6th category where cross-modal correlation is learned via discrete token prediction rather than continuous feature alignment. Update the comparison table and evolution timeline.
- [[modality-fusion]] — L3 module. TerraMind's dual-scale fusion (token + pixel for the same spatial patch) is a novel solution to the modality fusion problem. The finding that token-level fusion outperforms late fusion by 2.9pp (Table 2) is strong evidence for early fusion in multimodal EO.
- [[geo-foundation-models]] — L3 module. TerraMind is the first GFM to beat task-specific U-Nets on PANGAEA — a milestone that challenges the "FM underperforms supervised baselines" pattern documented in PANGAEA.
- [[pretraining-paradigm]] — L3 module. TerraMind introduces a new pretraining paradigm: "cross-modal patch classification" — distinct from MIM, contrastive learning, and distillation. This is a token-prediction objective (like LLM next-token prediction) applied to multimodal EO data.
- [[data-scarcity]] — L3 module. TiM provides a data-scarcity solution: when a modality is missing at inference time, generate it. The 1-shot 5-way EuroSAT result (70.83%) demonstrates strong few-shot capability from structured latent spaces.
- [[open-source-reproducibility]] — L3 module. TerraMind is fully open-source (weights, code, dataset) — a rarity among large-scale RS FMs. Only CROMA, Prithvi, and DOFA+ are similarly open.

## [2026-06-07] Re-review — Strategic Assessment

**What TerraMind changes about the field:**

1. **From discriminative to generative GFMs:** Before TerraMind, all major RS GFMs were discriminative (CROMA, DOFA, Prithvi, SkySense, RingMoE). TerraMind proves that generative pretraining can achieve discriminative SOTA while unlocking entirely new capabilities (any-to-any generation, TiM). This mirrors the NLP trajectory from BERT (discriminative) to GPT (generative).

2. **Token-based EO representation:** By discretizing EO modalities into token vocabularies, TerraMind bridges EO and NLP/LLM techniques. The cross-entropy token prediction objective is identical in form to LLM pretraining. This opens the door to: (a) scaling laws from LLM literature, (b) LLM inference optimizations (speculative decoding, KV-cache), (c) multimodal LLM integration.

3. **Dataset as contribution:** TerraMesh (9M samples, 9 modalities, global coverage) is a significant dataset contribution alongside the model. The spatiotemporal alignment and pseudo-labeling pipeline will benefit the community.

**Open questions for follow-up work:**

1. Can TiM be extended to recursive depth K>1? Does chained generation quality degrade gracefully?
2. How does TerraMind perform on time-series tasks (change detection, crop monitoring) with temporal inputs?
3. Can the tokenizer architecture be made sensor-agnostic (like DOFA's wavelength conditioning) to handle new satellites without retraining?
4. What is the compute-optimal scaling law for dual-scale pretraining? Is the token/pixel ratio a tunable hyperparameter?
5. Can TerraMind's generative capabilities be used for data augmentation in downstream training (synthetic samples from real inputs)?

**Comparison to closest competitors:**

| Dimension | TerraMind | MetaEarth | DiffusionSat | MMEarth |
|-----------|-----------|-----------|--------------|---------|
| Generative | Yes (any-to-any) | Yes (optical only) | Yes (optical only) | No |
| Multimodal | 9 modalities | 1 modality | 1 modality | 6 modalities |
| Tokenization | FSQ + diffusion | VQ-VAE | Diffusion | MAE (continuous) |
| Pretraining objective | Cross-modal token classification | Image generation | Image generation | Masked reconstruction |
| Discriminative SOTA | Yes (PANGAEA) | No | No | Partial |
| Open source | Yes | No | No | No |
| Compute | 32xA100, 6-10 days | Not reported | Not reported | Not reported |

TerraMind occupies a unique position: the only model that is simultaneously generative, multimodal, discriminative-SOTA, and open-source.

**Final assessment:** TerraMind is a landmark paper that defines a new category of RS foundation models. The dual-scale pretraining paradigm, any-to-any generation capability, and TiM recursive augmentation are genuine contributions with clear experimental validation. The open-source release maximizes scientific impact. The main limitations (no temporal modeling, fixed resolution, modality-specific tokenizers) are acknowledged by the authors and represent natural directions for future work.

---

```json
{
  "paper": {
    "title": "TerraMind: Large-Scale Generative Multimodality for Earth Observation",
    "authors": ["Johannes Jakubik", "Felix Yang", "Benedikt Blumenstiel", "et al."],
    "year": 2025,
    "venue": "ICCV 2025",
    "arxiv": "2504.11171"
  },
  "assessment": {
    "score": 5,
    "contribution": 5,
    "soundness": 4,
    "relevance": 5
  },
  "deployability": {
    "open_source": true,
    "code_url": "https://github.com/ibm/terramind",
    "model_url": "https://huggingface.co/ibm-esa-geospatial",
    "compute": "32x NVIDIA A100, ~9,216 GPU hours (v1-B)",
    "dataset_access": "public"
  },
  "key_contributions": [
    "First any-to-any generative multimodal foundation model for Earth Observation",
    "Dual-scale (token-level + pixel-level) pretraining paradigm",
    "FSQ-based tokenizers with diffusion decoders for 6+ modalities",
    "Cross-modal patch classification pretraining objective",
    "Thinking-in-Modalities (TiM) recursive augmentation",
    "PANGAEA benchmark SOTA (first GFM to beat task-specific U-Nets)",
    "Zero-shot generation and few-shot classification capabilities"
  ],
  "technical_highlights": {
    "architecture": "Symmetric Transformer encoder-decoder (4M-style)",
    "tokenization": "FSQ quantizer (codebook 8-8-8-6-5, latent dim 5) + diffusion UNet decoder per modality",
    "pretraining_data": "TerraMesh: 9M samples, 9 modalities, 10m resolution, global coverage",
    "model_variants": {
      "v1-B": "Base, dual-scale, 500B tokens, 6 days on 32 A100",
      "v1-L": "Large, dual-scale, 500B tokens, 10 days on 32 A100",
      "v1-B-single": "Base, single-scale, 500B tokens, 6 days on 32 A100"
    },
    "compression_rates": "250x (S-1) to 3000x (S-2 L2A, 12-band)"
  },
  "benchmark_results": {
    "pangaea_avg_mIoU": {
      "TerraMindv1-B": 59.29,
      "TerraMindv1-L": "~61.3",
      "CROMA": 55.29,
      "DOFA": 53.59
    },
    "eurosat_1shot_5way": {
      "TerraMindv1-B": 70.83,
      "CLIP-ViT-B/16": 57.00,
      "Prithvi_2.0_300M": 61.06
    },
    "sen1floods11_zero_shot": {
      "TerraMindv1-B": 45.40,
      "TerraMindv1-B-single": 69.75
    }
  },
  "limitations": [
    "No temporal modeling capability",
    "Fixed 10m resolution pretraining",
    "Modality-specific tokenizers (not sensor-agnostic like DOFA)",
    "Synthetic captions with 31% hallucination rate",
    "Coarse coordinate discretization (quarter-degree)",
    "Substantial pretraining compute requirement"
  ],
  "lineage_connections": [
    "lineage/remote-sensing/representation-learning/multi-modal-fm",
    "L3_module/modality-fusion",
    "L3_module/geo-foundation-models",
    "L3_module/pretraining-paradigm",
    "L3_module/data-scarcity",
    "L3_module/open-source-reproducibility"
  ],
  "citation_key_papers": [
    "4M (Mizrahi et al., 2023)",
    "FSQ (Mentzer et al., 2023)",
    "SSL4EO-S12 (Wang et al., 2023)",
    "MajorTOM-Core (Francis & Czerkawski, 2024)",
    "CROMA (Fuller et al., 2023)",
    "DOFA (Xiong et al., 2024)",
    "Prithvi 2.0 (Jakubik et al., 2024)",
    "MetaEarth (Yu et al., 2024)"
  ],
  "review_date": "2026-06-07",
  "reviewer": "Paperweave Agent"
}
```