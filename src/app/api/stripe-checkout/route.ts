import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { itemType, caseId } = await req.json();

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe secret key missing' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const isCertified = itemType === 'certified_mail';
    const amount = isCertified ? 1499 : 2900; // In cents ($14.99 vs $29.00)
    const name = isCertified 
      ? 'USPS Certified Mail Dispatch & Return Receipt Service' 
      : 'NYC Small Claims Pro Self-Filing Action Kit';
    const description = isCertified
      ? 'Official printing, certified mail postage, USPS barcode tracking, and signed return receipt.'
      : 'Complete small claims filing package, summons template, evidence chronology, and court day script.';

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment_success=true&item=${itemType}&case=${caseId || 'default'}`,
      cancel_url: `${origin}/dashboard?payment_cancelled=true`,
    });

    // Log payment checkout initiation to history store
    try {
      const fs = require('fs');
      const path = require('path');
      const dataDir = path.join(process.cwd(), '.data');
      const historyFile = path.join(dataDir, 'history.json');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      let records: any[] = [];
      if (fs.existsSync(historyFile)) {
        records = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
      }
      records.unshift({
        id: 'pay_' + Date.now(),
        type: 'payment',
        title: `Payment: ${name}`,
        summary: `Stripe Checkout initialized for ${name} ($${(amount / 100).toFixed(2)}).`,
        timestamp: new Date().toISOString(),
        amount: `$${(amount / 100).toFixed(2)}`,
        ref: session.id,
        status: 'CHECKOUT_INITIALIZED',
        metadata: {
          item: name,
          amount: `$${(amount / 100).toFixed(2)}`,
          paymentId: session.id,
          provider: 'Stripe Test Gateway'
        }
      });
      fs.writeFileSync(historyFile, JSON.stringify(records.slice(0, 200), null, 2), 'utf-8');
    } catch (err) {
      console.warn('Payment history persistence notice:', err);
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe session creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
