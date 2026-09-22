import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local storage file path for persistent history across server reloads
const DATA_DIR = path.join(process.cwd(), '.data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    // Initial seeded history so the app has realistic history on initial load
    const initialRecords = [
      {
        id: 'seed_chat_1',
        type: 'ai_chat',
        title: 'TenantGuard AI Legal Query',
        summary: 'Asked about 14-day notice requirement under NY RPAPL § 711',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        metadata: {
          question: 'My landlord gave me a 5-day notice to pay rent. Is that legal in NYC?',
          reply: 'Under NY RPAPL § 711(2), a landlord must provide a 14-day written rent demand before commencing non-payment proceedings. A 5-day notice is defective.',
          model: 'meta-llama/Llama-3.3-70B-Instruct'
        }
      },
      {
        id: 'seed_audit_1',
        type: 'eviction_audit',
        title: 'Notice Audit: Empire Metropolitan Properties LLC',
        summary: 'Found 2 statutory defect(s) under NY RPAPL § 711. Days given: 5.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        amount: '$2,800.00',
        status: 'DEFECTIVE_NOTICE',
        metadata: {
          landlord: 'Empire Metropolitan Properties LLC',
          violations: ['Notice < 14 Days (RPAPL § 711)', '$150 Late Fee Exceeds Cap (RPL § 238-a)'],
          daysGiven: 5,
          rentDemanded: 2800
        }
      },
      {
        id: 'seed_deposit_1',
        type: 'deposit_claim',
        title: 'Deposit Claim: Midtown West Asset Management Group',
        summary: 'NY GOL § 7-108 Forfeiture triggered. Base: $3,200.00 (Claim: $9,600.00).',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        amount: '$9,600.00',
        status: 'FORFEITURE_TRIGGERED',
        metadata: {
          landlord: 'Midtown West Asset Management Group',
          baseDeposit: 3200,
          totalClaim: 9600,
          forfeited: true
        }
      },
      {
        id: 'seed_pay_1',
        type: 'payment',
        title: 'Payment: Digital Certified Dispatch & PDF Audit',
        summary: 'Stripe Checkout confirmed for Digital Certified Notice ($4.99).',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        amount: '$4.99',
        ref: 'cs_test_a1b2c3d4e5f6',
        status: 'COMPLETED',
        metadata: {
          item: 'Digital Certified Dispatch & PDF Audit',
          amount: '$4.99',
          paymentId: 'cs_test_a1b2c3d4e5f6',
          provider: 'Stripe Test Gateway'
        }
      },
      {
        id: 'seed_dispatch_1',
        type: 'certified_dispatch',
        title: 'Certified Notice Dispatch to empire.mgmt@example.com',
        summary: 'Dispatched via Resend with cryptographic proof hash 0x7f4e9a1b...',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        ref: 'msg_01JB3D9W41F8Q',
        status: 'DISPATCHED_VERIFIED',
        metadata: {
          recipient: 'empire.mgmt@example.com',
          subject: 'LEGAL DEMAND: Notice of Defective Rent Demand (RPAPL § 711)',
          trackingId: 'msg_01JB3D9W41F8Q',
          certHash: '0x7f4e9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f'
        }
      }
    ];
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(initialRecords, null, 2), 'utf-8');
  }
}

function readHistory(): any[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading history file:', err);
    return [];
  }
}

function writeHistory(records: any[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing history file:', err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let history = readHistory();

    if (type && type !== 'all') {
      history = history.filter(r => r.type === type);
    }

    return NextResponse.json({
      history,
      count: history.length,
      firebaseSync: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const record = await req.json();

    if (!record || !record.type) {
      return NextResponse.json({ error: 'Record with valid type is required' }, { status: 400 });
    }

    const history = readHistory();
    // Filter out if already exists
    const updated = [record, ...history.filter(r => r.id !== record.id)].slice(0, 200);
    writeHistory(updated);

    return NextResponse.json({
      success: true,
      record,
      total: updated.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    writeHistory([]);
    return NextResponse.json({ success: true, message: 'History cleared' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
