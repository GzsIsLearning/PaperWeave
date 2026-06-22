# Papereader — Web Reader

## What It Is

**👤 For Human**

Papereader is the Web reading frontend for the Paperweave knowledge base, providing full-text paper browsing, translation, Agent discussion, annotation highlighting, and more.

![Papereader Preview](../assets/reader-preview.png)

## How to Start

**👤 For Human**

```bash
cd papereader

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env to fill in your API Key and paths

# Start the server
python server.py --port 8899
```

After launching, visit http://localhost:8899 to use it.

You can also use the wrapper script:

```bash
bash start.sh
```

## API Endpoints

**🤖 For Agent**

| Method | Path | Description |
|------|------|------|
| GET | `/api/papers?search=` | List all papers, supports search |
| GET | `/api/paper/{slug}` | Get full paper text and metadata |
| GET | `/api/paper/{slug}/image/{filename}` | Get paper images (extracted by MinerU) |
| POST | `/api/translate` | Translate selected text (English → academic Chinese) |
| POST | `/api/chat` | Agent discussion with paper context and knowledge base |
| POST | `/api/chat/stream` | SSE streaming Agent conversation |
| POST | `/api/highlight` | Save highlight annotation to paper |
| DELETE | `/api/highlight/{slug}` | Delete highlight annotation |
| GET | `/api/sessions` | Get chat session list |
| POST | `/api/sessions` | Save chat session |
| GET | `/api/stars` | Get starred papers list |
| POST | `/api/stars` | Save starred papers list |
| GET | `/api/stats` | Knowledge base statistics |
| GET | `/` | Web Reader homepage |

## Configuration

**🤖 For Agent**

All configuration via `.env` file (reference `.env.example`):

| Variable | Description | Default |
|------|------|--------|
| `PAPERWEAVE_ROOT` | Project root directory path | Auto-detected |
| `DEEPSEEK_API_KEY` | LLM API key | — |
| `DEEPSEEK_BASE_URL` | LLM API base URL | `https://api.deepseek.com` |
| `LLM_MODEL` | Model to use | `deepseek-chat` |
| `LLM_TEMPERATURE` | Generation temperature | `0.3` |
| `AGENT_CMD` | Agent command (e.g. `hermes`) | — |
| `AGENT_TIMEOUT` | Agent timeout in seconds | `120` |
| `PAPERWEAVE_PORT` | Server port | `8899` |
| `PAPERWEAVE_AUTH_TOKEN` | API auth token | Auth disabled |

## Links

**🤖👤 For Both**

For detailed usage guides and configuration instructions, see the [docs/ directory](../docs/), especially:
- [docs/GUIDE.md](../docs/GUIDE.md) — User guide
- [docs/SPEC.md](../docs/SPEC.md) — Complete specification
