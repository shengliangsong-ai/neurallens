
# 🏛️ Neural Lens: ARCHITECTURE_MANIFEST.md

**Protocol Version:** 1.2.0-N-FACTOR  
**Subject:** Sovereign Intelligence Verification & C2PA Integration  
**Authority:** Neural Prism Platform

---

## 🎯 I. Core Logic Path: The VPR Sequence

The **Verifiable Proof of Reasoning (VPR)** protocol follows a deterministic sequence to ensure technical truth.

1.  **Ingestion Node**: Source data (Code, PDF, Transcript) is hashed using SHA-256.
2.  **Decomposition Node**: Gemini 3 Pro extracts discrete "Logical Invariants" (Immutable Truths).
3.  **Mesh Synthesis**: Invariants are mapped to a high-dimensional Dependency Graph (Retina Mesh).
4.  **Adversarial Refraction**: A Shadow Agent launches targeted probes against the weakest edges of the mesh.
5.  **Signature Node**: The resulting graph and coherence score are signed using an on-device **ECDSA P-256** member key.

---

## 🔐 II. C2PA Schema: org.signetai.vpr

Integration for the Content Provenance and Authenticity (C2PA) standard.

```json
{
  "assertion": "org.signetai.vpr",
  "data": {
    "version": "1.2.0",
    "coherence_score": 98.5,
    "drift_risk": "low",
    "robustness": "high",
    "nodes": [
      { "id": "claim_01", "label": "Memory Safety Verified", "type": "verification" }
    ],
    "signature": {
      "alg": "ES256",
      "cert_id": "member_uuid_here",
      "value": "base64_signature_shard"
    },
    "timestamp": "2026-01-25T14:30:00Z"
  }
}
```

---

## ⚖️ III. Validation Rules: The Immutable Laws

A logic node is marked as **COMPROMISED** if any of the following laws are violated:

1.  **Law of Closure**: Every claim made in the summary MUST have a corresponding edge in the Dependency Graph pointing to evidence.
2.  **Law of No Cycles**: Technical reasoning must be a Directed Acyclic Graph (DAG). Any circular argument triggers a "Logic Drift" warning.
3.  **Law of Parity**: The hash of the verified artifact must match the hash stored in the signed VPR shard.

---

## 📂 IV. Project Map: File Directory

| File Path | Role in Refraction |
| :--- | :--- |
| `App.tsx` | Spectrum Orchestrator. Manages global state and diagnostic console. |
| `services/geminiLive.ts` | The Emotive Link. Low-latency WebSocket handler for Gemini 2.5. |
| `services/lectureGenerator.ts` | The Reasoning Engine. Orchestrates the Lead-Shadow audit loop. |
| `components/NeuralLens.tsx` | The Observability Plane. Visualizes logic meshes and VPR shards. |
| `components/IdentityLab.tsx` | Biometric Entrypoint. Handshakes ID documents with live faces. |
| `components/CodeStudio.tsx` | Heuristic Simulator. The Digital Twin terminal for code execution. |
| `utils/idUtils.ts` | Security Core. Handles generating secure UUIDs and atomic serialization. |
| `utils/manualContent.ts` | The Registry of Truth. Stores documentation for all app refractions. |

---

**Refraction complete.**
*Thanks for the Neural Prism Platform and the Google Gemini Model.*
