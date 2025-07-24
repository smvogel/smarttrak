'use client'

import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { CredentialResponse } from 'google-one-tap'
import {signInWithGoogleOneTap} from "@/app/auth/actions";

declare const google: { accounts: any }

const generateNonce = async (): Promise<[string, string]> => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const encoder = new TextEncoder()
  const encodedNonce = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return [nonce, hashedNonce]
}

const GoogleOneTap = () => {
  const router = useRouter()
  const supabase = createClient()

  const initializeGoogleOneTap = async () => {
    const [nonce, hashedNonce] = await generateNonce()

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      router.push('/dashboard')
      return
    }

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: CredentialResponse) => {
        try {
          const result = await signInWithGoogleOneTap(response.credential, nonce)

          if (result.success) {
            router.push('/dashboard')
          } else {
            router.push('/auth/error')
          }
        } catch (error) {
          router.push('/auth/error')
        }
      },
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
    })

    google.accounts.id.prompt()
  }

  return (
      <Script
          onReady={initializeGoogleOneTap}
          src="https://accounts.google.com/gsi/client"
      />
  )
}

export default GoogleOneTap