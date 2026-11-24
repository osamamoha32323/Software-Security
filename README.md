# 🛡️ SecureShop — E-Commerce Security Platform

> **Institution:** Elsewedy University of Technology (Polytechnic of Egypt)  
> **Faculty:** Department of Computer Engineering Technology  
> **Course:** CET431 — Software Security | Fall 2026  
> **Milestone:** Project Phase 1 Submission & Week 10 Oral Discussion (5 Marks)  
> **Repository:** [Software-Security](https://github.com/osamamoha32323/Software-Security)

---

## 1. Project Title & Course Information

**SecureShop** is an enterprise-oriented, security-hardened e-commerce web application developed specifically to satisfy the practical and theoretical requirements of course **CET431 (Software Security)**. 

The project addresses commercial retail operations within the Egyptian domestic market (EGP currency, free shipping across all 24 Egyptian governorates, localized Arabic UI with English technical audit logging) while implementing defensive controls against OWASP Top 10 web application vulnerabilities taught up to Week 9.

---

## 2. Project Overview

SecureShop demonstrates the dual imperatives of modern software engineering:
1. **Commercial Functionality:** Complete customer shopping journey, digital wallet settlement (Store Credit), promotional coupons, order tracking, and administrative store management.
2. **Defensive Software Engineering:** A dual-mode comparative security engine (**SecureShop Mode** vs. **Naive Baseline**) allowing academic examiners to observe real-world vulnerabilities (XSS, SQL Injection patterns, Brute Force, IDOR, Negative Quantity Manipulation, and Coupon Replay) succeed against an unhardened baseline and fail against implemented defensive controls.

---

## 3. Project Developer

### Individual Project Implementation

- **Developer:** Osama Mohamed Moawad Zaytoun
- **Student ID:** 230105355
- **Academic Affiliation:** Department of Computer Engineering Technology, Elsewedy University of Technology

#### Key Responsibilities Undertaken:
- System architecture and application design.
- Frontend development and responsive user experience (React 19 + TypeScript).
- Database design, schema configuration, and Supabase PostgreSQL integration.
- Authentication, PBKDF2 cryptographic hashing, and authorization subsystem implementation.
- Security controls, interceptor services, and STRIDE threat modeling.
- Requirements engineering, traceability matrix, and technical documentation.
- Functional testing, verification, and debugging.
- Comparative security demonstration planning.

> [!IMPORTANT]
> **Academic Note on Team Size:** The course guidelines typically require a six-member team. The developer has handled all architecture, implementation, defensive engineering, and documentation responsibilities individually. Any exception for individual project submission is subject to formal instructor approval.

---

## 4. Technology Stack

Forensic verification of `package.json` and codebase configuration confirms the active technology stack:

| Layer | Technology | Specification / Version | Role in SecureShop |
|:---|:---|:---|:---|
| **Frontend Framework** | React 19 | `^19.2.8` | Client-side Single Page Application (SPA) |
| **Language & Typing** | TypeScript | `~6.0.2` | Strict static typing and interface contracts |
| **Build Tool & Bundler** | Vite | `^8.3.0` | Build orchestration, HMR, and Rollup bundling |
| **Database Engine** | PostgreSQL | Supabase Cloud (AWS EU-West-1) | Persistent storage for users, products, orders, coupons, and logs |
| **Database SDK** | `@supabase/supabase-js` | `^2.119.2` | Client data querying and Realtime subscriptions |
| **Realtime Sync** | Supabase Realtime | WebSocket (`postgres_changes`) | Live cross-client synchronization of user balances and orders |
| **Cryptography** | Web Cryptography API | Native `crypto.subtle` | PBKDF2 (100,000 iterations, SHA-256) + 16-byte random salts |
| **UI Icons & Visuals** | `lucide-react` | `^1.45.0` | Vector interface iconography |
| **Static Linter** | `oxlint` | `^1.81.0` | Code quality and syntax analysis |

---

## 5. Installation & Quick Start

Ensure **Node.js (v18+)** and **npm** are installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/osamamoha32323/Software-Security.git
cd Software-Security
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file based on the provided template:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

### 5. Production Build
```bash
npm run build
```
Verify that TypeScript compiles with 0 errors and Vite generates optimized bundles in `dist/`.

---

## 6. System Architecture

The application is structured into four functional tiers separated by defined trust boundaries:

```
+----------------------------------------------------------------------------------+
|                              CLIENT LAYER (Browser)                              |
|  React 19 SPA | Mobile-First UI | Customer Views | Admin Dashboard | Lab Hub     |
+----------------------------------------------------------------------------------+
                                        │
                         [ Trust Boundary: User Input ]
                                        ▼
+----------------------------------------------------------------------------------+
|                   APPLICATION STATE & INTERCEPTOR LAYER                          |
|  - StoreContext.tsx: In-memory state, Realtime event sync, transient session     |
|  - securityService.ts: PBKDF2/Salt, sanitizeHtml, validateSearchQuery, IDOR Guard|
+----------------------------------------------------------------------------------+
                                        │
                      [ Trust Boundary: Network / PostgREST ]
                                        ▼
+----------------------------------------------------------------------------------+
|                     DATA PERSISTENCE LAYER (Supabase Cloud)                      |
|  - PostgreSQL Tables: users, products, orders, coupons, security_logs            |
|  - Realtime Channels: postgres_changes broadcasts                                |
|  - Row Level Security (RLS): Documented Known Finding (Scheduled for Phase 2)    |
+----------------------------------------------------------------------------------+
```

### Architectural Principles:
- **Centralized State:** Managed via `StoreContext.tsx` with Supabase Realtime synchronization across active browser tabs.
- **Client vs. Database Validation:** Client-side checks (`validateOrderAccess`, `validateAdminAccess`, `validateCartQuantity`) provide responsive user feedback and client UI containment. However, **client-side checks do not replace database-enforced authorization (Row Level Security)**. Remote RLS policies are marked as a Phase 2 hardening requirement.

---

## 7. Functional Requirements

All eight primary functional areas required by the course syllabus are fully operational:

1. **User Registration & Account Confirmation:**
   - Account creation with password complexity requirements.
   - 6-digit confirmation token printed in terminal logs to simulate secure out-of-band delivery.
   - Welcome wallet bonus (1,000 EGP Store Credit) to enable immediate checkout testing.
2. **User Authentication & Session Management:**
   - Secure login with PBKDF2/SHA-256 password hash comparison.
   - Account lockout (60 seconds) triggered after 5 consecutive failed login attempts.
   - Immediate logout invalidating active in-memory session.
3. **Product Catalogue & Search:**
   - E-commerce catalog with Arabic titles, descriptions, pricing, stock levels, and category filtering.
   - Real-time search query sanitization with SQL injection pattern matching.
4. **Shopping Cart Management:**
   - Slide-out cart drawer with item addition, removal, and quantity adjustment.
   - Free shipping automatically applied across all 24 Egyptian governorates.
5. **Promotional Coupons & Newsletter:**
   - Newsletter subscription issuing single-use discount coupon `WELCOME15` (15% off).
   - Strict identity binding: input email must match the authenticated customer's registered email.
   - Persistent coupon redemption tracking in database (`usedByUsers`).
6. **Checkout & Payment:**
   - Primary payment method: **Store Credit (Digital Wallet)** with automatic balance deduction.
   - Secondary payment method: Cash on Delivery (COD).
   - Real-time stock decrement upon successful order placement.
7. **User Profile & Order Tracking:**
   - Customer profile details, password updates, and wallet balance overview.
   - Private order tracking with IDOR ownership validation.
8. **Admin Dashboard:**
   - Role-Based Access Control protecting administrative interfaces.
   - User Management: status toggling, wallet balance adjustments, and per-user security mode toggle.
   - Product Management: Full CRUD operations directly writing to Supabase PostgreSQL.
   - Order Management: Status updating and order deletion.

---

## 8. User Roles & Permissions

The application defines three distinct user roles:

| Role | Access Level | Permissions |
|:---|:---|:---|
| **Guest** | Anonymous | Browse catalog, view product details, initiate registration/login. Cannot access cart or checkout without signing in. |
| **Registered Customer (User)** | Authenticated | Browse catalog, add items to cart, claim single-use coupons, checkout via Store Credit / COD, view personal orders, update profile. Cannot access `/admin`. |
| **System Administrator (Admin)** | High-Privilege | Access full Admin Dashboard, manage products, view/delete customer orders, adjust customer store credits, toggle per-user security mode. Isolated from shopping/cart. |

> **Sole Administrator Enforcement:** The account `admin@secureshop.edu` is permanently designated as the master administrator (`حساب محمي`). The system strictly prohibits deleting or demoting this account, or promoting normal users to administrator.

---

## 9. Database Integration & Persistence

### Migration from LocalStorage to Supabase PostgreSQL
During early development, the application utilized browser `localStorage` as a mock storage mechanism. In recent milestones, **all business data was migrated to a live Supabase PostgreSQL database**:
- `users`: User profiles, cryptographic hashes, salts, store credits, account statuses, and per-user `security_mode`.
- `products`: Complete retail catalog, pricing, inventory stock, and specifications.
- `orders`: Customer orders, shipping details, item manifests, payment methods, and timestamps.
- `coupons`: Discount percentages, minimum order requirements, and the `usedByUsers` JSONB redemption array.
- `security_logs`: Security audit logs detailing intercepted attack payloads and defensive actions.

### Realtime Synchronization
The application subscribes to Supabase Realtime channels (`postgres_changes` on `users`, `orders`, `products`, `coupons`). When an administrator updates a user's wallet credit or order status, changes reflect immediately across open customer sessions without manual page refreshes.

### Database Security Status
- **Row Level Security (RLS):** Currently **Not Verified / Documented Known Finding**. The client application connects via the public anonymous key (`VITE_SUPABASE_ANON_KEY`). Access control is actively enforced at the application context layer. Writing and enforcing PostgreSQL RLS policies is scheduled for Phase 2.
- **Transaction Atomicity:** Multi-table mutations during checkout (order creation, stock decrement, wallet debit) are currently executed sequentially via the client SDK; atomic PostgreSQL stored procedures (`plpgsql`) are scheduled for Phase 2.

---

## 10. Security Coverage Matrix

The table below documents the current implementation status of all course security topics:

| Code | Security Topic | Attack Scenario in SecureShop | Root Cause in Naive Version | Implemented Defense | File & Function | Implementation Status | Remaining Limitations |
|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **SEC-01** | **Cross-Site Scripting (XSS)** | Injecting `<script>alert(1)</script>` into search queries or reviews | Direct unescaped rendering of inputs into the DOM | Contextual HTML entity encoding via `sanitizeHtml` and React JSX default escaping | `src/security/securityService.ts`<br>`sanitizeHtml` | **Implemented & Verified** | Client-side only; requires HTTP Content-Security-Policy (CSP) headers in deployment |
| **SEC-02** | **SQL & Search Injection** | Submitting `' OR '1'='1' --` in catalog search | Direct string interpolation into filter expressions | Regex keyword matching intercepting SQL tokens and triggering security audit events | `src/security/securityService.ts`<br>`validateSearchQuery` | **Partially Implemented** | Keyword filtering alone is not sufficient SQLi defense; PostgREST parameterizes queries, but client regex is an input check only |
| **SEC-03** | **Broken Authentication** | Automated password dictionary attacks on login | Unlimited login retries and weak unsalted password storage | PBKDF2 (100,000 iterations, SHA-256) + 16-byte random salt; 60s lockout after 5 consecutive failures | `src/security/securityService.ts`<br>`hashPasswordSecure`<br>`StoreContext.tsx` (`login`) | **Implemented & Verified** | Lockout state stored on user record; distributed brute-force mitigation requires server-side IP rate limiting |
| **SEC-04** | **Insecure Direct Object Reference (IDOR)** | Modifying order tracking parameter `#SEC-XXXX` to view other customers' invoices | Backend accepts order ID without verifying ownership against active session | Client-side ownership validation: `order.userId === currentUser.id` or `currentUser.role === 'admin'` | `src/security/securityService.ts`<br>`validateOrderAccess` | **Partially Implemented** | Browser-side check only; direct PostgREST API queries using anon key require database Row Level Security |
| **SEC-05** | **Business Logic: Negative Quantities** | Submitting quantity `-5` in cart to artificially diminish checkout total | System accepts raw client-supplied numbers without validation | Strict numerical validation ensuring positive non-zero integers bounded by stock limits | `src/security/securityService.ts`<br>`validateCartQuantity` | **Partially Implemented** | Pre-save client validation; database-level `CHECK (quantity > 0)` constraints planned for Phase 2 |
| **SEC-06** | **Promotional Coupon Replay** | Re-applying single-use discount coupon `WELCOME15` across multiple orders | Absence of redemption tracking tied to customer identities | Persistent tracking via `usedByUsers` array on coupon record in database; duplicate claims rejected | `src/security/securityService.ts`<br>`validateCouponSecurity` | **Implemented & Verified** | Concurrent requests require atomic database transaction locks to prevent race conditions |
| **SEC-07** | **Broken Access Control & Privilege Escalation** | Normal customer directly accesses `/admin` dashboard | Application relies solely on hiding navigation links from non-admin users | Authoritative RBAC guard in `AdminDashboard.tsx` verifying `currentUser.role === 'admin'` with 403 barrier | `src/components/admin/AdminDashboard.tsx`<br>`src/security/securityService.ts` | **Partially Implemented** | Client-side view blocking only; does not replace database-enforced role authorization via RLS |

---

## 11. Test Accounts

The following demonstration accounts are configured in the live database for testing and oral evaluation:

| Account Type | Email Address | Assigned Role | Initial Wallet Balance | Account Password |
|:---|:---|:---:|:---:|:---|
| **System Administrator** | `admin@secureshop.edu` | `admin` | — | `Provided privately for evaluation` |
| **Standard Customer** | `user@secureshop.edu` | `user` | 1,000 EGP | `Provided privately for evaluation` |

> [!WARNING]
> **Credential Security Notice:** In accordance with secure software development standards, plaintext demonstration passwords have been removed from all tracked documentation. Any credentials previously committed to public Git history have been sanitized and must be rotated prior to any production deployment.

---

## 12. Functional Testing Status

- **Build Verification:** Tested with `npm run build` (`tsc -b && vite build`) — passes with 0 TypeScript or bundler errors.
- **Authentication Flow:** Registration, 6-digit confirmation, login, 5-failure lockout (60s timer), and logout verified.
- **Cart & Store Credit:** Negative quantity rejection, subtotal calculations, free shipping application, and store credit deductions verified.
- **Coupon Workflow:** Single-use issuance on newsletter subscription and replay rejection verified.
- **Admin Management:** Product CRUD, order deletion, and customer credit adjustments verified.
- **Device Compatibility:** Tested and verified across desktop, tablet, and mobile viewports with responsive navigation.

---

## 13. Security Limitations & Realistic Assessment

To maintain academic rigor and transparency, the current implementation boundaries are acknowledged:
1. **Client-Side Validation vs. Database Enforcement:** While defensive interceptors prevent attacks within the web application, a technically skilled adversary utilizing external HTTP clients (e.g., `curl` or Postman) with the public Supabase anon key could theoretically query tables directly if remote RLS is disabled.
2. **Keyword Filtering Limitations:** The client-side search query check intercepts known SQL keywords (`UNION`, `SELECT`, `OR 1=1`), but input filtering alone is an auxiliary control; primary SQL injection protection relies on Supabase parameterization via PostgREST.
3. **Session Token Storage:** Active session identity is maintained in browser storage for refresh continuity; production deployment should utilize server-side sessions with `HttpOnly` and `SameSite=Strict` cookies.
4. **Transaction Atomicity:** Checkout operations currently execute sequentially from the client SDK; atomic multi-table transaction guarantees require PostgreSQL stored procedures.

---

## 14. Phase 1 Documentation

Complete, detailed technical specifications and academic deliverables are located in the repository:

### Core Phase 1 Specifications:
- 📄 [Software Requirements Specification (SRS)](docs/Phase1/01_SecureShop_Requirements.md)
- 🏛️ [System Architecture & Design Specification](docs/Phase1/02_SecureShop_System_Architecture.md)
- 🎯 [Threat Model & Risk Assessment (STRIDE)](docs/Phase1/03_SecureShop_Threat_Model.md)
- 🔬 [Security Code Review & Coverage Matrix](docs/Phase1/04_SecureShop_Security_Code_Review.md)
- 🏆 [Phase 1 Project Readiness & Audit Report](docs/Phase1/05_Phase1_Readiness_Report.md)

### Additional Architectural & Test Reports:
- 📋 [Security Design & Threat Modeling Report](docs/Phase1_Security_Design_Report.md)
- 🧪 [Comparative Attack Evidence Report](docs/Phase1_Attack_Evidence_Report.md)
- ⚔️ [Security Assessment & Attack Demonstration Plan](docs/Phase1_Red_Team_Penetration_Test.md)

### Architectural Vector Diagrams:
- 🖼️ [System Architecture Overview (SVG)](docs/Phase1/diagrams/architecture_overview.svg)
- 🖼️ [Database Entity-Relationship Diagram (SVG)](docs/Phase1/diagrams/erd_database.svg)
- 🖼️ [STRIDE Threat Model Data Flow Diagram (SVG)](docs/Phase1/diagrams/threat_model_dfd.svg)

---

## 15. Phase 2 Roadmap

Building on the Phase 1 foundation, the following engineering enhancements are planned for Phase 2:
1. **PostgreSQL Row Level Security (RLS):** Author and enforce database-level policies ensuring customers can only query and mutate their own records.
2. **Atomic Checkout Stored Procedures:** Migrate multi-step checkout logic into a transactional PostgreSQL stored procedure (`plpgsql`) with explicit rollbacks.
3. **Automated Security Regression Suite:** Implement Cypress / Playwright test scripts simulating OWASP attack vectors on every build.
4. **Anti-CSRF & Request Signing:** Introduce cryptographic HMAC request signing between client requests and backend proxies.
