import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { IBooking } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking | null;
  onPaymentSuccess: (booking: IBooking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const { showToast } = useNotifications();
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('siddhant@okhdfcbank');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create Order
      const orderRes = await api.createPaymentOrder(booking._id, booking.totalAmount);

      // Step 2: Simulate Razorpay checkout verification
      const verifyRes = await api.verifyPayment(
        booking._id,
        `pay_${Date.now()}_razorpay_mock`,
        orderRes.orderId
      );

      confetti({ particleCount: 80, spread: 70 });
      showToast(
        'success',
        'Payment Verified',
        `Transaction ₹${booking.totalAmount} approved for #${booking.bookingNumber}`
      );
      onPaymentSuccess(verifyRes.data);
      onClose();
    } catch (err: any) {
      showToast('error', 'Payment Error', err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold">Razorpay Secure Checkout</h3>
              <p className="text-[10px] text-purple-300">Test / Mock Ready Architecture</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Amount Box */}
          <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Total Payable</span>
              <span className="text-xl font-black text-slate-900">₹{booking.totalAmount}</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px] font-semibold">
              #{booking.bookingNumber}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Payment Instrument</label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'CARD', 'NETBANKING'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`p-2.5 rounded-xl border font-bold text-center text-xs transition ${
                    method === m
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {method === 'UPI' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Enter UPI VPA ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Google Pay, PhonePe, Paytm, BHIM supported
              </span>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-2">
              <input
                type="text"
                defaultValue="4242 •••• •••• 4242"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  defaultValue="12/28"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 text-center"
                />
                <input
                  type="password"
                  defaultValue="123"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 text-center"
                />
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>State Bank of India</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
            </select>
          )}

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Encrypted</span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full font-bold shadow-md shadow-purple-600/30 transition flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? 'Verifying...' : `Pay ₹${booking.totalAmount}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
