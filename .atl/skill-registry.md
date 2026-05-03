# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| SOLID, refactoring, SRP, OCP, LSP, ISP, DIP | solid-principles | /home/yan2005dris-afk/.config/opencode/skills/solid-principles/SKILL.md |
| Bugs, errors, "no funciona", debug | debugger | /home/yan2005dris-afk/.config/opencode/skills/debugger/SKILL.md |
| Code review, "review", "revisá esto" | code-reviewer | /home/yan2005dris-afk/.config/opencode/skills/code-reviewer/SKILL.md |
| Security, "es seguro", "vulnerabilidad" | senior-security | /home/yan2005dris-afk/.config/opencode/skills/senior-security/SKILL.md |
| Backend, "endpoint", "API", "autenticación" | senior-backend | /home/yan2005dris-afk/.config/opencode/skills/senior-backend/SKILL.md |
| Frontend, "componente", "state", "React" | senior-frontend | /home/yan2005dris-afk/.config/opencode/skills/senior-frontend/SKILL.md |
| Architecture, "diseño", "patrones" | senior-architect | /home/yan2005dris-afk/.config/opencode/skills/senior-architect/SKILL.md |
| Database, "schema", "relaciones", "migración" | database-architect | /home/yan2005dris-afk/.config/opencode/skills/database-architect/SKILL.md |
| Optimize DB, "lento", "índice", "performance" | database-optimizer | /home/yan2005dris-afk/.config/opencode/skills/database-optimizer/SKILL.md |
| QA, "coverage", "test" | senior-qa | /home/yan2005dris-afk/.config/opencode/skills/senior-qa/SKILL.md |
| Testing, "test", "e2e" | webapp-testing | /home/yan2005dris-afk/.config/opencode/skills/webapp-testing/SKILL.md |
| Clean code, "refactorizar", "código limpio" | clean-code | /home/yan2005dris-afk/.config/opencode/skills/clean-code/SKILL.md |
| Issue, "crear issue", "reportar bug" | issue-creation | /home/yan2005dris-afk/.config/opencode/skills/issue-creation/SKILL.md |
| PR, "crear PR", "pull request" | branch-pr | /home/yan2005dris-afk/.config/opencode/skills/branch-pr/SKILL.md |
| Go tests, "Go test", "testing" | go-testing | /home/yan2005dris-afk/.config/opencode/skills/go-testing/SKILL.md |
| React, "React", hooks, performance | react-best-practices | /home/yan2005dris-afk/.config/opencode/skills/react-best-practices/SKILL.md |
| Memory, "recordar", "cómo hicimos" | memory-search | /home/yan2005dris-afk/.config/opencode/skills/memory-search/SKILL.md |
| Judgment, "judgment day", "dual review" | judgment-day | /home/yan2005dris-afk/.config/opencode/skills/judgment-day/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### solid-principles
- **S** (Single Responsibility): Class has one reason to change. Split fat classes. Check: describe class without using "and".
- **O** (Open/Closed): Open for extension, closed for modification. Use interfaces + polymorphism. Add new classes, don't modify existing.
- **L** (Liskov Substitution): Subclass replaces parent without breaking. Don't strengthen preconditions, don't weaken postconditions.
- **I** (Interface Segregation): Many small interfaces > one big. Don't force unused methods.
- **D** (Dependency Inversion): Depend on abstractions, not concretions. High-level doesn't know low-level.
- Use interfaces (e.g., `UserRepository`) injected in constructors, not concrete classes (e.g., `PrismaService`).

### debugger
- NEVER guess — always verify: REPRODUCE, ISOLATE, HYPOTHESIZE, FIX, VERIFY.
- Binary search isolation: half code → does it break? → repeat until isolated.
- Log contextual info: `{ userId, action, reason }` — never just `console.log('here')`.
- Null safety: use optional chaining (`?.`) and null guards.
- Async errors: always try/catch with logger.error.

### code-reviewer
- Run `git status + git diff --stat` first.
- Check security vulnerabilities FIRST: SQL injection, XSS, auth bypass, secrets in code.
- All modified files reviewed — NOT just new files.
- No credentials/secrets committed. Tests passing locally. No console.log/debug code.
- Pre-push checklist: naming conventions, error handling, TODO without ticket ref.

### senior-security
- **OWASP Top 10**: Broken Access Control, Injection, Insecure Design — MUST validate permissions EVERYWHERE.
- Passwords: bcrypt/argon2 — NEVER MD5/SHA.
- Tokens: JWT with expiration. HttpOnly + Secure + SameSite cookies.
- Input validation: ALWAYS validate, NEVER trust client. Parameterized queries for DB.
- Secrets in env vars, NOT in code.

### senior-backend
- REST methods: GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove.
- Response format: `{ data: {...}, meta: { page, total } }` or `{ error: { code, message } }`.
- Use Repository pattern: interface in service, implementation in repository layer.
- Avoid N+1: use `include`/`eager loading`, not loops.
- Database indexes for slow queries. Pagination for large payloads.

### senior-frontend
- React: use useEffect for side effects, useState for local state.
- Performance: React Compiler handles memoization — prefer let it optimize.
- Component architecture: presentational (UI) + container (logic).
- State management: local first, then Context/Redux/Zustand for shared.

### senior-architect
- Design patterns: choose based on problem, not trends.
- Clean Architecture: separate concerns — UI, business logic, data access.
- Dependencies point inward: domain has no external dependencies.
- Evaluate tradeoffs before choosing patterns.

### database-architect
- Normalize to 3NF min, avoid redundancy.
- Foreign keys enforce relationships.
- Index foreign keys and columns in WHERE/JOIN.
- Use UUID or bigint for IDs.

### database-optimizer
- Check slow queries: `pg_stat_statements`.
- EXPLAIN ANALYZE before adding indexes.
- Avoid SELECT *. Use specific columns.
- N+1: use JOIN/include, not loops.

### senior-qa
- Test the public API, not internals.
- Mock external dependencies (DB, services).
- Unit tests: .spec.ts in same folder.
- Integration: testcontainers for real DB.

### senior-qa
- Test the public API, not internals.
- Mock external dependencies (DB, services).
- Unit tests: .spec.ts in same folder.
- Integration: testcontainers for real DB.

### clean-code
- Meaningful names: describe WHAT the variable/function does.
- Functions: do one thing, <20 lines.
- DRY: don't repeat logic.
- Comments: WHY, not WHAT.
- Formats: ESLint/Prettier enforced.

### webapp-testing
- Unit tests: component renders, logic.
- Integration: user flows, API mocking.
- E2E: critical paths, login, checkout.
- Playwright/Cypress for browser automation.

### memory-search
- Search engram BEFORE making decisions that affect past work.
- Use exact keywords from past decisions.

### judgment-day
- Launch two independent reviewers.
- If both pass → APPROVED. If both fail → fixes required.
- If split → human decides.

### react-best-practices
- No useMemo/useCallback unless evidence — React Compiler optimizes.
- use() for promises/context.
- Server Components default, add 'use client' only for interactivity.
- ref is regular prop — no forwardRef needed.
- Actions: useActionState, useOptimistic.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/yan2005dris-afk/Documentos/GitHub/JASRAPO-BACKEND/AGENTS.md | Project-level conventions |
| .atl/skill-registry.md | /home/yan2005dris-afk/Documentos/GitHub/JASRAPO-BACKEND/.atl/skill-registry.md | This file |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.