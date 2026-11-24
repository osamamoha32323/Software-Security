# ⚔️ Security Assessment & Attack Demonstration Plan (Phase 1)
**CET431 - Software Security | Fall 2026**  
**Department of Computer Engineering Technology**  
**Elsewedy University of Technology - Polytechnic of Egypt**  
**Application Under Test:** SecureShop E-Commerce System  
**Developer & Evaluator:** Osama Mohamed Moawad Zaytoun (Student ID: 230105355)  
**Submission Mode:** Individual Project Implementation (Course standard team size: 6; subject to instructor approval)  
**Evaluation Milestone:** Week 10 Oral Discussion  

---

## 1. Executive Summary

This Security Assessment Report documents the attack demonstration plan and comparative security evaluation designed for **SecureShop** in course CET431. The project was designed, implemented, and tested individually by Osama Mohamed Moawad Zaytoun.

To satisfy the academic requirement to *"show that the attack works against a naive baseline and fails against your own"*, seven primary security topics were selected for empirical demonstration. Each finding contrasts an unhardened baseline (naive implementation) with the defensive controls implemented in the Phase 1 codebase. Formal, independent penetration testing is planned as a dedicated Phase 2 objective.

---

## 2. Assessment Scope & Methodology

### 2.1 Scope
The scope of comparative testing encompasses all primary user-facing and administrative interfaces:
- User Registration, Login, and Account Confirmation workflows.
- Product catalog querying, keyword search, and reviews.
- Shopping cart state manipulations, quantity updates, and calculations.
- Promotional coupon redemption and newsletter mechanisms.
- Order placement, Store Credit financial ledger, and order tracking.
- User profile updates and personal order histories.
- Administrative panel access and privilege boundaries.

### 2.2 Methodology
The testing methodology references the **OWASP Web Security Testing Guide (WSTG)** and the **OWASP Top 10 (2021)** framework, utilizing:
- Manual request inspection and parameter tampering.
- Boundary condition and edge-case fuzzing.
- Privilege escalation testing across role boundaries.
- Cross-user authorization validation (IDOR).
- Automated script-based brute-force simulation.

---

## 3. Vulnerability Summary Dashboard

| Finding ID | Vulnerability Title | Category (OWASP) | Initial Severity (CVSS v3.1) | Implemented Defense Status |
|:---:|:---|:---|:---:|:---:|
| **RT-01** | Cross-Site Scripting (Reflected & Stored) | Injection (A03) | **High (7.5)** | ✅ Implemented (Client Entity Encoding) |
| **RT-02** | Search Parameter Query Injection | Injection (A03) | **High (8.2)** | ⚠️ Partially Implemented (Keyword Check) |
| **RT-03** | Missing Rate Limiting & Brute-Force | Auth Failures (A07) | **High (7.8)** | ✅ Implemented (PBKDF2 + 60s Lockout) |
| **RT-04** | IDOR Order Data Disclosure | Broken Access Control (A01) | **High (7.7)** | ⚠️ Partially Implemented (Client Check; DB RLS Needed) |
| **RT-05** | Negative Quantity Price Tampering | Insecure Design (A04) | **High (7.4)** | ⚠️ Partially Implemented (Pre-save Validation) |
| **RT-06** | Promotional Coupon Replay Abuse | Insecure Design (A04) | **Medium (5.3)** | ✅ Implemented (usedByUsers Tracking in DB) |
| **RT-07** | Admin Panel Privilege Escalation | Broken Access Control (A01) | **Critical (9.1)** | ⚠️ Partially Implemented (Client RBAC View Guard) |

---

## 4. Detailed Comparative Demonstration Findings

### Finding RT-01: Cross-Site Scripting (XSS)
- **CVSS v3.1 Base Score:** 7.5 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The search query and customer input fields rendered directly into the HTML document without entity escaping, enabling arbitrary JavaScript execution in victim browsers.
- **Proof of Concept:**
  ```html
  <script>alert(document.domain)</script>
  ```
- **Naive Baseline Behavior:** In naive mode, injecting this payload triggered an immediate script execution popup.
- **Implemented Remediation:** Built an entity-encoding sanitizer (`sanitizeHtml`) in `src/security/securityService.ts` that safely escapes all special characters before DOM rendering, backed by native React JSX escaping.
- **Verification & Limitations:** Re-test showed the payload renders strictly as safe literal text. *Limitation:* Client-side only; full defense requires HTTP Content-Security-Policy (CSP) headers.

---

### Finding RT-02: Search Parameter Query Injection
- **CVSS v3.1 Base Score:** 8.2 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N`)
- **Vulnerability Description:** Search strings were passed into filter logic without pattern filtering, allowing SQL metacharacters (`'`, `--`, `UNION SELECT`) to alter query logic.
- **Proof of Concept:**
  ```sql
  ' OR '1'='1' --
  ```
- **Naive Baseline Behavior:** Injecting tautologies altered filter bounds in the naive implementation.
- **Implemented Remediation:** Implemented `validateSearchQuery` which performs regex keyword matching, intercepts common SQL keywords, and triggers security audit events.
- **Verification & Limitations:** *Limitation:* Client-side keyword filtering alone is not sufficient SQL injection protection; Supabase parameterizes queries via PostgREST, but client-side regex is an input check only.

---

### Finding RT-03: Missing Rate Limiting on Authentication
- **CVSS v3.1 Base Score:** 7.8 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The authentication endpoint accepted unlimited rapid password attempts, leaving user accounts susceptible to credential stuffing and automated dictionary attacks.
- **Proof of Concept:** Submitted consecutive automated login requests with incorrect passwords.
- **Implemented Remediation:**
  1. Implemented account lockout threshold: after 5 failed attempts, the target account is locked for 60 seconds.
  2. Upgraded password storage to PBKDF2 with SHA-256 (100,000 iterations) and 16-byte random salts.
- **Verification & Limitations:** After 5 attempts, login is blocked with an interactive lockout countdown timer. *Limitation:* Lockout is tracked on the user database record; true distributed defense requires edge/API rate limiting.

---

### Finding RT-04: Insecure Direct Object Reference (IDOR)
- **CVSS v3.1 Base Score:** 7.7 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The order tracking facility accepted any order identifier (e.g. `#DK-1001`) and displayed the associated invoice without verifying whether the requesting user owned the order.
- **Proof of Concept:** User `user@secureshop.edu` requested tracking details for order `#DK-1001` belonging to a third-party customer.
- **Naive Baseline Behavior:** Naive mode returned the victim's full shipping address, mobile phone number, and items purchased.
- **Implemented Remediation:** Added object-level authorization in `validateOrderAccess` ensuring `order.userId === currentUser.id` or `currentUser.role === 'admin'`.
- **Verification & Limitations:** Unauthorized lookups return `403 Forbidden: IDOR attempt blocked` in the UI. *Limitation:* Browser-side check only; direct PostgREST access requires database Row Level Security (RLS) enforcement in Phase 2.

---

### Finding RT-05: Business Logic Flaw: Negative Quantity Exploit
- **CVSS v3.1 Base Score:** 7.4 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N`)
- **Vulnerability Description:** The cart drawer accepted negative numerical inputs (e.g. `-5`), which decreased the total order balance below zero.
- **Proof of Concept:** Added 1 unit of product A (300 EGP) and -2 units of product B (200 EGP each), yielding a negative subtotal of -100 EGP.
- **Implemented Remediation:** Built numerical boundary validation in `validateCartQuantity` enforcing positive non-zero integers bounded by real-time stock limits.
- **Verification & Limitations:** Entering negative or fractional quantities is blocked with an immediate validation alert, clamping quantity to 1. *Limitation:* Pre-save client validation; database constraints (`CHECK (quantity > 0)`) planned for Phase 2.

---

### Finding RT-06: Promotional Coupon Replay Attack
- **CVSS v3.1 Base Score:** 5.3 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`)
- **Vulnerability Description:** Promotional coupon `WELCOME15` could be applied repeatedly across unlimited separate orders by the same user.
- **Proof of Concept:** Placed Order 1 with `WELCOME15`, then attempted to apply `WELCOME15` again on Order 2 within the same account session.
- **Implemented Remediation:** Implemented persistent redemption tracking via `usedByUsers` on every coupon record stored in Supabase PostgreSQL.
- **Verification & Limitations:** Subsequent redemption attempts display: `Coupon Replay Blocked: Already redeemed by this account`. *Limitation:* Concurrent race conditions require atomic database transaction locks.

---

### Finding RT-07: Broken Access Control & Privilege Escalation
- **CVSS v3.1 Base Score:** 9.1 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- **Vulnerability Description:** Non-administrative accounts could switch views to `/admin` and manipulate system configurations because access control was only enforced via client-side button visibility.
- **Proof of Concept:** Logged in as standard customer `user@secureshop.edu` and triggered the admin view state.
- **Naive Baseline Behavior:** Naive mode rendered the complete management dashboard, allowing price edits and user deletions.
- **Implemented Remediation:** Embedded an authoritative **RBAC Guard** at the root of `AdminDashboard.tsx`, validating `currentUser.role === 'admin'`.
- **Verification & Limitations:** Non-admin attempts trigger an immediate `403 Access Denied` barrier with audit logging. *Limitation:* Browser-side view guard only; direct PostgREST API access requires PostgreSQL RLS policies.

---

## 5. Conclusion & Submission Record

The comparative attack demonstrations and defensive mitigations implemented in Phase 1 provide a solid foundation for evaluating software security principles in course CET431.

- **Developer & Evaluator:** Osama Mohamed Moawad Zaytoun
- **Student ID:** 230105355
- **Academic Course:** CET431 — Software Security
- **Department:** Computer Engineering Technology, Elsewedy University of Technology
- **Phase 1 Status:** Ready for Week 10 Oral Evaluation
