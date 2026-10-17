import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { IBooking } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, booking }) => {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setLoading(true);
      api.getInvoice(booking._id || booking.bookingNumber)
        .then((res) => {
          if (res && res.data) {
            setInvoiceData(res.data);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch remote invoice data, fallback to booking props:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setInvoiceData(null);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  // Safe invoice values with fallbacks — never undefined, null, or NaN
  const invoiceNumber = invoiceData?.invoiceNumber || `INV-${booking.bookingNumber || '0000'}`;
  const invoiceDate = invoiceData?.date || booking.scheduledDate || new Date().toISOString().split('T')[0];

  // Customer Information
  const customerName = invoiceData?.customer?.name || booking.customerName || 'Valued Customer';
  const customerPhone = invoiceData?.customer?.phone || booking.customerPhone || 'Not provided';
  const customerEmail = invoiceData?.customer?.email || booking.customerEmail || 'Not provided';
  
  const rawAddress = invoiceData?.customer?.address || booking.address;
  let customerAddress = 'Not provided';
  if (rawAddress) {
    if (typeof rawAddress === 'string') {
      customerAddress = rawAddress;
    } else {
      const parts = [rawAddress.street, rawAddress.area, rawAddress.city, rawAddress.pincode].filter(Boolean);
      customerAddress = parts.length > 0 ? parts.join(', ') : 'Pune, Maharashtra';
    }
  }

  // Technician Information
  const technicianName = invoiceData?.technician?.name || booking.technicianName || 'Assigned Certified Expert';
  const technicianPhone = invoiceData?.technician?.phone || booking.technicianPhone || '+91 98810 54321';

  // Service Information
  const serviceName = invoiceData?.service?.name || booking.serviceName || 'Professional Doorstep Service';
  const serviceDescription =
    invoiceData?.service?.description ||
    booking.problemDescription ||
    booking.serviceName ||
    'Professional on-site diagnostic & repair service';
  const bookingId = booking.bookingNumber || invoiceData?.service?.bookingId || 'BK-0000';
  const serviceDate = `${booking.scheduledDate || invoiceData?.service?.serviceDate || 'Scheduled'}${
    booking.scheduledTimeSlot ? ` (${booking.scheduledTimeSlot})` : ''
  }`;

  // Financial Breakdown with proper zero handling
  const serviceCharge = Number(invoiceData?.serviceCharge ?? booking.amount ?? 0) || 0;
  const partsMaterials =
    Number(
      invoiceData?.partsMaterials ??
        (booking.partsUsed && booking.partsUsed.length > 0
          ? booking.partsUsed.reduce((sum, p) => sum + (Number(p.cost) || 0), 0)
          : 0)
    ) || 0;
  const otherCharges = Number(invoiceData?.otherCharges ?? 0) || 0;
  const subtotal = Number(invoiceData?.subtotal ?? (serviceCharge + partsMaterials)) || (serviceCharge + partsMaterials);
  const tax = Number(invoiceData?.tax ?? booking.taxAmount ?? 0) || 0;
  const discount = Number(invoiceData?.discount ?? booking.discountAmount ?? 0) || 0;
  const total = Number(invoiceData?.total ?? booking.totalAmount ?? (subtotal + tax - discount)) || 0;
  const paymentStatus = invoiceData?.paymentStatus || booking.paymentStatus || 'PAID';

  // Admin / Company Information
  const adminName = invoiceData?.admin?.name || 'Prathamesh Deshmukh';
  const adminRole = invoiceData?.admin?.role || 'Operations Administrator';
  const companyName = invoiceData?.admin?.company || 'ServiceHub Pvt. Ltd.';

  // Native Print Handler
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Native window.print() exception, using hidden iframe print fallback:', err);
      printViaHiddenIframe();
    }
  };

  // Hidden Iframe Fallback for sandboxed preview environments
  const printViaHiddenIframe = () => {
    try {
      const sheet = document.getElementById('invoice-printable-sheet');
      if (!sheet) {
        window.print();
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${booking.bookingNumber}</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
              th, td { padding: 8px 10px; text-align: left; }
              th { background-color: #f8fafc; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
              td { border-bottom: 1px solid #f1f5f9; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              hr { border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0; }
            </style>
          </head>
          <body>
            ${sheet.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 300);
    } catch (e) {
      console.error('Hidden iframe print error:', e);
    }
  };

  // Reliable Vector PDF Download via jsPDF
  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setDocumentProperties({
        title: `ServiceHub Invoice - ${booking.bookingNumber}`,
        subject: 'Official Service Tax Invoice',
        author: 'Prathamesh Deshmukh',
      });

      const purple = [124, 58, 237];
      const darkSlate = [15, 23, 42];
      const slate = [100, 116, 139];
      const lightSlate = [226, 232, 240];

      // Header Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text('SERVICEHUB', 15, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text('Smart Service Management Platform Pvt. Ltd.', 15, 26);
      doc.text('Baner Road, Pune, Maharashtra - 411045', 15, 30);
      doc.text('GSTIN: 27AABCS1429B1Z8', 15, 34);

      // Title & Meta Right Side
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('INVOICE', 195, 20, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(invoiceNumber, 195, 26, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text(`Invoice Date: ${invoiceDate}`, 195, 31, { align: 'right' });
      doc.text(`Payment Status: ${paymentStatus}`, 195, 36, { align: 'right' });

      // Divider
      doc.setDrawColor(lightSlate[0], lightSlate[1], lightSlate[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 41, 195, 41);

      // Customer & Technician Sections
      let y = 49;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('Customer:', 15, y);
      doc.text('Technician:', 115, y);

      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(customerName, 15, y);
      doc.text(technicianName, 115, y);

      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.setFontSize(8.5);

      const splitAddress = doc.splitTextToSize(customerAddress, 90);
      doc.text(splitAddress, 15, y);
      const addressLines = splitAddress.length;
      doc.text(`Certified Pune Hub Field Specialist`, 115, y);

      y += Math.max(addressLines * 4, 8);
      doc.text(`Phone: ${customerPhone}`, 15, y);
      doc.text(`Contact: ${technicianPhone}`, 115, y);

      y += 4.5;
      doc.text(`Email: ${customerEmail}`, 15, y);
      doc.text(`Background & Verification Checked ✓`, 115, y);

      // Divider
      y += 7;
      doc.line(15, y, 195, y);

      // Service Section
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('Service:', 15, y);

      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(serviceName, 15, y);

      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      const splitDesc = doc.splitTextToSize(`Description: ${serviceDescription}`, 180);
      doc.text(splitDesc, 15, y);

      y += splitDesc.length * 4;
      doc.text(`Booking ID: #${bookingId}`, 15, y);
      doc.text(`Service Date: ${serviceDate}`, 115, y);

      // Divider
      y += 6;
      doc.line(15, y, 195, y);

      // Items Table
      y += 6;
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('Description', 18, y + 4.8);
      doc.text('Amount', 192, y + 4.8, { align: 'right' });

      y += 9;
      doc.setFont('helvetica', 'normal');
      doc.text('Service Charge', 18, y + 4);
      doc.text(`Rs. ${serviceCharge}`, 192, y + 4, { align: 'right' });

      y += 7;
      doc.text('Parts / Materials', 18, y + 4);
      doc.text(`Rs. ${partsMaterials}`, 192, y + 4, { align: 'right' });

      y += 7;
      doc.text('Other Charges', 18, y + 4);
      doc.text(`Rs. ${otherCharges}`, 192, y + 4, { align: 'right' });

      // Table Divider
      y += 8;
      doc.line(15, y, 195, y);

      // Subtotal, Tax, Total
      y += 5;
      doc.text('Subtotal', 140, y + 4);
      doc.text(`Rs. ${subtotal}`, 192, y + 4, { align: 'right' });

      y += 6;
      doc.text('Tax (GST)', 140, y + 4);
      doc.text(`Rs. ${tax}`, 192, y + 4, { align: 'right' });

      if (discount > 0) {
        y += 6;
        doc.setTextColor(16, 185, 129);
        doc.text('Discount Applied', 140, y + 4);
        doc.text(`-Rs. ${discount}`, 192, y + 4, { align: 'right' });
        doc.setTextColor(slate[0], slate[1], slate[2]);
      }

      y += 8;
      doc.line(135, y, 195, y);

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('TOTAL', 140, y + 4);
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(`Rs. ${total}`, 192, y + 4, { align: 'right' });

      // Payment Status line
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(`Payment Status: ${paymentStatus}`, 15, y);

      // Footer Divider
      y += 6;
      doc.line(15, y, 195, y);

      // Signatory & Thank you
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text('Thank you for choosing ServiceHub.', 15, y);

      doc.setFont('helvetica', 'bold');
      doc.text(`Authorized Signatory: ${adminName}`, 195, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${adminRole} • ${companyName}`, 195, y + 4, { align: 'right' });

      doc.save(`ServiceHub-Invoice-${booking.bookingNumber}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    }
  };

  return (
    <div
      id="invoice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="invoice-modal-card"
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Top Action Bar - Hidden when printing */}
        <div
          id="invoice-modal-topbar"
          className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between print:hidden"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Official Service Invoice</span>
            {loading && <span className="text-[10px] text-purple-600 font-medium">Syncing data...</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-invoice-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-semibold shadow-xs transition active:scale-95"
              title="Print formatted A4 invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              id="download-pdf-btn"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition active:scale-95"
              title="Download official PDF copy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div
          id="invoice-printable-sheet"
          className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-800 text-xs font-sans space-y-5"
        >
          {/* Header Section */}
          <div className="flex items-start justify-between pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">
                  SERVICE<span className="text-purple-600">HUB</span>
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Smart Service Management Platform Pvt. Ltd.
                <br />
                Baner Road, Pune, Maharashtra - 411045
                <br />
                GSTIN: 27AABCS1429B1Z8
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 block font-mono">
                Invoice
              </span>
              <span className="text-sm font-extrabold text-purple-700 block font-mono mt-0.5">
                {invoiceNumber}
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                Invoice Date: {invoiceDate}
              </span>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                PAYMENT: {paymentStatus}
              </span>
            </div>
          </div>

          {/* Customer & Technician Information Block */}
          <div className="grid grid-cols-2 gap-6 py-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Customer:
              </span>
              <h4 className="font-bold text-slate-900 text-xs">{customerName}</h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {customerAddress}
                <br />
                Phone: {customerPhone}
                <br />
                Email: {customerEmail}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Technician:
              </span>
              <h4 className="font-bold text-slate-900 text-xs">{technicianName}</h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                Phone: {technicianPhone}
                <br />
                Pune Operations Hub
                <br />
                Background & Verification Checked ✓
              </p>
            </div>
          </div>

          {/* Service Details Block */}
          <div className="py-2 border-t border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Service:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Service Name: </span>
                <span className="font-bold text-slate-900">{serviceName}</span>
              </div>
              <div>
                <span className="text-slate-500">Booking ID: </span>
                <span className="font-bold text-slate-900 font-mono">#{bookingId}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Service Description: </span>
                <span className="text-slate-700">{serviceDescription}</span>
              </div>
              <div>
                <span className="text-slate-500">Service Date: </span>
                <span className="font-medium text-slate-800">{serviceDate}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table Breakdown */}
          <div className="pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-700">
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-800">Service Charge</span>
                    <span className="text-[10px] text-slate-400 block">{serviceName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    ₹{serviceCharge}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-800">Parts/Materials</span>
                    {booking.partsUsed && booking.partsUsed.length > 0 && (
                      <span className="text-[10px] text-slate-400 block">
                        {booking.partsUsed.map((p) => `${p.name} (₹${p.cost})`).join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    ₹{partsMaterials}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-800">Other Charges</span>
                    <span className="text-[10px] text-slate-400 block">Standard visiting & inspection</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    ₹{otherCharges}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-1">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST 18%):</span>
                <span className="font-medium text-slate-900">₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-300">
                <span>TOTAL:</span>
                <span className="text-purple-700">₹{total}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Status:</span>
                <span className="font-bold text-slate-800">{paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Signatory and Thank You Footer */}
          <div className="pt-5 border-t border-slate-200 flex items-end justify-between text-[11px] leading-relaxed">
            <div>
              <p className="font-bold text-slate-800">Thank you for choosing ServiceHub.</p>
              <p className="text-slate-500 mt-0.5">
                All certified jobs include a 30-day service warranty on workmanship.
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Authorized Signatory
              </p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{adminName}</p>
              <p className="text-[10px] text-slate-500">
                {adminRole} • {companyName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
