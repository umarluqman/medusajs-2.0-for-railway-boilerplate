"use client"

import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import ErrorMessage from "../error-message"
import { placeOrder } from "@lib/data/cart"

type SenangPayPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const SenangPayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: SenangPayPaymentButtonProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  console.log("session", session)
  console.log("cart", cart)

  const handlePayment = async () => {
    setSubmitting(true)

    try {
      if (!session?.data) {
        throw new Error("No payment session found")
      }

      // Get the payment session data
      const { merchantId, hash, amount, order_id, detail, payment_url } =
        session.data
      console.log({ ...session.data })
      if (!merchantId || !hash || !amount || !order_id || !detail) {
        throw new Error("Missing required payment session data")
      }

      // Create and submit the hidden form
      const form = document.createElement("form")
      form.method = "POST"
      form.action =
        payment_url ||
        `${process.env.NEXT_PUBLIC_SENANGPAY_URL}/payment/${merchantId}`

      const createHiddenInput = (name: string, value: string) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        return input
      }

      // Add required fields
      form.appendChild(createHiddenInput("detail", detail))
      form.appendChild(createHiddenInput("amount", amount))
      form.appendChild(createHiddenInput("order_id", order_id))
      form.appendChild(createHiddenInput("hash", hash))

      // Add return URL parameters
      const returnUrl = `${window.location.origin}/order/confirmed/${order_id}`
      form.appendChild(createHiddenInput("return_url", returnUrl))
      form.appendChild(
        createHiddenInput(
          "callback_url",
          `${window.location.origin}/api/webhooks/senangpay`
        )
      )

      // Optional user info if available
      if (cart.email) {
        form.appendChild(createHiddenInput("email", cart.email))
      }
      if (cart.billing_address) {
        const name = `${cart.billing_address.first_name} ${cart.billing_address.last_name}`
        form.appendChild(createHiddenInput("name", name))
        if (cart.billing_address.phone) {
          form.appendChild(
            createHiddenInput("phone", cart.billing_address.phone)
          )
        }
      }

      // Try to place the order first
      await placeOrder(cart.id)

      // Submit form
      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setErrorMessage(err.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId}
      >
        Place order senangpay
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="senangpay-payment-error-message"
      />
    </>
  )
}

export default SenangPayPaymentButton
