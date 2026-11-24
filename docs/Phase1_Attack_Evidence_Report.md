# 🧪 Attack Evidence Report (Phase 1)
**CET431 - Software Security | Fall 2026**  
**Department of Computer Engineering Technology**  
**Elsewedy University of Technology - Polytechnic of Egypt**  
**Application:** SecureShop  
**Developer & Evaluator:** Osama Mohamed Moawad Zaytoun (Student ID: 230105355)  
**Submission Mode:** Individual Project Implementation (Course standard team size: 6; subject to instructor approval)  
**Evaluation Requirement:** "For each topic, students must show that the attack works against a naive implementation and fails against their own."

---

## 1. Overview of Comparative Testing Methodology

To satisfy the evaluation criteria of CET431 Software Security, an internal comparative testing mechanism was developed directly inside SecureShop. The application supports two distinct operational modes:
1. **Naive Implementation (Vulnerable Baseline):** Represents typical developer oversights (missing validation, no sanitization, missing object authorization, weak authentication).
2. **SecureShop Implementation (Hardened Defenses):** Enforces rigorous input sanitization, parameterized checks, cryptographic salt/PBKDF2 hashing, account lockout thresholds, and role/object-level authorization.

Below is the verified experimental evidence for each security topic taught in the course up to Week 9.

---

## 2. Topic-by-Topic Comparative Evidence

### Topic 1: Cross-Site Scripting (XSS - Stored & Reflected)
- **Vulnerability Category:** OWASP A03:2021 - Injection / CWE-79 (Cross-Site Scripting).
- **Target Component:** Product Catalogue Search Bar, Product Detail Reviews, and User Profile.
- **Comparative Attack Payload:**
  ```html
  <script>alert("XSS Vulnerability Detected in SecureShop!");</script>
  ```
  Alternative event-handler payload:
  ```html
  <img src="x" onerror="alert(document.cookie)" />
  ```

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:** The input string is directly written to the DOM using innerHTML or unescaped string interpolation.
- **Result:** The browser parses the tag as executable JavaScript; a modal alert dialog pops up with `document.cookie`, confirming successful arbitrary code execution within the victim's session.
- **Severity:** High (CVSS 7.5).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** The input passes through `sanitizeHtml` (`src/security/securityService.ts`), which performs HTML entity encoding (`<` -> `&lt;`, `>` -> `&gt;`, `"` -> `&quot;`, `'` -> `&#x27;`) and strips inline JavaScript pseudo-protocols.
- **Result:** The browser displays the payload literally as plain text `&lt;script&gt;alert(...)&lt;/script&gt;` on screen. No script execution occurs.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Cross-Site Scripting (XSS)",
    "payload": "<script>alert(\"XSS Defeated in SecureShop!\")</script>",
    "blocked": true,
    "details": "HTML entity encoding successfully neutralized script execution."
  }
  ```

---

### Topic 2: SQL / Search Query Injection
- **Vulnerability Category:** OWASP A03:2021 - Injection / CWE-89 (SQL Injection).
- **Target Component:** Product Search Engine and Filter Query Parameters.
- **Comparative Attack Payload:**
  ```sql
  ' OR '1'='1' --
  ```
  Alternative payload:
  ```sql
  gadgets' UNION SELECT passwordHash, salt FROM users --
  ```

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:** Unsanitized user strings are concatenated directly into conditional filter expressions:
  ```ts
  // Naive vulnerable logic
  const query = "SELECT * FROM products WHERE title LIKE '%" + userInput + "%'";
  ```
- **Result:** The `' OR '1'='1` payload forces the boolean evaluation to always return `true`, causing inactive, hidden, or administrative items to leak into the public catalog.
- **Severity:** Critical (CVSS 8.8).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** `validateSearchQuery` (`src/security/securityService.ts`) runs an active regular expression parser that intercepts SQL meta-characters and keywords (`'|--|;|union\s+select|or\s+1=1`).
- **Result:** The attack string is flagged immediately; an on-screen security notification alerts the user: `تم رصد وحجب محاولة حقن استعلامات مشبوهة (SQL Injection Blocked)`. The malicious characters are stripped before catalog lookup.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "SQL/Search Injection",
    "payload": "' OR '1'='1' --",
    "blocked": true,
    "details": "Suspicious SQL syntax intercepted and stripped prior to execution."
  }
  ```

---

### Topic 3: Broken Authentication & Brute-Force Attacks
- **Vulnerability Category:** OWASP A07:2021 - Identification & Authentication Failures / CWE-307.
- **Target Component:** Authentication Service & User Login Modal.
- **Comparative Attack Scenario:**
  Automated submission of 10 rapid incorrect passwords against the administrator account `admin@secureshop.edu`.

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:** The naive login endpoint compares passwords in plaintext or uses fast unsalted MD5 hashes, without tracking failure counts.
- **Result:** An attacker can perform millions of guesses without delay, locking, or alerting. Passwords in storage are exposed in plaintext.
- **Severity:** High (CVSS 8.1).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:**
  1. Passwords are keyed using **PBKDF2** derived via SHA-256 with 100,000 iterations and a unique 16-byte cryptographic salt per user (`src/security/securityService.ts`).
  2. The login engine maintains an attempt counter (`failedAttempts`). Upon the **5th consecutive failed attempt**, the account enters a locked state (`isLocked: true`, `lockUntil: Date.now() + 60000`).
- **Result:** After 5 failed attempts, the UI disables submission, displays a real-time countdown timer: `تم تجاوز عدد المحاولات المسموح بها! تم قفل الحساب لمدة دقيقة لحمايته`, and rejects subsequent attempts even if the correct password is entered during the lockout window.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Brute Force Defense Triggered",
    "payload": "Account: admin@secureshop.edu failed 5 times",
    "blocked": true,
    "details": "Account locked automatically for 60 seconds."
  }
  ```

---

### Topic 4: Insecure Direct Object Reference (IDOR)
- **Vulnerability Category:** OWASP A01:2021 - Broken Access Control / CWE-639.
- **Target Component:** Order Lookup and Tracking Modal (`OrderTrackingModal.tsx`).
- **Comparative Attack Scenario:**
  User logged in as `user@secureshop.edu` submits a query for Order ID `#DK-1001` or `#SEC-1001` belonging to customer `سارة خالد` or an unauthenticated third party.

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:**
  ```ts
  // Naive vulnerable lookup
  const foundOrder = orders.find(o => o.id === queryId);
  return foundOrder; // Returns customer name, address, phone number to anyone!
  ```
- **Result:** The application returns the complete order record, exposing private customer phone numbers, street addresses, and purchased items.
- **Severity:** High (CVSS 7.7).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** `validateOrderAccess` (`src/security/securityService.ts`) validates the current session context against the object owner:
  ```ts
  if (currentUser.role !== 'admin' && order.userId !== currentUser.id) {
    return { allowed: false, reason: '403 Forbidden: IDOR attempt blocked' };
  }
  ```
- **Result:** When attempting to view an order belonging to another user, the modal displays a red shield alert: `تم رصد محاولة وصول غير مصرح بها (IDOR Defense Triggered)`. Zero personal information is leaked.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Insecure Direct Object Reference (IDOR)",
    "payload": "Attempted access to order: #SEC-1001 by user: user@secureshop.edu",
    "blocked": true,
    "details": "Unauthorized access to another customer's order blocked."
  }
  ```

---

### Topic 5: Business Logic Flaw (Negative Quantity Cart Exploit)
- **Vulnerability Category:** OWASP A04:2021 - Insecure Design / CWE-840.
- **Target Component:** Shopping Cart Drawer & Checkout Subtotal Calculator.
- **Comparative Attack Payload:**
  Direct modification of quantity in cart input: `quantity = -5`.

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:**
  ```ts
  // Naive subtotal logic
  subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  ```
  If item price is 285 EGP and quantity is -5, `subtotal` becomes `-1425 EGP`!
- **Result:** Adding another item of 500 EGP results in a negative total checkout price, allowing the attacker to place orders for free or generate false credit balances.
- **Severity:** High (CVSS 7.4).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** `validateCartQuantity` strictly verifies that:
  1. `quantity` is a valid finite number.
  2. `Number.isInteger(quantity) === true`.
  3. `quantity > 0`.
  4. `quantity <= product.stock`.
- **Result:** Any non-positive or fractional value is immediately rejected with an alert: `قيمة غير صالحة: يجب أن تكون الكمية رقماً صحيحاً أكبر من الصفر`, and the quantity is safely reset to 1.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Negative Quantity / Price Tampering",
    "payload": "quantity = -5",
    "blocked": true,
    "details": "Invalid negative quantity rejected and reset to minimum safe boundary."
  }
  ```

---

### Topic 6: Promotional Coupon Replay & Tampering Attack
- **Vulnerability Category:** OWASP A04:2021 - Insecure Design / CWE-799 (Improper Control of Generation of Code).
- **Target Component:** Checkout Modal Coupon Processing.
- **Comparative Attack Scenario:**
  A customer applies the single-use newsletter discount code `WELCOME15` (15% off) on Order 1, and subsequently applies the exact same coupon on Order 2.

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:** The naive coupon validator only checks `coupon.code === input` and calculates the percentage discount, without recording user redemptions.
- **Result:** The user obtains unlimited 15% discounts across all orders indefinitely, causing financial loss to the store.
- **Severity:** Medium (CVSS 5.3).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** `validateCouponSecurity` checks the `usedByUsers` array on the coupon. Upon order placement, `currentUser.id` is permanently added to the coupon's history.
- **Result:** On the second attempt, the coupon engine returns: `لقد استخدمت هذا الكوبون مسبقاً! الكوبون صالح للاستخدام مرة واحدة فقط لكل عميل (Coupon Replay Blocked)`.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Coupon Abuse / Replay",
    "payload": "Coupon: WELCOME15 by user-customer-01",
    "blocked": true,
    "details": "Single-use promotion replay attack blocked."
  }
  ```

---

### Topic 7: Broken Access Control & Vertical Privilege Escalation
- **Vulnerability Category:** OWASP A01:2021 - Broken Access Control / CWE-285.
- **Target Component:** Administrative Panel (`/admin` and `AdminDashboard.tsx`).
- **Comparative Attack Scenario:**
  A visitor logged in as normal user `user@secureshop.edu` attempts to open the Admin Panel to modify user balances, change product prices, and delete coupons.

#### Naive Implementation Result (Attack Works):
- **Execution Mechanism:** The system relies on "security through obscurity" — it merely hides the link in the navbar for non-admins, but renders the admin component if requested.
- **Result:** The standard user views all financial KPIs, modifies user roles, and changes catalog prices without authorization.
- **Severity:** Critical (CVSS 9.1).

#### SecureShop Implementation Result (Attack Fails):
- **Defense Mechanism:** The root of `AdminDashboard.tsx` enforces an active **RBAC Guard**:
  ```ts
  const isAccessDenied = (securityMode === 'secure') && (!currentUser || currentUser.role !== 'admin');
  if (isAccessDenied) {
    return <403_Access_Denied_Component />;
  }
  ```
- **Result:** The user is immediately blocked with a full-screen `403 Forbidden` banner explaining that role `admin` is required. Access to administrative controls is completely obstructed.
- **Security Audit Log Entry:**
  ```json
  {
    "attackType": "Privilege Escalation Attempt",
    "payload": "User user@secureshop.edu attempted to open Admin Dashboard",
    "blocked": true,
    "details": "RBAC guard rejected non-admin access with 403 Forbidden."
  }
  ```

---

## 3. Summary of Verification Results

| Security Topic | Naive Status | SecureShop Status | Verification Method |
|:---|:---:|:---:|:---|
| 1. Cross-Site Scripting (XSS) | ❌ Vulnerable | ✅ Protected | Live DOM Injection Test |
| 2. SQL / Query Injection | ❌ Vulnerable | ✅ Protected | Pattern Matching & Whitelist |
| 3. Broken Auth & Brute Force | ❌ Vulnerable | ✅ Protected | 5-Attempt Lockout & PBKDF2 |
| 4. IDOR (Order Lookup) | ❌ Vulnerable | ✅ Protected | User ID Ownership Verification |
| 5. Negative Quantity Cart Exploit | ❌ Vulnerable | ✅ Protected | Positive Integer Boundary Check |
| 6. Coupon Replay Abuse | ❌ Vulnerable | ✅ Protected | `usedByUsers` Redemption Ledger |
| 7. Admin Privilege Escalation | ❌ Vulnerable | ✅ Protected | Active RBAC Route Guard |

All seven topics have been successfully demonstrated to fail against the SecureShop implementation and succeed against the naive configuration.

---

## 4. Assessment Sign-Off & Submission Record

- **Developer & Evaluator:** Osama Mohamed Moawad Zaytoun
- **Student ID:** 230105355
- **Academic Course:** CET431 — Software Security
- **Department:** Computer Engineering Technology, Elsewedy University of Technology
- **Phase 1 Evaluation Status:** Verified for Week 10 Demonstration
