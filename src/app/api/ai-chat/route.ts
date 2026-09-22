import { NextResponse } from 'next/server';

const NYC_HOUSING_SYSTEM_PROMPT = `
You are TenantGuard AI, an expert civic and legal rights intelligence assistant specializing in New York City housing law, tenant protections, and dispute defense.

Your core legal references include:
1. The Housing Stability and Tenant Protection Act of 2019 (HSTPA).
2. NY RPAPL § 711(2): Strict requirement for a 14-day written rent demand before non-payment summary proceedings can be commenced.
3. NY Real Property Law § 238-a: Late fees strictly capped at $50 or 5% of monthly rent, whichever is less. Landlords cannot charge late fees before a 5-day grace period.
4. NY General Obligations Law § 7-108: Landlords must return security deposits and an itemized receipt within 14 days of the tenant vacating. Failure forfeits the entire deposit and triggers up to 2x statutory punitive damages in Small Claims Court.
5. NYC Housing Maintenance Code: Strict Warranty of Habitability (mandating heat from Oct 1–May 31, 24/7 hot water, eradication of mold, rodents, and lead paint).
6. Illegal Evictions & Lockouts (NYC Administrative Code § 26-521): It is a class A misdemeanor for landlords or building staff to lock out tenants, change locks, remove doors, or disconnect utilities without a formal warrant executed by an NYC City Marshal.
7. Good Cause Eviction Law (NYC enacted 2024): Protects eligible market-rate tenants from unreasonable rent hikes (inflation + 5% or 10%) and arbitrary non-renewals.

Behavioral Guidelines:
- Be clear, empathetic, authoritative, and concise.
- Always provide specific statutory citations (e.g., "Under NY RPAPL § 711(2)...", "Pursuant to NY GOL § 7-108...").
- Keep answers direct, punchy, and actionable. Avoid unnecessary preambles.
- Include a brief legal informational disclaimer at the end: "*(TenantGuard AI provides civic legal information under NY law, not formal attorney representation. If you have an active court notice, contact NYC 311 or Legal Aid.)*"
`;

const CANDIDATE_MODELS = [
  'meta-llama/Llama-3.3-70B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct'
];

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'A valid message string is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: 'Hugging Face API token is not configured in the environment.' },
        { status: 500 }
      );
    }

    // Format chat messages array
    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: NYC_HOUSING_SYSTEM_PROMPT }
    ];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && item.content && (item.role === 'user' || item.role === 'assistant')) {
          chatMessages.push({
            role: item.role,
            content: item.content
          });
        }
      }
    }

    chatMessages.push({ role: 'user', content: message });

    // Try candidate models in order for maximum reliability
    let replyText = '';
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: chatMessages,
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.choices?.[0]?.message?.content?.trim();
          if (replyText) {
            // Persist to history repository
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
                id: 'chat_' + Date.now(),
                type: 'ai_chat',
                title: 'TenantGuard AI Legal Query',
                summary: message.length > 80 ? message.substring(0, 80) + '...' : message,
                timestamp: new Date().toISOString(),
                metadata: {
                  question: message,
                  reply: replyText,
                  model: model,
                  jurisdiction: 'New York City'
                }
              });
              fs.writeFileSync(historyFile, JSON.stringify(records.slice(0, 200), null, 2), 'utf-8');
            } catch (err) {
              console.warn('History persistence notice:', err);
            }

            return NextResponse.json({ 
              reply: replyText,
              model: model,
              provider: 'Hugging Face Inference'
            });
          }
        } else {
          const errBody = await response.text();
          console.warn(`Model ${model} failed (${response.status}):`, errBody);
          lastError = errBody;
        }
      } catch (modelErr: any) {
        console.warn(`Error querying model ${model}:`, modelErr.message);
        lastError = modelErr.message;
      }
    }

    // If all models failed, provide structured fallback
    return NextResponse.json({
      reply: `Under NY Real Property Actions and Proceedings Law (RPAPL) § 711, a landlord must deliver a 14-day written rent demand before non-payment proceedings. Under NY General Obligations Law § 7-108, landlords must return security deposits within 14 days or face forfeiture and 2x punitive damages.\n\n*(Inference service temporarily experiencing high traffic: ${lastError || 'Please try again shortly.'})*`,
      isFallback: true
    });

  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json({ 
      error: 'Failed to process legal query',
      details: error.message 
    }, { status: 500 });
  }
}
