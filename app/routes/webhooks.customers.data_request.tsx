import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// GDPR webhook: Customer data request
// This webhook is triggered when a customer requests their data
// Since this app doesn't store customer data, we just acknowledge the request
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // This app doesn't store customer data, so we just acknowledge the request
  // In a real app that stores customer data, you would:
  // 1. Query your database for the customer's data
  // 2. Send the data to the shop owner

  return new Response();
};
