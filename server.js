const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// CORS এবং JSON পার্সিং এনাবল করা
app.use(cors());
app.use(express.json());

// MiahSMS API তথ্য
const MIAH_API_KEY = 'MIAHSMS_7B1BA76A1513872E8E978087';
const BASE_URL = 'https://miahsms.com/bot/api';

// রুট URL (সার্ভার ঠিক আছে কিনা চেক করার জন্য)
app.get('/', (req, res) => {
    res.send('OTP Panel Backend is Running Successfully!');
});

// ==========================================
// ১. নাম্বার নেওয়ার API (POST)
// ==========================================
app.post('/api/get-number', async (req, res) => {
    try {
        const { range } = req.body;
        if (!range) {
            return res.status(400).json({ success: false, message: "Range is required" });
        }

        const response = await axios.post(`${BASE_URL}/getnum`, 
            { range: range }, 
            { 
                headers: { 
                    'X-API-Key': MIAH_API_KEY, 
                    'Content-Type': 'application/json' 
                } 
            }
        );

        if (response.data && response.data.meta && response.data.meta.code === 200) {
            res.json({ 
                success: true, 
                number: response.data.data.full_number,
                raw_data: response.data.data
            });
        } else {
            res.status(400).json({ success: false, message: response.data.message || "Number not available" });
        }
    } catch (error) {
        console.error("Error fetching number:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ==========================================
// ২. OTP চেক করার API (GET)
// ==========================================
app.get('/api/check-otp', async (req, res) => {
    try {
        const { last_id } = req.query;
        const sinceId = last_id || 0;

        const response = await axios.get(`${BASE_URL}/live-console`, {
            params: { since: sinceId, limit: 55 },
            headers: { 'X-API-Key': MIAH_API_KEY }
        });

        if (response.data && response.data.meta && response.data.meta.code === 200) {
            res.json({ 
                success: true, 
                otps: response.data.data.otps || [], 
                new_max_id: response.data.data.max_id || sinceId 
            });
        } else {
            res.status(400).json({ success: false, message: "Failed to fetch OTPs" });
        }
    } catch (error) {
        console.error("Error fetching OTP:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ==========================================
// সার্ভার চালু করা (Render এর জন্য অত্যন্ত জরুরি)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
