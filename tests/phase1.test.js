process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../src/config/db', () => ({
  getConnection: jest.fn(),
  query: jest.fn()
}));

const pool = require('../src/config/db');
const app = require('../src/index');

const tokenFor = (payload = {}) => jwt.sign({ user_id: 1, email: 'user@test.com', role: 'customer', ...payload }, process.env.JWT_SECRET);

describe('Phase 1 API tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Auth login returns token', async () => {
    const hash = await bcrypt.hash('Password@123', 10);
    const connection = {
      query: jest.fn(async (sql) => {
        if (sql.includes('SELECT * FROM users')) {
          return [[{ user_id: 1, email: 'user@test.com', password_hash: hash, is_active: 1, is_email_verified: 1, role: 'customer' }]];
        }
        if (sql.includes('UPDATE users SET last_login')) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      }),
      release: jest.fn()
    };
    pool.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@test.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.access_token).toBeTruthy();
  });

  test('Add to cart endpoint works with validation and token', async () => {
    const connection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      release: jest.fn(),
      query: jest.fn(async (sql) => {
        if (sql.includes('SELECT cart_id')) return [[null]];
        if (sql.includes('INSERT INTO cart')) return [{ insertId: 10 }];
        return [[]];
      })
    };
    pool.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${tokenFor()}`)
      .send({ product_id: 2, quantity: 1, price: 99.99 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');

    const invalid = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${tokenFor()}`)
      .send({ product_id: 2, quantity: 0, price: 99.99 });

    expect(invalid.status).toBe(400);
    expect(invalid.body.status).toBe('error');
  });

  test('Place order transaction from cart', async () => {
    const connection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      query: jest.fn(async (sql) => {
        if (sql.includes('FROM cart c')) {
          return [[{ product_id: 1, quantity: 2, price_at_added: 50, name: 'Product', sku: 'SKU001' }]];
        }
        if (sql.includes('INSERT INTO orders')) return [{ insertId: 77 }];
        if (sql.includes('INSERT INTO order_items')) return [{ insertId: 1 }];
        if (sql.includes('INSERT INTO order_status_history')) return [{ insertId: 1 }];
        if (sql.includes('DELETE FROM cart')) return [{ affectedRows: 1 }];
        return [[]];
      })
    };

    pool.getConnection.mockResolvedValue(connection);

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${tokenFor()}`)
      .send({
        shipping_address_id: 1,
        billing_address_id: 1,
        payment_method: 'cod',
        notes: 'deliver fast'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalled();
  });
});
