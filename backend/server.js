const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /progress: Retrieve user progress
app.get('/progress', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user_id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ progress: data });
});

// POST /level-complete: Update progress and streak
app.post('/level-complete', async (req, res) => {
    const { user_id, level_id } = req.body;
    if (!user_id || !level_id) {
        return res.status(400).json({ error: 'user_id and level_id are required' });
    }

    try {
        // Fetch existing progress
        const { data: existing, error: fetchError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user_id)
            .eq('level_id', level_id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means zero rows returned (not found)
            return res.status(500).json({ error: fetchError.message });
        }

        let result;
        if (existing) {
            // Update existing record (e.g., increase streak)
            result = await supabase
                .from('user_progress')
                .update({ is_completed: true, streak: existing.streak + 1 })
                .eq('id', existing.id);
        } else {
            // Insert new record
            result = await supabase
                .from('user_progress')
                .insert([{ user_id, level_id, is_completed: true, streak: 1 }]);
        }

        if (result.error) return res.status(500).json({ error: result.error.message });
        
        res.json({ success: true, message: 'Level completion recorded successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Application Backend running on port ${PORT}`);
});
