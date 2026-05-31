const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: {
    schema: 'pg_catalog'
  }
})

async function run() {
  const { data, error } = await supabase.from('pg_policy').select('*')
  console.log("pg_policy:", data || error)

  const { data: proc, error: procErr } = await supabase.from('pg_proc').select('*').limit(5)
  console.log("pg_proc:", proc || procErr)
}
run()
