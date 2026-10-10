# ADR-009: Application Layer Naming and Orchestration Conventions

## Status
Accepted

## Context
Across different bounded contexts (e.g., `billing`, `operations`, `identity`), the naming and structure of the `application` layer had minor variations between standalone services and dedicated use case directories. This ADR establishes a uniform convention across the backend.

## Decision
1. **Application Services (`application/<feature>.service.ts`)**:
   - Serve as high-level orchestration facades that expose coordinated capabilities to the presentation/controller layer.
   - Inject atomic use cases and external adapters, keeping HTTP controllers lean, readable, and free from multi-use-case injection explosion.
   - Contain orchestration flow, transactional boundaries, and coordination between domain operations.

2. **Use Cases (`application/use-cases/<action>.use-case.ts`)**:
   - Encapsulate single, cohesive business operations (Command or Query).
   - Contain pure business logic orchestration, repository calls, and domain policy invocations.
   - Testable in isolation with focused unit tests.

3. **Sub-Services (`application/services/`)**:
   - Reserved strictly for domain-supporting sub-services (e.g., specialized calculation or background helper services such as `tercera-edad.service.ts` or `invitation-token-generator.service.ts`), never as ambiguous duplicates of use cases.

## Consequences
- **Controllers** maintain a clean interface by interacting with the bounded context's primary service facade without inflating imports.
- **Use Cases** remain isolated, testable, and reusable across multiple entry points (REST controllers, CLI commands, background jobs).
- Clear, predictable directory structure across all modules in the project.
