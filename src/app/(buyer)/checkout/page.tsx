import { fetchUserAddresses } from "@/services/addresses/actions"
import { CheckoutClient } from "@/components/buyer/checkout-client"
import { PageContainer } from "@/components/shared/page-container"

export default async function CheckoutPage() {
  const addresses = await fetchUserAddresses()
  
  return (
    <PageContainer className="py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      <CheckoutClient initialAddresses={addresses} />
    </PageContainer>
  )
}
