# Superhuman Settings Framework

## Problem

Today, settings are fragmented. The Super Admin Portal handles workspace-level admin settings, but there's no unified experience for personal account settings, and no clear framework for how settings from multiple products (Grammarly, Coda, Superhuman Mail) should be organized under the superhuman.com umbrella.

The Identity team needs a comprehensive vision for how settings are structured, what lives where, and — critically — which settings require elevated security protections.

## Current state

- **Super Admin Portal** — standalone page, admin-level workspace settings only
- **Individual products** — each maintains its own settings (Grammarly, Coda, Superhuman Mail)
- **Superhuman account data is minimal** — when a user creates a superhuman.com account, we currently store their email and optionally a password. We may not capture their name or other profile info yet, though this is starting to change. Most personal profile data still lives in the individual products.
- **No unified personal settings** — account info, security, preferences have no shared home
- **No security isolation** — privileged identity operations (password, MFA) are not separated from low-risk settings

## Proposed framework

Settings fall into four levels, each with different audiences and permissions:

| Level | Who can change | Examples |
|---|---|---|
| **Individual** | The user themselves | Profile, email, password, MFA, preferences, connected accounts |
| **Product** | The user, within a specific product | Grammarly writing style, Coda doc defaults, Mail signature |
| **Team** | Team admins | Member management, team-level feature toggles, billing |
| **Org** | Org admins | SSO/SAML, org-wide policies, cross-team settings |

## Security layer

Not all settings are equal. The Identity team requires that each setting lives at the right level of security. The deciding question: **could this change affect login, recovery, or ownership in a way that enables account takeover or lockout?**

### Privileged identity operations → `accounts.*`

Isolated domain, stricter CSP, step-up authentication required.

- Password change / reset
- MFA enroll / disable / change method
- Recovery email (add/change/remove)
- Account deletion
- Session revocation ("log out other devices")
- Account unlinking (disconnecting identity providers or critical auth links)
- Primary email change

### Non-privileged settings → `settings.*`

Standard domain, normal CSP, no step-up auth needed.

- Display name, avatar
- Notification preferences
- UI preferences, themes
- Signature, aliases (if they don't affect login/recovery)
- Integrations that aren't auth-critical
- Workspace/product configuration

## Subdomain architecture (prototyping)

This repo is a working prototype exploring how settings could be split across subdomains under superhuman.com. The current routes:

| Subdomain | Purpose |
|---|---|
| `home.*` | App shell — hosts the universal nav and iframes settings as a modal overlay |
| `settings.*` | Non-privileged settings panel (iframed) — profile display info, preferences, workspace config |
| `account.*` | Standalone pages for individual account settings, including privileged operations |
| `admin.*` | Workspace admin — members, billing, workspace-level settings |
| `id.*` | Sign-in / authentication |

The key architectural idea is that **privileged identity operations live on `accounts.*`** with stricter CSP and step-up auth, while **everything else stays on `settings.*`** where third-party analytics, tracking, and integrations can run without creating security risk. The settings panel can link out to `accounts.*` when the user needs to do something sensitive.

This prototype uses `*.localhost` subdomains locally and path-based routing (`/home`, `/settings`, etc.) on Vercel.

## Design language

Spacing, component rules, border treatment, interaction states, and page structure are documented in **[DESIGN-LANGUAGE.md](./DESIGN-LANGUAGE.md)**. That file is the authoritative reference for how settings UI is built — all changes to the app should be rooted in those rules.

## Open questions

1. **New products or re-skins?** Are SH 1.0 products being rebuilt or re-skinned? If re-skinned, each product likely keeps its own settings and we surface a subset in the shared experience. If rebuilt, we may consolidate more aggressively.

2. **Which product-level settings belong in the unified experience?** We need a full feature inventory from each product team to decide what gets pulled into the shared settings vs. what stays product-specific.

3. **What's in scope for SH 1.0?** Which of these levels and features ship with the launch vs. come later?

4. **Universal navigation** — is anyone else working on a global nav / profile icon that could house the settings entry point across all superhuman.com subdomains?

5. **Team vs. org distinction** — do all products support both levels, or do some only have one?

## Stakeholders to align with

- **Identity team** — security framework, privileged operations, auth flows
- **Product teams** (Grammarly, Coda, Mail) — which product settings to surface
- **SH 1.0 program leads** — scope and timeline
- **Platform/infra** — subdomain architecture, CSP policies

## Next steps

- [ ] Inventory all settings across products, categorized by level (individual / product / team / org)
- [ ] Map each setting to its security tier (privileged vs. non-privileged)
- [ ] Confirm SH 1.0 scope — which settings ship at launch
- [ ] Align on navigation pattern — universal profile icon + settings entry point
- [ ] Share framework with Identity team for review
