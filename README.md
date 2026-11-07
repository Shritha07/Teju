# Teju

### Your Personal AI Operating System

Teju is a personalized AI assistant built on the OpenJarvis Python framework, with a React and TypeScript interface. The project brings together a conversational UI, an OpenAI-compatible inference API, local model support through Ollama, and a separate voice-assistant prototype.

**React · TypeScript · Python · OpenJarvis · Ollama · Gemini · Whisper · XTTS**

---

## Overview

Teju is organized as three cooperating parts:

- **Teju UI** — a browser-based interface built with React, TypeScript, and Vite.
- **OpenJarvis core** — the Python foundation for inference engines, agents, memory, tools, security, and API services.
- **Teju Voice** — a separate Python voice prototype with speech recognition, Gemini response generation, and text-to-speech.

The current UI sends chat messages to an OpenAI-compatible endpoint at `/v1/chat/completions`, requesting the `qwen3:4b` model. The OpenJarvis codebase includes an Ollama inference engine that communicates with Ollama's local HTTP API.

> **Integration note:** The repository contains these components, but their end-to-end connection must be configured and tested in the local environment. In particular, the supplied Vite configuration does not currently define a development proxy for `/v1`; configure a proxy or serve the UI and API from a common origin before expecting browser chat requests to reach the Python API.

---

## Architecture

### High-level system architecture

```text
                           USER
                             |
                             v
                   +-------------------+
                   |     Teju UI       |
                   | React + TypeScript|
                   |      Vite         |
                   +-------------------+
                             |
                             | POST /v1/chat/completions
                             v
                   +-------------------+
                   | OpenJarvis API    |
                   | FastAPI            |
                   | OpenAI-compatible |
                   +-------------------+
                             |
                             v
                   +-------------------+
                   | Inference Engine  |
                   | Engine Registry   |
                   +-------------------+
                             |
                             v
                   +-------------------+
                   |   Ollama Engine   |
                   | HTTP API client   |
                   +-------------------+
                             |
                             v
                   +-------------------+
                   | Ollama Service    |
                   | localhost:11434   |
                   | qwen3:4b*         |
                   +-------------------+

        * The UI currently requests qwen3:4b.
          The model must be available in Ollama.
```

### Voice subsystem

```text
       MICROPHONE
            |
            v
    +------------------+
    | sounddevice      |
    | Audio recording  |
    +------------------+
            |
            v
    +------------------+
    | Faster-Whisper   |
    | Speech-to-text   |
    | base / CPU / int8|
    +------------------+
            |
            v
       TRANSCRIBED TEXT
            |
            v
    +------------------+
    | Gemini API       |
    | gemini-2.5-flash |
    | -lite            |
    +------------------+
            |
            v
       RESPONSE TEXT
            |
            v
    +------------------+
    | Coqui XTTS v2    |
    | Text-to-speech   |
    +------------------+
            |
            v
       PLAYBACK (afplay)
```

The voice prototype is separate from the browser chat path in the supplied source files. Its current response generator uses Gemini, while the browser chat service targets the OpenAI-compatible API endpoint.

---

## Core Components

| Component | Location | Responsibility |
|---|---|---|
| Teju identity | `src/openjarvis/teju/identity.py` | Name, aliases, creator, version, tagline, and description |
| React application | `teju-ui/src/App.tsx` | Main frontend application |
| Chat panel | `teju-ui/src/components/ChatPanel.tsx` | Chat interface |
| AI context | `teju-ui/src/context/AIContext.tsx` | Frontend AI-related context |
| Chat service | `teju-ui/src/services/ChatService.ts` | Builds the system prompt and conversation message list |
| AI service | `teju-ui/src/services/AIService.ts` | Sends requests to `/v1/chat/completions` |
| UI AI helpers | `teju-ui/src/lib/aiEngine.ts` | Local canned-response and token-streaming helpers |
| API application factory | `src/openjarvis/server/app.py` | Constructs the FastAPI application and attaches API services |
| Ollama engine | `src/openjarvis/engine/ollama.py` | Sends inference requests to the Ollama HTTP API |
| Agent framework | `src/openjarvis/agents/` | Agent implementations and orchestration |
| Memory framework | `src/openjarvis/memory/` | Memory storage, service, and extraction modules |
| Tools | `src/openjarvis/tools/` | Tool implementations for agent workflows |
| Voice chat loop | `teju-voice/teju_chat.py` | Standalone voice-assistant interaction loop |
| Speech recognition | `teju-voice/voice/stt.py` | Records audio and transcribes it with Faster-Whisper |
| Speech synthesis | `teju-voice/voice/tts.py` | Generates speech using XTTS v2 |
| Gemini client | `teju-voice/ai/gemini.py` | Sends voice-assistant prompts to Gemini |

---

## Chat Request Lifecycle

The current frontend chat path is implemented as follows:

```text
User enters a message
        |
        v
submitChat(text, messages)
        |
        v
Add Teju system prompt
        |
        v
askAI(messages)
        |
        v
POST /v1/chat/completions
        |
        | model: qwen3:4b
        | stream: false
        v
OpenAI-compatible API endpoint
        |
        v
Configured inference engine
        |
        v
Assistant message content
        |
        v
Display response in the UI
```

The frontend sends the conversation history along with the new user message. The system prompt currently describes Teju as a local AI assistant and asks it to use the supplied conversation history.

### API request shape

The frontend sends a JSON body with this structure:

```json
{
  "model": "qwen3:4b",
  "stream": false,
  "messages": [
    {
      "role": "system",
      "content": "You are Teju, an advanced local AI assistant..."
    },
    {
      "role": "user",
      "content": "Hello, Teju."
    }
  ]
}
```

The service reads the assistant response from:

```text
choices[0].message.content
```

---

## Inference and Local Models

The OpenJarvis repository includes an Ollama inference engine.

| Setting | Current implementation |
|---|---|
| Engine | `ollama` |
| Default Ollama host | `http://localhost:11434` |
| Host override | `OLLAMA_HOST` |
| UI-requested model | `qwen3:4b` |
| Default context window | `16384` tokens |
| Context override | `JARVIS_NUM_CTX` |
| Ollama endpoint | `/api/chat` |

The Ollama engine sends chat messages to Ollama's native `/api/chat` endpoint. It supports non-streaming generation, optional tool calls, and structured JSON output handling.

**Important:** Installing Ollama does not automatically download a model. The requested model must be pulled separately and the Ollama service must be running.

---

## Memory and Agent Framework

The OpenJarvis codebase contains reusable modules for:

- Agent execution and orchestration
- Memory storage, retrieval services, and extraction
- Tool registration and execution
- Skills and workflow management
- Sessions and conversation handling
- Security policies, guardrails, and audit utilities
- Connectors and external integrations

Relevant source directories:

```text
src/openjarvis/
├── agents/
├── connectors/
├── core/
├── engine/
├── memory/
├── operators/
├── security/
├── server/
├── sessions/
├── skills/
├── tools/
└── workflow/
```

These are framework capabilities available in the repository. Their availability does not mean every module is currently exposed through the Teju UI or enabled in a running deployment.

---

## Voice Pipeline

The separate `teju-voice` prototype contains the following implementation:

| Stage | Technology | Responsibility |
|---|---|---|
| Audio capture | `sounddevice` | Records microphone input |
| Audio file output | `scipy` | Writes the recording to WAV |
| Speech recognition | Faster-Whisper `base` | Converts audio into text |
| Response generation | Gemini `gemini-2.5-flash-lite` | Generates a text response |
| Speech synthesis | Coqui XTTS v2 | Converts response text into speech |
| Playback | macOS `afplay` | Plays the generated WAV file |

The current speech-recognition configuration uses CPU inference with `int8` compute. The TTS implementation expects a speaker reference recording at `voices/akka_reference.wav`.

The voice prototype requires its own Python dependencies, model downloads, API key, and reference audio file.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | User interface |
| Language | TypeScript | Frontend application logic |
| Frontend tooling | Vite 5 | Development server and build tooling |
| UI icons | Lucide React | Interface icons |
| Backend framework | Python / FastAPI | API application |
| AI framework | OpenJarvis | Inference, agents, memory, tools, and orchestration |
| Local inference | Ollama | Local model serving |
| Chat model requested by UI | `qwen3:4b` | Conversational inference target |
| Voice response model | Gemini 2.5 Flash Lite | Voice prototype response generation |
| Speech recognition | Faster-Whisper | Speech-to-text |
| Speech synthesis | Coqui XTTS v2 | Text-to-speech |
| HTTP client | HTTPX | Ollama API communication |

---

## Repository Structure

```text
Teju/
├── src/
│   └── openjarvis/
│       ├── agents/          # Agent execution and orchestration
│       ├── connectors/      # External data connectors
│       ├── core/            # Configuration, events, registry, types
│       ├── engine/          # Inference engines, including Ollama
│       ├── memory/          # Memory services and storage
│       ├── security/        # Security controls and guardrails
│       ├── server/          # FastAPI application and API routes
│       ├── speech/          # Speech-related framework modules
│       ├── tools/           # Agent tools
│       ├── workflow/        # Workflow engine
│       └── teju/
│           └── identity.py  # Teju identity configuration
│
├── teju-ui/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # React context
│   │   ├── hooks/           # UI hooks and voice commands
│   │   ├── lib/             # Frontend helpers
│   │   ├── services/        # Chat and AI API services
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── teju-voice/
│   ├── ai/                  # Gemini integration
│   ├── personality/         # Voice assistant personality files
│   ├── scripts/             # Voice-related scripts
│   ├── voice/               # STT and TTS
│   ├── memory_manager.py
│   └── teju_chat.py
│
├── configs/
├── docs/
├── scripts/
├── tests/
├── tools/
├── pyproject.toml
└── README.md
```

---

## Setup

### Prerequisites

- macOS, Linux, or Windows with a supported Python environment
- Python `>=3.10,<3.14`
- Node.js and npm
- Ollama, if using local Ollama inference
- A model available in Ollama (the current UI requests `qwen3:4b`)

### 1. Clone the repository

```bash
git clone https://github.com/Shritha07/Teju.git
cd Teju
```

### 2. Install frontend dependencies

```bash
cd teju-ui
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

Vite normally serves the development UI at:

```text
http://localhost:5173
```

### 4. Prepare local inference

Install Ollama from its official website, start the Ollama service, and pull the model requested by the UI:

```bash
ollama pull qwen3:4b
ollama list
```

The Ollama service normally listens at:

```text
http://localhost:11434
```

### 5. Configure the API connection

The frontend calls `/v1/chat/completions` using a relative URL. The supplied `vite.config.ts` does not define a proxy for this path.

Before using browser chat, configure one of the following:

- A Vite development proxy that forwards `/v1` requests to the running OpenJarvis API server; or
- A deployment where the frontend and API are served from the same origin.

The OpenJarvis FastAPI application is created through `create_app(engine, model, ...)` in `src/openjarvis/server/app.py`. The engine and model must be configured when the application is created.

> The exact backend launch command depends on the chosen OpenJarvis CLI/configuration and is intentionally not guessed here. Confirm the configured server command for your checkout before adding it to automated startup scripts.

---

## Running the Voice Prototype

The voice subsystem is separate from the React frontend.

It requires the dependencies used by the voice modules, a Gemini API key, the Faster-Whisper model, the XTTS v2 model, and a speaker reference recording.

Set the Gemini key in an environment file that is not committed:

```bash
GEMINI_API_KEY=your_gemini_api_key
```

The voice TTS implementation expects:

```text
voices/akka_reference.wav
```

The voice chat loop is located at:

```text
teju-voice/teju_chat.py
```

Run it only after installing the voice dependencies and confirming the required audio and reference files are available.

---

## Configuration

| Variable | Purpose | Default / behavior |
|---|---|---|
| `OLLAMA_HOST` | Ollama server address | `http://localhost:11434` |
| `JARVIS_NUM_CTX` | Ollama context window | `16384` |
| `GEMINI_API_KEY` | Gemini API authentication for voice prototype | Must be supplied |

Never commit API keys, private credentials, personal voice recordings, or local environment files.

---

## Engineering Decisions

**OpenAI-compatible frontend contract**

The UI uses a familiar chat-completions request format. This keeps the frontend interface decoupled from the underlying inference implementation.

**Separate inference engine**

The Ollama integration lives in the Python engine layer. The engine communicates with Ollama's native HTTP API rather than embedding model execution in the browser.

**Independent voice prototype**

Speech recognition, Gemini response generation, and speech synthesis are kept in a separate module rather than being presented as an already integrated browser voice service.

**Modular framework foundation**

OpenJarvis organizes agents, memory, tools, security, connectors, and workflows into separate packages. Teju can selectively integrate these capabilities as the application evolves.

---

## Current Implementation Notes

The following distinctions are important when evaluating the current repository:

| Area | What the inspected source confirms |
|---|---|
| Frontend development | Vite development script is defined |
| Browser chat request | Sends `POST /v1/chat/completions` |
| Chat model field | Requests `qwen3:4b` |
| Vite API proxy | Not present in the supplied Vite configuration |
| Ollama engine | Implemented in the OpenJarvis engine package |
| FastAPI server | Application factory is implemented |
| Voice STT | Faster-Whisper integration is present |
| Voice response | Gemini API integration is present |
| Voice TTS | XTTS v2 integration is present |
| Voice reference file | Expects `voices/akka_reference.wav` |
| Full end-to-end integration | Must be verified in the target environment |

---

## Security

Keep these local or sensitive items out of version control:

```text
.env
.venv/
node_modules/
__pycache__/
*.pyc
output/
voices/akka_reference.wav
```

Review the repository's `.gitignore` before committing. Do not add real API keys, tokens, credentials, or private voice recordings to GitHub.

---

## Roadmap

Potential next engineering steps:

- Configure and verify the frontend-to-FastAPI proxy.
- Verify the complete browser chat → API → Ollama → response path.
- Connect persistent memory to the user-facing conversation flow.
- Integrate voice input and output into the main Teju experience.
- Add automated integration tests for the complete request lifecycle.
- Document the exact backend startup and deployment configuration.

---

## Project Identity

**Name:** Teju  
**Version:** 1.0 (identity configuration)  
**Creator:** Shritha Mullapudi  
**Tagline:** Your Personal AI Operating System

---

## Design Contract

```text
USER INPUT
    |
    v
TEJU INTERFACE
    |
    v
CHAT API CONTRACT
    |
    v
OPENJARVIS SERVER
    |
    v
INFERENCE ENGINE
    |
    v
LOCAL MODEL RUNTIME
    |
    v
ASSISTANT RESPONSE
    |
    v
TEJU INTERFACE
```

Teju's design separates the user experience, API boundary, orchestration framework, and model runtime so that each layer can evolve independently.
