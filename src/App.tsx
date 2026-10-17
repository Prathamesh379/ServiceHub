import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider, useNotifications } from './context/NotificationContext.tsx';
import { Sidebar, NavItemId } from './components/common/Sidebar.tsx';
import { Header } from './components/common/Header.tsx';

// Views
import { DashboardView } from './views/DashboardView.tsx';
import { BookingsView } from './views/BookingsView.tsx';
import { TechniciansView } from './views/TechniciansView.tsx';
import { CustomersView } from './views/CustomersView.tsx';
import { ServicesView } from './views/ServicesView.tsx';
import { ComplaintsView } from './views/ComplaintsView.tsx';
import { ReviewsView } from './views/ReviewsView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { TechnicianPortalView } from './views/TechnicianPortalView.tsx';
import { CustomerPortalView } from './views/CustomerPortalView.tsx';
import { CustomerMyServicesView } from './views/CustomerMyServicesView.tsx';
import { UnauthorizedView } from './views/UnauthorizedView.tsx';
import { AIAssistantView } from './components/ai/AIAssistantView.tsx';

// Modals
import { NewBookingModal } from './components/modals/NewBookingModal.tsx';
import { BookingDetailsModal } from './components/modals/BookingDetailsModal.tsx';
import { SmartAssignModal } from './components/modals/SmartAssignModal.tsx';
import { InvoiceModal } from './components/modals/InvoiceModal.tsx';
import { ReviewModal } from './components/modals/ReviewModal.tsx';
import { ComplaintModal } from './components/modals/ComplaintModal.tsx';
import { PaymentModal } from './components/modals/PaymentModal.tsx';
import { AIAssistantModal } from './components/modals/AIAssistantModal.tsx';

// Services & Types
import { api } from './services/api.ts';
import { socketClient } from './services/socket.ts';
import {
  IBooking,
  ITechnician,
  IDashboardStats,
  BookingStatus,
} from './types/index.ts';
import { FileText, CreditCard, ShieldCheck, Database, Server, Sparkles, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, isTechnician, isCustomer } = useAuth();
  const { showToast, notifications } = useNotifications();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavItemId>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Main Data States
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; bookings: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [topServicesData, setTopServicesData] = useState<any[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [technicians, setTechnicians] = useState<ITechnician[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Modals
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [initialBookingService, setInitialBookingService] = useState('');
  const [initialBookingProblem, setInitialBookingProblem] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [smartAssignModalOpen, setSmartAssignModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [aiAssistantModalOpen, setAiAssistantModalOpen] = useState(false);

  // Sync default tab when user role changes
  useEffect(() => {
    if (isTechnician) {
      setActiveTab('tech-portal');
    } else if (isCustomer) {
      setActiveTab('customer-portal');
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.role, isTechnician, isCustomer]);

  // Load Dashboard Data & Bookings
  const refreshAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [statsRes, bookingsRes, techRes] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings(),
        api.getTechnicians(),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data.kpi);
        setRevenueData(statsRes.data.revenueTrend || []);
        setCategoryData(statsRes.data.categoryDistribution || []);
        setTopServicesData(statsRes.data.topServices || []);
      }

      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }

      if (techRes.data) {
        setTechnicians(techRes.data);
      }
    } catch (err: any) {
      console.error('Error loading initial platform data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const unsubBookingCreated = socketClient.onBookingCreated((newBooking) => {
      setBookings((prev) => [newBooking, ...prev.filter((b) => b._id !== newBooking._id)]);
      refreshAllData();
    });

    const unsubBookingUpdated = socketClient.onBookingUpdated((updatedBooking) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
      );
      if (selectedBooking && selectedBooking._id === updatedBooking._id) {
        setSelectedBooking(updatedBooking);
      }
    });

    const unsubStatusChanged = socketClient.onBookingStatusChanged((data) => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === data.bookingId
            ? {
                ...b,
                status: data.status,
                statusHistory: data.statusHistory || b.statusHistory,
                cancellationReason: data.cancellationReason || b.cancellationReason,
                cancelledAt: data.cancelledAt || b.cancelledAt,
                cancelledBy: data.cancelledBy || b.cancelledBy,
              }
            : b
        )
      );
      if (selectedBooking && selectedBooking._id === data.bookingId) {
        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
                statusHistory: data.statusHistory || prev.statusHistory,
                cancellationReason: data.cancellationReason || prev.cancellationReason,
                cancelledAt: data.cancelledAt || prev.cancelledAt,
                cancelledBy: data.cancelledBy || prev.cancelledBy,
              }
            : null
        );
      }
    });

    const unsubTechAssigned = socketClient.onTechnicianAssigned((data) => {
      refreshAllData();
    });

    return () => {
      unsubBookingCreated();
      unsubBookingUpdated();
      unsubStatusChanged();
      unsubTechAssigned();
    };
  }, [refreshAllData, selectedBooking]);

  // Quick Action Triggers
  const handleOpenBookingWithPrompt = (serviceName: string, problem: string) => {
    setInitialBookingService(serviceName);
    setInitialBookingProblem(problem);
    setNewBookingModalOpen(true);
  };

  const handleViewBooking = (b: IBooking) => {
    setSelectedBooking(b);
    setDetailsModalOpen(true);
  };

  const handleAssignTechnician = (b: IBooking) => {
    setSelectedBooking(b);
    setSmartAssignModalOpen(true);
  };

  const handleViewInvoice = (b: IBooking) => {
    setSelectedBooking(b);
    setInvoiceModalOpen(true);
  };

  const handleOpenReview = (b: IBooking) => {
    setSelectedBooking(b);
    setReviewModalOpen(true);
  };

  const handleOpenComplaint = (b: IBooking) => {
    setSelectedBooking(b);
    setComplaintModalOpen(true);
  };

  const handleOpenPayment = (b: IBooking) => {
    setSelectedBooking(b);
    setPaymentModalOpen(true);
  };

  const handleUpdateStatus = async (booking: IBooking, status: BookingStatus) => {
    try {
      const res = await api.updateBookingStatus(booking._id, status);
      if (res.data) {
        showToast('success', 'Status Updated', `Booking #${booking.bookingNumber} is now ${status}`);
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? res.data : b))
        );
      }
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update status');
    }
  };

  // Resolve active page title
  const pageTitles: Record<NavItemId, string> = {
    dashboard: 'Operations Dashboard',
    bookings: 'Service Bookings',
    customers: 'Customer Accounts',
    technicians: 'Field Technicians',
    services: 'Service Catalog',
    complaints: 'Customer Support Tickets',
    payments: 'Payment Transactions',
    invoices: 'Billing & Invoices',
    reviews: 'Verified Ratings & Reviews',
    reports: 'Business Intelligence Reports',
    notifications: 'System Notifications',
    settings: 'Platform Infrastructure & Architecture',
    'tech-portal': 'Technician Field App',
    'customer-portal': 'Customer Portal',
    'my-services': 'My Services & Bookings',
    'ai-assistant': isTechnician
      ? 'Technician AI Copilot'
      : isCustomer
      ? 'Customer AI Concierge'
      : 'AI Diagnostics & Assistant',
  };

  // Find currently logged-in technician data if role is TECHNICIAN
  const currentTechnician = technicians[0] || null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* SaaS Pill Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          pageTitle={pageTitles[activeTab]}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            !isAdmin ? (
              <UnauthorizedView
                onReturnHome={() => setActiveTab(isTechnician ? 'tech-portal' : 'customer-portal')}
              />
            ) : (
              <DashboardView
                stats={stats}
                revenueData={revenueData}
                categoryData={categoryData}
                topServicesData={topServicesData}
                bookings={bookings}
                loadingStats={loadingData}
                onViewBooking={handleViewBooking}
                onAssignTechnician={handleAssignTechnician}
                onUpdateBookingStatus={handleUpdateStatus}
                onViewInvoice={handleViewInvoice}
                onOpenBookingModalWithPrompt={handleOpenBookingWithPrompt}
              />
            )
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              loading={loadingData}
              onViewBooking={handleViewBooking}
              onAssignTechnician={handleAssignTechnician}
              onUpdateStatus={handleUpdateStatus}
              onViewInvoice={handleViewInvoice}
              onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
            />
          )}

          {activeTab === 'technicians' && (
            <TechniciansView
              technicians={technicians}
              loading={loadingData}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'customers' && <CustomersView />}

          {activeTab === 'services' && (
            <ServicesView
              onOpenBookingForService={(serviceName) =>
                handleOpenBookingWithPrompt(serviceName, `Standard service request for ${serviceName}`)
              }
            />
          )}

          {activeTab === 'complaints' && <ComplaintsView />}

          {activeTab === 'reviews' && <ReviewsView />}

          {activeTab === 'reports' && (
            !isAdmin ? (
              <UnauthorizedView
                onReturnHome={() => setActiveTab(isTechnician ? 'tech-portal' : 'customer-portal')}
              />
            ) : (
              <ReportsView stats={stats} />
            )
          )}

          {activeTab === 'tech-portal' && (
            <TechnicianPortalView
              bookings={bookings}
              currentTech={currentTechnician}
              onRefresh={refreshAllData}
              onViewBooking={handleViewBooking}
              onOpenAIAssistant={() => setAiAssistantModalOpen(true)}
            />
          )}

          {activeTab === 'customer-portal' && (
            <CustomerPortalView
              bookings={bookings}
              onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
              onViewBooking={handleViewBooking}
              onViewInvoice={handleViewInvoice}
              onOpenReviewModal={handleOpenReview}
              onOpenComplaintModal={handleOpenComplaint}
              onOpenPaymentModal={handleOpenPayment}
              onOpenAIAssistant={(bookingId) => setAiAssistantModalOpen(true)}
              onNavigateToMyServices={() => setActiveTab('my-services')}
            />
          )}

          {activeTab === 'my-services' && (
            <CustomerMyServicesView
              bookings={bookings}
              onTrackBooking={(b) => {
                setSelectedBooking(b);
                setActiveTab('customer-portal');
              }}
              onViewBooking={handleViewBooking}
              onViewInvoice={handleViewInvoice}
              onOpenPaymentModal={handleOpenPayment}
              onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
              onBookingCancelled={refreshAllData}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              bookings={bookings}
              activeBooking={selectedBooking}
              onBookService={handleOpenBookingWithPrompt}
              onTrackBooking={(b) => {
                setSelectedBooking(b);
                setActiveTab(isCustomer ? 'customer-portal' : 'bookings');
              }}
            />
          )}

          {/* Payments View */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Payment Transactions</h2>
                  <p className="text-xs text-slate-500">
                    Razorpay gateway order webhooks, UPI settlements, and split commissions
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4 pl-5">Txn ID</th>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right pr-5">Gateway Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 pl-5 font-mono text-purple-700 font-bold">
                          pay_{b._id.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{b.bookingNumber}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{b.customerName}</td>
                        <td className="py-3 px-4 text-slate-600">{b.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">₹{b.totalAmount}</td>
                        <td className="py-3 px-4 text-right pr-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices View */}
          {activeTab === 'invoices' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Invoices & Tax Records</h2>
                  <p className="text-xs text-slate-500">GST-compliant invoice generation and itemized rate cards</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-purple-700">
                          INV-{b.bookingNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{b.scheduledDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{b.serviceName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Billed to: {b.customerName}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">₹{b.totalAmount}</span>
                      <button
                        onClick={() => handleViewInvoice(b)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-full text-xs font-bold transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications View */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Notification History & Webhooks</h2>
                <p className="text-xs text-slate-500">Real-time alerts broadcast across Socket.IO rooms</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n._id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture / Placement Showcase Settings View */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Platform Architecture & Placement Audit</h2>
                <p className="text-xs text-slate-500">
                  Comprehensive architectural verification, technology stack, and live telemetry
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>Backend & API Architecture</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Node.js + Express unified Vite middleware architecture on Port 3000.</li>
                    <li>JWT Bearer token authentication with Role-based access control (Admin, Technician, Customer).</li>
                    <li>REST endpoints covering /api/auth, /api/services, /api/bookings, /api/technicians, /api/dashboard.</li>
                    <li>Socket.IO server integration broadcasting real-time dispatch events to scoped rooms.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini AI Diagnostic Assistant</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Integrated with `@google/genai` on server-side with fallback intelligent diagnostics.</li>
                    <li>Instant root cause determination, estimated repair time, and price quotation.</li>
                    <li>One-click automated transfer from AI diagnostic output directly to booking creation modal.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <CreditCard className="w-4 h-4" />
                    <span>Smart Dispatch & Payment Ready</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Weighted algorithm for technician recommendation: 40% Skills, 20% Availability, 20% Distance, 10% Rating, 10% Workload.</li>
                    <li>Payment gateway ready: Order creation, signature verification, and printable GST invoice.</li>
                    <li>Customer Live GPS telemetry mockup with step-by-step progress tracking.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <Database className="w-4 h-4" />
                    <span>Database & Data Persistence</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Persistent JSON database store synced directly to local storage file on container disk.</li>
                    <li>Mongoose-style schema typing for Bookings, Technicians, Services, Reviews, and Complaints.</li>
                    <li>Pre-seeded with realistic Indian metro data (Pune / Baner / Wakad) and demo accounts.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewBookingModal
        isOpen={newBookingModalOpen}
        onClose={() => {
          setNewBookingModalOpen(false);
          setInitialBookingService('');
          setInitialBookingProblem('');
        }}
        initialServiceName={initialBookingService}
        initialProblemDescription={initialBookingProblem}
        onBookingCreated={(newBooking) => {
          setBookings((prev) => [newBooking, ...prev]);
          refreshAllData();
        }}
      />

      <BookingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        booking={selectedBooking}
        onOpenAssignModal={(b) => {
          setDetailsModalOpen(false);
          handleAssignTechnician(b);
        }}
        onOpenInvoiceModal={(b) => {
          setDetailsModalOpen(false);
          handleViewInvoice(b);
        }}
        onOpenReviewModal={(b) => {
          setDetailsModalOpen(false);
          handleOpenReview(b);
        }}
        onOpenComplaintModal={(b) => {
          setDetailsModalOpen(false);
          handleOpenComplaint(b);
        }}
        onUpdateStatus={handleUpdateStatus}
      />

      <SmartAssignModal
        isOpen={smartAssignModalOpen}
        onClose={() => setSmartAssignModalOpen(false)}
        booking={selectedBooking}
        onAssignmentSuccess={(updatedBooking) => {
          setBookings((prev) =>
            prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
          );
          setSelectedBooking(updatedBooking);
          refreshAllData();
        }}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        booking={selectedBooking}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={selectedBooking}
        onReviewSubmitted={refreshAllData}
      />

      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        booking={selectedBooking}
        onComplaintRaised={refreshAllData}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        booking={selectedBooking}
        onPaymentSuccess={(updatedBooking) => {
          setBookings((prev) =>
            prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
          );
          refreshAllData();
        }}
      />

      <AIAssistantModal
        isOpen={aiAssistantModalOpen}
        onClose={() => setAiAssistantModalOpen(false)}
        bookings={bookings}
        activeBooking={selectedBooking}
        onBookService={handleOpenBookingWithPrompt}
        onTrackBooking={(b) => {
          setSelectedBooking(b);
          setActiveTab(isCustomer ? 'customer-portal' : 'bookings');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
