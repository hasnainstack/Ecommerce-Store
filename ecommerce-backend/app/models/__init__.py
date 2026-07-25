# Import models so SQLModel metadata can discover all tables
from app.models.user import User
from app.models.product import Category, Product, ProductVariant, ProductImage, CategoryAttribute
from app.models.order import Order, OrderItem, Payment, OrderStatusHistory
from app.models.settings import SiteSettings
from app.models.attribute import Attribute, AttributeValue
