import React from "react";
import { Layout, LegacyCard } from "@shopify/polaris";
import { storeData } from "../../../data";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "chart.js/auto";

function OrderGraphs() {
  
  const chartData = {
    labels: storeData?.map((d) => d.year) || [],
    datasets: [
      {
        label: "Orders Details",
        data: storeData?.map((d) => d.order) || [],
        backgroundColor: ['#008170', '#000000', '#8e8e8e', '#81BF37'],
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Layout>
      <Layout.Section oneHalf>
        <LegacyCard title="Total Orders" sectioned>
          <div style={{ height: "300px", width: "100%" }}>
            <Line data={chartData} options={{responsive: true, maintainAspectRatio: false}} />
          </div>
        </LegacyCard>
      </Layout.Section>
      <Layout.Section oneThird>
        <LegacyCard title="Completed Orders" sectioned>
          <Doughnut data={chartData} options={{responsive: true, maintainAspectRatio: false}} />
        </LegacyCard>
      </Layout.Section>
      <Layout.Section oneThird>
        <LegacyCard title="Remaining Orders" sectioned>
          <Bar data={chartData} options={{responsive: true, maintainAspectRatio: false}} />
        </LegacyCard>
      </Layout.Section>
    </Layout>
  );
}

export default OrderGraphs;
