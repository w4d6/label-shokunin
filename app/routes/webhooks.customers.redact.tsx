import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// GDPR webhook: Customer redact (deletion)
// This webhook is triggered when a shop owner requests deletion of customer data
// Since this app doesn't store customer data, we just acknowledge the request
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // This app doesn't store customer data, so we just acknowledge the request
  // In a real app that stores customer data, you would:
  // 1. Delete all data associated with the specified customer
  // 2. Confirm the deletion

  return new Response();
};
