# Product Requirements — Daily Diary & Task Manager

> The product spec for **Meri Zindagi**: what we're building, who it's for, and what it must do.

## Overview

Daily Diary & Task Manager is a secure web application that lets users record their
daily journal entries and manage their daily tasks in one place.

It should be **simple, responsive, and fast** while maintaining enterprise-quality
architecture under the hood.

## Goals

- Secure authentication
- Effortless daily journaling
- Daily task management
- Responsive UI across devices
- A modern, informative dashboard
- A clean, distraction-free user experience

## Target Users

Individuals who want to:

- Keep a daily diary
- Track daily tasks
- Review previous journal entries
- Review previously completed tasks

## Functional Requirements

### Authentication

- Sign Up
- Sign In
- Forgot Password
- Reset Password
- Logout
- Protected routes for authenticated areas

### Dashboard

Displays an at-a-glance summary:

- Welcome message
- Today's diary status
- Today's task completion
- Number of pending tasks
- Number of completed tasks
- Quick actions

### Diary Module

Users can **create, edit, delete, view history, search, and filter by date**.

| Field | Purpose |
|---|---|
| Title | Short heading for the entry |
| Content | The journal body |
| Created Date | When the entry was created |
| Updated Date | When the entry was last modified |

### Task Module

Users can **create, edit, delete, mark complete/pending, search, and filter**.

| Field | Purpose |
|---|---|
| Title | Short task name |
| Description | Task details |
| Due Date | When the task is due |
| Status | `Pending` or `Completed` |

### User Profile

- Update name
- Update password
- Logout

## Non-Functional Requirements

- Responsive layout
- Fast loading
- Accessibility (a11y)
- SEO friendly
- Mobile friendly
- Dark mode
- Written in TypeScript
- Secure authentication

---

**Related docs:** [Architecture](./ARCHITECTURE.md) · [Database](./DATABASE.md) · [UI Guidelines](./UI_GUIDELINES.md) · [Requirements](./REQUIREMENTS.md) · [Roadmap](./ROADMAP.md)
