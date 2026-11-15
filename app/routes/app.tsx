import type { LoaderFunctionArgs } from "react-router";
import { NavLink, Outlet } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchActiveSubscription } from "../partner-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, redirect, session } = await authenticate.admin(request);
  if (process.env.SHOPIFY_APP_PRICING_ENABLED === "true") {
    const appHandle = process.env.SHOPIFY_APP_HANDLE;
    if (!appHandle) throw new Error("SHOPIFY_APP_HANDLE is required when Shopify App Pricing enforcement is enabled.");
    const response = await admin.graphql(`query NodusShopId { shop { id } }`);
    const body = await response.json() as { data?: { shop?: { id: string } }; errors?: Array<{ message: string }> };
    if (!response.ok || body.errors?.length || !body.data?.shop?.id) {
      throw new Error("Unable to verify the Shopify shop identity for subscription access.");
    }
    const subscription = await fetchActiveSubscription(body.data.shop.id);
    if (!subscription) {
      const storeHandle = session.shop.replace(".myshopify.com", "");
      return redirect(`https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`, { target: "_top" });
    }
    const allowedHandles = [
      process.env.NODUS_PLAN_EVIDENCE_HANDLE,
      process.env.NODUS_PLAN_CONTROL_HANDLE,
      process.env.NODUS_PLAN_PORTFOLIO_HANDLE,
    ].filter((value): value is string => Boolean(value));
    if (!subscription.items.some((item) => allowedHandles.includes(item.handle))) {
      throw new Response("The active subscription does not include a recognized NODUS plan. Contact support.", { status: 403 });
    }
  }
  return null;
}

export default function AppLayout() {
  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="/"><span className="brand-mark">N</span><span>NODUS<small>SHIPPING INTELLIGENCE</small></span></a><div className="nav-label">WORKSPACE</div><nav className="side-nav"><NavLink to="/app" end>Overview</NavLink><NavLink to="/app/orders">Orders</NavLink><NavLink to="/app/evidence">Evidence</NavLink><NavLink to="/app/diagnostics">Diagnostics</NavLink><NavLink to="/app/simulations">Simulations</NavLink><NavLink to="/app/policies">Policies</NavLink><NavLink to="/app/monitoring">Monitoring</NavLink><NavLink to="/app/reports">Reports</NavLink><NavLink to="/app/value">Value ledger</NavLink></nav><div className="sidebar-bottom"><span className="status-dot"/> Live Shopify data; evidence coverage shown explicitly</div></aside><main className="app-main"><Outlet/></main></div>;
}
