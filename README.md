# 🎯 Plinko Lab — Provably Fair

A full-stack Plinko game with a commit-reveal fairness protocol, deterministic seed-replayable outcomes, polished UI, and a public verifier page.

Built with Next.js, TypeScript, Prisma, and PostgreSQL to demonstrate modern full-stack web development and system design.

---

## Live Links

- App: https://daphnis-labs-assignment-9g6g.vercel.app
- Verifier: https://daphnis-labs-assignment-9g6g.vercel.app/verify
- History: https://daphnis-labs-assignment-9g6g.vercel.app/history

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-username/plinko-lab
cd plinko-lab

# 2. Install
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/plinko_lab"
```

For local dev, SQLite also works if you change the schema `provider` to `"sqlite"`.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14+ (App Router), React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Validation | Zod |
| Testing | Vitest |
| Hashing | Node.js `crypto` (SHA-256) |
| PRNG | xorshift32 (custom implementation) |

---

## Architecture

```
plinko-lab/
├── app/
│   ├── page.tsx               # Landing page
│   ├── game/page.tsx          # Main game UI
│   ├── verify/page.tsx        # Public verifier
│   ├── history/page.tsx       # Round history + CSV export
│   └── api/
│       ├── rounds/
│       │   ├── commit/        # POST — create round + commitment
│       │   ├── [id]/start/    # POST — set clientSeed, compute result
│       │   ├── [id]/reveal/   # POST — reveal serverSeed
│       │   ├── [id]/          # GET — fetch round details
│       │   └── route.ts       # GET — list rounds
│       └── verify/route.ts    # GET — stateless recompute
├── components/
│   └── game/                  # PlinkoBoard, GameControls, FairnessPanel, etc.
├── hooks/                     # useGame, useAudio
├── lib/
│   ├── crypto.ts              # SHA-256 helpers
│   ├── prng.ts                # xorshift32
│   ├── engine.ts              # Deterministic Plinko engine
│   ├── store.ts               # Zustand game state
│   └── db.ts                  # Prisma client
├── prisma/schema.prisma
├── tests/                     # Vitest unit + integration tests
└── types/index.ts
```

---

## Provably Fair Protocol

### How It Works

```
BEFORE ROUND:
  1. Server generates: serverSeed (random), nonce (random)
  2. Server publishes: commitHex = SHA256(serverSeed + ":" + nonce)
  3. Client sees the commitment — NOT the serverSeed

DURING ROUND:
  4. Client provides: clientSeed (free-form string)
  5. Server computes: combinedSeed = SHA256(serverSeed + ":" + clientSeed + ":" + nonce)
  6. All randomness comes from xorshift32 PRNG seeded by combinedSeed

AFTER ROUND:
  7. Server reveals: serverSeed
  8. Anyone can verify: recompute commitHex, combinedSeed, engine output
```

### Why This Is Fair

- Server **cannot change** `serverSeed` after commitment (it would change `commitHex`)
- Client **cannot predict** the outcome before providing `clientSeed` (server seed is hidden)
- Both seeds are mixed — **neither party alone controls the outcome**
- Every round is **fully reproducible** from `(serverSeed, clientSeed, nonce, dropColumn)`

---

## Deterministic Engine

### PRNG: xorshift32

```ts
// Seeded from first 4 bytes of combinedSeed (big-endian)
let x = parseInt(combinedSeed.slice(0, 8), 16);
x ^= x << 13;
x ^= x >>> 17;
x ^= x << 5;
rand() = x / 0x100000000  // → [0, 1)
```

### Peg Map Generation

For each row `r` (0-based, 0..11), create `r+1` pegs:
```
leftBias = 0.5 + (rand() - 0.5) * 0.2  // rounded to 6 decimal places
```
Result: leftBias ∈ [0.4, 0.6]

The peg map is generated **first** using the PRNG, **before** any path decisions. This guarantees the verifier can reproduce results by consuming the PRNG in the same order.

### Ball Drop Simulation

```
adj = (dropColumn - floor(ROWS/2)) * 0.01
bias' = clamp(leftBias + adj, 0, 1)
rnd = rand()
direction = rnd < bias' ? "L" : "R"
if "R": pos += 1
```

`pos` starts at 0 and increments with each Right move. `binIndex = pos` after 12 rows.

### Peg Map Hash

```
pegMapHash = SHA256(JSON.stringify(pegMap))
```

Stored and exposed so verifiers can confirm the peg layout used.

---

## Test Vectors

These exact values are verified by the unit tests:

```
serverSeed   = "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc"
nonce        = "42"
clientSeed   = "candidate-hello"
dropColumn   = 6

commitHex    = bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34
combinedSeed = e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0

PRNG seed (first 4 bytes, big-endian): e1dddf77 = 3789725559
First 5 rand():  0.110617, 0.762513, 0.043929, 0.457868, 0.343900

Row 0: [0.422123]
Row 1: [0.552503, 0.408786]
Row 2: [0.491574, 0.468780, 0.436540]

binIndex = 6  (center drop, no bias offset)
```

---

## Verifier Page

**URL:** `/verify`

Enter any `serverSeed + clientSeed + nonce + dropColumn` to:
1. Recompute `commitHex` and `combinedSeed`
2. Re-run the engine deterministically
3. Get `pegMapHash` and `binIndex`
4. Optionally match against a stored `roundId`

The verifier is completely **stateless** — it doesn't need database access to verify. It re-derives everything from first principles.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rounds/commit` | Create round, return `{roundId, commitHex, nonce}` |
| POST | `/api/rounds/:id/start` | Set `clientSeed`, compute result |
| POST | `/api/rounds/:id/reveal` | Reveal `serverSeed` |
| GET | `/api/rounds/:id` | Get round details |
| GET | `/api/rounds?limit=20` | List recent rounds |
| GET | `/api/verify?serverSeed&clientSeed&nonce&dropColumn` | Stateless verify |

---

## Running Tests

```bash
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

Tests verify:
- SHA-256 generation (commitHex, combinedSeed)
- All assignment test vectors
- xorshift32 PRNG sequence matches expected values
- Peg map structure (row r has r+1 pegs, leftBias ∈ [0.4, 0.6])
- Engine determinism (same inputs → identical outputs)
- BinIndex = R-count
- Verifier full pipeline (commit → combinedSeed → engine → binIndex=6)

---

## Easter Eggs

| Trigger | Effect |
|---|---|
| Press `T` | **TILT MODE** — Board rotates ±5° with vintage arcade filter |
| Three consecutive center landings | **GOLDEN BALL** — Next ball has gold trail + glow |
| Type `open sesame` | **DUNGEON THEME** — Torchlight/dungeon aesthetic for one round |
| Press `G` | **DEBUG GRID** — Overlays RNG values and path details |

---

## AI Usage

AI (Claude Sonnet) was used extensively throughout this project:

1. **Architecture planning** — Mapping requirements to Next.js app structure
2. **xorshift32 implementation** — Prompted for a clean TypeScript implementation, then verified manually against test vectors
3. **Canvas animation** — The ball animation and peg rendering logic was drafted with AI, then refined for performance
4. **API route structure** — Boilerplate for Next.js route handlers
5. **Tailwind styling** — Color palette and glassmorphism effects
6. **Test cases** — Generated test structure, added edge cases manually

**What I reviewed and changed:**
- Verified all cryptographic functions produce bit-exact outputs matching test vectors
- Manually traced the xorshift32 PRNG to confirm seed extraction logic
- Confirmed PRNG usage order (peg map first, then row decisions) matches spec
- Validated payout multiplier symmetry

---

## Time Log

| Phase | Time |
|---|---|
| Reading requirements, planning | 30 min |
| Core crypto + PRNG + engine | 1.5 hr |
| Tests (all 18 passing) | 45 min |
| API routes (commit/start/reveal/verify) | 1 hr |
| Prisma schema + DB setup | 30 min |
| Game UI + canvas board | 2 hr |
| Verifier page | 45 min |
| History page + CSV export | 30 min |
| Easter eggs + polish | 45 min |
| README | 30 min |
| **Total** | **~8.5 hr** |

---

## What I'd Do Next

1. **True physics** — Matter.js fixed-timestep physics for visually accurate collisions
2. **WebSocket realtime** — Live session log, multiplayer spectating
3. **Row-1 animation fix** — Smoother ball path interpolation through pegs
4. **Mobile gestures** — Swipe left/right to change drop column
5. **Sound pack** — Proper recorded SFX instead of Web Audio API tones
6. **Rate limiting** — Prevent API abuse
7. **Better client seed UX** — Entropy indicator, suggested phrases

---

## Payout Table

| Bin | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | 10x | 3x | 1.5x | 1x | 0.5x | 0.3x | 0.2x | 0.3x | 0.5x | 1x | 1.5x | 3x | 10x |

Symmetric around center. Edge bins pay highest, center pays lowest — mirrors real Plinko probability distributions.

---

## License

MIT — Built as a full-stack web application demonstrating frontend, backend, database, testing, and system design concepts.
