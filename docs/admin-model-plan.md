# Admin Model Plan

Based on UXR findings from "Admins in the World of AI Tooling" (Feb 2026, Raajat Gupta).

## Admin Segments

The research identifies 5 admin personas across two axes: org size and enforcer/enabler focus.

### The Generalist (SMB, <250 FTEs)
- IT admin and functional lead are the same person
- Prioritizes speed/velocity, under pressure to be frugal and safe
- Needs to unblock teams without creating liability

### The Gatekeeper (Mid-market, 250-5K FTEs, Enforcer)
- IT/security leaders centralizing control
- Investigates shadow IT and risky actions
- Enforces security/compliance while the org wants to "move fast"

### The Rebel (Mid-market, 250-5K FTEs, Enabler)
- Functional leaders driving innovation and ROI
- Handcuffed by rigid IT ticketing systems
- Fights to administer their own tools faster

### The Ruler (Enterprise, 5K+ FTEs, Enforcer)
- Infrastructure leaders managing global settings
- Wants to delegate control to functional leads safely
- Fears loosening the reins will create security holes

### The Custodian (Enterprise, 5K+ FTEs, Enabler)
- Team leads optimizing AI tools for their teams
- Loves the federated model but acknowledges teams can be reckless
- Goes under the hood to customize tools for team needs

---

## Unmet Needs by Segment

### Generalist
- **ROI Black Box**: Needs "hours saved" metrics, not vanity stats like "tokens used"
- **Partner Onboarding Friction**: Needs to grant external contractors secure access without IT tickets
- **Automated Content Guardrails**: Needs Brand Voice and safety enforcement without manual policing
- **Swivel Chair Fatigue**: Needs a superuser dashboard to manage settings across disjointed tools

### Gatekeeper
- **Forensic Blind Spots**: Needs deep audit logs to reconstruct events during investigations
- **Productivity Black Box**: Needs credible productivity data, not vague metrics
- **Control vs. Bandwidth**: Needs granular controls but lacks time to manage them (e.g., finding zombie users)
- **Inability to Idiot-Proof**: Needs to globally disable risky modalities (e.g., image generation) at scale

### Rebel
- **Federated Autonomy**: Needs self-service control over their team without submitting IT tickets
- **Efficient Feature Gating**: Needs to restrict expensive features (e.g., Agents) to experts, not all-or-nothing
- **Integration of Team Standards**: Needs a hub for voice, templates, and data syncs matching team standards
- **Justifying Expenditures**: Needs outcome data to defend budget to Finance/IT, not salesy login stats

### Ruler
- **Out-of-the-Box Automation**: Manual management at 10K+ users is impossible; needs smart automation
- **Safer AI Playgrounds**: Needs active alerting for suspicious activity (e.g., PII uploads)
- **Cutting Through Vanity Metrics**: Needs departmental chargebacks and granular efficiency data for the CFO
- **Tooling Fragmentation**: Needs a "single pane of glass" to apply settings consistently across tools

### Custodian
- **Black Box of Logic**: Needs model transparency (weights, sources) to debug and trust output
- **Settings Inheritance Straitjacket**: Frustrated by global "base class" settings blocking team-level customization
- **Team Moderation Issues**: Needs per-sub-group restrictions (not all-or-nothing switches)
- **Usage != Value**: Rejects token usage metrics; needs proof of "force multiplication"

---

## Go-Forward Principles

1. **Enable the Federated Model** - Central IT owns compliance/security laws; functional leads own operations within those laws
2. **Tailor Trust Signals to the Audience** - Central IT needs data governance; functional leads need model output insight
3. **Replace Vanity Metrics with Value Metrics** - Hours saved, work done, licensing optimization opportunities
4. **Support Swim Lane Products** - Templates and customizations that make AI collaborators legitimately useful
5. **Automate the Admin Workload** - User access, suspicious activity investigation, guardrail creation

---

## Features to Build

### Tier 1: Workspace Settings (Pro)
Settings available to workspace admins on the Pro plan.

- [ ] **Members & Roles** - Invite, remove, assign roles (admin/member/viewer)
- [ ] **Feature Gating** - Toggle AI features per workspace (e.g., Agents, image generation)
- [ ] **Content Guardrails** - Brand Voice enforcement, safety rules, output restrictions
- [ ] **Usage Overview** - Hours saved, tasks completed, active users (value metrics not vanity)
- [ ] **Billing & Licensing** - Plan management, seat management, payment method
- [ ] **Team Templates** - Shared prompts, workflows, and customizations
- [ ] **Activity Log** - Basic audit trail of admin actions and user activity

### Tier 2: Organization Settings (Enterprise)
Additional settings for enterprise orgs with centralized IT.

- [ ] **Settings Inheritance** - Org-level policies that cascade to workspaces with lock/unlock controls
- [ ] **Federated Delegation** - Grant team leads admin access to their workspace without full org access
- [ ] **Security Policies** - SSO enforcement, MFA requirements, data retention rules, IP allowlists
- [ ] **Advanced Audit Logs** - Forensic-level logs with search, filters, export, and event reconstruction
- [ ] **Active Alerting** - Notifications for suspicious activity (PII uploads, unusual access patterns)
- [ ] **AI-Specific Controls** - Model selection per workspace, data sharing toggles, third-party integration approvals
- [ ] **Departmental Metrics** - Per-team usage, chargebacks, ROI reporting for CFO/Finance
- [ ] **Compliance Dashboard** - Regulatory status, data residency, compliance certifications

### Tier 3: Cross-Product Admin Hub
Settings that span across products (Superhuman, Coda, Grammarly).

- [ ] **Unified User Management** - Single view of users across all products with lifecycle management
- [ ] **Cross-Product Policies** - Security and compliance rules that apply across the suite
- [ ] **Consolidated Metrics** - Aggregated ROI and usage data across all products
- [ ] **Single Sign-Out / Session Management** - Revoke access across all products simultaneously

---

## Admin View Differentiation

The admin experience should adapt based on the viewer's role:

| Setting Area | Central IT (Gatekeeper/Ruler) | Team Lead (Rebel/Custodian) |
|---|---|---|
| Security policies | Full control | Read-only / inherited |
| Feature toggles | Org-wide defaults | Team-level overrides (within bounds) |
| Audit logs | Full forensic access | Team-scoped activity |
| Metrics | Org-wide, departmental | Team-specific |
| User management | Full lifecycle | Add/remove within their team |
| AI controls | Global model/feature selection | Team customization within policy |

---

## Subdomain Architecture

| Subdomain | Content |
|---|---|
| `id.` | Sign-in / authentication |
| `home.` | Main app shell |
| `settings.` | Settings overlay (iframed into home) |
| `account.` | Account-level settings (profile, preferences, security) |
| `admin.` | Workspace and org admin settings (features above) |
