# Simple Wik

A simple, sweet wiki solution that keeps your knowledge organized just like Simple Rick's life - uncomplicated and homey. Self-hosted with Markdown storage and RAG-ready for AI integration.

*"Sometimes science is more art than science. A lot of people don't get that. But your wiki? That should be simple."*

## Features

- 📝 Visual Markdown editor with live preview (as simple as Sunday morning)
- 📁 Hierarchical page organization with folder structure  
- 🌙 Dark mode toggle for cozy evening browsing
- 🏷️ Page tagging system for easy organization
- 🗑️ Page deletion with gentle confirmations
- ⚙️ File properties editor for renaming and organizing
- 🔐 Simple single-user authentication (no database required)
- 🐳 Docker container with GHCR hosting
- 💾 Markdown files stored on disk for easy RAG integration
- ⚙️ Configurable timezone, port, and storage location
- 🎨 Clean, warm interface inspired by simple living
- 🔍 Enhanced search across all pages, content, and tags

## Quick Start

### Using Docker Compose (Recommended)

1. Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  wiki:
    image: ghcr.io/loryanstrant/wiki-ai:latest
    container_name: wiki-ai
    ports:
      - "3000:3000"  # Change left port to your preference
    environment:
      - TZ=America/New_York  # Set your timezone
      - WIKI_PORT=3000
      - WIKI_USERNAME=admin  # Set your username
      - WIKI_PASSWORD=changeme  # IMPORTANT: Change this!
      - JWT_SECRET=your-secret-key  # IMPORTANT: Change this!
      - NODE_ENV=production
    volumes:
      - ./wiki-data:/app/data  # Markdown files storage
    restart: unless-stopped
```

2. Run the container:

```bash
docker-compose up -d
```

3. Access the wiki at `http://localhost:3000`

### Using Docker Run

```bash
docker run -d \
  --name wiki-ai \
  -p 3000:3000 \
  -e TZ=America/New_York \
  -e WIKI_USERNAME=admin \
  -e WIKI_PASSWORD=changeme \
  -e JWT_SECRET=your-secret-key \
  -v $(pwd)/wiki-data:/app/data \
  ghcr.io/loryanstrant/wiki-ai:latest
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WIKI_PORT` | `3000` | Port the wiki runs on inside the container |
| `WIKI_USERNAME` | `admin` | Username for authentication |
| `WIKI_PASSWORD` | `changeme` | Password for authentication (**must be changed!**) |
| `JWT_SECRET` | auto-generated | JWT signing secret (**should be changed!**) |
| `TZ` | `UTC` | Timezone for the container (e.g., `America/New_York`) |
| `NODE_ENV` | `production` | Node environment |

### Volume Mounts

| Path | Description |
|------|-------------|
| `/app/data` | Markdown files storage location |

All wiki content is stored as `.md` files in the data directory, making it easy to:
- Backup your wiki (just backup the `wiki-data` folder)
- Version control with Git
- Process with AI/RAG systems
- Migrate to other systems

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/loryanstrant/wiki-ai.git
cd wiki-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file for local development:
```env
WIKI_USERNAME=admin
WIKI_PASSWORD=changeme
JWT_SECRET=development-secret
WIKI_PORT=3000
```

4. Start development server:
```bash
npm run dev
```

The development server will start with:
- Backend API on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Building Docker Image Locally

```bash
docker build -t wiki-ai .
```

## Architecture

- **Backend**: Node.js with Express.js
- **Frontend**: React with Material-UI
- **Editor**: Monaco Editor with Markdown support
- **Storage**: File-based Markdown storage with frontmatter
- **Authentication**: JWT-based single-user authentication
- **No Database**: Simple environment-based configuration

## Page Structure

Pages are stored as Markdown files with optional YAML frontmatter:

```markdown
---
title: My Page Title
tags: [documentation, guide]
created: 2025-01-01
---

# My Page Content

Your markdown content here...
```

## RAG Integration

All wiki content is stored as plain Markdown files in the mounted data directory, making it perfect for:

- **Vector Databases**: Index content with Pinecone, Weaviate, or Chroma
- **LLM Processing**: Feed content directly to GPT, Claude, or other models
- **Semantic Search**: Build semantic search with embeddings
- **Knowledge Graphs**: Extract entities and relationships
- **Git Integration**: Version control your knowledge base

Example RAG integration:
```python
import os
from pathlib import Path

# Read all wiki content
wiki_path = Path("./wiki-data")
documents = []

for md_file in wiki_path.rglob("*.md"):
    with open(md_file, 'r') as f:
        content = f.read()
        documents.append({
            'path': str(md_file),
            'content': content
        })

# Process with your RAG pipeline
# ... embed, index, query, etc.
```

## Security Notes

1. **Change default credentials**: Always change the default username and password
2. **Set JWT secret**: Use a strong, unique JWT secret in production
3. **Use HTTPS**: Put the wiki behind a reverse proxy with SSL in production
4. **Regular backups**: Backup your `wiki-data` directory regularly

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.