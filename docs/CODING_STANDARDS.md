# Coding Standards

> Conventions every contributor (human or AI) should follow to keep the codebase
> consistent and maintainable.

## Language

- TypeScript everywhere
- `strict` mode enabled
- No `any`

## Components

- Reusable by default
- Single Responsibility Principle
- Favor composition over inheritance

## Naming

- `PascalCase` for components and types
- `camelCase` for variables and functions
- `UPPER_CASE` for constants

## Hooks

- Extract shared logic into custom hooks
- No duplicated logic across components

## API

- Business logic lives in services (not route handlers)
- Validate all inputs
- Consistent error handling

## Forms

- React Hook Form for form state
- Zod for schema validation

## Styling

- shadcn/ui components (Radix UI primitives)
- Tailwind CSS utility classes; theme tokens via CSS variables
- Responsive by default

## Testing

- **Vitest** for unit and integration tests
- **Playwright** for end-to-end flows
- Test user-facing behavior, not implementation details
- Co-locate unit tests with the code they cover (`*.test.ts`)

## Tooling

- **ESLint** — linting
- **Prettier** — formatting
- **Husky** — git hooks
- **Commitlint** — enforce conventional commit messages

---

**Related docs:** [Architecture](./ARCHITECTURE.md) · [Requirements](./REQUIREMENTS.md)
