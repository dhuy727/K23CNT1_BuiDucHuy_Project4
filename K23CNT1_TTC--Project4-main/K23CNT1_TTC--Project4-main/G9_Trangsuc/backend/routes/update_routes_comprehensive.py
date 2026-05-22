import os
import re
import ast

def wrap_route_function(func_body, model_name, model_method):
    """Wrap route function body with try-except error handling"""
    lines = func_body.strip().split('\n')
    # Filter out decorator lines
    body_lines = [l for l in lines if not l.strip().startswith('@')]
    indented_body = '\n'.join(['        ' + l if l.strip() else l for l in body_lines[1:]])
    
    return f'''try:
{indented_body}
    except Exception as e:
        return {{'error': str(e)}}, 500'''

# File configurations
configs = {
    'cart_checkout/order_routes.py': {
        'model': 'OrderModel',
        'import_line': 'from models.order_model import OrderModel'
    },
    'account/user_routes.py': {
        'model': 'UserModel',
        'import_line': 'from models.user_model import UserModel'
    },
    'admin_management/admin_routes.py': {
        'model': 'AdminModel',
        'import_line': 'from models.admin_model import AdminModel'
    },
    'admin_management/dashboard_routes.py': {
        'model': 'DashboardModel',
        'import_line': 'from models.dashboard_model import DashboardModel'
    },
    'news/news_routes.py': {
        'model': 'NewsModel',
        'import_line': 'from models.news_model import NewsModel'
    },
    'gold/gold_routes.py': {
        'model': 'GoldModel',
        'import_line': 'from models.gold_model import GoldModel'
    }
}

# Process each file
for filepath, config in configs.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if model import exists
        if config['import_line'] not in content:
            # Add import after other imports
            lines = content.split('\n')
            import_added = False
            for i, line in enumerate(lines):
                if line.startswith('from ') or line.startswith('import '):
                    if not import_added and (i == len(lines) - 1 or not lines[i+1].startswith('from ') and not lines[i+1].startswith('import ')):
                        lines.insert(i + 1, config['import_line'])
                        import_added = True
                        break
            
            if not import_added:
                lines.insert(0, config['import_line'])
            
            content = '\n'.join(lines)
        
        # Find all function definitions and add try-except error handling
        # This is a simplified approach - for complex functions, manual review is recommended
        pattern = r'@.*?\ndef\s+(\w+)\s*\((.*?)\):\s*\n((?:(?!^def\s|\n@).*\n)*)'
        
        def replace_func(match):
            decorator = match.group(0).split('def')[0]
            func_def = f'def {match.group(1)}({match.group(2)}):'
            func_body = match.group(3)
            
            # Check if already wrapped in try-except
            if 'try:' in func_body:
                return match.group(0)
            
            # Wrap body with try-except
            indented_body = '\n'.join(['    ' + line if line.strip() else line for line in func_body.strip().split('\n')])
            wrapped = f'{decorator}{func_def}\n    try:\n{indented_body}\n    except Exception as e:\n        return {{"error": str(e)}}, 500\n'
            return wrapped
        
        content = re.sub(pattern, replace_func, content, flags=re.MULTILINE | re.DOTALL)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"? Updated {filepath}")
    else:
        print(f"? File not found: {filepath}")
