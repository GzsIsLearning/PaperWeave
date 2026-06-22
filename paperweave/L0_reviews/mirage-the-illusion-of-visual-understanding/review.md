---
slug: "mirage-the-illusion-of-visual-understanding"
title: "MIRAGE: The Illusion of Visual Understanding"
authors:
  - "Mohammad Asadi"
  - "Jack W. O'Sullivan"
  - "Fang Cao"
  - "Tahoura Nedaee"
  - "Kamyar Rajabalifardi"
  - "Fei-Fei Li"
  - "Ehsan Adeli"
  - "Euan Ashley"
year: 2026
venue: "arXiv preprint (cs.AI)"
tags: [multimodal, vlm, benchmark, evaluation]
score: 5
contribution: 5
soundness: 5
relevance: 5
open_source: true
code_url: "https://github.com/masadi-99/MIRAGE"
compute: "API-based eval (Azure OpenAI + Vertex AI); super-guesser: 1×DGX Spark Blackwell GPU, LoRA rank=8, 3 epochs"
dataset_access: public
---

> **Abstract:** Multimodal AI systems have achieved remarkable performance across a broad range of real-world tasks, yet the mechanisms underlying visual-language reasoning remain surprisingly poorly understood. We report three findings that challenge prevailing assumptions about how these systems process and integrate visual information. First, frontier models readily generate detailed image descriptions and elaborate reasoning traces, including pathology-biased clinical findings, for images never provided — we term this phenomenon *mirage reasoning*. Second, without any image input, models also attain strikingly high scores across general and medical multimodal benchmarks. In the most extreme case, our model achieved the top rank on a standard chest X-ray QA benchmark without access to any images. Third, when models were explicitly instructed to guess, performance declined markedly — explicit guessing engages a more conservative response regime vs the mirage regime. We introduce B-Clean for fair, vision-grounded evaluation.

## [2026-05-06] Full Review (full.md read)

**Score: 5/5** — Landmark. Changes how I think about VLM evaluation.
- **Contribution: 5/5** — Introduces an entirely new failure mode (mirage effect) distinct from hallucination; quantifies it systematically; provides a practical, reusable solution (B-Clean). The "mirage vs guess" divergence reveals two distinct operating regimes in VLMs that were previously conflated. The super-guesser (3B text-only beating all frontier VLMs on chest X-ray QA) is devastating evidence.
- **Soundness: 5/5** — Extremely rigorous. Phantom-0 (200 questions × 20 categories), 6 benchmarks × 4 models, multiple control conditions (baseline, visual-instruction, benchmark-name-known, mirage vs guess), 200-seed diagnosis distribution analysis, clean super-guesser experiment (Qwen-2.5 released before ReXVQA), principled B-Clean union strategy. LLM-judge protocol clearly described.
- **Relevance: 5/5** — Directly applicable to RS: (1) RS VLMs (GeoChat, RSGPT, LLaVA-Geo) will exhibit the same mirage effect — benchmark questions with textual context ("what crop type?" + NDVI/climate in prompt) leak answers; (2) Your multi-modal SAR/Optical fusion work — this paper shows models may silently ignore visual modalities when text alone suffices; (3) B-Clean is directly applicable to RS VQA benchmarks (RSVQA, BEN, GeoChat-Bench); (4) Mirage Score can serve as a diagnostic for any multi-modal RS system.

### Key Insights

1. **Mirage ≠ Hallucination.** Hallucination = ungrounded details *within* a valid epistemic frame (e.g., making up citations). Mirage = constructing a *false epistemic frame* — the model fabricates an entire perceptual narrative, including the image itself. The reasoning trace looks indistinguishable from genuine visual reasoning. This means you cannot detect mirage by inspecting reasoning quality alone.

2. **Mirage-mode > Guess-mode.** When models are told "the image is missing, take your best guess", accuracy DECLINES. But when images are silently removed and the model assumes they exist, accuracy is HIGHER. This implies VLMs have at least two distinct operating modes — mirage-mode accesses hidden patterns/structures that guess-mode's conservative strategy misses. This invalidates the common evaluation trick of "test without images to find text-only-answerable questions."

3. **Evaluation prompts INCREASE mirage rates.** Common multimodal evaluation instructions ("Base your statements on the visual evidence in the data") raise mirage rates to 90-100%. Similarly, mentioning "Number of image attachments: 1" in the prompt (as API interfaces do) disables guardrails and triggers mirage behavior. This means current evaluation practices are actively making the problem worse.

4. **Medical benchmarks most susceptible (60-99% mirage scores).** On average, models retain 70-80% of their fully image-enabled accuracy without any images. Medical benchmarks are the most vulnerable — likely because medical QA is statistics-dominated and models learn population-level priors from pretraining.

5. **B-Clean removes 75-77% of benchmark questions.** After union-removing all questions any of 3 models answered correctly without images, MicroVQA retained only 23%, MedXpertQA-MM 26%, MMMU-Pro 25%. On B-Clean benchmarks, model rankings changed for 2/3 models on 2/3 benchmarks.

6. **RS VLM implication — modality ignorance is a silent failure mode.** The paper's core finding (models achieving competitive accuracy without images) generalizes to any multimodal system. In your SAR/Optical fusion BioGFM, if a crop yield prediction can be made accurately from temporal patterns in the text/prompt alone, the model may learn to ignore the visual encoder entirely. This is not detectable by accuracy metrics — only by counterfactual modality ablation.

7. **The "super-guesser" shows text-only models can mimic visual reasoning.** A 3B-parameter Qwen-2.5 trained on question-answer pairs alone (no images) outperforms all frontier VLMs *and* human radiologists on a chest X-ray benchmark. This fundamentally questions whether VLM "reasoning traces" contain any genuine visual processing.

8. **Counterfactual verification is a proven mitigation (MARCUS paper).** The companion MARCUS paper [31] shows that systematically comparing image-present vs image-absent outputs at inference time can reduce composite mirage rate to zero while preserving accuracy. This is the architectural-level solution to complement B-Clean's evaluation-level solution.

### Code Review

**Repository:** github.com/masadi-99/MIRAGE (79 files, well-structured)

**Structure:**
```
mirage/         — Core library (config, models, datasets, evaluators, prompts, utils)
scripts/        — 3-stage pipeline: prepare_experiment → run_inference → evaluate_results
experiments/    — 6 paper experiments (exp1–exp6)
analysis/       — Analysis + figure generation scripts
data/phantom_0/ — Phantom-0 benchmark data (2 JSON files)
```

**Code quality: High**
- Clean Python package with setuptools, type hints, dataclasses
- Async evaluation with batching (MeasurementEvaluator with asyncio)
- Robust MCQ answer extraction (11 regex patterns with priority, handles [[A]], \boxed{}, natural language)
- Supports 3 cloud providers (Azure OpenAI, Vertex AI Gemini, Vertex AI Anthropic) with unified interface
- Scripts use 3-stage pipeline design (prepare → infer → evaluate), enabling reproducibility
- LoRA config well-documented for super-guesser (rank=8, α=16, LoRA+, SwiGLU, RoPE, FlashAttention-2)
- B-Clean is simple but principled: union of per-model compromised question sets

**Issues:**
- Requires Azure OpenAI key + GCP project for full reproduction (no standalone local inference)
- Phantom-0 is included (200 questions), but other datasets (MicroVQA, MedXpertQA-MM, MMMU-Pro, VQA-RAD) must be downloaded separately
- Results data not included — need to re-run experiments or contact authors
- Super-guesser requires LLaMA-Factory and DGX Spark GPU; not reproducible on this server without modification

**Reproducibility: Moderate** — Code is clean and well-documented, but full pipeline requires Azure + GCP credentials and external dataset downloads. The analysis scripts can run on any machine with pandas/matplotlib if result JSONs are available.

**Key implementation details for RS adaptation:**
1. Mirage Score computation is trivial: `(acc_no_image / acc_with_image) * 100` — can be dropped into any RS VLM eval pipeline
2. MCQComparator handles all common answer formats — directly reusable for RS VQA benchmarks
3. MeasurementEvaluator (LLM-judge for uncertainty/confidence/mirage detection) is model-agnostic — works with any OpenAI-compatible API
4. B-Clean logic is ~330 lines — straightforward to adapt for RS benchmarks
5. The evaluate_results.py (20K lines) is the most complex — handles response aggregation, MCQ grading, LLM-judge comparison

### Code-Driven Feasibility Reassessment

- **open_source: true** ✅ — Code is real, functional, well-organized
- **compute:** Super-guesser fine-tuning uses 1×DGX Spark (Blackwell GPU), LoRA rank=8, 3 epochs, effective batch=256. This is small-scale and could run on our 3090 machine if adapted from LLaMA-Factory. Main experiments are API-based (Azure/GCP), not training-based.
- **code_url:** Confirmed active — github.com/masadi-99/MIRAGE has full implementation

## [2026-05-06] GUIDE.md 重读新发现

### New Insights

9. **Benchmark 名字本身就是结构先验。** Fig.S3 实验：在 prompt 中加入 "You are answering questions from the MicroVQA dataset"（仅告知 benchmark 名称，无任何题目内容），模型在 mirage-mode 下的准确率显著提升。这说明模型已经学会了**数据集级别的结构模式**（答案分布、题型偏好、难度梯度），不仅是单道题的文本捷径。这对所有公开 benchmark 的评估意味着：即使你用 B-Clean 清除了文本捷径，模型仍可通过 "这是哪个数据集" 推断出结构性线索。

10. **API metadata 可 disable guardrails。** §S2 揭示：用户界面（ChatGPT Web）中的防 mirage 护栏（检测到没有图片时要求用户上传），在 API 调用里被 "Number of image attachments: 1" 这行元数据**直接绕过**。这意味着当前所有通过 API 的 benchmark 评估——包括本文自己的实验——都在系统性地触发 mirage 行为。这不是 prompt engineering 的 nuance，是 API 接口设计层面的漏洞：同一模型的 Web UI 和 API endpoint 对同一空输入的 mirage 率完全不同。

### Citation Mining (精选 4 篇)

按关系分类：

| 类别 | 论文 | 入库理由 |
|------|------|---------|
| 范式基础 | **"Making the V in VQA Matter"** (Goyal et al., CVPR 2017) — 提出 VQA benchmark 的文本偏见问题，首次识别"不看图也能答对"的题目类别。MIRAGE 的直接前驱。 | CVPR 2017，开创性工作，1000+ citations |
| 关键对手/参照 | **"Vision Language Models Are Blind"** (Rahmanzadehgervi et al., 2025) — 发现前沿 VLMs 在基本视觉任务上失败（数数、找重叠圆、判断线条交叉），同样是幻觉类评测。 | arXiv，与 MIRAGE 互补——一个测"不看图说瞎话"，一个测"看图也不理解"。Nguyen 组（Auburn），有代表性 |
| 设计空间对比 | **"Don't Just Assume; Look and Answer"** (Agrawal et al., CVPR 2018) — 提出 VQA-CP (Changing Priors)，改变训练/测试的答案分布使文本捷径失效。与 MIRAGE 的不同：VQA-CP 只能排除 overt priors，MIRAGE 发现 hidden patterns 更难检测。 | CVPR 2018，500+ citations，是理解"为什么之前的方法不充分"的必读 |
| 直接谱系 | **"Are We on the Right Way for Evaluating Large Vision-Language Models?"** (Chen et al., NeurIPS 2024) — 系统性分析 VLM 评测的 failure modes，包括数据泄漏、文本捷径、评估指标误导等。与 MIRAGE 同期、互补。 | NeurIPS 2024，与 MIRAGE 在评测方法论层面呼应 |
