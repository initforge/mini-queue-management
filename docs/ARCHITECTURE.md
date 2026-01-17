# System Architecture

QStream is designed as a **decoupled, real-time web application**.  
The system separates concerns between UI, business logic, and realtime communication.

---

## High-level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │  REST   │                 │         │                 │
│   React SPA     │────────▶│  FastAPI API    │────────▶│   PostgreSQL    │
│   (Frontend)    │         │   (Backend)     │         │   (Database)    │
│                 │◀────────│                 │         │                 │
└────────┬────────┘   JSON  └────────┬────────┘         └─────────────────┘
         │                           │
         │    WebSocket              │
         │◀──────────────────────────┤
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │                 │
         │                  │     Redis       │
         │                  │  (Pub/Sub)      │
         │                  │                 │
         │                  └─────────────────┘
         ▼
┌─────────────────┐
│     Nginx       │  (Production only)
│  Reverse Proxy  │
└─────────────────┘
```

### Why this design?

| Component | Decision | Reason |
|-----------|----------|--------|
| **SPA + API** | Decoupled frontend/backend | Independent deployment, better caching |
| **FastAPI** | Async Python framework | High performance, auto OpenAPI docs |
| **WebSocket** | Real-time updates | Low latency queue notifications |
| **Redis** | Pub/Sub messaging | Lightweight, easy horizontal scaling |
| **PostgreSQL** | Relational DB | ACID transactions for queue operations |

---

## Realtime Queue Flow

This is the core feature - how queue updates propagate instantly to all clients.

```
┌──────────────┐
│ Staff Action │  (Call next customer)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  FastAPI     │  POST /api/v1/tickets/{id}/call
│  Endpoint    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │  UPDATE ticket SET status='called'
│  Transaction │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Redis     │  PUBLISH queue_updates {ticket_id, status, counter}
│   Pub/Sub    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  WebSocket   │  Broadcast to all connected clients
│   Manager    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  All Connected Clients (Dashboard, Display)  │
│  React Query invalidates → UI updates        │
└──────────────────────────────────────────────┘
```

### Key implementation details:

1. **WebSocket Manager** (`websocket_manager.py`)
   - Maintains active connections by client_id
   - Handles join/leave queue subscriptions
   - Broadcasts to specific ticket subscribers

2. **Event Types:**
   - `queue_update` - Ticket status changed
   - `ticket_called` - Customer called to counter
   - `ping/pong` - Keep-alive heartbeat

---

## Backend Structure

```
backend/
├── app/
│   ├── api/v1/           # HTTP Layer (routes only)
│   │   ├── auth.py       # Login, JWT
│   │   ├── tickets.py    # Queue CRUD
│   │   ├── dashboard.py  # Analytics
│   │   └── schedule.py   # Shift management
│   │
│   ├── services/         # Business Logic
│   │   ├── auth.py
│   │   ├── ticket.py
│   │   └── schedule_service.py
│   │
│   ├── models/           # SQLAlchemy ORM
│   │   ├── user.py
│   │   ├── ticket.py
│   │   └── department.py
│   │
│   ├── schemas/          # Pydantic Validation
│   │
│   ├── core/             # Config, DB, Security
│   │
│   └── websocket_manager.py  # Realtime handler
```

### Design principle:

> **API routes don't contain business logic.**  
> Routes → call Services → use Models → return Schemas

This separation allows:
- Easy unit testing of services
- Swappable data layer
- Clear responsibility boundaries

---

## Authentication & Authorization

```
Request
   │
   ▼
┌──────────────┐
│  JWT Decode  │  Extract user from Bearer token
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Role Check  │  admin / manager / staff
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Business   │  Proceed if authorized
│    Logic     │
└──────────────┘
```

### Access Control Matrix:

| Resource | Admin | Manager | Staff |
|----------|-------|---------|-------|
| All departments | ✅ | ❌ | ❌ |
| Own department | ✅ | ✅ | ✅ |
| User management | ✅ | ✅ | ❌ |
| Schedule management | ✅ | ✅ | ❌ |
| Queue operations | ✅ | ✅ | ✅ |
| System config | ✅ | ❌ | ❌ |

---

## Frontend Architecture

```
frontend/src/
├── features/           # Feature-based modules
│   ├── auth/          # Login component
│   ├── dashboard/     # Role-specific dashboards
│   ├── queue/         # Queue management
│   ├── schedule/      # Shift scheduling
│   └── ai-helper/     # AI assistant
│
├── shared/
│   ├── components/    # Reusable UI
│   ├── api.js         # Axios instance
│   ├── AuthContext.js # Auth state
│   └── WebSocketContext.js  # WS connection
│
└── routes/            # React Router config
```

### State Management:

| State Type | Solution |
|------------|----------|
| Server state | React Query (cache, refetch) |
| Auth state | React Context |
| WebSocket | Custom context with reconnect logic |
| Form state | React Hook Form |

---

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   departments   │◀────│     users       │────▶│ staff_schedules │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│    services     │              │              │     shifts      │
└────────┬────────┘              │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────┐
│              queue_tickets                  │
│  (ticket_number, status, rating)            │
└─────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ticket_complaints│     │staff_performance│
└─────────────────┘     └─────────────────┘
```

**9 tables total** - intentionally minimal for the scope.

---

## Scalability Considerations

### Current design (single instance):
- ✅ Sufficient for 1 location, ~50 concurrent users
- ✅ Simple deployment

### To scale horizontally:

| Bottleneck | Solution |
|------------|----------|
| Backend | Stateless → add more instances behind load balancer |
| WebSocket | Redis adapter for cross-instance broadcasting |
| Database | Read replicas for dashboard queries |
| Frontend | CDN for static assets |

### Trade-offs made:

| Decision | Trade-off |
|----------|-----------|
| Single Redis instance | Simple, but single point of failure |
| JWT (not sessions) | Stateless, but can't revoke instantly |
| Polling fallback | Not implemented (WebSocket only) |

---

## Key Design Decisions

| Decision | Alternatives Considered | Why Chosen |
|----------|------------------------|------------|
| FastAPI | Django, Express | Async native, auto docs, Python ecosystem |
| React Query | Redux, SWR | Built-in cache, optimistic updates |
| WebSocket (native) | Socket.io, SSE | Lower overhead, full control |
| TailwindCSS | CSS Modules, Styled Components | Rapid development, consistent design |
| Docker Compose | Kubernetes | Right-sized for the scope |

---

## Future Improvements

If continuing development:

1. **Add message queue** (RabbitMQ/Celery) for background tasks
2. **Implement polling fallback** for WebSocket failures
3. **Add rate limiting** on public endpoints
4. **Multi-tenant support** for SaaS deployment
5. **Mobile app** (React Native) for customer queue tracking

---

<p align="center">
  <i>This document reflects architectural decisions as of January 2026.</i>
</p>
