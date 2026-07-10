# UI Guidelines — Screen Specifications

> Layout specs for each screen. Rather than pixel-perfect mockups, these define the
> elements and structure so a designer or AI design tool can generate consistent
> screens. See [PRD](./PRD.md) for feature intent.

## Authentication

The sign-in entry point. Minimal, centered card with clear paths to reset password
or create an account.

```text
----------------------------------
  Logo

  Welcome Back

  Email
  Password
  [ ] Remember me

  [ Sign In ]

  Forgot Password
  Create Account
----------------------------------
```

## Dashboard

At-a-glance overview after login: greeting, summary cards, and recent activity.

```text
----------------------------------
  Navbar

  Welcome, Vishal

  Cards:
    · Today's Diary
    · Pending Tasks
    · Completed Tasks

  Recent Diary Entries
  Recent Tasks
----------------------------------
```

## Diary

List + editor split view for journaling, with search and date filtering.

```text
----------------------------------
  Sidebar
    Diary List
    Search
    Date Filter
    [ Add Diary ]

  Editor
    Title
    Content
    [ Save ]  [ Delete ]
----------------------------------
```

## Task

List view with inline completion, search, and filters.

```text
----------------------------------
  Sidebar
    Task List
    Search
    Filters
    [ Add Task ]

  Task row
    [x] Checkbox
    Edit
    Delete
----------------------------------
```

## Profile

Simple account settings form.

```text
----------------------------------
  Avatar
  Name
  Email
  Change Password
  [ Save ]
----------------------------------
```

---

**Related docs:** [PRD](./PRD.md) · [Coding Standards](./CODING_STANDARDS.md) · [Roadmap](./ROADMAP.md)
