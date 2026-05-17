export interface DashboardSummary {
  totalRevenueToday: number;
  totalTransactionsToday: number;
  averageTransactionToday: number;
  successRateToday: number;
  totalProfitToday: number;
  revenueGrowthPercent: number;
  transactionGrowthPercent: number;
  averageTransactionGrowthPercent: number;
  successRateGrowthPercent: number;
  profitGrowthPercent: number;
  totalProducts: number;
  activeUsers: number;
  totalCategories: number;
  totalRevenueYesterday?: number;
  totalTransactionsYesterday?: number;
  averageTransactionYesterday?: number;
  successRateYesterday?: number;
  totalProfitYesterday?: number;
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  transactions: number;
}

export interface RecentActivityItem {
  id: string;
  userName: string;
  status: string;
  amount: number;
  createdAt: string;
  description?: string;
  metadata?: {
    productName?: string;
    [key: string]: any;
  };
}

/* ── Category Distribution (from API) ── */

export interface CategoryBrand {
  name: string;
  totalTransactions: number;
}

export interface CategoryDistributionItem {
  categoryName: string;
  totalTransactions: number;
  totalRevenue: number;
  percentage: number;
  brands: CategoryBrand[];
}

/* ── Transaction Status ── */

/** Raw shape returned by the API */
export interface TransactionStatusRaw {
  success: number;
  pending: number;
  failed: number;
  refunded: number;
  canceled: number;
}

/** Transformed item used by Recharts */
export interface TransactionStatusItem {
  name: string;
  key: string;
  value: number;
  color: string;
}

/* ── Dashboard Payload (after service transform) ── */

export interface DashboardPayload {
  summary: DashboardSummary;
  revenueTrend: RevenueTrendItem[];
  recentActivities: RecentActivityItem[];
  categoryDistribution: CategoryDistributionItem[];
  transactionStatus: TransactionStatusItem[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardPayload;
}
