# Staz-Store Frontend - Project Structure

This document describes the organized folder structure of the Staz-Store Next.js application.

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router (file-based routing)
│   ├── (app)/                    # Route group: Public user pages
│   │   ├── layout.tsx            # Main layout with Navbar & Footer
│   │   ├── page.tsx              # Home page
│   │   ├── profile/              # User profile pages
│   │   ├── topup/                # Top-up flow pages
│   │   ├── promo/                # Promo pages
│   │   └── riwayat-transaksi/    # Transaction history
│   │
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── loading.tsx           # Admin loading state
│   │   ├── dashboard/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── category/page.tsx
│   │   ├── products/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── types/page.tsx
│   │   ├── topups/page.tsx
│   │   ├── transactions/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── layout.tsx            # Centered auth layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   └── api/                      # API routes (server-side)
│       ├── auth/route.ts
│       └── profile/route.ts
│
├── components/                   # React components
│   ├── ui/                       # Primitive UI components (shadcn/ui ONLY)
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   │
│   ├── common/                   # Shared reusable components
│   │   ├── Carousel.tsx
│   │   ├── InputField.tsx
│   │   ├── PaymentAccording.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── LoginForm.tsx
│   │   ├── OrderProcessingModal.tsx
│   │   └── PurchaseForm.tsx
│   │
│   ├── home/                     # Home page specific
│   │   ├── GameCard.tsx
│   │   ├── HeroBanner.tsx
│   │   └── PromoSlider.tsx
│   │
│   ├── topup/                    # Top-up flow components
│   │   ├── ConfirmationModal.tsx
│   │   ├── ContactInfo.tsx
│   │   ├── PaymentMethodSelection.tsx
│   │   ├── PromoCodeInput.tsx
│   │   ├── TopUpCard.tsx
│   │   └── UserIdInput.tsx
│   │
│   ├── admin/                    # Admin-specific components
│   │   ├── AdminSidebar.tsx
│   │   ├── BrandTable.tsx
│   │   ├── CategoryTable.tsx
│   │   ├── CustomersTable.tsx
│   │   ├── DashboardMain.tsx
│   │   ├── DashboardSummary.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ReportsPageContent.tsx
│   │   ├── SettingsPageContent.tsx
│   │   ├── StatCard.tsx
│   │   ├── TopupsTable.tsx
│   │   ├── TransactionCategoryLayout.tsx
│   │   ├── TransactionDetailModal.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionsByCategoryTable.tsx
│   │   ├── TransactionsTable.tsx
│   │   ├── TypeForm.tsx
│   │   ├── TypeTable.tsx
│   │   └── UsersTable.tsx
│   │
│   ├── sections/                 # Page sections
│   │   └── HeroSection.tsx
│   │
│   ├── flashSale/                # Flash sale components
│   │   ├── FlashSaleCard.tsx
│   │   └── FlashSaleSection.tsx
│   │
│   ├── promo/                    # Promo components
│   │   ├── PromoBanner.tsx
│   │   └── PromoList.tsx
│   │
│   ├── purchase/                 # Purchase components
│   │   └── PurchaseFooter.tsx
│   │
│   ├── transactions/             # Transaction components
│   │   └── TransactionHistory.tsx
│   │
│   └── providers/                # React providers
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAdminDashboardQuery.ts # Admin dashboard data hook
│   ├── useAuthSession.ts         # Auth session hook
│   ├── useProductParams.ts       # Product URL params hook
│   ├── useProductQuery.ts        # Product CRUD hooks
│   ├── useProfile.ts             # Profile hook
│   └── useTypes.ts               # Type CRUD hooks
│
├── services/                     # API service layer
│   ├── brand.client.ts           # Brand CRUD operations
│   ├── category.client.ts        # Category CRUD operations
│   ├── dashboard.client.ts       # Dashboard analytics
│   ├── pricingTier.client.ts     # Pricing tier operations
│   ├── product.client.ts         # Product operations
│   ├── topup.client.ts           # Top-up invoice operations
│   ├── transaction.client.ts     # Transaction operations
│   ├── type.client.ts            # Type CRUD operations
│   └── user.client.ts            # User operations
│
├── types/                        # TypeScript type definitions
│   ├── category.types.ts         # Category types
│   ├── dashboard.types.ts        # Dashboard analytics types
│   ├── game.types.ts             # Game & ProductCard props (frontend)
│   ├── paymentMethod.types.ts    # Payment method types
│   ├── product.types.ts          # Product API types (admin/CRUD)
│   ├── purchase.types.ts         # Purchase form types
│   ├── topup.types.ts            # Top-up invoice types
│   ├── topUpCard.types.ts        # TopUpCard component props
│   ├── transaction.types.ts      # Transaction item types
│   ├── type.types.ts             # Brand type CRUD types
│   ├── ui.d.ts                   # UI component ambient declarations
│   └── user.types.ts             # User & role types
│
├── constants/                    # Application constants & config
│   ├── paymentMethods.ts         # Payment method definitions
│   └── product.constants.ts      # Product default params
│
├── data/                         # Static & mock data
│   ├── games.ts                  # Game catalog
│   ├── promoCodes.ts             # Promo codes
│   └── transactions.ts           # Dummy transactions
│
├── lib/                          # Utilities and configurations
│   ├── api-client.ts             # fetchWithJwt helper
│   ├── auth-client.ts            # better-auth client
│   ├── auth-server.ts            # Server-side auth
│   ├── roles.ts                  # Role constants & helpers
│   └── utils.ts                  # General utilities (cn, formatRupiah)
│
└── proxy.ts                      # Next.js middleware (edge runtime)
```

## 📝 Naming Conventions

- **Components**: PascalCase (`ThemeToggle.tsx`, `GameCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuthSession.ts`, `useTypes.ts`)
- **Services**: camelCase with `.client` suffix (`category.client.ts`)
- **Types**: camelCase with `.types.ts` suffix (`category.types.ts`, `product.types.ts`)
- **Constants**: camelCase (`paymentMethods.ts`)
- **Data**: camelCase (`games.ts`, `promoCodes.ts`)

## 🔧 Development Guidelines

### Adding New Components
1. **UI Primitive** → `components/ui/` (shadcn/ui only)
2. **Shared Component** → `components/common/`
3. **Page-Specific** → `components/{feature}/`
4. **Layout** → `components/layout/`

### Adding New Types
- Always use `.types.ts` suffix (e.g. `order.types.ts`)
- Exception: ambient declarations use `.d.ts`
- Place in `types/` folder

### Adding New Hooks
- Always use camelCase with `use` prefix (`useMyHook.ts`)
- Place in `hooks/` folder

### Constants vs Data
- **`constants/`** — Config values, defaults, enums (things that define behavior)
- **`data/`** — Static catalogs, mock data, seed data (things that define content)

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

- Route group `(app)` doesn't affect URL paths
- All imports use `@/` alias pointing to `src/`
- External images configured in `next.config.ts`
- Dark mode via class (not automatic)
- `proxy.ts` is Next.js middleware using edge runtime
