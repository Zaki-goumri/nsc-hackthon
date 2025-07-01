# NSC Hackathon
# Tijarati – Backend (NestJS & PostgreSQL)

> **Tijarati** is the backend that powers an end‑to‑end Algerian e‑commerce experience.  It manages shops, products, orders, payments (escrow simulation), risk scoring (AI Flask service), returns/“retour” resolution, and role‑based administration – all packaged in a single Docker‑Compose stack.

---

## ✨ Key Features

| Domain                   | Highlights                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**       | JWT **access** + **refresh** tokens  *(15 min, 7 days)*.  Secure cookie storage & automatic token rotation.                                                                        |
| **RBAC**                 | *admin* (platform controller) vs *manager* (shop/e‑commerce owner). Guards + decorators enforce route‑level privileges.                                                            |
| **Order Lifecycle**      | `pending → paid → in‑progress → delivered → returned/refunded`.  Escrow state lives between **paid** & **delivered** to hold funds until confirmation or return window expiration. |
| **Returns (retours)**    | Return request → approval / rejection → automatic stock & refund adjustments.                                                                                                      |
| **Payments (simulated)** | "Carte d’Or" sandbox – generates mock transaction & escrow record; no external gateway keys needed.                                                                                |
| **AI Risk Scoring**      | Calls Flask service at **`AI_URL`** (`/risk`) to classify orders (`Low / Medium / High / Critical`).  Blacklist, category & charge‑back data feed the model.                       |
| **Search & Analytics**   | Elasticsearch 8.13 for product + order indexing; dedicated analytics endpoints (orders‑over‑time, risk heat‑map).                                                                  |
| **Caching / Queues**     | Redis 7 for short‑TTL caching & background retry queues (e.g. risk score timeouts).                                                                                                |
| **Documentation**        | Auto‑generated Swagger at **`/api`** (scalar theme).                                                                                                                               |

---

## 🗺️ System Design Diagrams

All diagrams are maintained in **Eraser**. Open them live → [https://app.eraser.io/workspace/6D7I2ZfIncYLOLD9XFXk](https://app.eraser.io/workspace/6D7I2ZfIncYLOLD9XFXk)

*Included:* System Context, Use‑Case, Sequence (Checkout & Payment), and ER model.

---

## 🏗️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- | 
| Runtime    | Node.js                | 
| Framework  | NestJS                 | 
| DB         | PostgreSQL             | 
| ORM        | TypeORM                |
| Cache / MQ | Redis                  |
| Search     | Elasticsearch          |
| AI Risk    | Flask (Python 3.11)    |
| Auth       | JWT (access & refresh) | 
| AI chatbot | answers questions about product features       |

---

## 📂 Project Structure

```
# Project Folder Structure
.
├── compose.yaml
├── Dockerfile
├── .env
├── package.json
├── pnpm-lock.yaml
├── src/
│   ├── ai/
│   │   └── risk/
│   │       ├── risk.controller.ts
│   │       ├── risk.module.ts
│   │       ├── risk.service.ts
│   │       └── ...
│   ├── order/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── types/
│   │   ├── order.controller.ts
│   │   ├── order.module.ts
│   │   ├── order.service.ts
│   │   └── ...
│   └── ...
├── data_ai_tejarati/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── risk_api.py
│   ├── result.py
│   ├── rebalence.py
│   ├── chart.py
│   ├── chatbot.py
│   ├── data.py
│   ├── dataset.py
│   ├── dataset3.py
│   ├── dataset4.py
│   ├── makedata.py
│   ├── searchwebagent.py
│   ├── category_behaviour.json
│   ├── blacklist.json
│   ├── orders.csv
│   ├── orders_final.csv
│   ├── orders_balanced.csv
│   ├── orders_with_blacklist.csv
│   ├── orders_algerianized.csv
│   └── faiss_index/
│       └── ...
├── pgdata/ (docker volume)
└── ...
```



## © License

MIT — *2025 Tijarati*
