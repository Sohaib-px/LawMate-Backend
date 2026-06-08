const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment'); // <-- Humne models wali file ko yahan import kar liya

// 1. GET Route: Saaray appointments dekhne k liye
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('clientId lawyerId', 'name email');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// 2. POST Route: Naya appointment book karne k liye
router.post('/', async (req, res) => {
    try {
        const { clientId, lawyerId, date } = req.body;
        
        const newAppointment = new Appointment({
            clientId,
            lawyerId,
            date
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json({ success: true, data: savedAppointment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;