# Design Process — Account Settings Prototype

How this prototype was built, what problems it solves, why decisions were made the way they were, and how iteration shaped the final system.

---

## The Problem

Account settings is one of those surfaces every product has but few get right. It's sprawling — profile, security, preferences, connected accounts, workspace management, billing, sign out, account deletion — and the patterns vary wildly between products. Most settings UIs feel like an afterthought: a flat list of forms with inconsistent layouts, unclear hierarchy, and no principled system underneath.

The goal was to build a prototype that:
1. Establishes a **componentized row system** that scales across every settings surface
2. Simulates **real subdomain architecture** (not a single-page mockup) to pressure-test how settings work when concerns are separated
3. Applies **documented design heuristics** from a cross-product audit (Northbase analysis) rather than inventing patterns from scratch
4. Makes **plan-tier differences** visible by switching between Free, Pro, and Enterprise states

This isn't a visual design exercise. It's a systems design exercise that happens to produce working UI.

---

## Starting Point: Heuristic Research

Before writing any code, I audited account settings across 10+ products (the Northbase analysis). The research surfaced recurring patterns and anti-patterns:

- **"Invite" not "Add"** — 8/10 products use "invite" for adding team members. "Add" implies instant access; "invite" implies a request flow.
- **Role descriptions inline** — showing just "Admin" or "Member" is insufficient. Users need to see what each role can do at the point of assignment.
- **"Remove" not "Deactivate"** — 6/9 products use "remove" for taking someone off a team. "Deactivate" is ambiguous about whether the person's data persists.
- **Consequence disclosure before destructive actions** — not just a confirmation dialog, but a screen that says "here's what will happen" before you commit.
- **Default to most restrictive** — invite flows default to Member, not Admin. Visibility defaults to Private, not Public.
- **No dead-end screens** — every error state, access-denied state, or empty state offers a next action.

These heuristics became the checklist for every phase of implementation.

---

## Architecture: Why Subdomains

The prototype uses separate subdomains (`home.localhost`, `settings.localhost`, `id.localhost`, `account.localhost`, `admin.localhost`) rather than routing everything through a single hostname. This was deliberate:

**The production reality.** In real products, settings often lives on a separate subdomain or service. Billing is on its own subdomain for PCI compliance. Auth (sign-in) is isolated for security scoping. Building the prototype this way surfaces real problems — cross-origin communication, state persistence across subdomains, iframe scoping — that a single-page mockup would hide.

**Iframed settings modal.** The settings UI at `settings.localhost` is designed to be iframed into the main app at `home.localhost`. This mirrors how Superhuman (and many products) present settings: as a modal overlay on top of the main app, not a separate page navigation. The iframe communicates via `postMessage` for close and sign-out events.

**Sign-in as an iframe too.** Originally, signing out navigated to `id.localhost` as a full page. This was changed so that sign-out stays in the app — the avatar changes to a signed-out state, and clicking it opens the sign-in page in an iframed modal (same pattern as settings). This keeps the user in context and avoids a jarring full-page transition for what should feel like switching accounts.

---

## The Row System: How It Evolved

The row system went through several iterations before landing on the final 2-variant, 5-template model.

### Iteration 1: Five Variants

The first pass had five named variants: `inline`, `stacked`, `toggle`, `navigation`, `display`. Each mapped to a specific layout:

- `inline` — label + value on right + pencil edit icon
- `stacked` — label + description below + action on right
- `toggle` — label + description below + switch
- `navigation` — clickable row + caret
- `display` — label + value, no interaction

This worked but felt over-specified. `toggle` was structurally identical to `stacked` with a Switch in the action slot. `display` was `stacked` with no action. The variant name was describing the content, not the layout.

### Iteration 2: Three Variants

Collapsed to three: `field`, `action`, `navigation`. `toggle` and `display` merged into `action` since the action slot already handled different content (button, switch, select, nothing). This was cleaner but still had a structural split between `field` (value on right) and `navigation` (caret on right) that shared the same clickable-row layout.

### Iteration 3: Two Variants (Final)

Realized that `field` and `navigation` are the same structure — label + description on the left, value/icon on the right, whole row clickable. The only difference is what the application puts on the right: a pencil icon for editing, a caret for navigation. So they merged into `clickable`, with the icon passed as a prop.

Final system:

| Variant | Left | Right | Clickable? |
|---|---|---|---|
| `clickable` | Label + Description | Value + Icon (app chooses) | Yes, whole row |
| `action` | Label + Description | Action slot (button, switch, menu, nothing) | No |

This produces 5 templates depending on what goes in the right side:

1. **Edit** — clickable + pencil icon (profile fields)
2. **Navigate** — clickable + caret icon (members, billing, close account)
3. **Button** — action + text button (revoke, manage, connect)
4. **Toggle** — action + switch (dark mode, notifications)
5. **Select** — action + button with dropdown menu (language)
6. **Info** — action + nothing (current session, display-only)

### The Description Consistency Fix

During iteration, description text was appearing in different places depending on the variant — below the label for action rows, inline on the right for navigation rows, not shown at all for field rows. This created visual inconsistency across the settings UI.

The fix was simple: **description always goes below the label, on the left side, for every variant.** The right side is always and only the interaction element. One rule, no exceptions. This made the system predictable — you always know where to look for context (below the label) and where to look for what you can do (on the right).

---

## Row Action Patterns: The Button Decision

One of the hardest design decisions was how to handle actions on list items (device sessions, connected accounts, invites). Three options were evaluated:

**Icon buttons** — Compact, but most icons are ambiguous. An X could mean close, delete, remove, cancel, or revoke. A circular arrow could mean refresh, retry, undo, or resend. Users shouldn't need to hover for a tooltip to understand what a button does. The pencil icon is a rare exception — it maps to "edit" across virtually every application.

**Overflow menu (ellipsis)** — Clean rows, labeled items inside the menu. But an extra click to discover and execute. Actions feel hidden. Bad for primary actions — a device session row exists so you can revoke it. Hiding "Revoke" behind an ellipsis defeats the purpose.

**Text buttons** — Immediately clear, single click, no interpretation needed. Adds visual weight, but the clarity tradeoff is worth it. A user scanning a device list should immediately see "Revoke" without hovering or clicking.

Decision: **text buttons for list item actions.** Icon buttons only for universally understood icons (pencil = edit, download arrow = export). Overflow menus only for secondary multi-action rows where a primary button already exists (member rows with "Change role" + "Remove from workspace").

### Button Styling

The button variant went through several tries:
- `secondary small` — clear affordance via border, compact
- `secondary medium` — more clickable, but too prominent
- `tertiary medium` — too subtle, no clear affordance
- `ghost medium` — cleanest look, but color-blind users can't distinguish it from static text

Landed back on **`secondary small`**. The border provides a structural cue that doesn't depend on color perception. This aligns with the same principle behind choosing text buttons over icon buttons: clarity over cleanliness.

---

## Select as a Button

The language selector originally used a native `<Select>` dropdown component. This looked visually inconsistent with the other action row buttons — different height, different border style, different interaction model.

The fix: replace the Select trigger with a secondary button showing the current value + a down caret (`CaretSmallDownIcon`), opening a Menu dropdown on click. Now the language "select" is visually identical to every other action row button. The interaction is the same (click → pick from options), but the visual language is unified.

---

## Close Account: Single-Page Consolidation

The close account flow originally used a multi-step wizard: review screen → confirmation screen, with a "Continue" button connecting them. This was confusing — users didn't realize there were multiple steps, and the "Continue" button drew too much attention to a destructive path.

Consolidated into a single page: consequence text, an inline data export link, and the deletion form (code + acknowledgment + delete button). Export data was originally a separate subpage with per-product download buttons, then horizontal cards, but ultimately became an inline link ("request a data export") that triggers a toast on the scrim — the most compact option that doesn't clutter the destructive flow.

### Deletion Code: Why Numeric, Not a Phrase

Three formats were evaluated for the emailed verification code:

- **6-digit numeric code** (e.g. "583 291") — familiar 2FA pattern, users immediately recognize it as a verification code
- **Random word phrase** (e.g. "coral-sunset-bridge") — easier to type, no number/letter ambiguity, used by Stripe and Heroku
- **Typed confirmation** (e.g. "delete my account") — reinforces the action, but doesn't require email verification

The word phrase and numeric code are equally secure — both are one-time tokens validated server-side with rate limiting and expiry. The security doesn't depend on the format being hard to guess.

Decision: **6-digit numeric code.** 2FA trained users to expect numeric codes for email verification. A word phrase, while technically equivalent, looks unfamiliar in this context and may make users question whether the flow is legitimate. Perceived security matters as much as actual security for destructive actions.

---

## Sign-In Architecture

The sign-in page evolved from a standalone page to an iframed component:

**Before:** Sign out navigated to `id.localhost` — a full page transition. Signing back in navigated to `home.localhost`. Two full page loads to switch state.

**After:** Sign out stays on `home.localhost`. The avatar changes to a signed-out state (generic user icon + "Sign in" label). Clicking it opens `id.localhost` in an iframed modal (same pattern as the settings modal). The sign-in page detects it's iframed and uses `postMessage` to communicate back. No full page transitions.

The sign-in page shows 3 demo accounts (Free, Pro, Enterprise) that replaced the original DemoControls floating panel. This killed two birds: removed a dev-only UI element and made plan switching part of the actual user flow.

---

## What I Shipped and How I Shared It

Created a Loom walkthrough and pushed the prototype to GitHub. Sent the repo + Loom link to the backend and frontend engineers for feedback, specifically asking for input on:
- The subdomain separation model
- The row system abstraction
- Anything that feels off from an implementation standpoint

The prototype is functional — you can run it locally (`npm install && npm run dev`), switch between plans by signing in as different accounts, open settings in the iframed modal, navigate all the settings sections, and see the component reference at `components.localhost`.

---

## Principles That Guided Everything

1. **Build the system, not the screens.** Every row, every action, every layout decision was made at the system level first, then applied to specific screens. The component reference page exists to prove the system works independently of any specific content.

2. **Research before invention.** The Northbase heuristic audit happened before any code was written. Patterns were adopted from what works across products, not invented from scratch.

3. **Iterate toward simplicity.** The row system started with 5 variants and ended with 2. The close account flow started as 2 pages and ended as 1. The sign-in started as a page navigation and ended as an iframe. Each iteration removed complexity.

4. **Consistency over cleverness.** Description always below the label. Buttons always secondary with borders. No special cases for "this one row" — if a pattern can't be applied everywhere, it's the wrong pattern.

5. **Accessibility is structural.** Choosing bordered buttons over ghost buttons isn't an aesthetic preference — it's ensuring that the "this is interactive" signal doesn't depend on color perception. Choosing text buttons over icon buttons isn't about style — it's about not requiring a tooltip hover to understand what something does.

---

## Links

- **Repo:** https://github.com/robertkenner1/superhuman-settings-proto
- **Loom walkthrough:** https://www.loom.com/share/d271afa2955b4048b66b3ccec9000135
- **Next steps:** `docs/next-steps.md`
- **Row action pattern tradeoffs:** `docs/row-action-patterns.md`
- **Admin implementation plan:** `docs/admin-implementation-plan.md`
- **Heuristic research:** `docs/permission-access-control.md`
