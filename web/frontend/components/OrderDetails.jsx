import React from 'react'
import { Layout, LegacyCard } from '@shopify/polaris'

function OrderDetails() {
  return (
    <>
        <Layout.Section oneThird>
            <LegacyCard title="Total Orders" sectioned>
                <div>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                </div>
            </LegacyCard>
        </Layout.Section>
    </>
  )
}

export default OrderDetails