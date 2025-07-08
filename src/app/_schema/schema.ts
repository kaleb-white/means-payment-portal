export interface SalesData {
    data: MonthlySales[]
}

export interface MonthlySales {
    sales: number;
    month: number;
    year: number;
}
