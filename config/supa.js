import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mdadsntdrjxzofsflmpb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYWRzbnRkcmp4em9mc2ZsbXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDgyODIsImV4cCI6MjA0ODI4NDI4Mn0.Ep9HV-vsLqsOLBnOpeljdb4OHCMwESN9FFaq1lRoRpo'
const supabase = createClient(supabaseUrl, supabaseKey)
console.log('Supabase client initialized:', supabase)
console.log('Supabase storage:', supabase.storage)

export default supabase
export { supabaseKey, supabaseUrl }
