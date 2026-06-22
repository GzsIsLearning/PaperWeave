---
slug: "improving-language-understanding-by-generative-pre-training"
title: "Improving Language Understanding by Generative Pre-Training"
authors:
  - "Alec Radford"
  - "Karthik Narasimhan"
  - "Tim Salimans"
  - "Ilya Sutskever"
venue: "OpenAI Technical Report (2018)"
---

## [2026-05-02] Review

### Summary
This paper (GPT-1) introduced the generative pre-training + discriminative fine-tuning paradigm that became the blueprint for modern LLMs. The authors pre-train a 12-layer decoder-only Transformer on the BooksCorpus (7,000 unpublished books), then fine-tune it on specific NLP tasks using task-specific input transformations. The model achieves state-of-the-art on 9 out of 12 tasks studied, including +8.9% on commonsense reasoning, +5.7% on question answering (RACE), and +1.5% on textual entailment (MultiNLI).

### Significance
This paper launched the GPT family and established semi-supervised pre-training as the dominant NLP paradigm. The two-stage approach (unsupervised pre-training → supervised fine-tuning) directly led to GPT-2, GPT-3, GPT-4, and inspired BERT. Its core insight—that generative pre-training on diverse text teaches a model transferable linguistic knowledge—remains fundamental.

### Strengths
- Clear, well-motivated two-stage framework
- Task-specific input transformations enable minimal architecture changes
- Strong empirical results across 12 diverse NLP benchmarks
- Ablation studies showing: pre-training is essential (14.8% drop without it), Transformers beat LSTMs (5.6 point gap), auxiliary LM objective helps
- Zero-shot analysis showing generative pre-training learns task-relevant functionality

### Weaknesses
- Pre-training corpus (BooksCorpus) is relatively small by modern standards
- Only 12 layers, 117M parameters — small by today's measures
- Task-specific input format engineering required
- Limited exploration of scaling behavior

### Rating
Foundational: 5/5 — One of the most important papers in NLP history, establishing the pre-train then fine-tune paradigm.

**Citation Mining:**
- Transformer [Vaswani et al., 2017] — baseline architecture
- ELMo [Peters et al., 2018] — contemporary feature-based approach
- ULMFiT [Howard & Ruder, 2018] — concurrent pre-training approach
- BooksCorpus [Zhu et al., 2015] — pre-training data
- GLUE [Wang et al., 2018] — multi-task benchmark

**L1 Ecology Observations:**
- GPT's decoder-only architecture became the dominant paradigm for LLMs (GPT-2/3/4, LLaMA)
- Generative pre-training + fine-tuning paradigm directly inherited by vision-language models
- Transformer decoder with masked self-attention is the standard for autoregressive generation
- Task-specific input formatting (traversal-style) influenced prompt engineering concepts
- The importance of contiguous long-range text for pre-training applies to remote sensing temporal sequences

## [2026-05-02] Re-review — Fresh Eyes with Seven Years of Hindsight

**Score re-confirmed: 5/5 — Foundational**

### Technical Details Worth Noting (Missed or Underappreciated)

**Architecture specifics (still impressive at 117M parameters):**
- 12-layer decoder-only Transformer, 768-dim states, 12 attention heads, 3072-dim FFN inner states
- Adam optimizer, max LR 2.5e-4, cosine schedule, 100 epochs, minibatches of 64 × 512 tokens
- BPE vocabulary with 40,000 merges (Byte-Pair Encoding from Sennrich et al., 2015)
- GELU activation (Hendrycks & Gimpel, 2016) — adopted from the then-new activation function
- Learned position embeddings (not sinusoidal), dropout 0.1, modified AdamW L2 regularization (w=0.01)
- ftfy cleanup + spaCy tokenizer for text preprocessing

**BooksCorpus:** 7,000 unpublished books across Adventure, Fantasy, Romance. Crucial property: **contiguous long-range text** (vs 1B Word Benchmark which shuffles sentences). Language model perplexity: 18.4 on this corpus.

### Ablation Studies — Still the Gold Standard

The ablation table (Table 5) reveals critical insights often overlooked:

| Variant | Avg Score | Delta | Key Insight |
|---------|-----------|-------|-------------|
| Full (Transformer + pre-train + aux LM) | 74.7 | — | Complete system |
| w/o pre-training | 59.9 | **−14.8%** | Pre-training is irreplaceable |
| w/o aux LM | 75.0 | +0.3 | Aux LM helps large datasets, hurts small ones |
| LSTM instead of Transformer | 69.1 | −5.6 | Transformer's attention memory > LSTM's recurrence |

Key observations:
1. **LSTM variant still outperforms no-pre-training** (69.1 vs 59.9), confirming semi-supervised value even with weaker architectures
2. **Transformer w/o aux LM (75.0) > Transformer w/ aux LM (74.7)** — the aux LM objective actually *hurts* on small datasets (CoLA: 47.9 vs 45.4, SST-2: 92.0 vs 91.3) but helps on large ones (MNLI: 81.1 vs 81.8)
3. **Layer transfer analysis:** Each additional layer provides up to 9% improvement on MultiNLI — proving every layer learns transferable functionality

### Zero-Shot Behaviors — The Most Underappreciated Experiment

The paper's zero-shot analysis (Section 5) is remarkably prescient:
- **CoLA (linguistic acceptability):** Average token log-probability thresholding — **45.4 Matthew's correlation** without any supervised CoLA training
- **SST-2 (sentiment):** Append "very" and compare P(positive) vs P(negative) from LM output
- **RACE (QA):** Select answer with highest avg token log-probability conditioned on document+question
- **DPRD (Winograd):** Replace pronoun → compare P(rest of sequence)

The zero-shot performance steadily improves throughout pre-training (Figure 2 right), demonstrating that **generative pre-training inherently learns task-relevant functionality** — this directly foreshadows GPT-3's in-context learning discovery 2 years later.

### Historical Significance — Recontextualized

Reading this paper in 2026 with the full GPT family and Emu3 in view:

1. **Decoder-only choice was pivotal.** BERT (2019) outperformed GPT-1 on GLUE with bidirectional encoding, but the decoder-only architecture scaled better (GPT-2/3/4, LLaMA). GPT-1's choice of decoder-only over encoder-decoder or encoder-only was the correct bet for scaling.

2. **"Generative pre-training + discriminative fine-tuning" → "next-token prediction".** Emu3 (2026, Nature) directly extends this paradigm to all modalities — images, video, audio all tokenized and predicted autoregressively. GPT-1's core insight that "any task can be formulated as next-token prediction" is now the dominant paradigm in multimodal AI.

3. **Task-specific input transformations → prompt engineering.** The traversal-style input formatting (concatenating document+question+answer with delimiters) directly prefigures modern prompt engineering. This was the first demonstration that a single frozen model could handle diverse tasks through input formatting alone.

4. **The BooksCorpus choice mattered.** The paper explicitly notes that 1B Word Benchmark shuffles sentences while BooksCorpus preserves contiguous text. This insight — that **long-range coherence is essential for language understanding** — directly influenced the data curation strategies of all subsequent LLMs.

### Citation Mining — Additions

**References worth reading (not already in wiki):**
- **Direct lineage:** Howard & Ruder, 2018 — ULMFiT (Universal Language Model Fine-tuning, ACL 2018). Concurrent approach using LSTMs for text classification fine-tuning. GPT-1's direct contemporary and closest methodological relative.
- **Paradigm basis:** Peters et al., 2018 — ELMo (Deep Contextualized Word Representations, NAACL 2018). Feature-based pre-training approach, the other major pre-2019 NLP paradigm alongside GPT-1.
- **Design space:** Hendrycks & Gimpel, 2016 — GELU activation function. Minor but foundational architectural component.
- **Design space:** Sennrich et al., 2015 — BPE for NMT. Tokenization method used by GPT-1.

### Cross-Wiki Connections

- [[transformer-based]] — L2 lineage page correctly lists GPT-1 with score 5; consider adding the ablation study results to illustrate why Transformer > LSTM
- [[pretraining-paradigm]] — L3 page focuses on RS pre-training but should note GPT-1 as the origin of the generative pre-train → fine-tune paradigm in NLP
- [[learning-transferable-visual-models-from-natural-language-supervision]] — CLIP directly inherits the pre-train → fine-tune paradigm from GPT-1
- [[visual-instruction-tuning]] — LLaVA's instruction tuning paradigm is a direct descendant of GPT-1's supervised fine-tuning
- [[emu3-next-token-prediction]] — Emu3's next-token prediction for all modalities is the ultimate extension of GPT-1's core insight

## [2026-05-26] SciJudge Re-Read

**Score:**
- Contribution: 5/5 — Established the generative pre-training + discriminative fine-tuning paradigm that became the blueprint for all modern LLMs. The paper's core insight — that unsupervised language modeling on diverse, contiguous text produces transferable representations — directly launched the GPT family and inspired BERT. Nine of 12 tasks achieved SOTA with a single 117M-parameter model.
- Soundness: 5/5 — Rigorous experimental design with four complementary evaluation categories (NLI, QA, similarity, classification), comprehensive ablation studies (Table 5: 4 variants × 8 tasks with statistical deltas), zero-shot analysis across 4 distinct task formats, and transparent reporting of failures (RTE: 56% vs 61.7% SOTA). The ablation of pre-training (14.8% drop) and architecture (Transformer vs LSTM: 5.6 point gap) cleanly isolates each component's contribution.
- Relevance: 5/5 — This paper remains the foundational reference for understanding why decoder-only Transformers with autoregressive pre-training work. Every contemporary LLM (GPT-4o, LLaMA-3, DeepSeek-V3, Qwen) inherits GPT-1's two-stage framework. The zero-shot probing methodology directly prefigures GPT-3's in-context learning discovery.

**Key Insights:**

1. **The framework's simplicity is its deepest contribution.** Section 3 defines just three equations: L₁ (language modeling, Eq. 1), L₂ (supervised fine-tuning, Eq. 4), and L₃ = L₂ + λL₁ (Eq. 5 with λ=0.5). The only new parameters during fine-tuning are W_y (linear output layer) and delimiter token embeddings (Section 3.3, para 1: "the only extra parameters we require during fine-tuning are W_y, and embeddings for delimiter tokens"). This minimal-adaptation design directly enabled scaling — no task-specific architectural surgery needed. Contrast with ELMo (Peters et al., 2018) which required freezing embeddings and training task-specific BiLSTM+CRF towers on top.

2. **The input transformation strategy solved an implicit tokenization bottleneck.** For similarity tasks, GPT-1 processes both sentence orderings independently then element-wise adds the [CLS] representations — "we modify the input sequence to contain both possible sentence orderings ... and process each independently to produce two sequence representations h_l^m which are added element-wise" (Section 3.3, para 3). For QA, it concatenates document+question+each answer separately with delimiters and softmax-normalizes across candidates. This traversal-style approach (citing Rocktäschel et al., 2015) meant a single pretrained model could handle classification, NLI, QA, and similarity without any architectural modifications — a direct precursor to modern prompt engineering.

3. **The RTE results reveal a critical small-data failure mode the paper honestly reports.** On RTE (only 2,490 training examples), GPT-1 scores 56% versus the multi-task BiLSTM+Attn baseline's 61.7% (Table 2). The paper's own analysis: "Given the strong performance of our approach on larger NLI datasets, it is likely our model will benefit from multi-task training as well but we have not explored this currently" (Section 4.2, para 3). This is the first documented evidence that generative pre-training alone is insufficient for very small downstream datasets — a limitation that persisted through GPT-2 and was only partially addressed by instruction tuning in GPT-3.5/InstructGPT.

4. **The BooksCorpus vs. 1B Word Benchmark comparison is a foundational data curation insight.** Section 4.1 explicitly contrasts: "An alternative dataset, the 1B Word Benchmark ... is approximately the same size but is shuffled at a sentence level — destroying long-range structure." This single sentence encodes the insight that data quality (contiguity, narrative coherence) matters more than data quantity for learning transferable linguistic representations. The resulting perplexity of 18.4 on BooksCorpus becomes the quality baseline. This principle directly influenced the curation of C4 (Raffel et al., 2020), The Pile (Gao et al., 2020), and Dolma (Soldaini et al., 2024).

5. **The optimization recipe was remarkably prescient.** The training setup (Section 4.1) includes: linear warmup over 2000 steps → cosine annealing to zero; Adam with max LR 2.5e-4; modified L2 regularization from Loshchilov & Hutter (2017) with w=0.01 on non-bias/gain weights (effectively AdamW before the name existed); GELU activation (Hendrycks & Gimpel, 2016) which later became the standard for GPT-2/3, BERT, and virtually all subsequent Transformers; learned position embeddings (not sinusoidal); dropout 0.1 on residuals, embeddings, and attention. Every one of these choices became canonical in the Transformer LM training pipeline.

**Compared to L2 Lineage** (Transformer-based models):
- GPT-1 is the **origin point** of the decoder-only Transformer LM lineage. While Vaswani et al. (2017) introduced the Transformer for machine translation (encoder-decoder), GPT-1 was the first to demonstrate that a **decoder-only** Transformer pre-trained on language modeling could transfer to diverse NLU tasks. This architectural choice — discarding the encoder entirely — was initially controversial (BERT's encoder-only approach achieved higher GLUE scores in 2019), but proved decisive for scaling: every major LLM since GPT-2 (GPT-3/4, LLaMA, Mistral, DeepSeek, Qwen) uses decoder-only with causal masking.
- Compared to concurrent pre-training paradigms: ULMFiT (Howard & Ruder, ACL 2018) used LSTMs with the same pre-train→fine-tune strategy but achieved narrower gains (text classification only). ELMo (Peters et al., NAACL 2018) used biLSTMs with feature-based transfer. GPT-1 unified both advances — the pre-train→fine-tune approach of ULMFiT with the Transformer architecture — and generalized to 12 tasks spanning 4 categories, establishing that **generative pre-training + Transformer > either innovation alone**.
- BERT (Devlin et al., NAACL 2019) directly responded to GPT-1 by introducing masked language modeling (bidirectional) and outperforming GPT-1 on GLUE (82.1→86.7 average). However, BERT's encoder-only architecture proved less scalable for generation tasks, and the decoder-only paradigm ultimately won the scaling race.

**Notes:**
- **Venue:** OpenAI Technical Report (not peer-reviewed, no conference venue). This was a deliberate choice — OpenAI published it as a technical report on their website, bypassing the traditional conference review cycle. This set a precedent for GPT-2 (2019) and GPT-3 (2020) being published outside traditional venues.
- **Compute:** No explicit FLOPs reported. The model has 117M parameters, trained for 100 epochs on BooksCorpus (~7,000 books, ~1B tokens after BPE). With batch size 64×512=32,768 tokens and 100 epochs, estimated ~3.3B tokens processed. Modern estimates: ~2-5 petaFLOP/s-days on a single 8-GPU machine (V100 era).
- **Code availability:** No publicly released code or weights. The paper only describes the architectural details. This is in stark contrast to BERT (released as open-source with pre-trained weights) and contributed to BERT's faster adoption despite being published a year later.
- **Discrepancies with original review:** The original review's "weaknesses" section lists "Only 12 layers, 117M parameters — small by today's measures" and "Limited exploration of scaling behavior." These are anachronistic judgments: in 2018, 117M parameters was large (ELMo had ~94M across two BiLSTM directions; Transformer base had 65M). The paper couldn't explore scaling because the necessary hardware (e.g., 10,000 A100s for GPT-3) didn't exist. These are not weaknesses of the paper but observations from hindsight.

**Citation Mining (8 papers):**

- **直接谱系:** Dai & Le, 2015 — "Semi-supervised Sequence Learning" (NIPS 2015). The direct methodological ancestor: pre-train an LSTM language model, then fine-tune with a linear classifier on top. GPT-1 replaces the LSTM with a Transformer and expands from text classification to 12 NLU tasks. The paper explicitly cites this as "the closest line of work to ours" (Section 2, para 3).

- **直接谱系:** Howard & Ruder, 2018 — "Universal Language Model Fine-tuning (ULMFiT)" (ACL 2018). Concurrent work (same year) using LSTM + pre-train/fine-tune for text classification. GPT-1 generalizes beyond classification to QA, NLI, similarity, and replaces LSTM with Transformer. The paper acknowledges this as a contemporary approach "restricted" by LSTM's limited prediction range (Section 2, para 3).

- **范式基础:** Vaswani et al., 2017 — "Attention Is All You Need" (NIPS 2017). The Transformer architecture that GPT-1 adapts. Key modifications: decoder-only with masked self-attention (removing encoder-decoder cross-attention), learned position embeddings (vs sinusoidal), GELU activation (vs ReLU). This architectural adaptation became the standard for all subsequent autoregressive LMs.

- **范式基础:** Zhu et al., 2015 — "Aligning Books and Movies" (ICCV 2015). The BooksCorpus dataset: 7,000+ unpublished books. GPT-1's choice of this dataset over 1B Word Benchmark was pivotal because BooksCorpus preserves "long stretches of contiguous text" — enabling the model to learn long-range dependencies essential for transfer (Section 4.1).

- **关键对手:** Peters et al., 2018 — "Deep Contextualized Word Representations (ELMo)" (NAACL 2018). The dominant pre-2019 NLP paradigm. ELMo trains a biLSTM language model and uses hidden states as frozen features for task-specific models. GPT-1 outperforms ELMo by 5-10% on most tasks (Table 2: GPT-1 88.1 QNLI vs ELMo not listed; Table 4: GPT-1 45.4 CoLA vs ELMo+BiLSTM 35.0). The key difference: feature-based (ELMo) vs fine-tuning (GPT-1).

- **关键对手:** Devlin et al., 2019 — "BERT: Pre-training of Deep Bidirectional Transformers" (NAACL 2019). The direct successor and competitor. BERT adopted GPT-1's pre-train→fine-tune framework but introduced masked language modeling (bidirectional context). BERT outperformed GPT-1 on GLUE (86.7 vs 72.8) by leveraging bidirectional context, but GPT-1's decoder-only choice proved more scalable for generation tasks.

- **设计空间对比:** Loshchilov & Hutter, 2017 — "Fixing Weight Decay Regularization in Adam" (ICLR 2019, arXiv 2017). GPT-1 uses their modified L2 regularization approach (w=0.01 on non-bias/gain weights). This is effectively AdamW before the named optimizer existed. GPT-1 was an early adopter of this regularization technique, which later became standard in all Transformer LM training.

- **设计空间对比:** Hendrycks & Gimpel, 2016 — "Gaussian Error Linear Units (GELU)" (arXiv 2016). GPT-1 was the first major NLP paper to use GELU activation, which later became the standard activation for BERT, GPT-2/3, and virtually all subsequent Transformers. The paper's choice of GELU over ReLU was forward-looking and ultimately canonical.

**原始 review 验证:**

- **Still holds:** The core assessment that GPT-1 is foundational (5/5) is robust and, if anything, strengthened by subsequent developments. The historical significance framing — that this paper launched the pre-train→fine-tune paradigm — remains the dominant narrative.
- **Needs updating — Weakness framing:** The original review lists "Only 12 layers, 117M parameters — small by today's measures" and "Limited exploration of scaling behavior" as weaknesses. These are historically situated limitations, not paper weaknesses. In 2018, GPT-1 was one of the largest models trained, and scaling studies were computationally prohibitive. A more accurate framing: the paper established the paradigm that *would* enable scaling studies (Kaplan et al., 2020; Hoffmann et al., 2022) once hardware caught up.
- **Needs updating — "Task-specific input format engineering required":** This weakness is better reframed as an insight. The traversal-style transformations (Section 3.3) were the first demonstration that diverse tasks could be handled through input formatting alone — directly prefiguring prompt engineering, instruction tuning, and in-context learning. What the original review sees as "engineering" is actually the origin of a major research direction.
- **Needs updating — Zero-shot section:** The original re-review correctly identifies zero-shot probing as underappreciated but doesn't note the **specific heuristic for SST-2**: "append the token 'very' to each example and restrict the language model's output distribution to only the words 'positive' and 'negative'" (Section 5, para 2). This is arguably the first documented instance of **prompt-based few-shot classification** — a technique that would be formalized in PET (Schick & Schütze, 2020) and GPT-3's in-context learning (Brown et al., 2020).
- **Still valid — Ablation analysis:** The ablation study remains the gold standard. The observation that "aux LM helps large datasets, hurts small ones" is confirmed by subsequent work on multi-task learning and auxiliary objectives.

**Cross-Review Diff (vs previous reviews):**

1. **Mathematical framework depth:** The previous review focuses on architectural parameters and dataset details. This re-read emphasizes the **three-equation framework** (L₁, L₂, L₃ with λ=0.5) and the **minimal parameter expansion** (only W_y and delimiter embeddings). This formal clarity — that the entire paradigm reduces to combining a language modeling loss with a classification loss via a single hyperparameter — is arguably the paper's deepest conceptual contribution, and previous reviews underplayed it.

2. **Failure case analysis:** Previous reviews focus exclusively on GPT-1's successes (9/12 SOTA). This re-read examines the **RTE failure case** (56% vs 61.7%) in detail — the only dataset where GPT-1 significantly underperformed a non-Transformer baseline. This failure reveals a fundamental limitation (insufficient pre-training signal for very small datasets) that persisted through GPT-2 and was only addressed by instruction tuning. The paper's honest reporting of this failure is itself notable.

3. **Data strategy nuance:** Previous reviews note BooksCorpus as the pre-training data but don't fully articulate the **BooksCorpus vs 1B Word Benchmark design decision**. This re-read identifies the explicit sentence-level shuffling critique (Section 4.1) as one of the paper's most influential data curation principles — directly influencing C4, The Pile, and Dolma corpus construction.

4. **Optimization recipe analysis:** Previous reviews list hyperparameters but don't trace their lineage. This re-read connects GPT-1's specific choices (GELU, AdamW-style regularization from Loshchilov & Hutter, learned position embeddings, linear warmup + cosine decay) to their canonical status in modern LLM training. The recognition that GPT-1's training recipe was remarkably stable and became the default for all subsequent models is a new observation.

5. **Historical recontextualization of "weaknesses":** Previous reviews list "small by modern standards" as a weakness. This re-read reframes this as an anachronistic judgment — in 2018, 117M parameters was state-of-the-art scale, and the paper's paradigm was precisely what enabled subsequent scaling. The code/weight non-release is also newly noted as a strategic choice that contrasts with BERT's open-source strategy and affected adoption trajectories.

## [2026-05-28] Re-review — Cross-Wiki Connection to RS Pretraining Paradigm

**核心发现：GPT-1 的"连续文本"数据原则对遥感预训练的平行启示**

### GPT-1 与遥感预训练范式的结构平行

在阅读 [[../L3_module/pretraining-paradigm]] 后，我发现了 GPT-1 与遥感预训练之间一条被忽视的深层平行：

| 维度 | GPT-1 (NLP) | 遥感预训练 | 平行洞察 |
|------|-------------|-----------|---------|
| 数据连续性 | BooksCorpus: 连续长文本 > 打乱句子 | 时序遥感: 连续时序场景 > 随机快照 | 连续性保留长程依赖结构 |
| 预训练目标 | 下一个词预测 (L1) | MIM/对比学习 | 自监督生成式目标最通用 |
| 微调策略 | 最小参数修改 (仅 Wy + delimiter emb) | 线性探测/全量微调 | 通用表示 + 轻量适配 |
| 数据质量 | Perplexity 18.4 as quality indicator | 地理分布/季节覆盖/光谱完整性 | 域内数据质量 > 放缩规模 |
| 失败模式 | RTE (2.5k 样本): 56% vs 61.7% | RS 小样本域迁移: PANGAEA 47-65% 性能崩溃 | 小数据下预训练信号不足是普遍问题 |

### "连续数据"原则在遥感的平行

GPT-1 论文中最被低估的洞察是 BooksCorpus vs 1B Word Benchmark 的对比。这一原则——**数据连续性比数据规模更重要**——在遥感中有一个惊人的平行：

- **NLP 版**: BooksCorpus 保留叙事连续性 -> 模型学习长程依赖 -> 更好的转移
- **RS 版**: 时序遥感保留季节连续性 (SeaMo 的渐进式 MIM) / 空间连续性 (SatMAE 的独立 masking) -> 模型学习时空结构 -> 更好的迁移

SeaMo (2025) 的 Phase 1 空间 MIM -> Phase 2 时序融合 MIM 设计，实质上是在遥感中"发现"了 GPT-1 的连续性原则——模型需要先理解"上下文"（空间邻域），再理解"时序叙事"（季节变化）。这与 GPT-1 在连续文本上训练 LM 的逻辑是同构的。

### GPT-1 的零样本探测 -> RS VLM 提示工程

GPT-1 的零样本实验（Section 5）是最早的提示工程案例：
- SST-2: 追加 "very" 并比较 "positive"/"negative" 概率
- CoLA: 平均 token log-概率阈值化
- RACE: 条件概率选择答案

这些启发式方法在 2026 年的 RS-VLM（如 SkySense++, RemoteCLIP, RS-MoE）中找到了回响。例如 RS-MoE 的 Instruction Router 将 Caption 分解为子任务进行路由，本质上是一种更结构化的提示工程——起源于 GPT-1 的 traversal-style 输入变换。

### 引文建议

被引用应被添加到 [[../L3_module/pretraining-paradigm.md]]:
- GPT-1 应被列为 NLP 侧"生成式预训练"范式的起源点，与遥感 MIM 范式并列
- "连续数据"原则应被添加到数据策略讨论中（Section 3）

被引用应被添加到 [[../L2_lineage/nlp/language-modeling/transformer-based.md]]:
- 当前 L2 页面缺少 GPT-1 的零样本实验描述——这是 GPT-3 in-context learning 的直接前驱，应补充

### 新引用论文（to-read.md）

- **Dai and Le, 2015** — "Semi-supervised Sequence Learning" (NIPS 2015). GPT-1 的直接方法论前身：LSTM 语言模型预训练 + 线性分类器微调。已在之前的 citation mining 中提到，但值得全文阅读以理解"从 LSTM 到 Transformer"的跃迁。
