# Anti-Patterns & Missed Opportunities

Things I got wrong, suggested poorly, or should have caught proactively during this build. Each entry documents what happened, why it was wrong, and what I should have done instead. This is a reference for building better defaults.

---

## 1. Disabled Button Instead of Validation on Submit

**What happened:** Used `isDisabled={!canDelete}` on the "Delete my account" button, gating it behind filled inputs.

**Why it's wrong:** Disabled buttons are an accessibility failure. Screen readers can't focus them, sighted users get no feedback about *why* it's disabled, and there's no path to resolution. The user had to ask "from an accessibility perspective, i know that's preferred right?" — I should have known this upfront.

**What I should have done:** Always-enabled button → validate on click → show inline `errorMessage` on the fields that failed → focus the first error. This is the standard accessible form pattern.

---

## 2. Manual Form Layout Instead of Origin's Form Component

**What happened:** Built the deletion form with raw `<div>`s, inline `flexDirection: 'column'`, and manual `gap` values instead of using Origin's `Form`, `FormRow`, and `FormFooter` components.

**Why it's wrong:** Origin's Form handles spacing, semantic structure (`<form>`, `<fieldset>`), and consistent rhythm automatically. Rolling my own meant inconsistent spacing and missing semantics. The user had to ask "do you have knowledge of the origin form pattern?"

**What I should have done:** Check the design system for form patterns before building any form layout manually. Always prefer the system's form components over custom div wrappers.

---

## 3. Hidden TextField Label

**What happened:** Set `labelDisplay="hidden"` on the verification code TextField because the paragraph above already mentioned the code.

**Why it's wrong:** Origin's Form pattern expects visible labels on inputs. The paragraph above is context, not a label — it won't be associated with the input for assistive technology in the way a `<label>` is. Hiding the label loses a structural cue that helps all users scan the form.

**What I should have done:** Keep the label visible. Redundancy between contextual copy and a form label is fine — they serve different purposes. The paragraph explains, the label identifies.

---

## 4. Ghost Button Suggestion

**What happened:** Offered ghost buttons (`variant="ghost"`) as an option for row action buttons during the button styling iteration.

**Why it's wrong:** Ghost buttons have no border or background — the only signal that they're interactive is color. Color-blind users can't distinguish a ghost button from static text. The user caught this: "color blind users may not tell the diff between the first variation and a button without a border."

**What I should have done:** Never suggest ghost buttons for primary actions without immediately flagging the accessibility tradeoff. Bordered buttons (`variant="secondary"`) provide a structural affordance that doesn't depend on color perception.

---

## 5. Raw `<button>` Instead of Origin's Link Component

**What happened:** Built the "request a data export" inline link as a `<button>` with manual inline styles (`background: 'none', border: 'none', color: 'var(--color-text-accent-default)', textDecoration: 'underline'`).

**Why it's wrong:** Origin has a `Link` component with built-in accessibility, consistent styling, variant support (`primary`, `secondary`, `inherit`), and underline options. Using a raw button meant reimplementing what the system already provides, and missing semantic meaning (a link that triggers an action vs. a button styled as a link).

**What I should have done:** Check Origin's component library for a Link component before writing custom styled buttons. Always prefer system components over manual implementations.

---

## 6. Didn't Clean Up Unused Imports Proactively

**What happened:** After removing the export data cards, `FileArrowDownIcon` and `CLOSE_ACCOUNT_PRODUCTS` became unused. I only caught them when the TypeScript compiler flagged errors.

**Why it's wrong:** Leaving dead imports adds noise and signals inattention. The user called it out: "you should be proactive about that."

**What I should have done:** Every time I remove or replace a component, immediately check whether its imports are still used. Don't wait for the compiler.

---

## 7. Subdued Text Color for Important Instructions

**What happened:** Used `color="base-subdued"` for the verification code instructions ("We sent a 6-digit verification code...").

**Why it's wrong:** This is critical instructional text — it tells the user what to do and that there's a time limit. Subduing it visually deprioritizes it. The user asked "why's it subdued.. make it default."

**What I should have done:** Default text color for instructions the user needs to act on. Subdued is for supplementary/secondary information, not action-required content.

---

## 8. Didn't Check for Purpose-Built Components

**What happened:** Used a generic `TextField` for the verification code input. Origin has a dedicated `VerificationCode` component with `numberOfDigits`, `type`, and proper semantics for one-time codes.

**Why it's wrong:** The user had to ask "we have a verification code component in origin available.. is it suitable for this?" I should have searched Origin's exports before defaulting to TextField.

**What I should have done:** Before using a generic input for a specific use case (verification codes, search, passwords), always search the design system for a purpose-built component. `VerificationCode`, `SearchField`, `TextField` with `type="password"` — these exist for a reason.

*Note: We ended up reverting to TextField because the 6-box input felt too prominent for this context. But I should have surfaced the option proactively and let the user decide.*

---

## 9. Over-Explaining in Copy (Verification Code Paragraph)

**What happened:** Wrote "We sent a 6-digit verification code (0–9) to bobby@kenner.com. Enter it below to confirm account deletion. The code expires in 10 minutes." — dense, technical, and included "enter it below" language.

**Why it's wrong:** The input sits right below the text — visual proximity handles "enter it below." The digit range (0–9) is useful for accessibility but the overall sentence was doing too much: what happened + what it's for + how to use it + when it expires, all in one breath.

**What I should have done:** Separate concerns. The paragraph says the code was sent and when it expires. The label identifies the input. Let each element do its job instead of cramming everything into copy.

---

## 10. Inconsistent Description Placement Across Row Variants

**What happened:** During the row system build, description text appeared below the label for action rows, inline on the right for navigation rows, and not at all for field rows.

**Why it's wrong:** Inconsistent placement means users can't build a mental model of where to find information. The user spotted it: "I see lot of inconsistency."

**What I should have done:** Establish the rule first — description always below the label, for every variant — then build the components. Consistency should be the starting constraint, not an afterthought.

---

## 11. Defaulting to "Destructive = Scary" for Delete/Sign Out

**What happened:** I didn't flag this during the build, but my instinct would have been to suggest red/danger button variants for "Delete my account," visually burying "Delete account" and "Sign out" in the nav, or adding extra friction layers to make these paths feel heavier than other settings.

**Why it's wrong:** This is a dark pattern disguised as best practice. The industry standard of making destructive actions red, buried, and scary isn't protecting users — it's discouraging them from exercising a legitimate choice. It treats leaving as something the product should resist rather than respect.

**The intentional counter-decision:** Destructive actions in this prototype use the same visual language as every other action. "Delete account" sits in the nav alongside "Profile" and "Preferences" — not banished to a "Danger Zone." The delete button is `variant="primary"`, not red. The copy is calm and informational, not threatening. Sign out is a normal menu item, not a guilt trip.

**The principle:** If a user wants to delete their account, the product's job is to make sure they understand what will happen (consequence disclosure) and confirm their intent (verification code + acknowledgment). It is *not* the product's job to make the experience unpleasant so they reconsider. Respect the user's decision. A calm offboarding is better for trust than a hostile one — and more likely to bring them back.

---

## General Lessons

1. **Challenge the default before shipping it.** My instinct throughout this build was to reach for the quick, visually-sufficient option — disabled buttons, raw divs, hidden labels, ghost buttons, manual styled links, subdued text. Every time, the designer had to pull me toward the principled choice. The lesson: "works visually" is not the bar. Before committing to any pattern, ask: does the design system have a component for this? Is this accessible? Is this consistent with the system's principles? Am I doing this because it's right, or because it's easy? If I'm not the one asking those questions, I'm creating work for the person reviewing me.

2. **Search the design system first.** Before building anything manually, check if the system has a component for it. This applies to Form, Link, VerificationCode, and any pattern that seems like it would exist in a mature design system.

3. **Accessibility is not an optimization.** Disabled buttons, hidden labels, ghost buttons, subdued instructional text — these are all accessibility regressions, not style choices. Surface the tradeoff immediately, don't wait to be asked.

4. **Clean up after yourself.** When you remove or replace something, trace its dependencies. Unused imports, orphaned CSS classes, dead constants — remove them in the same edit.

5. **Let the system handle rhythm.** If the design system has form spacing, use it. Manual `gap` values on wrapper divs will always drift from the system's standards.

6. **Separate concerns in copy.** Labels label. Paragraphs explain. Placeholders hint at format. Don't make one element do three jobs.

7. **Don't assume industry defaults are correct.** Red destructive buttons, buried delete links, scary warning language — these are conventions, not principles. They can be dark patterns disguised as best practice. When a designer makes an unconventional choice (calm delete flow, no danger zone), understand the reasoning before pushing back toward the default.
