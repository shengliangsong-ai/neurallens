# Neural Prism: Model & API Documentation

This document outlines the artificial intelligence models integrated into the Neural Prism platform, providing a comparative analysis of their capabilities to help you choose the right engine for your workload.

## Centralized Model Architecture

Neural Prism leverages a dual-engine architecture, utilizing both Google's Gemini family and Anthropic's Claude family to power different aspects of the platform.

### Model Comparison Matrix

| Feature / Trait | Gemini 3.1 & 3.0 Flash | Gemini 3.1 Pro | Claude 3.7 Sonnet (Sandbox) |
| :--- | :--- | :--- | :--- |
| **Primary Use Case** | Speed, High-volume processing, Real-time TTS | Deep reasoning, Complex Code Generation | Conversational intelligence, Nuanced writing |
| **Speed / Latency** | Lightning Fast (Optimal for real-time) | Moderate (Heavier reasoning budget) | Moderate / Fast |
| **Context Window** | Up to 1M tokens | Up to 2M tokens | 200K tokens |
| **Multimodality** | Native Audio, Vision, Text, Video | Native Audio, Vision, Text, Video | Vision & Text |
| **Speed-to-Voice (TTS)**| Excellent (Native Live API integration) | Good (but slower than Flash) | N/A (Text-based in Sandbox) |
| **Ideal For** | Live transcription, Quick data parsing | System architecture, Complex logic checks | Brainstorming, Refactoring text, Sandbox chats |

---

## Google Gemini Integration

Neural Prism heavily utilizes the `@google/genai` SDK to power its core features.

### Gemini Flash Spotlight
**Gemini Flash** is the workhorse of the Neural Prism platform. It is explicitly optimized for tasks where latency is the most critical factor.

**Key Flash Features utilized in our platform:**
1. **Unrivaled Speed-to-Voice:** Because of Flash's native multimodal capabilities and highly optimized architecture, it powers our real-time Text-to-Speech (TTS) and Live API integrations (e.g., Scribe Studio, Live Interactions) with near-instantaneous audio generation. 
2. **High-Throughput Parsing:** Used for rapid data extraction, such as parsing raw text into structured JSON (e.g., Address parsing in the Shipping Label App, Resume parsing).
3. **Cost-Efficient Context Handling:** Allows Neural Prism to process massive documents (like full books in Book Studio or entire codebases in Code Studio) rapidly without hitting extreme latency bottlenecks.

### Gemini Pro Spotlight
Used selectively when deep heuristic reasoning and complex problem-solving outweigh the need for split-second responses (e.g., advanced math refraction in Graph Studio, or Senior Code Partner duties in Code Studio).

---

## Anthropic Claude Integration (AI Sandbox)

The **Claude 3.7 Sonnet** model is available via the isolated Claude Sandbox environment.

**Why Claude?**
While Gemini powers the automated and multimodal aspects of the platform, the Claude Sandbox gives users access to Anthropic's latest 3.7 Sonnet model. It is highly regarded for:
- **Nuanced Conversational Tone:** Excellent for brainstorming, long-form creative writing, and human-like dialogue.
- **Strict Adherence:** Strong adherence to complex formatting constraints and system prompts within a text-only chat interface.
- **Isolated Sandbox:** Operates in a clean, state-free chat environment, allowing users to test prompts or explore ideas without affecting the main Neural Prism workspace.

## Authentication & Secuity

All API models require user-provided API keys (Bring-Your-Own-Key model):
- keys are stored safely within the browser's `localStorage`.
- they are **never** transmitted to a central database or shared telemetry server.
- The system automatically detects missing keys and natively dispatches the `MISSING_API_KEY` global event to prompt the user.
