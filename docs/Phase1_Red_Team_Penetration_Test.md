# ⚔️ Red Team Penetration Testing Report (Phase 1)
**CET431 - Software Security | Fall 2026**  
**Department of Computer Engineering Technology**  
**Elsewedy University of Technology - Polytechnic of Egypt**  
**Application Under Test:** SecureShop E-Commerce System  
**Assessment Team:** Red Team Sub-Group (3 Members)  
**Defending Team:** Blue Team Sub-Group (3 Members)  
**Assessment Window:** Week 8 - Week 9  

---

## 1. Executive Summary

During Phase 1 of the CET431 Software Security project, the Red Team conducted a comprehensive security assessment and penetration test targeting the initial build of the **SecureShop** e-commerce platform. The objective was to emulate real-world adversary tactics, identify potential security flaws across all eight functional areas, and provide actionable findings to the Blue Team for defensive hardening.

The initial penetration test identified **7 primary vulnerabilities** ranging from Critical to Medium severity on the unhardened baseline. Following the assessment window, the Red Team collaborated with the Blue Team during the fix cycle. All 7 findings were re-tested against the final Phase 1 submission and verified to be **completely mitigated**.

---

## 2. Assessment Scope & Methodology

### 2.1 Scope
The scope of penetration testing encompassed all endpoints, request parameters, forms, and administrative panels:
- User Registration, Login, and Account Confirmation workflows.
- Product catalog querying, keyword search, and reviews.
- Shopping cart state manipulations, quantity updates, and calculations.
- Promotional coupon redemption and newsletter mechanisms.
- Order placement, Store Credit financial ledger, and order tracking.
- User profile updates and personal order histories.
- Administrative panel access and privilege boundaries.

### 2.2 Methodology
The testing methodology adhered to the **OWASP Web Security Testing Guide (WSTG)** and the **OWASP Top 10 (2021)** framework, utilizing:
- Manual request inspection and parameter tampering.
- Boundary condition and edge-case fuzzing.
- Privilege escalation testing across role boundaries.
- Cross-user authorization validation (IDOR).
- Automated script-based brute-force simulation.

---

## 3. Vulnerability Summary Dashboard

| Finding ID | Vulnerability Title | Category (OWASP) | Initial Severity (CVSS v3.1) | Blue Team Status |
|:---:|:---|:---|:---:|:---:|
| **RT-01** | Cross-Site Scripting (Reflected & Stored) | Injection (A03) | **High (7.5)** | ✅ RESOLVED |
| **RT-02** | Search Parameter Query Injection | Injection (A03) | **High (8.2)** | ✅ RESOLVED |
| **RT-03** | Missing Rate Limiting & Brute-Force | Auth Failures (A07) | **High (7.8)** | ✅ RESOLVED |
| **RT-04** | IDOR Order Data Disclosure | Broken Access Control (A01) | **High (7.7)** | ✅ RESOLVED |
| **RT-05** | Negative Quantity Price Tampering | Insecure Design (A04) | **High (7.4)** | ✅ RESOLVED |
| **RT-06** | Promotional Coupon Replay Abuse | Insecure Design (A04) | **Medium (5.3)** | ✅ RESOLVED |
| **RT-07** | Admin Panel Privilege Escalation | Broken Access Control (A01) | **Critical (9.1)** | ✅ RESOLVED |

---

## 4. Detailed Penetration Testing Findings

### Finding RT-01: Cross-Site Scripting (XSS)
- **CVSS v3.1 Base Score:** 7.5 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The search query and customer input fields were rendered directly into the HTML document without entity escaping, enabling arbitrary JavaScript execution in victim browsers.
- **Proof of Concept:**
  ```html
  <script>alert(document.domain)</script>
  ```
- **Red Team Attack Evidence:** In the naive mode, injecting this payload triggered an immediate script execution popup.
- **Blue Team Remediation:** Built an entity-encoding sanitizer (`sanitizeHtml`) in `src/security/securityService.ts` that safely escapes all special characters before DOM rendering.
- **Verification:** Re-test showed the payload renders strictly as safe literal text. **Mitigation Verified.**

---

### Finding RT-02: Search Parameter Query Injection
- **CVSS v3.1 Base Score:** 8.2 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N`)
- **Vulnerability Description:** Search strings were passed into filter logic without pattern filtering, allowing SQL metacharacters (`'`, `--`, `UNION SELECT`) to alter query logic.
- **Proof of Concept:**
  ```sql
  ' OR '1'='1' --
  ```
- **Red Team Attack Evidence:** Injecting tautologies broke filter bounds and leaked deactivated catalog items.
- **Blue Team Remediation:** Implemented `validateSearchQuery` which enforces whitelist regex validation, intercepts malicious SQL keywords, and triggers security audit events.
- **Verification:** Malicious patterns are stripped, a security alert is presented, and catalog integrity is maintained. **Mitigation Verified.**

---

### Finding RT-03: Missing Rate Limiting on Authentication
- **CVSS v3.1 Base Score:** 7.8 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The authentication endpoint accepted unlimited rapid password attempts, leaving user accounts susceptible to credential stuffing and automated dictionary attacks.
- **Proof of Concept:** Submitted 20 consecutive automated login requests with incorrect passwords.
- **Blue Team Remediation:**
  1. Implemented account lockout threshold: after 5 failed attempts, the target account is locked for 60 seconds.
  2. Upgraded password storage to PBKDF2 with SHA-256 (100,000 iterations) and 16-byte random salts.
- **Verification:** After 5 attempts, login is blocked with an interactive lockout countdown timer. **Mitigation Verified.**

---

### Finding RT-04: Insecure Direct Object Reference (IDOR)
- **CVSS v3.1 Base Score:** 7.7 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`)
- **Vulnerability Description:** The order tracking facility accepted any order identifier (e.g. `#DK-1001`) and displayed the associated invoice without verifying whether the requesting user owned the order.
- **Proof of Concept:** User `user@secureshop.edu` requested tracking details for order `#DK-1001` belonging to a third-party customer.
- **Red Team Attack Evidence:** Naive mode returned the victim's full shipping address, mobile phone number, and items purchased.
- **Blue Team Remediation:** Added object-level authorization in `validateOrderAccess` ensuring `order.userId === currentUser.id` or `currentUser.role === 'admin'`.
- **Verification:** Unauthorized lookups return `403 Forbidden: IDOR attempt blocked` with zero data disclosure. **Mitigation Verified.**

---

### Finding RT-05: Business Logic Flaw: Negative Quantity Exploit
- **CVSS v3.1 Base Score:** 7.4 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N`)
- **Vulnerability Description:** The cart drawer accepted negative numerical inputs (e.g. `-5`), which decreased the total order balance below zero.
- **Proof of Concept:** Added 1 unit of product A (300 EGP) and -2 units of product B (200 EGP each), yielding a negative subtotal of -100 EGP.
- **Blue Team Remediation:** Built strict numerical boundary validation in `validateCartQuantity` enforcing positive non-zero integers bounded by real-time stock limits.
- **Verification:** Entering negative or fractional quantities is blocked with an immediate validation alert, clamping quantity to 1. **Mitigation Verified.**

---

### Finding RT-06: Promotional Coupon Replay Attack
- **CVSS v3.1 Base Score:** 5.3 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`)
- **Vulnerability Description:** Promotional coupon `WELCOME15` could be applied repeatedly across unlimited separate orders by the same user.
- **Proof of Concept:** Placed Order 1 with `WELCOME15`, then applied `WELCOME15` again on Order 2 within the same account session.
- **Blue Team Remediation:** Implemented persistent redemption tracking via `usedByUsers` on every coupon record.
- **Verification:** Subsequent redemption attempts display: `Coupon Replay Blocked: Already redeemed by this account`. **Mitigation Verified.**

---

### Finding RT-07: Broken Access Control & Privilege Escalation
- **CVSS v3.1 Base Score:** 9.1 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- **Vulnerability Description:** Non-administrative accounts could switch views to `/admin` and manipulate system configurations because access control was only enforced via client-side button visibility.
- **Proof of Concept:** Logged in as standard customer `user@secureshop.edu` and triggered the admin view state.
- **Red Team Attack Evidence:** Naive mode rendered the complete management dashboard, allowing price edits and user deletions.
- **Blue Team Remediation:** Embedded an authoritative **RBAC Guard** at the root of `AdminDashboard.tsx`, demanding cryptographic verification of `currentUser.role === 'admin'`.
- **Verification:** Non-admin attempts trigger an immediate `403 Access Denied` barrier with audit logging. **Mitigation Verified.**

---

## 5. Conclusion & Blue Team Sign-Off

All seven findings raised by the Red Team have been addressed with defense-in-depth mitigations implemented directly in the application layer. The SecureShop Phase 1 deliverable meets all criteria established by the Department of Computer Engineering Technology for CET431 Software Security.

- **Red Team Lead:** *Signed & Approved*
- **Blue Team Lead:** *Signed & Verified*
- **Phase 1 Status:** Ready for Week 10 Oral Evaluation
