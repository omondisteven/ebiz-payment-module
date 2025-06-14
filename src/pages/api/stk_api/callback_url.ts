// src/pages/api/stk_api/callback_url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

type CallbackMetadataItem = {
  Name: string;
  Value: string | number;
};

type PaymentStatus = {
  timestamp: string;
  status: 'Success' | 'Failed';
  details: CallbackMetadataItem[] | string;
  amount?: number;
  phoneNumber?: string;
  receiptNumber?: string;
};

// src/pages/api/stk_api/callback_url.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] Callback received`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ResultCode: 1,
      ResultDesc: 'Method Not Allowed' 
    });
  }

  try {
    if (!req.body || !req.body.Body?.stkCallback) {
      console.error('Invalid callback structure:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid request format'
      });
    }

    const { stkCallback } = req.body.Body;
    const { CheckoutRequestID, ResultCode, CallbackMetadata, ResultDesc } = stkCallback;

    // Extract payment details first
    const amountObj = CallbackMetadata?.Item?.find((i: CallbackMetadataItem) => i.Name === "Amount");
    const receiptObj = CallbackMetadata?.Item?.find((i: CallbackMetadataItem) => i.Name === "MpesaReceiptNumber");
    const phoneObj = CallbackMetadata?.Item?.find((i: CallbackMetadataItem) => i.Name === "PhoneNumber");

    const statusUpdate: PaymentStatus = {
      timestamp: new Date().toISOString(),
      status: ResultCode === 0 ? 'Success' : 'Failed',
      details: CallbackMetadata?.Item || ResultDesc,
      amount: amountObj?.Value as number,
      phoneNumber: String(phoneObj?.Value || ''), // Convert to string
      receiptNumber: receiptObj?.Value as string
    };

    console.log('Processing payment:', {
      requestId: CheckoutRequestID,
      status: statusUpdate.status,
      amount: statusUpdate.amount,
      phone: statusUpdate.phoneNumber,
      receipt: statusUpdate.receiptNumber
    });
    
    // Save user phone number if available
    if (statusUpdate.phoneNumber && statusUpdate.phoneNumber !== "254") {
      try {
        const userDocRef = doc(db, 'users', statusUpdate.phoneNumber);
        await setDoc(userDocRef, { 
          phoneNumber: statusUpdate.phoneNumber,
          lastUpdated: new Date() 
        }, { merge: true });
        console.log('User phone number saved:', statusUpdate.phoneNumber);
      } catch (err) {
        console.error('Error storing user phone number:', err);
      }
    }

    // Save to Firestore
    try {
      await setDoc(doc(db, 'transactions', CheckoutRequestID), {
        ...statusUpdate,
        processedAt: new Date(),
        transactionType: ResultCode === 0 ? 'completed' : 'failed',
        receiptNumber: statusUpdate.receiptNumber || null,
        checkoutRequestID: CheckoutRequestID
      });
      console.log('Transaction successfully saved to Firestore:', CheckoutRequestID);
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError);
      // Still respond to M-Pesa but log the error
    }

    // Only respond to M-Pesa after all operations are complete
    return res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: "Callback processed successfully" 
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Internal server error'
    });
  }
}