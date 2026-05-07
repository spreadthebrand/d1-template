// Stripe-ready placeholder. TODO: set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET, create products/prices for Builder, Network Pro, and Enterprise, then wire checkout/webhooks.
export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
