'use client'

import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


declare const google: { accounts: any }

// Generate nonce for extra security
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
    console.log('Initializing Google One Tap')
    
    const [nonce, hashedNonce] = await generateNonce()

    // Check if user is already signed in
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      router.push('/dashboard')
      return
    }

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: CredentialResponse) => {
        try {
          console.log('Google One Tap response received')
          
          // Call our server action
          const result = await signInWithGoogleOneTap(response.credential, nonce)
          
          if (result.success) {
            console.log('Successfully signed in with Google One Tap')
            router.push('/dashboard')
          } else {
            console.error('Sign-in failed:', result.error)
            router.push('/auth/error')
          }
        } catch (error) {
          console.error('Error during Google One Tap sign-in:', error)
          router.push('/auth/error')
        }
      },
      nonce: hashedNonce,
      use_fedcm_for_prompt: true, // For Chrome's third-party cookie phase-out
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