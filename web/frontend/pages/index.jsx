import { Layout, Page } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import OrderGraphs from "../components/OrderGraphs";
import { Card } from "../components";
import OrderDetails from "../components/OrderDetails";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function HomePage() {
  const { t } = useTranslation();
  const [productsCount, setProductsCount] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [fulFilled, setFulFilled] = useState(0);
  const [remains, setRemains] = useState(0);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    // Fetch products count from backend
    const fetchProductsCount = async () => {
      try {
        const response = await authenticatedFetch('/api/products/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Products Count:', data);
        setProductsCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching products count:', error);
        // Set to 0 if error occurs
        setProductsCount(0);
      }
    };
    // Fetch collections count from backend
    const fetchCollections = async () => {
      try {
        const response = await authenticatedFetch('/api/collections/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Collections Count:', data);
        setCollectionsCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching collections count:', error);
        // Set to 0 if error occurs
        setCollectionsCount(0);
      }
    };

    // Fetch orders count from backend
    const fetchOrdersCount = async () => {
      try {
        const response = await authenticatedFetch('/api/orders/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Orders Count:', data);
        setOrdersCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching orders count:', error);
        setOrdersCount(0);
      }
    };

    // Fetch fulfilled orders count from backend
    const fetchFulfilledCount = async () => {
      try {
        const response = await authenticatedFetch('/api/orders/fulfilled/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Fulfilled Orders Count:', data);
        setFulFilled(data.count || 0);
      } catch (error) {
        console.error('Error fetching fulfilled orders count:', error);
        setFulFilled(0);
      }
    };

    // Fetch remains orders count from backend
    const fetchRemainsCount = async () => {
      try {
        const response = await authenticatedFetch('/api/orders/remains/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Remains Orders Count:', data);
        setRemains(data.count || 0);
      } catch (error) {
        console.error('Error fetching remains orders count:', error);
        setRemains(0);
      }
    };

    // Fetch all orders from backend (for OrderDetails component)
    const fetchOrders = async () => {
      try {
        const response = await authenticatedFetch('/api/orders/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Orders Data:', data);
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }
    };

    fetchProductsCount();
    fetchCollections();
    fetchOrdersCount();
    fetchFulfilledCount();
    fetchRemainsCount();
    fetchOrders();
  }, [authenticatedFetch]);

  return (
    <Page fullWidth>
      <div className="graphs-section">
        <OrderGraphs />
      </div>
      {/* card components */}
      <div className="cards-section mt-4">
        <Layout>
          <Card title="Total Orders" data={ordersCount} orderCard />
          <Card title="Fulfilled Orders" data={fulFilled} fulfillCard />
          <Card title="Remains Orders" data={remains} remainsCard />
          <Card title="Total Products" data={productsCount} productCard />
          <Card title="Total Collections" data={collectionsCount} collectionCard />
        </Layout>
      </div>
      {/* order details */}
      <div className="order-details-section">
        <OrderDetails />
      </div>
    </Page>
  );
}
