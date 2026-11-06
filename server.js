const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// আপনার MiahSMS API তথ্য (এখানে সরাসরি বসিয়ে দেওয়া হলো)
const MIAH_API_KEY = 'MIAHSMS_7B1BA76A1513872E8E978087';
const BASE_URL = 'https://miahsms.com/bot/api';

// ==========================================
// ১. নাম্বার নেওয়ার API
// ==========================================
app.post('/api/get-number', async (req, res) => {
    try {
        const { range } = req.body;
        if (!range) return res.status(400).json({ success: false, message: "Range is required" });

        const response = await axios.post(`${BASE_URL}/getnum`, 
            { range: range }, 
            { headers: { 'X-API-Key': MIAH_API_KEY, 'Content-Type': 'application/json' } }
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
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ==========================================
// ২. OTP চেক করার API
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
            res.status(400).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// সার্ভার চালু
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js Server running on http://localhost:${PORT}`);
});
