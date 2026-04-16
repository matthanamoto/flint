// ============================================================
// FLINT — Registry
// ============================================================
// Data source registry. Edit this file to add tables, metrics,
// and guardrails. Adapt to your own data stack.
// ============================================================

const REGISTRY = {
  tables: [
    {
      id: 'users',
      fqn: 'analytics.users',
      short: 'users',
      grain: 'user_id',
      partitionKeys: ['created_date'],
      keyColumns: ['user_id', 'email', 'plan_type', 'signup_date', 'country', 'lifecycle_stage'],
      joinPatterns: 'users + orders on user_id; users + events on user_id',
      gotchas: 'SCD Type 2 — filter on is_current = true for latest snapshot',
      timezone: 'UTC'
    },
    {
      id: 'orders',
      fqn: 'analytics.orders',
      short: 'orders',
      grain: 'order_id',
      partitionKeys: ['order_date'],
      keyColumns: ['order_id', 'user_id', 'order_date', 'total_amount', 'currency', 'status', 'product_id', 'discount_amount'],
      joinPatterns: 'orders + users on user_id; orders + products on product_id',
      gotchas: "Includes cancelled/refunded — filter on status = 'completed' for revenue; amounts in cents",
      timezone: 'UTC'
    },
    {
      id: 'events',
      fqn: 'analytics.user_events',
      short: 'user_events',
      grain: 'event_id',
      partitionKeys: ['event_date'],
      keyColumns: ['event_id', 'user_id', 'event_name', 'event_timestamp', 'session_id', 'page_url', 'properties'],
      joinPatterns: 'events + users on user_id; events + sessions on session_id',
      gotchas: 'High volume — always filter on event_date partition; properties is JSON — use get_json_object()',
      timezone: 'UTC'
    },
    {
      id: 'products',
      fqn: 'analytics.products',
      short: 'products',
      grain: 'product_id',
      partitionKeys: [],
      keyColumns: ['product_id', 'product_name', 'category', 'price', 'sku', 'is_active'],
      joinPatterns: 'products + orders on product_id',
      gotchas: 'Slowly changing — use is_active = true for current catalog',
      timezone: 'N/A'
    },
    {
      id: 'sessions',
      fqn: 'analytics.sessions',
      short: 'sessions',
      grain: 'session_id',
      partitionKeys: ['session_date'],
      keyColumns: ['session_id', 'user_id', 'session_date', 'start_time', 'end_time', 'channel', 'device_type', 'page_count', 'duration_seconds'],
      joinPatterns: 'sessions + users on user_id; sessions + events on session_id',
      gotchas: 'Anonymous sessions have null user_id; duration_seconds can be 0 for single-page bounces',
      timezone: 'UTC'
    }
  ],

  metrics: {
    derived: [
      { name: 'Conversion Rate', formula: 'conversions / sessions', splitDate: false },
      { name: 'ARPU',            formula: 'revenue / active_users', splitDate: false },
      { name: 'Retention Rate',  formula: 'retained_users / prior_period_users', splitDate: false },
      { name: 'Cart Abandonment',formula: '1 - (completed_orders / carts_created)', splitDate: false },
      { name: 'LTV',             formula: 'avg_order_value * purchase_frequency * avg_lifespan', splitDate: false }
    ],
    base: [
      { name: 'Active Users', file: 'active_users.sql' },
      { name: 'Revenue',      file: 'revenue.sql' },
      { name: 'Signups',      file: 'signups.sql' },
      { name: 'Sessions',     file: 'sessions.sql' },
      { name: 'Orders',       file: 'orders.sql' }
    ]
  },

  guardrails: [
    {
      id: 'ytd_boundary',
      name: 'YTD Date Boundary',
      prevents: "Including today's partial data in YTD aggregates",
      correctPattern: "Use < current_date() not <= current_date() for YTD cutoffs — today's data is incomplete",
      appliesWhen: 'All YTD reporting date cutoffs'
    },
    {
      id: 'partition_pruning',
      name: 'Partition Key Filters',
      prevents: 'Full table scans on large tables',
      correctPattern: 'Always include partition column filters in WHERE clauses before running',
      appliesWhen: 'All partitioned tables'
    },
    {
      id: 'yoy_alignment',
      name: 'YoY Date Alignment',
      prevents: 'Day-of-week calendar shift distorting year-over-year comparisons',
      correctPattern: 'Align on day-of-week or iso_week, not raw calendar date, when comparing periods across years',
      appliesWhen: 'Any year-over-year comparison'
    }
  ]
};
