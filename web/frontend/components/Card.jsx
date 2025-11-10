import { Layout, LegacyCard } from '@shopify/polaris'
import React from 'react'

function Card({title, data, productCard, collectionCard, orderCard, fulfillCard, remainsCard}) {
  return (
    <>
        <Layout.Section oneThird>
            <LegacyCard title={title} sectioned>
                <h1 className='total_count'>
                    {productCard && data}
                    {collectionCard && data}
                    {orderCard && data}
                    {fulfillCard && data}
                    {remainsCard && data}
                </h1>
            </LegacyCard>
        </Layout.Section>
    </>
  )
}

export default Card