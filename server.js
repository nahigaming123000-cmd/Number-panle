const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// আপনার দেওয়া MinoSMS API Key
const MINO_API_KEY = 'mino_live_ed9b2c534c818322c1ec17671f619695'; 
const BASE_URL = 'https://minosms.com';

// রুট চেক (সার্ভার চালু আছে কিনা দেখার জন্য)
app.get('/', (req, res) => res.send('MinoSMS OTP Backend is Running Successfully!'));

// ==========================================
// ১. নাম্বার নেওয়ার API (POST)
// ==========================================
app.post('/api/get-number', async (req, res) => {
    try {
        const { range } = req.body;
        if (!range) return res.status(400).json({ success: false, message: "Range is required" });

        // MinoSMS ডকুমেন্টেশন অনুযায়ী বডিতে api_key এবং rid পাঠাতে হবে
        const response = await axios.post(`${BASE_URL}/getnumber`, {
            api_key: MINO_API_KEY,
            rid: range, // ইউজার যে রেঞ্জ দেবে (যেমন 2250789XXX)
            national_format: 1,
            remove_plus: 1
        });

        if (response.data && response.data.status === "success") {
            res.json({ 
                success: true, 
                number: response.data.number,
                raw_data: response.data 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: response.data.message || "Number not available for this range" 
            });
        }
    } catch (error) {
        console.error("Error fetching number:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ==========================================
// ২. OTP চেক করার API (GET)
// ==========================================
app.get('/api/check-otp', async (req, res) => {
    try {
        const { number } = req.query; // MinoSMS এ নাম্বার দিয়ে চেক করতে হয়
        
        if (!number) return res.status(400).json({ success: false, message: "Number is required" });

        // MinoSMS এর check এন্ডপয়েন্ট
        const response = await axios.get(`${BASE_URL}/check`, {
            params: {
                api_key: MINO_API_KEY,
                number: number 
            }
        });

        if (response.data && response.data.status === "success") {
            // allocation_status: "completed" হলে OTP পাওয়া গেছে
            const isCompleted = response.data.allocation_status === "completed";
            
            res.json({ 
                success: true, 
                completed: isCompleted,
                otp: response.data.otp_code || null,
                full_sms: response.data.full_sms || null
            });
        } else {
            res.json({ success: false, message: "OTP not found or pending" });
        }
    } catch (error) {
        console.error("Error checking OTP:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// সার্ভার চালু করা
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
