import {
  LayoutDashboard,
  Layers,
  Tags,
  Boxes,
  Package,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Wallet,
  ArrowLeftRight,
  SlidersHorizontal,
  Users,
  TicketPercent,
  Image as ImageIcon,
  Server,
  FileBarChart,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Key used to look up badge count from the badge data map */
  badgeKey?: string;
  /** Permission string for access control */
  permission?: string;
};

export type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

// ─── Badge keys (constants to avoid typos) ────────────────────────────────────

export const BADGE_KEYS = {
  PENDING_ORDERS: "pendingOrders",
  UNPAID_PAYMENTS: "unpaidPayments",
  PENDING_REFUNDS: "pendingRefunds",
  PENDING_DEPOSITS: "pendingDeposits",
} as const;

// ─── Sidebar Config ───────────────────────────────────────────────────────────

export const adminSidebarGroups: SidebarGroup[] = [
  {
    label: "MENU UTAMA",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.read",
      },
    ],
  },
  {
    label: "KATALOG",
    items: [
      {
        title: "Kategori",
        href: "/admin/categories",
        icon: Layers,
        permission: "category.read",
      },
      {
        title: "Brand / Game",
        href: "/admin/brands",
        icon: Tags,
        permission: "brand.read",
      },
      {
        title: "Tipe Produk",
        href: "/admin/product-types",
        icon: Boxes,
        permission: "product_type.read",
      },
      {
        title: "Produk",
        href: "/admin/products",
        icon: Package,
        permission: "product.read",
      },
    ],
  },
  {
    label: "PESANAN",
    items: [
      {
        title: "Order",
        href: "/admin/orders",
        icon: ShoppingCart,
        badgeKey: BADGE_KEYS.PENDING_ORDERS,
        permission: "order.read",
      },
      {
        title: "Pembayaran",
        href: "/admin/payments",
        icon: CreditCard,
        badgeKey: BADGE_KEYS.UNPAID_PAYMENTS,
        permission: "payment.read",
      },
      {
        title: "Refund",
        href: "/admin/refunds",
        icon: RotateCcw,
        badgeKey: BADGE_KEYS.PENDING_REFUNDS,
        permission: "refund.read",
      },
    ],
  },
  {
    label: "SALDO USER",
    items: [
      {
        title: "Deposit Saldo",
        href: "/admin/deposits",
        icon: Wallet,
        badgeKey: BADGE_KEYS.PENDING_DEPOSITS,
        permission: "deposit.read",
      },
      {
        title: "Mutasi Saldo",
        href: "/admin/balance-mutations",
        icon: ArrowLeftRight,
        permission: "balance_mutation.read",
      },
      {
        title: "Penyesuaian Saldo",
        href: "/admin/balance-adjustments",
        icon: SlidersHorizontal,
        permission: "balance_adjustment.read",
      },
    ],
  },
  {
    label: "USER",
    items: [
      {
        title: "Pengguna",
        href: "/admin/users",
        icon: Users,
        permission: "user.read",
      },
    ],
  },
  {
    label: "MARKETING",
    items: [
      {
        title: "Promo",
        href: "/admin/promos",
        icon: TicketPercent,
        permission: "promo.read",
      },
      {
        title: "Banner",
        href: "/admin/banners",
        icon: ImageIcon,
        permission: "banner.read",
      },
    ],
  },
  {
    label: "SISTEM",
    items: [
      {
        title: "Provider",
        href: "/admin/providers",
        icon: Server,
        permission: "provider.read",
      },
      {
        title: "Laporan",
        href: "/admin/reports",
        icon: FileBarChart,
        permission: "report.read",
      },
      {
        title: "Audit Log",
        href: "/admin/audit-logs",
        icon: ShieldCheck,
        permission: "audit_log.read",
      },
      {
        title: "Pengaturan",
        href: "/admin/settings",
        icon: Settings,
        permission: "setting.read",
      },
    ],
  },
];
