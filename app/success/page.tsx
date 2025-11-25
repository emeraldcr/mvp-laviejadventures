// app/payment/success/page.tsx

import { redirect } from 'next/navigation'
import { SuccessClient } from './SuccessClient'
import { getPayPalAuthHeader, getPayPalApiBaseUrl } from '@/lib/paypal'

interface SuccessPageProps {
  searchParams: { orderId?: string }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.orderId

  if (!orderId) redirect('/')

  // Fetch order details from PayPal
  let paypalOrder

  try {
    const res = await fetch(
      `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: getPayPalAuthHeader(),
        },
        cache: 'no-store',
      }
    )

    paypalOrder = await res.json()

    if (!res.ok) {
      console.error('PayPal ERROR:', paypalOrder)
      redirect('/')
    }
  } catch (err) {
    console.error('PayPal fetch error:', err)
    redirect('/')
  }

  // Extract fields from PayPal order
  const payer = paypalOrder.payer || {}

  const name = `${payer.name?.given_name || ''} ${payer.name?.surname || ''}`.trim()
  const email = payer.email_address || ''

  const description = paypalOrder.purchase_units?.[0]?.description || ''
  const ticketsMatch = description.match(/(\d+)\s*tickets?/i)
  const dateMatch = description.match(/para\s+(.*)/i)

  const tickets = ticketsMatch ? ticketsMatch[1] : ''
  const date = dateMatch ? dateMatch[1] : ''

  return (
    <SuccessClient
      email={email}
      name={name}
      date={date}
      tickets={tickets}
    />
  )
}
