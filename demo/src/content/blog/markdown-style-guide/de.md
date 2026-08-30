---
title: "Markdown-Stilfibel"
description: "Ein Referenzbeitrag zum Prüfen des Stylings nach Änderungen an den Design-Tokens."
pubDate: 2026-08-24
updatedDate: 2026-08-28
tags: ["referenz"]
---

Mit diesem Beitrag prüfst du, ob Überschriften, Code, Zitate und Listen richtig
aussehen.

## Überschriften

Die Überschrift oben ist ein `h2`, darunter folgt ein `h3`.

### Eine Überschrift dritter Ebene

## Textauszeichnung

Du kannst **fetten Text**, _kursiven Text_ und `Inline-Code` schreiben, dazu
[Links](https://astro.build).

> Zitate bekommen einen farbigen linken Rand und gedämpften Text.

## Listen

- Erster Punkt
- Zweiter Punkt
- Dritter Punkt mit mehr Text, damit die Zeile auf schmalen Bildschirmen umbricht

1. Repository klonen
2. `npm install` ausführen
3. `npm run dev` ausführen

## Code

```ts
type Post = { title: string; pubDate: Date; draft?: boolean };
const isPublished = (post: Post): boolean => !post.draft;
```

## Tabelle

| Element     | Tag          | Gestylt |
| ----------- | ------------ | ------- |
| Überschrift | `h2`         | ja      |
| Code        | `pre`        | ja      |
| Zitat       | `blockquote` | ja      |

---

Ende der Fibel.
