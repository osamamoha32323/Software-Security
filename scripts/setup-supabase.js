import pg from 'pg';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';
import { INITIAL_USERS, INITIAL_COUPONS } from '../src/data/initialSecurityData.ts';

const { Client } = pg;

const client = new Client({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.nojbpgdtlrcdyxsvmluh',
  password: 'BusinessOS@2026#DB',
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log('Connecting to Supabase PostgreSQL Database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Creating tables in Supabase...');

    await client.query(`
      -- جدول المنتجات (Products)
      CREATE TABLE IF NOT EXISTS public.products (
        id text PRIMARY KEY,
        title_ar text NOT NULL,
        title_en text,
        description_ar text NOT NULL,
        description_en text,
        category text NOT NULL,
        category_ar text NOT NULL,
        taager_price numeric NOT NULL DEFAULT 0,
        selling_price numeric NOT NULL DEFAULT 0,
        original_price numeric NOT NULL DEFAULT 0,
        stock integer NOT NULL DEFAULT 0,
        images jsonb DEFAULT '[]'::jsonb,
        features jsonb DEFAULT '[]'::jsonb,
        specifications jsonb DEFAULT '{}'::jsonb,
        is_featured boolean DEFAULT false,
        is_deal boolean DEFAULT false,
        deal_badge text,
        rating numeric DEFAULT 5.0,
        reviews_count integer DEFAULT 0,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );

      -- جدول المستخدمين (Users)
      CREATE TABLE IF NOT EXISTS public.users (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        salt text NOT NULL,
        role text NOT NULL DEFAULT 'user',
        is_confirmed boolean DEFAULT false,
        confirmation_code text,
        store_credit numeric DEFAULT 0,
        phone text,
        city text,
        address text,
        governorate text,
        failed_attempts integer DEFAULT 0,
        is_locked boolean DEFAULT false,
        lock_until bigint,
        created_at timestamptz DEFAULT now()
      );

      -- جدول الكوبونات (Coupons)
      CREATE TABLE IF NOT EXISTS public.coupons (
        id text PRIMARY KEY,
        code text UNIQUE NOT NULL,
        discount_percent numeric NOT NULL,
        max_discount numeric NOT NULL,
        min_order_amount numeric NOT NULL,
        expiry_date timestamptz NOT NULL,
        used_by_users jsonb DEFAULT '[]'::jsonb,
        is_active boolean DEFAULT true,
        is_single_use_per_user boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );

      -- جدول الطلبات (Orders)
      CREATE TABLE IF NOT EXISTS public.orders (
        id text PRIMARY KEY,
        order_number text UNIQUE NOT NULL,
        user_id text,
        customer_name text NOT NULL,
        customer_phone text NOT NULL,
        governorate_id text NOT NULL,
        governorate_ar text NOT NULL,
        city text NOT NULL,
        address text NOT NULL,
        notes text,
        items jsonb NOT NULL,
        subtotal numeric NOT NULL,
        shipping_cost numeric NOT NULL,
        coupon_discount numeric DEFAULT 0,
        total_amount numeric NOT NULL,
        taager_cost numeric DEFAULT 0,
        net_profit numeric DEFAULT 0,
        status text NOT NULL DEFAULT 'pending',
        payment_method text NOT NULL DEFAULT 'cod',
        timeline jsonb NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      -- جدول سجلات الأمان (Security Logs)
      CREATE TABLE IF NOT EXISTS public.security_logs (
        id text PRIMARY KEY,
        attack_type text NOT NULL,
        payload text NOT NULL,
        blocked boolean DEFAULT true,
        details text NOT NULL,
        user_id text,
        created_at timestamptz DEFAULT now()
      );

      -- منح الصلاحيات للمستخدمين والمفتاح العام (anon & authenticated)
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    `);

    console.log('Tables created and permissions granted successfully!');

    // إدخال المنتجات
    console.log(`Seeding ${INITIAL_PRODUCTS.length} products into Supabase...`);
    for (const p of INITIAL_PRODUCTS) {
      await client.query(`
        INSERT INTO public.products (
          id, title_ar, title_en, description_ar, description_en,
          category, category_ar, taager_price, selling_price, original_price,
          stock, images, features, specifications, is_featured, is_deal,
          deal_badge, rating, reviews_count, is_active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO UPDATE SET
          title_ar = EXCLUDED.title_ar,
          description_ar = EXCLUDED.description_ar,
          selling_price = EXCLUDED.selling_price,
          original_price = EXCLUDED.original_price,
          stock = EXCLUDED.stock,
          images = EXCLUDED.images,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications;
      `, [
        p.id,
        p.titleAr,
        p.titleEn || null,
        p.descriptionAr,
        p.descriptionEn || null,
        p.category,
        p.categoryAr,
        p.taagerPrice,
        p.sellingPrice,
        p.originalPrice,
        p.stock,
        JSON.stringify(p.images || []),
        JSON.stringify(p.features || []),
        JSON.stringify(p.specifications || {}),
        !!p.isFeatured,
        !!p.isDeal,
        p.dealBadge || null,
        p.rating || 5,
        p.reviewsCount || 0,
        p.isActive ?? true,
        p.createdAt || new Date().toISOString()
      ]);
    }

    // إدخال المستخدمين
    console.log(`Seeding ${INITIAL_USERS.length} users into Supabase...`);
    for (const u of INITIAL_USERS) {
      await client.query(`
        INSERT INTO public.users (
          id, name, email, password_hash, salt, role, is_confirmed,
          confirmation_code, store_credit, phone, city, address, governorate,
          failed_attempts, is_locked, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          salt = EXCLUDED.salt,
          role = EXCLUDED.role,
          is_confirmed = EXCLUDED.is_confirmed,
          store_credit = EXCLUDED.store_credit;
      `, [
        u.id,
        u.name,
        u.email.toLowerCase(),
        u.passwordHash,
        u.salt,
        u.role,
        u.isConfirmed,
        u.confirmationCode,
        u.storeCredit || 0,
        u.phone || null,
        u.city || null,
        u.address || null,
        u.governorate || null,
        u.failedAttempts || 0,
        !!u.isLocked,
        u.createdAt || new Date().toISOString()
      ]);
    }

    // إدخال الكوبونات
    console.log(`Seeding ${INITIAL_COUPONS.length} coupons into Supabase...`);
    for (const c of INITIAL_COUPONS) {
      await client.query(`
        INSERT INTO public.coupons (
          id, code, discount_percent, max_discount, min_order_amount,
          expiry_date, used_by_users, is_active, is_single_use_per_user
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          discount_percent = EXCLUDED.discount_percent,
          max_discount = EXCLUDED.max_discount,
          min_order_amount = EXCLUDED.min_order_amount,
          is_active = EXCLUDED.is_active;
      `, [
        c.id,
        c.code,
        c.discountPercent,
        c.maxDiscount,
        c.minOrderAmount,
        c.expiryDate,
        JSON.stringify(c.usedByUsers || []),
        c.isActive,
        c.isSingleUsePerUser
      ]);
    }

    // إخطار schema cache الخاص بـ PostgREST
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log('🎉 ALL DATA AND SCHEMA SUCCESSFULLY SETUP IN SUPABASE!');
    await client.end();
  } catch (err) {
    console.error('Setup error:', err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

setup();
