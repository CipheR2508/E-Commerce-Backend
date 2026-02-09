-- TRIGGERS FOR AUTOMATIC UPDATES

-- Trigger to update order status history when order status changes
DELIMITER / /

CREATE TRIGGER trg_order_status_history
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (NEW.order_id, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END//

DELIMITER;

-- Trigger to ensure only one default address per user
DELIMITER / /

CREATE TRIGGER trg_single_default_address
BEFORE UPDATE ON addresses
FOR EACH ROW
BEGIN
    IF NEW.is_default = TRUE AND (OLD.is_default = FALSE OR OLD.is_default IS NULL) THEN
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND address_id != NEW.address_id;
    END IF;
END//

DELIMITER;