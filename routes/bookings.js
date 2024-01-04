const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the database connection

router.get('/getAll', async (req, res) => {
  try {
    const [rows, fields] = await db.execute('SELECT * FROM booking_tbl');
    res.json(rows);
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

router.post('/add', async (req, res) => {
  try {
    const {
      user_id,
      firstname, // Add firstname
      lastname,  // Add lastname
      service,     // Add service
      contact_no, // Add contact_no
      items,
      departure_date,
      return_date,
      total_of_bills,
    } = req.body;

    // Check if any of the required fields is missing
    if (
      !user_id ||
      !firstname ||
      !lastname ||
      !service ||
      !contact_no ||
      !departure_date ||
      !return_date ||
      !items || 
      !service ||
      !total_of_bills
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert a new booking into the database
    const sql =
      'INSERT INTO booking_tbl (user_id, firstname, lastname, service, contact_no, departure_date, return_date, items, total_of_bills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
      user_id,
      firstname,
      lastname,
      service,
      contact_no,
      departure_date,
      return_date,
      items,
      total_of_bills,
    ];

    const [result] = await db.execute(sql, values);

    res.status(201).json({ message: 'Booking created', id: result.insertId });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/delete/:id', async (req, res) => {
    const bookingId = req.params.id;
    const sql = 'DELETE FROM booking_tbl WHERE id = ?';
  
    try {
      const [result] = await db.execute(sql, [bookingId]);
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Booking not found' });
      } else {
        res.json({ message: 'Booking deleted' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/update/:id', async (req, res) => {
    const { id } = req.params; // Extract user ID from the URL
    const { user_id, departure_date, return_date, service, total_of_bills } = req.body;
  
    // Update the user in the database
    const sql = 'UPDATE booking_tbl SET  user_id = ?, departure_date = ?, return_date = ?, service = ?, total_of_bills = ? WHERE id = ?';
    const values = [user_id, departure_date, return_date, service, total_of_bills, id];
  
    try {
      const [result] = await db.execute(sql, values);
  
      if (result.affectedRows === 0) {
        // If no rows were affected, the user does not exist
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      res.status(200).json({ message: 'Booking updated' });
    } catch (err) {
      console.error('Error updating Booking:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
module.exports = router;