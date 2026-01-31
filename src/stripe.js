import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const checkoutSubscription = async () => {
    const stripe = await stripePromise;

    // This redirect is for client-only checkout using a preregistered payment link or price ID
    // For a $20/month subscription, typically you'd Create a "Product" in Stripe Dashboard
    // and get a Price ID (e.g., price_1Mc4... or a payment link)

    // OPTION 1: Using a Stripe Payment Link (Easiest, No Backend Code)
    // Create a payment link in Stripe Dashboard -> Products -> Payment Links
    // window.location.href = "https://buy.stripe.com/test_..."; 

    // OPTION 3: Direct redirect to Stripe Payment Link
    // Since redirectToCheckout is deprecated for client-only integration without a backend session,
    // the industry standard no-code solution is Payment Links.

    // REPLACE THIS URL with your actual Stripe Payment Link
    // 1. Go to Stripe Dashboard -> Products -> Payment Links
    // 2. Create New -> Select your $20 product -> Create
    // 3. Copy the URL (starts with https://buy.stripe.com/test_...)
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

    // We add client_reference_id or URL params to track success if needed, 
    // but for this simple demo, we just redirect.
    // In a real app, you'd configure the Payment Link in Stripe Dashboard 
    // to redirect back to: http://localhost:5173/?success=true

    window.location.href = paymentLink;

    // The code below is unreachable but kept for reference or if you switch to backend-created sessions
    /*
    const { error } = await stripe.redirectToCheckout({
        lineItems: [{
            price: import.meta.env.VITE_STRIPE_PRICE_ID, 
            quantity: 1,
        }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/?success=true`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
    });

    if (error) {
        console.warn('Stripe Error:', error);
        throw new Error(error.message);
    }
    */
};
