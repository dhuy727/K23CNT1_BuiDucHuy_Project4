from flask import Blueprint, request, jsonify
from services.paypal_service import (
    create_paypal_order,
    capture_paypal_order,
    get_paypal_order
)
from models.order_model import OrderModel

paypal_bp = Blueprint('paypal', __name__)


def _resolve_order_id(paypal_order_id=None, order_id=None):
    if order_id is not None:
        return int(order_id)

    if not paypal_order_id:
        return None

    try:
        paypal_order = get_paypal_order(paypal_order_id)
    except Exception:
        return None

    if not paypal_order or not isinstance(paypal_order, dict):
        return None

    purchase_units = paypal_order.get('purchase_units') or []
    if not purchase_units:
        return None

    reference_id = purchase_units[0].get('reference_id')
    return int(reference_id) if reference_id is not None else None


def _extract_order_reference(paypal_response):
    purchase_units = paypal_response.get('purchase_units') or []
    if not purchase_units:
        return None

    reference_id = purchase_units[0].get('reference_id')
    return int(reference_id) if reference_id is not None else None


@paypal_bp.route('/create-order', methods=['POST'])
def create_order():
    data = request.json or {}
    order_id = data.get('order_id')
    total = data.get('total')

    if not order_id or total is None:
        return jsonify({
            'success': False,
            'message': 'order_id và total là bắt buộc'
        }), 400

    paypal_resp = create_paypal_order(order_id, total)

    # PayPal returns order object with 'id' and 'links'. If something went wrong
    # the response may contain 'name'/'message' error fields. Normalize errors
    if not isinstance(paypal_resp, dict):
        return jsonify({'success': False, 'message': 'Lỗi trả về từ PayPal'}), 502

    # If PayPal returned an error payload, forward a useful message
    if paypal_resp.get('name') or paypal_resp.get('message'):
        msg = paypal_resp.get('message') or paypal_resp.get('name')
        return jsonify({'success': False, 'message': f'PayPal error: {msg}', 'detail': paypal_resp}), 400

    # Ensure there's an approval link
    links = paypal_resp.get('links') or []
    approve = next((l for l in links if l.get('rel') == 'approve'), None)
    if not approve:
        return jsonify({'success': False, 'message': 'Không nhận được liên kết duyệt thanh toán từ PayPal', 'detail': paypal_resp}), 400

    return jsonify(paypal_resp)


@paypal_bp.route('/capture', methods=['POST'])
def capture_order():
    data = request.json
    paypal_order_id = data.get('paypal_order_id')

    if not paypal_order_id:
        return jsonify({
            'success': False,
            'message': 'paypal_order_id không được để trống'
        }), 400

    response = capture_paypal_order(paypal_order_id)

    if response.get('status') == 'COMPLETED':
        order_reference = _extract_order_reference(response)
        transaction_id = None

        purchase_units = response.get('purchase_units') or []
        if purchase_units:
            captures = purchase_units[0].get('payments', {}).get('captures', [])
            if captures:
                transaction_id = captures[0].get('id')

        if order_reference is not None:
            try:
                from models.payment_model import PaymentModel
                PaymentModel.update_payment_status(order_reference, 'Đã thanh toán', transaction_id)
                OrderModel.update_order_status(order_reference, 'Đã thanh toán')
            except Exception as err:
                return jsonify({
                    'success': False,
                    'message': f'Capture thành công nhưng không cập nhật thông tin đơn hàng/thanh toán: {err}'
                }), 500
    else:
        order_reference = _extract_order_reference(response)
        if order_reference is None:
            try:
                order_reference = _resolve_order_id(paypal_order_id=paypal_order_id)
            except Exception:
                order_reference = None

        if order_reference is not None:
            try:
                OrderModel.cancel_unpaid_order_and_restore_cart(order_reference)
            except Exception:
                pass

    return jsonify(response)


@paypal_bp.route('/cancel', methods=['POST'])
def cancel_order():
    data = request.json or {}
    paypal_order_id = data.get('paypal_order_id')
    order_id = data.get('order_id')

    if not paypal_order_id and order_id is None:
        return jsonify({'success': False, 'message': 'paypal_order_id hoặc order_id là bắt buộc'}), 400

    try:
        resolved_order_id = _resolve_order_id(
            paypal_order_id=paypal_order_id,
            order_id=order_id
        )
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'order_id không hợp lệ'}), 400

    if resolved_order_id is None:
        return jsonify({'success': False, 'message': 'Không tìm thấy đơn hàng để hủy'}), 400

    try:
        result = OrderModel.cancel_unpaid_order_and_restore_cart(resolved_order_id)
    except ValueError as err:
        return jsonify({'success': False, 'message': str(err)}), 400
    except Exception as err:
        return jsonify({'success': False, 'message': f'Không thể hủy đơn hàng: {err}'}), 500

    return jsonify({'success': True, **result})
