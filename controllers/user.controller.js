const emailController = require('./email.controller');
const authController = require('./auth.controller');
const bcrypt = require('bcrypt');
const db = require('./db.controller'); // Import the database connection
const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const sql = 'SELECT * FROM user_tbl WHERE email = ?';
      const [result] = await db.execute(sql, [email]);
      if (!result[0]) {
        res.status(401).json({ message: 'Incorrect Username', status: 401 });
        return;
      }
      const isValid = await bcrypt.compare(password, result[0].password);
      if (!isValid) {
        res.status(401).json({ message: 'Incorrect Password', status: 401 });
      } else {
        // generate a token
        const token = authController.generateAccessToken({ username: email });
        const userProfile = {
          id: result[0].id,
          firstname: result[0].firstname,
          lastname: result[0].lastname,
          email: result[0].email,
          contact_no: result[0].contact_no,
          type:result[0].type
        };
  
        res.status(200).json({  token, userProfile });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  // Add this function to users.controller.js
  getUserByToken: async (req, res) => {
    try {
      const { token } = req.body;

      console.log(token)
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

      console.log(err,user)

        if (err) {
          // If the token is invalid or expired, return an error.
          return res.status(401).json({ message: 'Invalid or expired token', status: 401 });
        }
  
        // If the token is valid, user will contain the decoded token payload.
        res.status(200).json({ user });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  signUp: async (req, res) => {
    const { firstname, lastname, email, type, password, contact_no } = req.body;
    try {
        // Check if the email already exists in the database
        const [existingUsers] = await db.execute('SELECT * FROM user_tbl WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Insert the hashed password into the database
        const sql = 'INSERT INTO user_tbl (firstname, lastname, email, type, password, contact_no) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [firstname, lastname, email, type, hash, contact_no];

        const [result] = await db.execute(sql, values);
        res.status(201).json({ message: 'Created successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const sql = 'SELECT * FROM user_tbl WHERE email = ?'; // Assuming 'user_tbl' is your table name
      const [result] = await db.execute(sql, [email]);
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found', status: 404 });
      }
  
      const user = result[0];
  
      // Generate a unique reset token (e.g., a random string)
      const resetToken = authController.generateRandomToken(); // Implement this function to generate a token
      const tokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
  
      // Store the reset token and its expiration time in the user's record
      const updateSql = 'UPDATE user_tbl SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?';
      await db.execute(updateSql, [resetToken, tokenExpiration, email]);
  
      // Send a password reset email
      const emailSent = await emailController.sendPasswordResetEmail(
        user.email,
        resetToken,
        user
      );
  
      if (emailSent) {
        res.status(200).json({ message: 'Email sent successfully', status: 200 });
      } else {
        res.status(500).send('Error sending email');
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const resetToken = req.params.id;
      const { newPassword } = req.body;
  
      const sql = 'SELECT * FROM user_tbl WHERE resetPasswordToken = ?';
      const [result] = await db.execute(sql, [resetToken]);
  
      if (result.length === 0 || result[0].resetPasswordExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired token', status: 400 });
      }
  
      const user = result[0];
  
      // Verify that the new password is different from the previous one
      const isMatch = await bcrypt.compare(newPassword, user.password);
  
      if (isMatch) {
        return res.status(400).json({ message: 'The previous password and the new password must be different.', status: 400 });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password and clear the reset token and expiration time
      const updateSql = 'UPDATE user_tbl SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';
      await db.execute(updateSql, [hashedPassword, user.id]);
  
      res.status(200).json({ message: 'Password reset successfully', status: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePasswordOld : async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid user email', status: 400 });
      }
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return res.status(404).json({ message: 'Invalid old password', status: 404 });
      }
      const isMatch = await bcrypt.compare(newPassword, user.password);
      if (isMatch) {
        return res.status(400).json({ message: 'The previous password and the new password must be different.', status: 400 });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: 'Update your password successfully', status: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      const sql = 'SELECT * FROM user_tbl WHERE email = ?'; // Assuming 'user_tbl' is your table name
      const [result] = await db.execute(sql, [email]);
  
      if (result.length === 0) {
        return res.status(400).json({ message: 'Invalid user email', status: 400 });
      }
  
      const user = result[0];
  
      const isValid = await bcrypt.compare(oldPassword, user.password);
  
      if (!isValid) {
        return res.status(404).json({ message: 'Invalid old password', status: 404 });
      }
  
      const isMatch = await bcrypt.compare(newPassword, user.password);
  
      if (isMatch) {
        return res.status(400).json({ message: 'The previous password and the new password must be different.', status: 400 });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      const updateSql = 'UPDATE user_tbl SET password = ? WHERE email = ?';
      await db.execute(updateSql, [hashedPassword, email]);
  
      res.status(200).json({ message: 'Update your password successfully', status: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAll : async (req, res) => {
    try {
      const sql = 'SELECT * FROM user_tbl';
      const [result] = await db.execute(sql);
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error querying the database:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getById : async (req, res) => {
    try {
      const { id } = req.params;
      const sql = 'SELECT * FROM user_tbl WHERE id = ?';
      const [result] = await db.execute(sql, [id]);
      if (!result[0]) {
        return res.status(404).json({ message: 'No data found', status: 404 });
      }
      res.status(200).json(result[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateById : async(req, res) => {
    try {
      let { id } = req.params;
      const { firstname, lastname, email,type,contact_no } = req.body;
      console.log(req.body)
      const sql = 'UPDATE user_tbl SET firstname = ?, lastname = ?, email = ?, type = ?, contact_no = ? WHERE id = ?';
      const [result] = await db.execute(sql, [firstname, lastname, email, type, contact_no, id,]);
      console.log(result)
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No data found to update', status: 404 })
      }
      res.status(200).json({ message: 'Update successfully', status: 200 });
    } catch (error) {
      res.status(500).json({message: error.message})
    }
  },

  deleteById: async (req, res) => {
    try {
      const { id } = req.params;
      const sql = 'DELETE FROM user_tbl WHERE id = ?'; // Assuming 'user_tbl' is your table name
      const [result] = await db.execute(sql, [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No data found to delete', status: 404 });
      }
  
      res.status(200).json({ message: 'Deleted successfully', status: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteAll: async (req, res) => {
    try {
      const sql = 'DELETE FROM user_tbl'; // Assuming 'user_tbl' is your table name
      const [result] = await db.execute(sql);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No data found to delete', status: 404 });
      }
      res.status(200).json({ message: 'Deleted all data successfully', status: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting data');
    }
  },
}