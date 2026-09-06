---
title: "Diagramme mit Mermaid"
description: "Ein Testbeitrag für Mermaid-Diagramme."
pubDate: 2026-08-31
tags: ["meta"]
urlSlug: "diagramme"
series:
  - { name: content-features, order: 1, title: "Inhalts-Features" }
  - { name: getting-started, order: 3 }
---

Mermaid-Diagramme werden im Browser gerendert, aus einem selbst gehosteten
Bundle, nur auf Seiten mit einem Diagramm.

## Flussdiagramm

```mermaid
flowchart TD
    A[Push auf main] --> B{CI}
    B -->|Build| C[dist-Branch]
    C --> D[Server zieht]
    D --> E[nginx liefert aus]
```

## Sequenz

```mermaid
sequenceDiagram
    Browser->>Server: GET /blog/beitrag/
    Server-->>Browser: statisches HTML
```
