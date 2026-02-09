-- VIEWS FOR COMMON QUERIES

-- View for user order summary
CREATE VIEW vw_user_orders_summary AS
SELECT
    o.order_id,
    o.order_number,
    o.user_id,
    u.email,
    u.first_name,
    u.last_name,
    o.status,
    o.total_amount,
    o.payment_status,
    o.created_at,
    COUNT(oi.order_item_id) as item_count
FROM
    orders o
    INNER JOIN users u ON o.user_id = u.user_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY
    o.order_id,
    o.order_number,
    o.user_id,
    u.email,
    u.first_name,
    u.last_name,
    o.status,
    o.total_amount,
    o.payment_status,
    o.created_at;

-- View for cart summary
CREATE VIEW vw_user_cart_summary AS
SELECT
    c.user_id,
    COUNT(c.cart_id) as item_count,
    SUM(c.quantity) as total_quantity,
    SUM(c.quantity * c.price_at_added) as total_amount
FROM cart c
GROUP BY
    c.user_id;