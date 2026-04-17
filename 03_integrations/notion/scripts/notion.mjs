#!/usr/bin/env node

import { parseArgs } from "node:util";

// --- Config ---
const NOTION_KEY = process.env.NOTION_API_KEY || process.env.NOTION_KEY;
const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const BASE = "https://api.notion.com/v1";

if (!NOTION_KEY) {
  console.error("Error: NOTION_API_KEY o NOTION_KEY debe estar configurado.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${NOTION_KEY}`,
  "Notion-Version": NOTION_VERSION,
  "Content-Type": "application/json",
};

// --- API Functions ---

async function search(query, pageSize = 10) {
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, page_size: pageSize }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function queryDb(databaseId, pageSize = 20, filter = null) {
  const body = { page_size: pageSize };
  if (filter) body.filter = JSON.parse(filter);
  const res = await fetch(`${BASE}/databases/${databaseId}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function createPage(databaseId, title, titleProp = "Name") {
  const res = await fetch(`${BASE}/pages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        [titleProp]: { title: [{ text: { content: title } }] },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function getPage(pageId) {
  const res = await fetch(`${BASE}/pages/${pageId}`, { headers });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function createDb(parentPageId, title, properties) {
  const propList = JSON.parse(properties);
  const dbProperties = {
    Name: { title: {} },
  };

  for (const prop of propList) {
    switch (prop) {
      case "Status":
        dbProperties.Status = {
          select: {
            options: [
              { name: "Por hacer", color: "default" },
              { name: "En progreso", color: "blue" },
              { name: "Completada", color: "green" },
              { name: "Bloqueada", color: "red" },
            ],
          },
        };
        break;
      case "Prioridad":
        dbProperties.Prioridad = {
          select: {
            options: [
              { name: "Alta", color: "red" },
              { name: "Media", color: "yellow" },
              { name: "Baja", color: "gray" },
            ],
          },
        };
        break;
      case "Fecha limite":
        dbProperties["Fecha limite"] = { date: {} };
        break;
      case "Area":
        dbProperties.Area = { select: { options: [] } };
        break;
      case "Tags":
        dbProperties.Tags = { multi_select: { options: [] } };
        break;
      default:
        dbProperties[prop] = { rich_text: {} };
    }
  }

  const res = await fetch(`${BASE}/databases`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: title } }],
      properties: dbProperties,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function appendBlocks(pageId, content) {
  const paragraphs = content.split("\n").filter((l) => l.trim());
  const children = paragraphs.map((text) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  }));

  const res = await fetch(`${BASE}/blocks/${pageId}/children`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ children }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

// --- CLI Parser ---

const [command] = process.argv.slice(2);

const { values } = parseArgs({
  args: process.argv.slice(3),
  options: {
    query: { type: "string" },
    "page-size": { type: "string" },
    "database-id": { type: "string" },
    "parent-page-id": { type: "string" },
    "page-id": { type: "string" },
    filter: { type: "string" },
    title: { type: "string" },
    "title-property": { type: "string" },
    properties: { type: "string" },
    content: { type: "string" },
  },
});

switch (command) {
  case "search":
    await search(values.query, parseInt(values["page-size"] || "10"));
    break;
  case "query-db":
    await queryDb(
      values["database-id"],
      parseInt(values["page-size"] || "20"),
      values.filter
    );
    break;
  case "create-page":
    await createPage(
      values["database-id"],
      values.title,
      values["title-property"] || "Name"
    );
    break;
  case "get-page":
    await getPage(values["page-id"]);
    break;
  case "create-db":
    await createDb(values["parent-page-id"], values.title, values.properties);
    break;
  case "append-blocks":
    await appendBlocks(values["page-id"], values.content);
    break;
  default:
    console.error(`Comando desconocido: ${command}`);
    console.error(
      "Comandos disponibles: search, query-db, create-page, get-page, create-db, append-blocks"
    );
    process.exit(1);
}
