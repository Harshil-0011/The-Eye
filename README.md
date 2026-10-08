# "The Eye" — Personal Intelligence & Data Fusion Platform

**The Eye** is a self-hosted, single-user workspace that ingests data from files, documents, databases, and web sources; normalizes it into a canonical model; resolves entity duplicates across sources; and presents everything as a searchable knowledge graph with full provenance tracking.

---

## Visual Design System

The Eye features a modern dark interface built with glassmorphism overlays and instrument-panel styling:
- **Palette**: Near-black background (`#0A0E14`), raised surfaces (`#121822`), and sky-blue (`#38BDF8`) reserved for active selections, interactive buttons, and glowing node highlights.
- **Glassmorphism**: Floating panels, search pills, context menus, and detail sidebars use translucent overlays and top-rim edge highlights.
- **Typography**:
  - Headings & Branding: **Space Grotesk**
  - Body & Form Controls: **Inter**
  - Identifiers, Hashes & Logs: **JetBrains Mono**

---

## Key Features

1. **Multi-Source Ingestion**: Supports CSV, JSON, Excel, PDF, and HTML with automatic schema mapping and column inference.
2. **Canonical Data Model**: Normalizes every record into standard `Entity`, `Event`, `Document`, `Relationship`, and `Source` objects.
3. **Entity Resolution Engine**:
   - **Blocking**: Token normalization & fuzzy name matching via `RapidFuzz`.
   - **Scoring**: Jaro-Winkler distance, token sort ratios, alias matching, and shared email/domain identifiers.
   - **Resolution Decision**: High confidence (>= 0.88) auto-merges; medium confidence (0.65-0.87) queues into the human **Review Queue**.
   - **Auditability**: Non-destructive merges with full evidence tracking and reversible unmerge operations.
4. **Interactive Graph Explorer**: Cytoscape.js force-directed visualization with glowing sky-blue selection rings, double-click neighbor expansion, layout toggles, edge filters, and high-res PNG export.
5. **Faceted Global Search**: Multi-type search (Entities, Events, Documents) with type filters and source facets.
6. **Chronology Timeline**: Interactive event timeline with category brushing.
7. **Full Provenance**: Every entity, edge, and event explicitly references its originating `Source`.

---

## Quick Start with Docker Compose

Run the entire platform with single-command Docker Compose deployment:

```
docker-compose up --build
```

- **Frontend Workspace**: http://localhost:3000
- **FastAPI Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/api/v1/health



---

## GitHub Deployment & CI/CD Pipeline

To host or deploy this repository on **GitHub**:

1. **GitHub Actions CI/CD Pipeline**:
   - The included `.github/workflows/ci.yml` pipeline automatically triggers on every push and pull request.
   - It executes the **backend pytest suite** (Python 3.12), verifies **frontend TypeScript typechecking and Vite production build** (Node 22), and checks **Docker Compose container build integrity**.


---

## Hosting live on GitHub Pages

This repository is configured to automatically build and host the interactive web workspace on **GitHub Pages** whenever you push code.

1. **Enable GitHub Pages in repository settings**:
   - Go to **Settings** -> **Pages** in your GitHub repository.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.

2. **Automatic Deployment**:
   - The workflow in `.github/workflows/pages.yml` will automatically build the React single-page app and publish it to `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/`.
   - When hosted on GitHub Pages, the frontend automatically runs in interactive demo mode using embedded intelligence records (entities, knowledge graph, timeline, and documents) if a backend server is not connected.
