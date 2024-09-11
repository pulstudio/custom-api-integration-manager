import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select('*')

  if (error) {
    console.error('Error fetching todos:', error)
    return <div className="text-center text-red-500">Error loading todos</div>
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Custom API Integration Manager</h1>
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Todo List</h2>
        <ul className="space-y-2">
          {todos?.map((todo: { id: string; title: string }) => (
            <li key={todo.id} className="bg-gray-100 p-2 rounded transition-transform duration-300 ease-in-out hover:scale-105">
              {todo.title}
            </li>
          ))}
        </ul>
        <button className="btn mt-4">Add Todo</button>
      </div>
    </main>
  )
}