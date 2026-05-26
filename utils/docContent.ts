
import { CommunityDiscussion } from '../types';

export const APP_COMPARISON_DOC: CommunityDiscussion = {
  id: 'system-doc-001',
  lectureId: 'system-architecture',
  channelId: 'system',
  userId: 'system',
  userName: 'System Architect',
  transcript: [],
  createdAt: 1769308800000, 
  isManual: true,
  title: "Neural Prism: The Human-AI Interface Spec",
  designDoc: `
# Neural Prism: Architecture of Accessibility

**Revision:** 5.0.0 | **Author:** Lead Architect | **Date:** Jan 25, 2026

## 1. Philosophical Refraction
The Neural Prism Platform moves beyond the "Knowledge OS" model. Our core architecture acts as a **refractive lens** for AI Super-Intelligence. 

### The Input-Output Model:
- **Input:** High-dimensional, complex AI reasoning (Gemini 3 Pro).
- **Refraction:** Contextual adaptation and daily-activity mapping.
- **Output:** The "Rainbow Spectrum"—a user-friendly suite of 20+ specialized tools.

## 2. Spectrum Components
The platform manages a modular suite of tools designed for daily human life.

| Activity Category | Tools | Technology |
| :--- | :--- | :--- |
| **Daily Living** | Shipping Lab / Check Lab / Gift Workshop | Flash Image / PDF-Gen |
| **Professional** | Interview Prep / Talent Hub / Careers | Live Audio / Vision |
| **Logic & Dev** | Builder Studio / Research Lab / Visualizer | Neural Simulation |
| **Community** | Team Space / Communities / Mentorship | Real-time Ledger |

## 3. Human-Centric Logic (Simulation)
We prioritize **Heuristic Tracing** over traditional execution. This ensures that users can interact with logic in a "safe, conversational sandbox."

### Why Human-Centric Beats Real Runtimes:
1. **Explainability:** The system can explain *why* something happens in human terms.
2. **Speed:** Instant results without the "boot time" of real servers.
3. **Safety:** High-risk code is simulated, never truly executed on hardware.

## 4. Federated Contribution
Every member of the Neural Prism community is a "Prism Contributor." The platform supports an exponential growth model where members can:
- Define new activity types.
- Curate custom knowledge paths.
- Sign and verify transactions via the VoiceCoin Ledger.

## 5. Privacy & Sovereignty
Intelligence is Refracted, not Retained. 
- **Ephemeral Sessions:** Logic processing is stateless by default.
- **Personal Storage:** All created assets (PDFs, Code, Records) are funneled directly into the user's private Google Drive.

## 6. Stability Protocols
v5.0.0 maintains the "Resilient Dream Machine" standard:
- **Preemptive Rotation:** Continuous AI availability for long-running human activities.
- **Neural Snapshot Sync:** Mandatory code-in-prompt bundling for zero-latency visibility.
- **Multi-modal Grounding:** The AI sees the user's physical or digital context in real-time.

## 7. Vision Statement
The Neural Prism is the final bridge between superhuman AI capacity and daily human utility. We make complexity invisible and intelligence colorful.
`
};

export const STACK_STORY_DOC: CommunityDiscussion = {
  id: 'system-doc-stack-story',
  lectureId: 'stack-story',
  channelId: 'system',
  userId: 'system',
  userName: 'Lead Architect',
  transcript: [],
  createdAt: 1769308800000,
  isManual: true,
  title: "The Stack Story: Building the Prism",
  designDoc: `
# 🌈 The Stack Story: Building Neural Prism

## The Technical "Prism"
Building a platform that handles real-time voice, code simulation, and secure financial asset generation required a unique "Refractive" stack.

### Core Stack Components:
- **Frontend**: React 19 + Tailwind CSS for a high-performance, responsive refractive UI.
- **AI Brain**: Google Gemini 3.0 (Pro & Flash). We utilize Flash for low-latency simulation and Pro for complex reasoning.
- **Real-time Link**: WebSockets via the Gemini Live API for "Always-on" multimodal collaboration.
- **The Ledger**: Firebase Firestore managing a decentralized identity model (ECDSA P-256) and the VoiceCoin economy.
- **The Vault**: Google Drive API for user-sovereign data persistence.

## Engineering Challenges
1. **Ghosting in the VFS**: Solving the synchronization loop between AI code edits and Google Drive auto-saves.
2. **Deterministic Simulation**: Tuning Gemini 3 Flash to act as a reliable digital twin for C++ and Python runtimes.
3. **Audio Latency**: Implementing a local IndexedDB cache for neural audio fragments to achieve sub-100ms playback starts.

## The Goal
To prove that AI is best used not as a search engine, but as a **context-aware activity partner**.
`
};

export const BUILT_WITH_DOC: CommunityDiscussion = {
  id: 'system-doc-built-with',
  lectureId: 'built-with',
  channelId: 'system',
  userId: 'system',
  userName: 'System Architect',
  transcript: [],
  createdAt: 1769308800000,
  isManual: true,
  title: "Technical Manifest: Built With",
  designDoc: `
# 🛠️ Technical Manifest: The Neural Prism Stack

## 1. Frameworks & Languages
- **React 19**: Modern UI component architecture.
- **TypeScript**: Robust application logic.
- **Tailwind CSS**: Refractive, utility-first design.

## 2. Artificial Intelligence (Gemini 3.0)
- **Pro Model**: Complex reasoning and document synthesis.
- **Flash Model**: Heuristic logic simulation and rapid response.
- **Live API**: Multimodal WebSockets for real-time collaboration.
- **Image & TTS**: Generative art and emotive speech.

## 3. Infrastructure & Platforms
- **Firebase**: Secure authentication and community data plane.
- **Google Cloud Platform**: Drive, YouTube, and Gmail integration.
- **GitHub API**: Developer workflow synchronization.

## 4. Edge Computing
- **IndexedDB**: High-speed asset caching.
- **Web Crypto API**: ECDSA P-256 decentralized identity.
- **WebGL**: Hardware-accelerated math visualization (Plotly).

## 5. Specialized Libraries
- **Monaco Editor**: Professional IDE capabilities.
- **html2canvas / jsPDF**: High-fidelity document rendering.
- **JSZip**: Neural asset packaging.
- **KaTeX**: Mathematical typesetting.
`
};

export const MODEL_API_DOC: CommunityDiscussion = {
  id: 'system-doc-model-api',
  lectureId: 'model-api',
  channelId: 'system',
  userId: 'system',
  userName: 'System Architect',
  transcript: [],
  createdAt: 1769308800000,
  isManual: true,
  title: "Neural Prism: Model & API Documentation",
  designDoc: `
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

Neural Prism heavily utilizes the \`@google/genai\` SDK to power its core features.

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
- keys are stored safely within the browser's \`localStorage\`.
- they are **never** transmitted to a central database or shared telemetry server.
- The system automatically detects missing keys and natively dispatches the \`MISSING_API_KEY\` global event to prompt the user.
`
};

