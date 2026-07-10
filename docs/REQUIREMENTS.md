# Build Requirements

> The implementation checklist for building a production-ready Next.js 16 app.
> Check items off as they land. See [Architecture](./ARCHITECTURE.md) for how the
> pieces fit together.

## Foundation

- [x] Next.js 16 with App Router
- [x] TypeScript
- [x] shadcn/ui + Tailwind CSS
- [x] Auth.js authentication
- [x] PostgreSQL database
- [x] Prisma ORM
- [x] React Hook Form
- [x] Zod validation
- [x] React Query
- [x] Responsive layout
- [x] Dark mode
- [x] Protected routes

## Authentication

- [x] Register
- [x] Login
- [x] Logout
- [ ] Forgot Password

## Dashboard

- [ ] Today's diary summary
- [ ] Today's tasks
- [ ] Completion statistics (charts via Recharts)
- [ ] Recent activity

## Diary

- [x] CRUD
- [x] Search
- [x] Filter by date
- [ ] Rich text editor (optional)
- [x] History

## Tasks

- [x] CRUD
- [x] Mark complete
- [x] Mark pending
- [x] Search
- [x] Filter
- [x] Due date
- [x] History

## Profile

- [x] Update profile
- [x] Change password

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
