# Build Requirements

> The implementation checklist for building a production-ready Next.js 16 app.
> Check items off as they land. See [Architecture](./ARCHITECTURE.md) for how the
> pieces fit together.

## Foundation

- [ ] Next.js 16 with App Router
- [ ] TypeScript
- [ ] shadcn/ui + Tailwind CSS
- [ ] Auth.js authentication
- [ ] PostgreSQL database
- [ ] Prisma ORM
- [ ] React Hook Form
- [ ] Zod validation
- [ ] React Query
- [ ] Responsive layout
- [ ] Dark mode
- [ ] Protected routes

## Authentication

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Forgot Password

## Dashboard

- [ ] Today's diary summary
- [ ] Today's tasks
- [ ] Completion statistics (charts via Recharts)
- [ ] Recent activity

## Diary

- [ ] CRUD
- [ ] Search
- [ ] Filter by date
- [ ] Rich text editor (optional)
- [ ] History

## Tasks

- [ ] CRUD
- [ ] Mark complete
- [ ] Mark pending
- [ ] Search
- [ ] Filter
- [ ] Due date
- [ ] History

## Profile

- [ ] Update profile
- [ ] Change password

## Testing

- [ ] Unit tests (Vitest)
- [ ] Component tests
- [ ] End-to-end flows (Playwright)
- [ ] Tests run in CI

## Quality

- [ ] Accessibility
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications for success/error (Sonner)
- [ ] Optimistic updates
- [ ] Pagination where appropriate
- [ ] Clean architecture
- [ ] Reusable components
- [ ] Enterprise-level code quality

---

**Related docs:** [PRD](./PRD.md) · [Architecture](./ARCHITECTURE.md) · [Coding Standards](./CODING_STANDARDS.md) · [Roadmap](./ROADMAP.md)
