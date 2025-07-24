'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/error')
  }

  revalidatePath('/', 'layout')
  redirect('/auth/confirm')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth/error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGoogleOneTap(credential: string, nonce?: string) {
  const supabase = await createClient()

  try {
    const options: { provider: 'google'; token: string; nonce?: string } = {
      provider: 'google',
      token: credential,
    }

    if (nonce) {
      options.nonce = nonce
    }

    const { data, error } = await supabase.auth.signInWithIdToken(options)

    if (error) {
      console.error('Error signing in with Google One Tap:', error)
      throw error
    }

    revalidatePath('/', 'layout')
    return { success: true, data }
  } catch (error) {
    console.error('Google One Tap sign-in failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth')
}