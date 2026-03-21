const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.json({
        status: "Backend is running!",
        message: "Auth and progress are now securely managed directly by the frontend and Supabase."
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Application Backend running on port ${PORT}`);
});
