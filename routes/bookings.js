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

  console.log(req.body)
  try {
    const {
      user_id,
      firstname, // Add firstname
      lastname,  // Add lastname
      service,     // Add service
      contact_no, // Add contact_no
      weights,
      address,
      email,
      zip_code,
      reservation_date,
      return_date,
      time_delivery,
      total_of_bills,
    } = req.body;


    console.log(req.body)
    // Check if any of the required fields is missing
    if (
      !user_id ||
      !firstname ||
      !lastname ||
      !email ||
      !service ||
      !contact_no ||
      !reservation_date ||
      !return_date ||
      !weights || 
      !address ||
      !zip_code || 
      !time_delivery ||
      !total_of_bills
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const serviceString = JSON.stringify(service);

    console.log(res)

    // Insert a new booking into the database
    const sql =
       'INSERT INTO booking_tbl (user_id, firstname, lastname, email, service, contact_no, reservation_date, return_date, address, zip_code, time_delivery, weights, total_of_bills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    const values = [
      user_id,
      firstname,
      lastname,
      email,
      serviceString,
      contact_no,
      reservation_date,
      return_date,
      address,
      zip_code,
      time_delivery,
      weights,
      total_of_bills,
    ];

    console.log(values)

    const [result] = await db.execute(sql, values);

    console.log(result)

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
    const { 
      reservation_date, 
      return_date, 
      service, 
      total_of_bills,
      email,
      firstname,
      lastname,
      contact_no,
      zip_code,
      time_delivery,
      weights 
    } = req.body;
  
    console.log(req.body)
    // Update the user in the database
    const sql = 'UPDATE booking_tbl SET  reservation_date = ?, return_date = ?, service = ?, total_of_bills = ?, email = ?, firstname = ?, lastname = ?, contact_no = ?, zip_code = ?, time_delivery = ?, weights = ? WHERE id = ?';
    const values = [reservation_date, return_date, service, total_of_bills, email, firstname, lastname, contact_no, zip_code,time_delivery,weights , id];
  
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