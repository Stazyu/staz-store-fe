# Staz-Store Frontend - Project Structure

This document describes the organized folder structure of the Staz-Store Next.js application.

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router (file-based routing)
│   ├── (auth)/                   # Route group: Authentication pages
│   │   ├── layout.tsx            # Centered auth layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (main)/                   # Route group: Public user pages
│   │   ├── layout.tsx            # Main layout with Navbar & Footer
│   │   ├── page.tsx              # Home page
│   │   ├── profile/              # User profile pages
│   │   ├── topup/                # Top-up flow pages
│   │   ├── promo/                # Promo pages
│   │   └── riwayat-transaksi/    # Transaction history
│   │
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── category/page.tsx
│   │   ├── products/page.tsx
│   │   ├── transactions/
│   │   └── ...
│   │
│   └── api/                      # API routes (server-side)
│       ├── auth/route.ts
│       └── profile/route.ts
│
├── components/                   # React components
│   ├── ui/                       # Primitive UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (UI primitives only)
│   │
│   ├── common/                   # Shared reusable components
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   ├── Carousel.tsx          # Image carousel
│   │   ├── PaymentAccording.tsx  # Payment accordion
│   │   └── InputField.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AppLayout.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── LoginForm.tsx
│   │   ├── PurchaseForm.tsx
│   │   └── OrderProcessingModal.tsx
│   │
│   ├── home/                     # Home page specific
│   │   ├── HeroBanner.tsx
│   │   ├── PromoSlider.tsx
│   │   └── GameCard.tsx          # Game/product card
│   │
│   ├── topup/                    # Top-up flow components
│   │   ├── TopUpCard.tsx
│   │   ├── UserIdInput.tsx
│   │   ├── PaymentMethodSelection.tsx
│   │   ├── ContactInfo.tsx
│   │   ├── PromoCodeInput.tsx
│   │   └── ConfirmationModal.tsx
│   │
│   ├── profile/                  # Profile page components
│   ├── promo/                    # Promo components
│   ├── transactions/             # Transaction components
│   ├── flashSale/                # Flash sale components
│   ├── sections/                 # Page sections
│   ├── admin/                    # Admin-specific components
│   └── providers/                # React providers
│       ├── AuthSession.tsx
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── features/                     # Feature-based organization (NEW)
│   ├── auth/                     # Auth feature logic
│   ├── topup/                    # Top-up feature logic
│   ├── transactions/             # Transaction feature logic
│   ├── admin/                    # Admin feature logic
│   └── profile/                  # Profile feature logic
│
├── lib/                          # Utilities and configurations
│   ├── api/                      # API client utilities
│   ├── auth/                     # Auth utilities
│   ├── utils.ts                  # General utilities (cn, formatRupiah)
│   ├── api-client.ts             # fetchWithJwt helper
│   ├── auth-client.ts            # better-auth client
│   └── roles.ts                  # Role constants & helpers
│
├── services/                     # API service layer
│   ├── brand.client.ts           # Brand CRUD operations
│   ├── category.client.ts        # Category CRUD operations
│   ├── product.client.ts         # Product operations
│   ├── topup.client.ts           # Top-up invoice operations
│   └── user.client.ts            # User operations
│
├── types/                        # TypeScript type definitions
│   ├── category.types.ts         # Category types (fixed extension)
│   ├── paymentMethod.ts          # Payment method types
│   ├── product.ts                # Game and ProductCard types
│   ├── purchase.ts               # Purchase form types
│   ├── topup.client.ts           # Top-up invoice types
│   ├── topUpCard.ts              # TopUpCard component props
│   ├── transaction.ts            # Transaction item type
│   ├── ui.d.ts                   # UI component declarations
│   └── user.client.ts            # User and role types
│
├── hooks/                        # Custom React hooks
│   ├── useAuthSession.ts         # Auth session hook
│   └── useProfile.ts             # Profile hook
│
├── constants/                    # Application constants
│   └── paymentMethods.ts         # Payment method definitions
│
└── data/                         # Static/mock data
    ├── games.ts                  # Game catalog
    ├── promoCodes.ts             # Promo codes
    └── transactions.ts           # Dummy transactions
```

## 🎯 Key Improvements

### 1. **Component Organization**
- **Before**: Components scattered at root level (`Carousel.tsx`, `ThemeToogle.tsx`, etc.)
- **After**: Grouped by purpose in `common/`, `layout/`, feature folders

### 2. **Route Groups**
- `(auth)` - Authentication pages (login, register, password reset)
- `(main)` - Public user pages (home, profile, topup)
- `admin/` - Admin dashboard (protected routes)

### 3. **Type Files**
- **Before**: Mixed `.d.ts` and `.ts` extensions
- **After**: Consistent `.ts` extension for all type files

### 4. **Feature-Based Organization**
- New `features/` directory for grouping related logic
- Makes it easier to find related components, hooks, and services

### 5. **Clear Separation**
- `ui/` - Only primitive UI components (shadcn)
- `common/` - Shared reusable components
- Feature folders - Page/feature-specific components

## 📝 Naming Conventions

- **Components**: PascalCase (`ThemeToggle.tsx`, `GameCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuthSession.ts`)
- **Services**: camelCase with `.client` suffix (`category.client.ts`)
- **Types**: kebab-case with `.types.ts` suffix (`category.types.ts`)
- **Constants**: camelCase (`paymentMethods.ts`)

## 🔧 Development Guidelines

### Adding New Components
1. **UI Primitive** → `components/ui/`
2. **Shared Component** → `components/common/` or appropriate feature folder
3. **Page-Specific** → `components/{feature}/`
4. **Layout** → `components/layout/`

### Adding New Types
- Always use `.ts` extension (not `.d.ts`)
- Place in `types/` folder
- Use `.types.ts` suffix for clarity

### Adding New Features
1. Create folder in `features/{feature-name}/`
2. Add related components, hooks, services
3. Update route in `app/` directory

## 🚀 Build & Development

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Lint code
bun run lint
```

## 📦 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Auth**: better-auth
- **State**: TanStack React Query
- **Database**: Prisma ORM (PostgreSQL)
- **Animation**: Framer Motion
- **Components**: Radix UI primitives, Headless UI

## 📌 Notes

- Route groups `(auth)` and `(main)` don't affect URL paths
- All imports use `@/` alias pointing to `src/`
- External images configured in `next.config.ts`
- Dark mode via class (not automatic)
