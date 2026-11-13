type AdminGraphqlContext = { graphql(query: string, options?: { variables?: Record<string, unknown> }): Promise<Response> };

const QUERY = `query NodusMarketShippingSnapshot {
  markets(first: 50) {
    nodes {
      id
      name
      handle
      status
      delivery {
        shipping {
          isEnabled
          optionDefinitions(first: 50) {
            nodes {
              __typename
              id
              isActive
              currency
              freeDeliveryMinimumValue { amount currencyCode }
              ... on DeliveryFlatRateOptionDefinition {
                name
                rateGroups(first: 10) {
                  nodes {
                    id
                    rate { price { amount currencyCode } }
                  }
                }
              }
              ... on DeliveryValueBasedOptionDefinition { name }
              ... on DeliveryWeightBasedOptionDefinition { name }
              ... on DeliveryCarrierCalculatedOptionDefinition { name }
            }
          }
        }
      }
    }
  }
}`;

type MoneyValue = { amount: string; currencyCode: string };
type OptionNode = {
  __typename: string;
  id: string;
  name?: string;
  isActive: boolean;
  currency: string;
  freeDeliveryMinimumValue: MoneyValue | null;
  rateGroups?: { nodes: Array<{ id: string; rate: { price: MoneyValue } }> };
};
type MarketNode = {
  id: string;
  name: string;
  handle: string;
  status: string;
  delivery: { shipping: null | { isEnabled: boolean; optionDefinitions: { nodes: OptionNode[] } } };
};

export type MarketShippingSnapshot = {
  markets: Array<{
    id: string;
    name: string;
    handle: string;
    status: string;
    inheritsShipping: boolean;
    shippingEnabled: boolean | null;
    options: Array<{
      id: string;
      name: string;
      type: string;
      active: boolean;
      currency: string;
      freeThreshold: string | null;
      flatRates: Array<{ amount: string; currency: string }>;
    }>;
  }>;
  capturedAt: string;
};

export async function getMarketShippingSnapshot(admin: AdminGraphqlContext): Promise<MarketShippingSnapshot> {
  const response = await admin.graphql(QUERY);
  const body = await response.json() as {
    data?: { markets?: { nodes: MarketNode[] } };
    errors?: Array<{ message: string }>;
  };
  if (!response.ok || body.errors?.length || !body.data?.markets) {
    throw new Error(body.errors?.map((error) => error.message).join("; ") || "Shopify market shipping configuration could not be read.");
  }

  return {
    markets: body.data.markets.nodes.map((market) => ({
      id: market.id,
      name: market.name,
      handle: market.handle,
      status: market.status,
      inheritsShipping: market.delivery.shipping === null,
      shippingEnabled: market.delivery.shipping?.isEnabled ?? null,
      options: (market.delivery.shipping?.optionDefinitions.nodes ?? []).map((option) => ({
        id: option.id,
        name: option.name ?? option.__typename.replace("Delivery", "").replace("OptionDefinition", ""),
        type: option.__typename,
        active: option.isActive,
        currency: option.currency,
        freeThreshold: option.freeDeliveryMinimumValue
          ? `${option.freeDeliveryMinimumValue.amount} ${option.freeDeliveryMinimumValue.currencyCode}`
          : null,
        flatRates: (option.rateGroups?.nodes ?? []).map((group) => ({
          amount: group.rate.price.amount,
          currency: group.rate.price.currencyCode,
        })),
      })),
    })),
    capturedAt: new Date().toISOString(),
  };
}
