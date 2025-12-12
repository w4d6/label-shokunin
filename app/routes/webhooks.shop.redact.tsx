import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GDPR webhook: Shop redact (deletion)
// This webhook is triggered 48 hours after app uninstallation
// It requests deletion of all shop data from the app
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Delete all shop-related data
  // Clean up any remaining data for this shop
  try {
    // Delete shop usage data
    await db.shopUsage.deleteMany({ where: { shop } });

    // Delete any remaining sessions (should already be deleted by app/uninstalled)
    await db.session.deleteMany({ where: { shop } });

    console.log(`Successfully deleted all data for ${shop}`);
  } catch (error) {
    console.error(`Error deleting data for ${shop}:`, error);
  }

  return new Response();
};
