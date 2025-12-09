import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://nolyprppeofqocgdyzrd.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbHlwcnBwZW9mcW9jZ2R5enJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODU3ODAsImV4cCI6MjA3OTE2MTc4MH0.DbvzsoDmor4TI_0etZB_oyZMKgbsyL-gORJUVgyZ8XA"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
