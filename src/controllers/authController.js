const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");

/**
 * SIGN UP
 */
exports.signup = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: { message: "All fields are required" },
    });
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: "Email already registered" },
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?)`,
      [email, password_hash, first_name, last_name],
    );

    const userId = result.insertId;
    const token = uuidv4();
    const expiresAt = new Date(
      Date.now() + process.env.EMAIL_TOKEN_EXPIRES_MINUTES * 60000,
    );

    await connection.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt],
    );

    // Email sending intentionally skipped (you'll integrate later)

    res.status(201).json({
      success: true,
      message: "Signup successful. Verify your email.",
      data: { user_id: userId },
    });
  } finally {
    connection.release();
  }
};

/**
 * VERIFY EMAIL
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("VERIFY EMAIL TOKEN:", token);

  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT * FROM email_verification_tokens
       WHERE token = ?
         AND is_used = FALSE
         AND expires_at > NOW()`,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid or expired token" },
      });
    }

    const { user_id } = rows[0];

    await connection.query(
      "UPDATE users SET is_email_verified = TRUE WHERE user_id = ?",
      [user_id],
    );

    await connection.query(
      "UPDATE email_verification_tokens SET is_used = TRUE WHERE token = ?",
      [token],
    );

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    const user = users[0];

    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        error: { message: "Email not verified" },
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    const [roleRows] = await connection.query(
      `
  SELECT r.role_name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.role_id
  WHERE ur.user_id = ?
  `,
      [user.user_id],
    );

    if (roleRows.length === 0) {
      return res.status(500).json({
        success: false,
        error: { message: "User role not assigned" },
      });
    }

    const role = roleRows[0].role_name;

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: role,
    });

    await connection.query(
      "UPDATE users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id],
    );

    res.json({
      success: true,
      message: "Login successful",
      data: { access_token: token },
    });
  } finally {
    connection.release();
  }
};

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    const token = uuidv4();
    const expiresAt = new Date(
      Date.now() + process.env.PASSWORD_RESET_EXPIRES_MINUTES * 60000,
    );

    await connection.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [users[0].user_id, token, expiresAt],
    );

    res.json({
      success: true,
      message: "Password reset link sent",
    });
  } finally {
    connection.release();
  }
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = ? AND is_used = FALSE AND expires_at > NOW()`,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid or expired token" },
      });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await connection.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [password_hash, rows[0].user_id],
    );

    await connection.query(
      "UPDATE password_reset_tokens SET is_used = TRUE WHERE token = ?",
      [token],
    );

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } finally {
    connection.release();
  }
};
