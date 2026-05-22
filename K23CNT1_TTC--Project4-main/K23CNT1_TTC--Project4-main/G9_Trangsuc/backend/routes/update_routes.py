import os
import re

# Define updates for each route file
updates = [
    {
        'path': 'cart_checkout/order_routes.py',
        'model_import': 'from models.order_model import OrderModel',
        'model': 'OrderModel',
        'methods': ['get_all_orders', 'get_orders_by_user', 'get_order_detail', 'create_order', 'update_order_status']
    },
    {
        'path': 'account/user_routes.py',
        'model_import': 'from models.user_model import UserModel',
        'model': 'UserModel',
        'methods': ['get_all_users', 'update_user_status']
    },
    {
        'path': 'admin_management/admin_routes.py',
        'model_import': 'from models.admin_model import AdminModel',
        'model': 'AdminModel',
        'methods': ['get_all_users', 'update_user_status']
    },
    {
        'path': 'admin_management/dashboard_routes.py',
        'model_import': 'from models.dashboard_model import DashboardModel',
        'model': 'DashboardModel',
        'methods': ['get_dashboard_stats']
    },
    {
        'path': 'news/news_routes.py',
        'model_import': 'from models.news_model import NewsModel',
        'model': 'NewsModel',
        'methods': ['get_all_news']
    },
    {
        'path': 'gold/gold_routes.py',
        'model_import': 'from models.gold_model import GoldModel',
        'model': 'GoldModel',
        'methods': ['get_all_gold_prices']
    }
]

def add_model_import(content, model_import):
    # Check if import already exists
    if model_import in content:
        return content
    
    # Find the last import line
    lines = content.split('\n')
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('import ') or line.startswith('from '):
            last_import_idx = i
    
    if last_import_idx >= 0:
        lines.insert(last_import_idx + 1, model_import)
    else:
        lines.insert(0, model_import)
    
    return '\n'.join(lines)

def wrap_with_error_handling(method_call, route_line):
    lines = method_call.split('\n')
    return f'''try:
        {method_call}
    except Exception as e:
        return {{'error': str(e)}}, 500'''

# Process each file
for update in updates:
    filepath = update['path']
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add model import
        content = add_model_import(content, update['model_import'])
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"? Updated {filepath}")
    else:
        print(f"? File not found: {filepath}")
