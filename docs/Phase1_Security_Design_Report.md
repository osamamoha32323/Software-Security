# 📄 Security Design & Threat Modeling Report (Phase 1)
**CET431 - Software Security | Fall 2026**  
**Department of Computer Engineering Technology**  
**Elsewedy University of Technology - Polytechnic of Egypt**  
**Project Application:** SecureShop E-Commerce System  
**Deliverable:** Phase 1 Submission (Week 9 - Week 10 Discussion)

---

## 1. Executive Summary

This Security Design Report provides a thorough architectural and threat-modeling analysis for **SecureShop**, an e-commerce platform built to meet the rigorous security requirements of CET431. The project follows a dual-team collaborative development model comprising **3 Blue Team members** (Defenders and Core Engineers) and **3 Red Team members** (Penetration Testers and Security Evaluators).

Phase 1 focuses on establishing the application baseline, defining the attack surface across all eight functional areas, constructing a formal threat model utilizing the **STRIDE** methodology, and verifying the implementation of defenses for all security topics taught up to Week 9. To comply with course standards, every defensive mechanism is demonstrated through a side-by-side comparative model: highlighting how attacks succeed against a naive baseline and how they are completely neutralized within the hardened SecureShop codebase.

---

## 2. Functional Requirements & Attack Surface Mapping

Every functional feature of SecureShop represents an external entry point that expands the website's attack surface. The table below maps each required feature to its potential entry points, handling components, and associated security exposures:

| Functional Requirement | Core Capabilities | Potential Attack Surface & Entry Points | Associated Security Concerns |
|:---|:---|:---|:---|
| **1. Registration & Login** | Account creation, password policy, account confirmation token, login, logout, session management. | Registration Form, Login Form, Account Confirmation Code input, Session storage. | Weak password storage, credential stuffing, brute-force attacks, session fixation, token tampering. |
| **2. Product Catalogue** | Product list, category filtering, search bar, product detail modal, specifications. | Search query parameters, category selector, review submission. | Stored and Reflected XSS, SQL/search query injection, regex Denial of Service. |
| **3. Shopping Cart** | Add to cart, quantity modification, remove from cart, session persistence. | Cart quantity input, cart state mutations, item IDs. | Business logic flaws: negative quantity injection, fractional quantity, item price manipulation. |
| **4. Coupons & Newsletter** | Newsletter email subscription issuing coupons (`WELCOME15`), coupon discount application. | Newsletter subscription form, checkout coupon input field. | Replay attacks, unauthorized multiple discount redemption, expired coupon exploitation. |
| **5. Checkout & Orders** | Store credit payment ledger, Cash on Delivery, order confirmation receipt, order status tracking. | Checkout payment method radio buttons, store credit balance verification, order ID lookup. | Store credit balance underflow, race conditions during checkout, order tampering. |
| **6. User Account Page** | View profile, update shipping details, change password, view private order history. | Profile update form, password change inputs, order history list queries. | Insecure Direct Object Reference (IDOR), horizontal privilege escalation, CSRF. |
| **7. Admin Panel** | Manage users (roles, credit, confirmation), manage products, manage coupons, review KPIs. | Admin dashboard routes, role promotion toggles, coupon creation modal. | Broken Access Control, vertical privilege escalation, unauthorized system configuration. |
| **8. Usability & Navigation** | Responsive layout (desktop/mobile), helpful error messages, security mode switcher. | UI notification toasts, security inspector modal. | Sensitive information leakage through verbose error messages, UI redressing. |

---

## 3. Threat Model

### 3.1 Identification of Assets
In SecureShop, the high-value assets requiring protection across the CIA triad (Confidentiality, Integrity, Availability) are:
1. **User Credentials & Authentication Data (Confidentiality & Integrity):** Plaintext passwords, cryptographic salts, session identifiers, and account confirmation tokens.
2. **Financial Balances & Store Credit (Integrity):** Ledger containing user store credit amounts and transaction records.
3. **Customer Personal Identifiable Information - PII (Confidentiality):** Customer full names, phone numbers, governorates, delivery addresses, and personal order receipts.
4. **Administrative Capabilities & Configuration (Integrity & Availability):** User role definitions, product inventory counts, pricing tables, and promotional coupon limits.
5. **System Audit Logs & Security Metrics (Integrity & Accountability):** Security event timestamps, intercepted attack payloads, and defense audit trails.

### 3.2 Identification of Potential Attackers
The threat model considers four distinct threat agent personas:
- **T1: External Anonymous Attacker (Script Kiddie / Opportunist):** Operates without credentials; leverages automated scanners, searches for open endpoints, attempts parameter tampering and automated login brute-forcing.
- **T2: Malicious Authenticated Customer:** Possesses valid user credentials; attempts horizontal privilege escalation via IDOR to view other customers' orders, manipulates cart quantities to acquire merchandise illegally, and abuses discount coupons.
- **T3: Disgruntled User Seeking Privilege Escalation:** Authenticated customer attempting vertical privilege escalation by accessing administrative interfaces (`/admin`) or modifying request headers/roles to obtain manager privileges.
- **T4: Malicious Content Provider / Social Engineer:** Injects weaponized payloads into user-supplied fields (e.g. search keywords, names, addresses) attempting Stored or Reflected XSS to execute malicious scripts in victim browsers.

### 3.3 Data Flow Diagrams (DFD)

#### Level 0 DFD (Context Diagram)
```
[External Visitor / Customer] 
      │ 
      ├── (Registration, Credentials, Cart Items, Orders, Coupons) ──► [ SecureShop E-Commerce System ]
      ◄── (Product Details, Order Confirmations, Session State) ───────┤
                                                                      │
[System Administrator] ───────────────────────────────────────────────┤
      ├── (Product Catalogs, User Roles, Coupon Configurations) ──────┤
      ◄── (Financial Analytics, User Ledgers, Security Audit Logs) ───┘
```

#### Level 1 DFD (Decomposed Architecture)
1. **Process 1.0 (Authentication & Token Verification):** Validates credentials using PBKDF2/SHA-256 + salt; checks lockout threshold; issues secure session state.
2. **Process 2.0 (Product & Search Filtering Engine):** Receives search strings; passes through input sanitization; blocks SQL injection syntax; queries sanitized catalog.
3. **Process 3.0 (Cart & Pricing Validation Engine):** Validates quantity inputs strictly as positive integers; checks physical inventory boundaries; recalculates subtotal independently.
4. **Process 4.0 (Order & Store Credit Settlement Engine):** Verifies coupon validity against `usedByUsers`; checks store credit balance; deducts funds atomically; assigns immutable `userId` to the newly minted order record.
5. **Process 5.0 (Access Control & IDOR Guard):** Intercepts requests for order tracking or admin tabs; enforces object-level and role-level authorization before returning data.

---

### 3.4 STRIDE Threat Matrix Analysis

The system was evaluated against each dimension of the **STRIDE** methodology:

| STRIDE Category | Threat Description in SecureShop | Impacted Component | Vulnerability in Naive System | SecureShop Blue Team Mitigation |
|:---|:---|:---|:---|:---|
| **Spoofing (S)** | An attacker guesses or brute-forces another user or administrator's password. | Authentication Process | No rate limiting; passwords stored in plaintext or weak unsalted hashes. | Password hashing using PBKDF2 with SHA-256 and 16-byte random salt; account lock for 60 seconds after 5 failed attempts. |
| **Tampering (T)** | Attacker changes item quantity to `-5` in the cart or manipulates the order subtotal. | Shopping Cart & Checkout | System trusts client-side price/quantity numbers directly without validation. | Backend validation in `validateCartQuantity` strictly enforces positive non-zero integers within available stock. |
| **Repudiation (R)** | User claims they did not apply a promotional discount or place an order. | Order Processing & Ledger | No audit trail; coupons lack per-user redemption tracking. | Secure storage of `usedByUsers` on coupons, immutable order history with timestamped status logs. |
| **Information Disclosure (I)** | An attacker queries order `#DK-1001` and retrieves customer address and phone. | Order Tracking Modal | Insecure Direct Object Reference: any valid order ID returns full customer details. | Object-level authorization in `validateOrderAccess` requiring `order.userId === currentUser.id` or `currentUser.role === 'admin'`. |
| **Denial of Service (D)** | Attacker attempts to flood login or search with expensive injection payloads. | Search & Login Engine | Unlimited retry loops and unconstrained regex evaluation on queries. | Rate limiting on authentication, regex whitelist sanitization, and structured query handling. |
| **Elevation of Privilege (E)** | Normal customer directly accesses the administrative dashboard. | Admin Dashboard Component | Administrative routes rely solely on hidden links (Security through Obscurity). | Strict RBAC enforcement via `validateAdminAccess`, immediately aborting unauthorized requests with a `403 Forbidden` guard. |

---

## 4. Phase 1 Security Coverage Matrix

The following matrix documents the core vulnerabilities taught in the curriculum up to Week 9, specifying the attack scenario, the naive implementation flaw, the defensive mechanism built into SecureShop, code locations, and test evidence:

| Item | Course Topic | Attack Scenario in SecureShop | Root Cause in Naive Version | Defense Implemented in SecureShop | Code Location | Live Evidence & Validation |
|:---:|:---|:---|:---|:---|:---|:---|
| **SEC-01** | **Cross-Site Scripting (XSS)** | Injecting `<script>alert('XSS')</script>` or malicious event handlers into search fields or user profile inputs. | Direct rendering of user input into the DOM without HTML entity encoding or sanitization. | Input sanitization function `sanitizeHtml` that escapes `<, >, &, ", '` and strips inline scripts and pseudo-protocols. | `src/security/securityService.ts` (`sanitizeHtml`) | In Secure mode, payload renders as harmless plain text `&lt;script&gt;` with zero script execution. |
| **SEC-02** | **SQL & Search Query Injection** | Submitting SQL metacharacters (`' OR '1'='1' --`) in the product catalog search to break filter queries. | Naive string concatenation directly interpolating unsanitized search input into filter logic. | Whitelist pattern matching and parameter sanitization via `validateSearchQuery` blocking SQL tokens. | `src/security/securityService.ts` (`validateSearchQuery`) | Injection patterns trigger a security warning, are sanitized, and log an audit event in the Security Hub. |
| **SEC-03** | **Broken Authentication & Brute Force** | Rapidly attempting hundreds of password combinations to compromise administrator or victim accounts. | Absence of account lockout thresholds, unlimited attempts, and weak unsalted password storage. | Adaptive rate-limiting locking the account for 60 seconds after 5 failed attempts; PBKDF2/SHA-256 + salt. | `src/context/StoreContext.tsx` (`login`) | 5 consecutive wrong passwords trigger an interactive countdown lock preventing further login attempts. |
| **SEC-04** | **Insecure Direct Object Reference (IDOR)** | Modifying the order ID parameter in tracking to access another customer's shipping address and invoices. | The backend lookup relies solely on the provided Order ID without checking current user ownership. | Context-aware authorization checking `order.userId === currentUser.id` or `currentUser.role === 'admin'`. | `src/security/securityService.ts` (`validateOrderAccess`) | Non-owners receive a `403 Forbidden: IDOR attempt blocked` banner; details are never revealed. |
| **SEC-05** | **Business Logic Flaws: Negative Quantities** | Entering negative values (e.g. `-5`) in the shopping cart to reduce subtotal or generate fraudulent credits. | Trusting client-supplied numerical inputs without validating sign, integer status, or physical inventory. | Verification in `validateCartQuantity` enforcing `parsed > 0`, integer check, and stock ceiling. | `src/security/securityService.ts` (`validateCartQuantity`) | Negative numbers are rejected with an explicit security alert and clamped to a safe minimum quantity of 1. |
| **SEC-06** | **Coupon Abuse & Replay Attacks** | Submitting the single-use newsletter discount code `WELCOME15` multiple times across different checkout orders. | No historical association between user accounts and redeemed promotion codes. | Persistent ledger tracking user IDs in `coupon.usedByUsers`, checking expiration date and minimum subtotal. | `src/security/securityService.ts` (`validateCouponSecurity`) | Second application attempt yields: "Coupon already used by this customer (Coupon Replay Blocked)". |
| **SEC-07** | **Broken Access Control & Privilege Escalation** | A normal customer or anonymous user navigates to the administrative panel to manage users and prices. | Client interface merely hides the navigation button without validating roles on the target view. | Role-Based Access Control (RBAC) guard in `AdminDashboard.tsx` validating `currentUser.role === 'admin'`. | `src/components/admin/AdminDashboard.tsx` | Non-admin users are blocked by a full-screen `403 Access Denied` alert with security audit logging. |

---

## 5. Defense Implementation & Live Demonstration Architecture

To facilitate evaluation by university examiners during the Week 10 oral discussion, SecureShop features a dedicated **Security Demonstration Hub**:

1. **Dual-Mode Operational Switch:**
   - In **SecureShop Mode (Active Defenses)**, all sanitization, IDOR checks, brute-force locks, and RBAC guards are actively enforced.
   - In **Naive Mode (Vulnerable Baseline)**, defenses can be temporarily disabled with one click to demonstrate to instructors how each attack succeeds against an unprotected implementation.
2. **Interactive Live Attack Simulator:**
   Instructors can execute interactive proofs-of-concept for all 7 topics directly from the UI, observing immediate comparisons between naive exploitation and secure mitigation.
3. **Real-Time Security Event Audit Stream:**
   Every intercepted attack payload is recorded with an accurate timestamp, payload snippet, mitigation status, and defensive rationale.

---

## 6. Conclusion & Roadmap to Phase 2

Phase 1 provides a fully functional, architecturally sound, and rigorously defended e-commerce platform. All functional requirements (from user registration to store credit payment) and security requirements for Phase 1 have been implemented, tested, and documented. 

Building upon this foundation, Phase 2 will incorporate:
- Advanced defenses for topics covered in weeks 10–13 (CSRF tokens, cryptographic nonces, rate-limited API proxies).
- Formal automated end-to-end security test suites.
- Full penetration testing reports with expanded CVSS scoring and remediation tracking.
