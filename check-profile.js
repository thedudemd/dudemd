const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'https://bicljoujevywrkzjeaoy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY2xqb3VqZXZ5d3JremplYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDc1ODIsImV4cCI6MjA5NDM4MzU4Mn0.UIKVUyX6QClJmAYdQKg91t_kAT4itpuSk_fIemcPJ0g'
)

async function check() {
  const { data } = await supabase.from('profiles').select('*')
  console.log('All profiles:', JSON.stringify(data, null, 2))
}
check()
