#!/bin/bash

echo "Installing Supabase dependencies..."
cd mobile
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

echo "Dependencies installed successfully!"
echo ""
echo "NEXT STEPS:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL commands from supabase-setup.sql in your Supabase SQL editor"
echo "3. Update mobile/src/lib/supabase.ts with your Supabase URL and anon key"
echo "4. Run 'npm start' in the mobile directory to start the app"
