# Architectural Guidelines

This project is being reorganised towards a modular, use case-driven architecture that aligns with NestJS best practices while keeping the codebase simple to evolve.

## Layering

- **Application layer (`src/core/application`, `*/use-cases`)**  
  Encapsulates business rules through use cases. Each use case depends only on abstractions (repositories, services) and is independently unit testable.

- **Domain layer (`*/entities`, `*/dto`)**  
  Contains TypeORM entities and DTOs that describe the domain data structures. Entities stay persistence-agnostic apart from ORM metadata.

- **Infrastructure layer (`*/repositories`)**  
  Houses repository implementations that talk to TypeORM. Repositories expose high-level methods tailored for use cases instead of exposing raw persistence APIs.

- **Interface layer (controllers/services)**  
  Nest controllers and services orchestrate HTTP/adapters, delegate business logic to use cases and translate results into DTOs.

This separation allows you to plug in new delivery mechanisms or swap persistence strategies with minimal impact on application logic.

## Use Case Conventions

- Use cases live close to their domain (`src/<module>/use-cases`).
- Each use case implements the shared `UseCase<Input, Output>` interface.
- Always add a dedicated unit test for every new use case under the same directory (`*.use-case.spec.ts`).
- Keep use cases thin: validation, orchestration and interaction with other services belong here; presentation logic remains in controllers.
- Prefer returning DTO classes (or map to them via `mappers/`) so controllers only shape HTTP responses.

## Testing Strategy

- **Use Case tests**: fast unit tests mocking repositories/services.  
- **controller tests**: optional integration tests using Nest `TestingModule`.  
- **E2E tests**: continue using the existing `test/` setup for cross-module flows.

## Folder Structure Example

```
src/
  core/
    application/
      use-case.interface.ts
  users/
    dto/
    use-cases/
      create-user.use-case.ts
      create-user.use-case.spec.ts
      find-user-by-id.use-case.ts
    user.entity.ts
    user.repository.ts
    users.controller.ts
  experiences/
    dto/
      create-experience.input.ts
      experience-summary.dto.ts
    entities/
      professional-experience.entity.ts
      project-experience.entity.ts
      academic-experience.entity.ts
    repositories/
      professional-experiences.repository.ts
      project-experiences.repository.ts
      academic-experiences.repository.ts
      ais-units.repository.ts
    mappers/
      experience.mapper.ts
    use-cases/
      list-experiences.use-case.ts
      create-experience.use-case.ts
      update-experience.use-case.ts
      remove-experience.use-case.ts
      create-ais-unit.use-case.ts
      update-ais-unit.use-case.ts
      remove-ais-unit.use-case.ts
    experiences.controller.ts
```

## Next Steps

1. Expand HTTP layer to cover remaining experience and AIS Unit operations by wiring the newly created use cases.
2. Where multiple use cases share DTO transformations, keep the logic in `mappers/` to avoid duplication.
3. Review other modules (e.g. resume, AI) and apply the same use case-driven pattern as the codebase evolves.
