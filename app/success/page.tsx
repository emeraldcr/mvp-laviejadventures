import { redirect } from 'next/navigation'
import { stripe } from '../../../lib/stripe'
import type { Stripe } from 'stripe'
import { SuccessClient } from './SuccessClient'

interface SuccessPageProps {
  searchParams: { session_id?: string }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id

  if (!sessionId) redirect('/')

  let session: Stripe.Checkout.Session

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })
  } catch (err) {
    console.error('Stripe session error:', err)
    redirect('/')
  }

  if (session.status !== 'complete') redirect('/')

  const customerEmail = session.customer_details?.email

  // ⭐ NEW — read metadata
  const name = session.metadata?.name || ''
  const date = session.metadata?.date || ''
  const tickets = session.metadata?.tickets || ''

  return (
    <SuccessClient
      email={customerEmail}
      name={name}
      date={date}
      tickets={tickets}
    />
  )
}
