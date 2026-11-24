# 🔬 Security Code Review & Coverage Matrix Specification
## SecureShop E-Commerce System — Phase 1 Baseline

> **Institution:** Elsewedy University of Technology (Polytechnic of Egypt)  
> **Faculty:** Department of Computer Engineering Technology  
> **Course:** CET431 — Software Security | Fall 2026  
> **Milestone:** Project Phase 1 Submission & Week 10 Oral Defense (5 Marks)  
> **Document Identifier:** `SEC-CR-2026-PH1-V1.0`  
> **Developer:** Osama Mohamed Moawad Zaytoun (Student ID: 230105355)  
> **Implementation Mode:** Individual Project Implementation (Course standard team size: 6; subject to instructor approval)  
> **Review Scope:** Static Application Security Testing (SAST) & Architecture Code Audit  

---

## 1. Executive Summary & Review Scope

This Security Code Review was conducted by the Application Security Engineering team through a comprehensive manual **Static Application Security Review (SAST)** of the SecureShop repository. In strict adherence to university evaluation guidelines, no active penetration testing, fuzzing, or vulnerability scanners were executed during this review. 

The audit focused on examining the actual source files in `src/`, `scripts/`, and root configurations:
- **Cryptographic Subsystems:** Implementation of PBKDF2/SHA-256 and salt handling in `src/security/securityService.ts`.
- **Authentication & Sessions:** State management and brute-force defenses in `src/context/StoreContext.tsx` and `src/components/auth/AuthModal.tsx`.
- **Authorization & Access Control:** RBAC guards in `src/components/admin/AdminDashboard.tsx` and IDOR prevention in `src/security/securityService.ts`.
- **Business Logic Operations:** Quantity validation, store credit deductions, coupon tracking, and newsletter binding.
- **Database & Persistence:** Client queries in `src/services/supabaseService.ts` and migration scripts in `scripts/setup-supabase.js`.

---

## 2. In-Depth Domain Review

### 2.1 Domain 1: Authentication & Credential Handling

```
+----------------------------------------------------------------------------------------------------+
|                               AUTHENTICATION AUDIT FINDINGS                                        |
+----------------------+-----------------------------+-----------------------------------------------+
| Check Item           | Evaluation & Status         | Code Evidence / File Reference                |
+----------------------+-----------------------------+-----------------------------------------------+
| Password Hashing     | **Robust (Implemented)**    | PBKDF2 with SHA-256, 100,000 iterations       |
|                      |                             | `src/security/securityService.ts` (lines 10-36)|
| Salt Generation      | **Cryptographically Secure**| 16-byte random values via crypto.getRandomVal |
|                      |                             | `src/security/securityService.ts` (lines 38-42)|
| Account Confirmation | **Implemented**             | 6-digit OTP verification token                |
|                      |                             | `src/context/StoreContext.tsx` (lines 805-825)|
| Brute Force Lockout  | **Implemented**             | 5 attempts threshold -> 60-second lock        |
|                      |                             | `src/context/StoreContext.tsx` (lines 758-769)|
| Password Change      | **Implemented**             | Verifies current password before updating     |
|                      |                             | `src/context/StoreContext.tsx` (lines 870-895)|
| Session Storage      | **LocalStorage Reliance**   | Token/Object stored in browser LocalStorage   |
|                      | (Documented Risk)           | `src/context/StoreContext.tsx` (lines 331-337)|
+----------------------+-----------------------------+-----------------------------------------------+
```

#### Detailed Findings:
1. **Password Hashing Implementation (`hashPasswordSecure`):**
   - Uses the browser's native `crypto.subtle` API.
   - Derives a key using `PBKDF2`, `SHA-256`, and an explicit iteration count of $100,000$.
   - A unique 16-byte cryptographically secure random salt is generated for each user using `crypto.getRandomValues(new Uint8Array(16))`.
   - Salts are stored separately alongside the derived hash in `public.users` (`salt` column).
   - *Verdict:* Satisfies current NIST SP 800-132 recommendations for password derivation.
2. **Account Lockout Threshold (`login` in `StoreContext.tsx`):**
   - Evaluates: `if (securityMode === 'secure' && user.isLocked && user.lockUntil && user.lockUntil > Date.now())`.
   - When consecutive failures reach 5, sets `isLocked = true` and `lockUntil = Date.now() + 60000`.
   - *Verdict:* Successfully protects against automated dictionary attacks and rapid credential stuffing.
3. **Session Management Finding (Area for Phase 2):**
   - Active user session stores the user email (`secureshop_session_email`) in local/session storage to preserve login state across refresh, with the full profile fetched fresh from Supabase.
   - *Limitation:* The client currently derives and verifies hashes locally; full production security requires server-issued signed JWTs stored in `HttpOnly`, `SameSite=Strict` cookies.
   - *Phase 2 Recommendation:* Transition to server-side authentication with signed sessions and database-enforced token revocation.

---

### 2.2 Domain 2: Authorization & Access Control

```
+----------------------------------------------------------------------------------------------------+
|                                AUTHORIZATION AUDIT FINDINGS                                        |
+----------------------+-----------------------------+-----------------------------------------------+
| Check Item           | Evaluation & Status         | Code Evidence / File Reference                |
+----------------------+-----------------------------+-----------------------------------------------+
| Admin RBAC Guard     | **Implemented & Hardened**  | Checks currentUser.role === 'admin'           |
|                      |                             | `src/security/securityService.ts` (L 175-200) |
| Non-Admin Blocking   | **Implemented**             | Returns 403 Forbidden with audit logging      |
|                      |                             | `src/components/admin/AdminDashboard.tsx`     |
| Sole Admin Protection| **Implemented & Hardened**  | admin@secureshop.edu cannot be edited/deleted |
|                      |                             | `src/components/admin/UserManager.tsx`        |
| IDOR Order Guard     | **Implemented**             | Checks order.userId === currentUser.id        |
|                      |                             | `src/security/securityService.ts` (L 134-169) |
| Horizontal Isolation | **Implemented**             | Customers only see own orders in profile      |
|                      |                             | `src/components/customer/UserProfileModal.tsx`|
+----------------------+-----------------------------+-----------------------------------------------+
```

#### Detailed Findings:
1. **Vertical Privilege Escalation Defense (`validateAdminAccess`):**
   - Found in `src/security/securityService.ts` (lines 175–200).
   - In Secure mode, strictly verifies:
     ```ts
     if (!currentUser || currentUser.role !== 'admin') {
       return { allowed: false, reason: 'تم رفض الوصول: حسابك مسجل كمستخدم عادي وليس لديك صلاحيات مدير' };
     }
     ```
   - In `AdminDashboard.tsx`, if `!accessCheck.allowed`, the component immediately returns a red `403 Forbidden` screen with an interactive error banner.
2. **Sole Admin Preservation (`UserManager.tsx` & `StoreContext.tsx`):**
   - `updateUserRole` explicitly rejects promoting any customer account to `admin`.
   - In `UserManager.tsx`, if `user.email === 'admin@secureshop.edu'`, all interactive action buttons (Demote, Modify Credit, Suspend, Delete) are replaced with an immutable shield badge: `حساب محمي 🛡️`.
   - In `deleteUser`, attempting to delete the administrator account returns an explicit refusal: `لا يمكن حذف حساب المشرف العام الرئيسي للنظام`.
3. **Insecure Direct Object Reference (IDOR) Defense (`validateOrderAccess`):**
   - Found in `src/security/securityService.ts` (lines 134–169).
   - If an unauthenticated user queries an order, access is rejected.
   - If a normal customer queries an order belonging to another customer (`order.userId !== currentUser.id`), access is rejected with a `403 Forbidden` warning, preventing enumeration of customer delivery addresses and phone numbers.

---

### 2.3 Domain 3: Database Security & Permissions

```
+----------------------------------------------------------------------------------------------------+
|                                 DATABASE AUDIT FINDINGS                                            |
+----------------------+-----------------------------+-----------------------------------------------+
| Check Item           | Evaluation & Status         | Code Evidence / File Reference                |
+----------------------+-----------------------------+-----------------------------------------------+
| SQLi in App Search   | **Implemented & Sanitized** | Regex whitelist stripping SQL metacharacters  |
|                      |                             | `src/security/securityService.ts` (L 76-93)   |
| DB Migration Driver  | **Parameterized ($1, $2)**  | Safe parameterization using pg driver         |
|                      |                             | `scripts/setup-supabase.js` (lines 142-146)   |
| Row Level Security   | **NOT ENABLED in Supabase** | RLS is disabled; relies on client-side guards |
| (RLS)                | (Critical SAST Finding)     | `scripts/setup-supabase.js` (lines 121-128)   |
| Database Permissions | **Over-Permissive (Anon)**  | GRANT ALL granted to anon role                |
|                      | (Critical SAST Finding)     | `scripts/setup-supabase.js` (lines 121-128)   |
+----------------------+-----------------------------+-----------------------------------------------+
```

#### Detailed Findings & Transparent Vulnerability Disclosure:
1. **Search Parameter Sanitization (`validateSearchQuery`):**
   - The application intercepts SQL injection signatures (`'`, `--`, `;`, `UNION SELECT`, `OR 1=1`).
   - In Secure mode, malicious characters are stripped before catalog filtering occurs.
2. **CRITICAL FINDING — Omission of Remote Row Level Security (RLS):**
   - Inspection of `scripts/setup-supabase.js` (lines 121–128) reveals:
     ```sql
     GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
     GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
     ```
   - No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` statements exist in the schema script.
   - **Risk Evaluation:** While the React application enforces strict RBAC and IDOR checks prior to calling `supabaseService.ts`, any attacker who extracts the public Supabase anon key (`sb_publishable_...`) from browser developer tools could theoretically issue direct PostgREST HTTP queries (`curl https://nojbpgdtlrcdyxsvmluh.supabase.co/rest/v1/orders`) and read all table rows directly.
   - **Academic Honesty Requirement:** We document this as an **identified architectural finding**. It is not claimed to be 100% secure at the database layer.
   - **Phase 2 Remediation Plan:** Write and deploy SQL migration adding RLS policies to all 5 tables.

---

### 2.4 Domain 4: Business Logic & Financial Integrity

```
+----------------------------------------------------------------------------------------------------+
|                               BUSINESS LOGIC AUDIT FINDINGS                                        |
+----------------------+-----------------------------+-----------------------------------------------+
| Check Item           | Evaluation & Status         | Code Evidence / File Reference                |
+----------------------+-----------------------------+-----------------------------------------------+
| Negative Quantities  | **Blocked & Clamped**       | Rejects quantities <= 0, resets to 1          |
|                      |                             | `src/security/securityService.ts` (L 99-128)  |
| Fractional Quantities| **Blocked**                 | Requires Number.isInteger(parsed)             |
|                      |                             | `src/security/securityService.ts` (line 111)  |
| Inventory Overflow   | **Blocked**                 | Clamps requested quantity to available stock  |
|                      |                             | `src/security/securityService.ts` (lines 119) |
| Store Credit Underflow| **Protected**              | Rejects order if storeCredit < orderTotal     |
|                      |                             | `src/components/customer/CheckoutModal.tsx`   |
| Self-Recharge Abuse  | **Disabled**                | Customer self-recharge button removed         |
|                      |                             | `src/components/customer/UserProfileModal.tsx`|
| Coupon Multi-Use     | **Blocked**                 | Single-use checked in usedByUsers array       |
|                      |                             | `src/security/securityService.ts` (L 236-242) |
| Newsletter Binding   | **Strict Email Binding**    | Requires input email === currentUser.email    |
|                      |                             | `src/context/StoreContext.tsx` (L 760-800)    |
+----------------------+-----------------------------+-----------------------------------------------+
```

#### Detailed Findings:
1. **Quantity & Subtotal Integrity (`validateCartQuantity`):**
   - Validates that `quantity` is a positive, non-zero integer within available inventory.
   - Shopping cart subtotal is always calculated independently by multiplying current item price with verified integer quantity. Client-side price parameters are ignored.
2. **Store Credit Settlement (`createOrder`):**
   - Balances are verified before deduction: `if (currentUser.storeCredit < finalTotal) return;`.
   - The deduction occurs synchronously in application state and persists to storage.
   - In `UserProfileModal.tsx`, the self-recharging button (`شحن +500 ج.م`) was permanently removed to prevent customers from arbitrarily inflating their balances.
3. **Newsletter Coupon Strict Binding (`subscribeNewsletter`):**
   - Prohibits admin accounts from claiming consumer shopping vouchers.
   - If an authenticated user enters an email differing from `currentUser.email`, the request is blocked and logged as an `Email Mismatch / Coupon Hijacking (Blocked)` attack.
   - Records customer identity in `newsletterClaims` to strictly restrict issuance to once per account.

---

### 2.5 Domain 5: Frontend Security & Injection Prevention

```
+----------------------------------------------------------------------------------------------------+
|                                 FRONTEND AUDIT FINDINGS                                            |
+----------------------+-----------------------------+-----------------------------------------------+
| Check Item           | Evaluation & Status         | Code Evidence / File Reference                |
+----------------------+-----------------------------+-----------------------------------------------+
| HTML Entity Encoding | **Implemented**             | Replaces <, >, &, ", ', / with HTML entities  |
|                      |                             | `src/security/securityService.ts` (lines 53-70|
| Script Stripping     | **Implemented**             | Strips javascript:, onerror=, onload=         |
|                      |                             | `src/security/securityService.ts` (lines 67-69|
| dangerouslySetInnerHTML| **Zero Occurrences**     | Codebase contains 0 dangerous DOM injections  |
|                      |                             | Full codebase search verified                 |
| React JSX Escaping   | **Active by Default**       | Native string escaping on all JSX text nodes  |
+----------------------+-----------------------------+-----------------------------------------------+
```

#### Detailed Findings:
1. **Zero Dangerous DOM Methods:**
   - A global regex search across all `.tsx` and `.ts` files confirms that `dangerouslySetInnerHTML` is **nowhere in the application codebase**.
   - All dynamic strings are rendered through standard React text nodes (`{item.titleAr}`, `{order.customerName}`), which inherently perform contextual HTML entity encoding.
2. **Sanitization Interceptor (`sanitizeHtml`):**
   - Active in `src/security/securityService.ts`.
   - Encodes special characters and neutralizes event handlers and javascript pseudo-protocols, ensuring that even if raw strings were injected into the DOM, they would render as inert text.

---

## 3. Comprehensive Security Coverage Matrix

The matrix below documents the curriculum topics taught up to Week 9, evaluating the attack scenario, the naive baseline flaw, the implemented defense, code references, status, and remaining limitations:

```
+------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                   SECURITY COVERAGE MATRIX (PHASE 1)                                                                 |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| Code  | Security Topic          | Attack Scenario in SecureShop   | Implemented Defense           | Code File & Function | Status        | Limitation|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-01| Cross-Site Scripting    | Injecting <script>alert(1)</script>| Entity encoding via sanitizeHtml| src/security/        | **Implemented| Client-   |
|       | (Stored & Reflected XSS)| in search or reviews            | & React JSX escaping          | securityService.ts   | & Verified**  | side only |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-02| SQL & Search Injection  | Submitting ' OR '1'='1' -- in   | Regex pattern check against   | src/security/        | **Partially   | Keyword   |
|       |                         | catalog search parameter        | known SQL injection keywords  | securityService.ts   | Implemented** | filter != |
|       |                         |                                 | (validateSearchQuery)         |                      |               | full SQLi |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-03| Broken Authentication & | Automated password dictionary   | PBKDF2/SHA-256 (100K iter)    | StoreContext.tsx     | **Implemented| Lockout on|
|       | Credential Brute-Force  | attack on login                 | + 60s lock after 5 failures   | & securityService.ts | & Verified**  | user doc  |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-04| Insecure Direct Object  | Modifying order ID (#DK-1001)   | Client ownership check        | src/security/        | **Partially   | Browser   |
|       | Reference (IDOR / BOLA) | to read other customers' data   | (order.userId === currentUser)| securityService.ts   | Implemented** | check; DB |
|       |                         |                                 |                               |                      |               | RLS needed|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-05| Business Logic:         | Entering negative quantity (-5) | Positive integer & stock check| src/security/        | **Partially   | Validated |
|       | Parameter Tampering     | to diminish cart subtotal       | (validateCartQuantity)        | securityService.ts   | Implemented** | pre-save  |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-06| Financial Logic:        | Applying WELCOME15 discount     | Single-use tracking via       | src/security/        | **Implemented| Needs DB  |
|       | Coupon Replay Abuse     | multiple times across orders    | coupon.usedByUsers in database| securityService.ts   | & Verified**  | trans lock|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-07| Broken Access Control & | Regular user navigates directly | Client-side RBAC guard check: | AdminDashboard.tsx   | **Partially   | Client UI |
|       | Privilege Escalation    | to /admin dashboard view        | currentUser.role === 'admin'  | & securityService.ts | Implemented** | guard only|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-08| Newsletter Privilege    | Claiming welcome coupon using   | Strict email equality check:  | StoreContext.tsx     | **Implemented| Single use|
|       | & Email Spoofing        | an external or fake email       | inputEmail === user.email     | (subscribeNewsletter)| & Verified**  | per user  |
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-09| Administrative Account  | Deleting or demoting the        | Sole admin protection:        | UserManager.tsx &    | **Implemented| In-app    |
|       | Tampering & Takeover    | master admin@secureshop.edu     | immutable role, actions locked| StoreContext.tsx     | & Verified**  | protection|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
| SEC-10| Database Row Level      | Direct PostgREST query          | Client-side logic filters;    | Supabase PostgreSQL  | **Not         | DB RLS not|
|       | Security (RLS)          | bypassing React application     | remote RLS not yet enforced   | Schema Configuration | Verified**    | in harness|
+-------+-------------------------+---------------------------------+-------------------------------+----------------------+---------------+-----------+
```

---

## 4. Status Legend & Evaluation Rules

- **Implemented & Verified:** The defense exists in source code, has been verified through functional testing, and operates as designed in the application tier.
- **Partially Implemented:** The defensive control is active in the client or presentation layer, but lacks corresponding server-side or database-level enforcement (e.g. client keyword filtering vs database parameterized queries; client RBAC vs database RLS).
- **Missing:** The defense is not implemented in the current milestone.
- **Not Verified:** The mechanism exists in documentation or design but has not been verified against live exploit scenarios in a dedicated test harness.

---

## 5. Security Code Review Sign-Off

This static security review represents an accurate, objective, and evidence-based assessment of the SecureShop repository as of the Phase 1 milestone.

- **Developer & Auditor:** Osama Mohamed Moawad Zaytoun
- **Student ID:** 230105355
- **Academic Course:** CET431 — Software Security
- **Department:** Computer Engineering Technology, Elsewedy University of Technology
- **Evaluation Milestone:** University Oral Defense — Week 10
- **Status:** Phase 1 Security Review Complete & Submitted
