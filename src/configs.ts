export enum baseUrls {
    LOGIN='/',
    ANALYTICS='/home',
    PAYMENT_INFO='/home/payment-info',
    SIGN_OUT='/signout',
    ADMIN_BASE_URL='/admin',
    ADMIN_ANALYTICS='/admin/analytics',
    ADMIN_PAYMENTS='/admin/payments'
}

export enum analyticsConfig {
    defaultQuarters=4,
    defaultProperty="Total (Net Revenue - Refund)"
}

export enum graphConfig {
    graphHeight=300,
    graphWidthMax=1000
}

export enum dbTableNames {
    testQuarterlyReports='test_quarterly_reports',
    quarterlyReports='quarterly_reports',
    testCouponCodes='coupon_codes',
    couponCodes='coupon_codes'
}

export enum fileTypes {
    csvs='text/csv application/vnd.ms-excel'
}

export enum timers {
    errorTimeout=5000,
    nextErrorTimeout=500,
}

export enum apiRoutes {
    updateCouponCode='api/user/update-coupon-code',
    createQuarterlyReport='api/analytics/create-quarterly-report',
    createCouponCode='api/user/create-coupon-code'
}
