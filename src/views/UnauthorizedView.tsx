import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface UnauthorizedViewProps {
  onReturnHome: () => void;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({ onReturnHome }) => {
  const { user, isTechnician, isCustomer } = useAuth();

  const roleName = isTechnician ? 'Technician' : isCustomer ? 'Customer' : user?.role || 'User';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <Lock className="w-3.5 h-3.5" />
            <span>403 Forbidden • Access Restricted</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Analysis View is Restricted to Admins
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your current account role (<span className="font-semibold text-slate-700">{roleName}</span>) does not have administrative privileges to view company-wide financial performance, revenue trends, and operational audits.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onReturnHome}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {isTechnician ? 'Technician Portal' : isCustomer ? 'Customer Dashboard' : 'Home'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
