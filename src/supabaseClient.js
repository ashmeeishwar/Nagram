import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// `isSupabaseConfigured` lets the UI fail gracefully (and the app still run)
// when env vars are missing — e.g. a fresh clone before `.env` is filled in.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

// Persist one anagram row. Resolves to the inserted row.
export async function saveAnagram(originalName, anagram, mode = 'anagram') {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }
  const { data, error } = await supabase
    .from('anagrams')
    .insert({ original_name: originalName, anagram, mode })
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch saved anagrams, newest first.
export async function fetchAnagrams() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('anagrams')
    .select('id, original_name, anagram, mode, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return data
}

// Delete one saved anagram by id.
export async function deleteAnagram(id) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.from('anagrams').delete().eq('id', id)
  if (error) throw error
}
