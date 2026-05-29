import requests
from config import Config


BASE_URL = Config.PAYPAL_BASE_URL
CLIENT_ID = Config.PAYPAL_CLIENT_ID
SECRET = Config.PAYPAL_SECRET

# If your store totals are in VND but PayPal account doesn't accept VND for checkout,
# convert to USD for PayPal calls. Adjust EXCHANGE_RATE as needed or make it env-driven.
EXCHANGE_RATE_VND_TO_USD = 23000.0


# =========================
# LẤY ACCESS TOKEN
# =========================
def get_access_token():

    url = f"{BASE_URL}/v1/oauth2/token"

    response = requests.post(
        url,
        auth=(CLIENT_ID, SECRET),
        data={"grant_type": "client_credentials"}
    )

    return response.json()['access_token']

# =========================
# TẠO ORDER
# =========================
def create_paypal_order(order_id, total):

    access_token = get_access_token()

    url = f"{BASE_URL}/v2/checkout/orders"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    # Convert to USD for PayPal if total looks like VND (large number)
    try:
        total_value = float(total)
    except Exception:
        total_value = 0.0

    # Simple heuristic: if amount > 1000 assume it's VND and convert.
    if total_value > 1000:
        usd_amount = round(total_value / EXCHANGE_RATE_VND_TO_USD, 2)
        currency = "USD"
        amount_value = f"{usd_amount:.2f}"
    else:
        # small amounts assumed to already be in USD
        currency = "USD"
        amount_value = f"{total_value:.2f}"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(order_id),
                "amount": {
                    "currency_code": currency,
                    "value": amount_value
                }
            }
        ],
        "application_context": {
            "return_url": "http://127.0.0.1:5000/user/payment-success.html",
            "cancel_url": "http://127.0.0.1:5000/user/payment-failed.html"
        }
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload
    )

    return response.json()


# =========================
# CAPTURE PAYMENT
# =========================
def capture_paypal_order(paypal_order_id):

    access_token = get_access_token()

    url = f"{BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.post(
        url,
        headers=headers
    )

    return response.json()


def get_paypal_order(paypal_order_id):
    """Lấy chi tiết order từ PayPal"""
    access_token = get_access_token()
    url = f"{BASE_URL}/v2/checkout/orders/{paypal_order_id}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    response = requests.get(url, headers=headers)
    return response.json()