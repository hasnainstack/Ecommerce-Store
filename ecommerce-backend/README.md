# Store backend — FastAPI scaffold

## Structure

```
app/
  core/       # config, db engine, security (hashing, JWT)
  models/     # SQLModel tables (the actual DB schema)
  schemas/    # Pydantic request/response shapes (separate from DB models)
  crud/       # DB read/write functions, isolated from route handlers
  api/routes/ # HTTP endpoints — thin, call into crud/
  main.py     # wires routers together
```

Why schemas are separate from models: it lets you accept/return different
fields than what's stored (e.g. never return `hashed_password`, accept a
plain `password` on register but store `hashed_password`).

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

API docs (interactive): http://localhost:8000/docs

## Try it

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "changeme123"}'

# Login (note: form-encoded, not JSON — OAuth2 spec requirement)
curl -X POST http://localhost:8000/auth/login \
  -d "username=you@example.com&password=changeme123"

# Create a product (requires admin role — see note below)
curl -X POST http://localhost:8000/products/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "T-Shirt", "slug": "t-shirt", "base_price": 19.99}'
```

## Known gaps to fill in next

- New users default to `customer` role — you'll need a one-off script or DB
  edit to promote your first admin user, since there's no public
  "make me admin" endpoint (intentionally — that would be a security hole).
- No Alembic migrations set up yet — `init_db()` just does
  `create_all()`, fine for dev, not for schema changes in production.
- No refresh-token endpoint yet (`/auth/refresh`) — access tokens just expire
  after 30 minutes as-is.
- No rate limiting on `/auth/login` yet.
