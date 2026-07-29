# AttributePlus Offline Documentation

The bundled AttributePlus documentation snapshot is stored at `assets/api-cache/attributeplus-docs/`.

## Search

Search all downloaded pages:

```powershell
rg -n -i "AttributeAPI|AttributeComponent|你的关键词" assets/api-cache/attributeplus-docs/pages
```

Search only the developer API section:

```powershell
rg -n -i "你的关键词" assets/api-cache/attributeplus-docs/pages/kai-fa-wen-dang*
```

Read `assets/api-cache/attributeplus-docs/snapshot.json` for page titles, source URLs, snapshot date, and sitemap entries that returned 404 during download.

## Scope And Authority

The snapshot contains the readable article body from 42 AttributePlus documentation pages at <https://plugin.hhhhhy.kim/docs/attributeplus>. Site navigation, scripts, styles, and unrelated plugin documentation are intentionally omitted.

Use the snapshot for configuration, attribute reading, mechanics, scripts, components, conditions, and API discovery. Every page retains its original source URL. Because AttributePlus releases can differ, confirm the installed plugin version and exact JAR/API before relying on a method signature. Prefer matching current official documentation when it differs from the snapshot.
