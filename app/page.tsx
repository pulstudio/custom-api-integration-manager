import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select('*')

  if (error) {
    console.error('Error fetching todos:', error)
    return <div>Error loading todos</div>
  }

  return (
    <main>
      <h1>Custom API Integration Manager</h1>
      <ul>
        {todos?.map((todo: { id: string; title: string }) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  )
}