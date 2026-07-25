from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.api.deps import require_admin
from app.models.order import Order, OrderStatus, OrderItem
from app.models.user import User, UserRole
from app.models.product import Product

router = APIRouter(prefix="/admin/dashboard", tags=["admin"])


# ── Schemas ─────────────────────────────────────────────────────

class MonthlyRevenue(BaseModel):
    month: str  # "Jan", "Feb", etc.
    revenue: float
    orders: int


class OrderStatusBreakdown(BaseModel):
    status: str
    count: int


class DashboardResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    revenue_change: float       # % change vs previous period
    orders_change: float        # % change vs previous period
    customers_change: float     # % change vs previous period
    products_change: float      # % change vs previous period
    monthly_revenue: List[MonthlyRevenue]
    status_breakdown: List[OrderStatusBreakdown]


# ── Endpoint ────────────────────────────────────────────────────

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    session: Session = Depends(get_session),
    _admin=Depends(require_admin),
):
    now = datetime.now(timezone.utc)

    # ── Total counts (all time) ─────────────────────────────────

    total_revenue = session.exec(
        select(func.coalesce(func.sum(Order.total_amount), 0.0))
        .where(Order.status.in_([OrderStatus.delivered, OrderStatus.shipped, OrderStatus.processing, OrderStatus.confirmed]))
    ).one()

    total_orders = session.exec(
        select(func.count(Order.id))
    ).one()

    total_customers = session.exec(
        select(func.count(User.id))
        .where(User.role == UserRole.customer)
    ).one()

    total_products = session.exec(
        select(func.count(Product.id))
        .where(Product.is_active == True)
    ).one()

    # ── Previous period (same length, before "this month") ──────
    # "Current" = orders created since the 1st of this month
    # "Previous" = orders created during the same-length window before that

    def _month_range(d: datetime) -> tuple[datetime, datetime]:
        """Return (start_of_month, now) for a given datetime."""
        start = d.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return start, d

    cur_start, cur_end = _month_range(now)

    # Previous period = the same number of days before cur_start
    days_so_far = (now - cur_start).days + 1  # +1 so we compare full days
    prev_start = cur_start - timedelta(days=days_so_far)

    def _period_revenue_and_orders(start: datetime, end: datetime) -> tuple[float, int]:
        rev = session.exec(
            select(func.coalesce(func.sum(Order.total_amount), 0.0))
            .where(
                Order.created_at >= start,
                Order.created_at <= end,
                Order.status.in_([OrderStatus.delivered, OrderStatus.shipped, OrderStatus.processing, OrderStatus.confirmed]),
            )
        ).one()
        cnt = session.exec(
            select(func.count(Order.id))
            .where(Order.created_at >= start, Order.created_at <= end)
        ).one()
        return rev, cnt

    cur_rev, cur_ord = _period_revenue_and_orders(cur_start, cur_end)
    prev_rev, prev_ord = _period_revenue_and_orders(prev_start, cur_start)
    prev_cust = session.exec(
        select(func.count(User.id))
        .where(User.role == UserRole.customer, User.created_at >= prev_start, User.created_at < cur_start)
    ).one()
    cur_cust = session.exec(
        select(func.count(User.id))
        .where(User.role == UserRole.customer, User.created_at >= cur_start, User.created_at <= cur_end)
    ).one()
    prev_prod = session.exec(
        select(func.count(Product.id))
        .where(Product.is_active == True, Product.created_at >= prev_start, Product.created_at < cur_start)
    ).one()
    cur_prod = session.exec(
        select(func.count(Product.id))
        .where(Product.is_active == True, Product.created_at >= cur_start, Product.created_at <= cur_end)
    ).one()

    def _pct_change(cur: float, prev: float) -> float:
        if prev == 0:
            return 100.0 if cur > 0 else 0.0
        return round((cur - prev) / prev * 100, 1)

    # ── Monthly revenue (last 6 complete months + current month) ─

    monthly: list[MonthlyRevenue] = []
    months_map = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
    }

    for i in range(5, -1, -1):
        # Go back i months from current
        target = now.month - i
        year = now.year
        while target < 1:
            target += 12
            year -= 1
        while target > 12:
            target -= 12
            year += 1

        month_start = datetime(year, target, 1, tzinfo=timezone.utc)
        if target == 12:
            month_end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            month_end = datetime(year, target + 1, 1, tzinfo=timezone.utc)

        rev = session.exec(
            select(func.coalesce(func.sum(Order.total_amount), 0.0))
            .where(
                Order.created_at >= month_start,
                Order.created_at < month_end,
                Order.status.in_([OrderStatus.delivered, OrderStatus.shipped, OrderStatus.processing, OrderStatus.confirmed]),
            )
        ).one()

        ord_cnt = session.exec(
            select(func.count(Order.id))
            .where(Order.created_at >= month_start, Order.created_at < month_end)
        ).one()

        monthly.append(MonthlyRevenue(
            month=months_map.get(target, "??"),
            revenue=rev,
            orders=ord_cnt,
        ))

    # ── Status breakdown ────────────────────────────────────────

    status_breakdown: list[OrderStatusBreakdown] = []
    for s in OrderStatus:
        cnt = session.exec(
            select(func.count(Order.id))
            .where(Order.status == s)
        ).one()
        status_breakdown.append(OrderStatusBreakdown(status=s.value, count=cnt))

    return DashboardResponse(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        total_customers=total_customers,
        total_products=total_products,
        revenue_change=_pct_change(cur_rev, prev_rev),
        orders_change=_pct_change(float(cur_ord), float(prev_ord)),
        customers_change=_pct_change(float(cur_cust), float(prev_cust)),
        products_change=_pct_change(float(cur_prod), float(prev_prod)),
        monthly_revenue=monthly,
        status_breakdown=status_breakdown,
    )
