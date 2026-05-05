export interface DashboardSummary {
  totalRevenueToday: number;
  totalTransactionsToday: number;
  averageTransactionToday: number;
  successRateToday: number;
  revenueGrowthPercent: number;
  transactionGrowthPercent: number;
  averageTransactionGrowthPercent: number;
  successRateGrowthPercent: number;
  totalProducts: number;
  activeUsers: number;
  totalCategories: number;
  totalRevenueYesterday?: number;
  totalTransactionsYesterday?: number;
  averageTransactionYesterday?: number;
  successRateYesterday?: number;
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

export interface SubCategoryDistribution {
  name: string;
  count: number;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
  revenue: number;
  color?: string;
  subcategories?: SubCategoryDistribution[];
}

export interface TransactionStatusItem {
  name: string;
  value: number;
  color?: string;
}

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
