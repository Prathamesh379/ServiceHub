import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Layers,
  ShieldCheck,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IService, IBooking } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: IBooking) => void;
  preselectedServiceName?: string;
  initialProblemDescription?: string;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingSuccess,
  preselectedServiceName,
  initialProblemDescription,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<IService[]>([]);
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  // Form State
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('10:00 AM - 11:30 AM');
  const [area, setArea] = useState<string>('Baner');
  const [streetAddress, setStreetAddress] = useState<string>('Flat 402, Rohan Leher Phase 2');
  const [pincode, setPincode] = useState<string>('411045');
  const [problemDescription, setProblemDescription] = useState<string>(
    initialProblemDescription || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);

  // Handle actual file upload via FormData
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 5MB maximum file size limit.`);
        return;
      }
      const ext = file.type.toLowerCase();
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(ext)) {
        setUploadError(`"${file.name}" has an unsupported format. Please upload JPG, PNG, or WEBP.`);
        return;
      }
      validFiles.push(file);
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      validFiles.forEach((file) => formData.append('images', file));

      const res = await api.uploadImages(formData);
      if (res.urls && res.urls.length > 0) {
        setUploadedImages((prev) => [...prev, ...res.urls]);
        showToast('Photos uploaded successfully', 'success');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload images. Please try again.');
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Load available services
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await api.getServices();
        if (res.data) {
          setServices(res.data);
          if (preselectedServiceName) {
            const match = res.data.find(
              (s) => s.name.toLowerCase() === preselectedServiceName.toLowerCase()
            );
            if (match) setSelectedService(match);
          } else if (res.data.length > 0) {
            setSelectedService(res.data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) {
      loadServices();
      setStep(1);
      setConfirmedBooking(null);
      if (initialProblemDescription) setProblemDescription(initialProblemDescription);
    }
  }, [isOpen, preselectedServiceName, initialProblemDescription]);

  if (!isOpen) return null;

  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '12:00 PM - 01:30 PM',
    '02:00 PM - 03:30 PM',
    '03:30 PM - 05:00 PM',
    '05:00 PM - 06:30 PM',
  ];

  const puneAreas = [
    'Baner',
    'Wakad',
    'Hinjewadi',
    'Aundh',
    'Kothrud',
    'Viman Nagar',
    'Kalyani Nagar',
    'Hadapsar',
    'Magarpatta',
    'Shivaji Nagar',
  ];

  const subtotal = selectedService?.price || 599;
  const tax = Math.round(subtotal * 0.18);
  const discount = subtotal > 700 ? 50 : 0;
  const total = subtotal + tax - discount;

  const handleSubmitBooking = async () => {
    if (!selectedService) return;
    setLoading(true);

    try {
      const payload: Partial<IBooking> = {
        serviceId: selectedService._id,
        customerId: user?._id || 'usr_cust_1',
        customerName: user?.name || 'Siddhant Patil',
        customerPhone: user?.phone || '+91 98224 88990',
        customerEmail: user?.email || 'customer@servicehub.com',
        location: area,
        address: {
          street: streetAddress,
          area,
          city: 'Pune',
          pincode,
        },
        scheduledDate,
        scheduledTimeSlot,
        problemDescription: problemDescription || 'General diagnostics and service repair required.',
        paymentMethod,
        uploadedImages,
      };

      const res = await api.createBooking(payload);
      if (res.data) {
        setConfirmedBooking(res.data);
        setStep(7); // Confirmation step
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('success', 'Booking Confirmed!', `Service booking #${res.data.bookingNumber} created.`);
        onBookingSuccess(res.data);
      }
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {step === 7 ? 'Booking Confirmed' : 'Book a Verified Service'}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 7
                  ? 'Technician dispatch will begin shortly'
                  : `Step ${step} of 6 • 100% Satisfaction Guarantee`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        {step < 7 && (
          <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= s ? 'bg-purple-600' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Select Service Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedService?._id === srv._id;
                  return (
                    <div
                      key={srv._id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={srv.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {srv.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {srv.category} • {srv.durationMinutes} mins
                        </span>
                        <span className="text-xs font-black text-purple-700 mt-1 block">
                          ₹{srv.price}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Preferred Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Convenient Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setScheduledTimeSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        scheduledTimeSlot === slot
                          ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Address & Pune Location */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Service Area (Pune)
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:border-purple-500 cursor-pointer"
                >
                  {puneAreas.map((a) => (
                    <option key={a} value={a}>
                      {a}, Pune
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Street Address / Society / Flat No.
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Flat 304, Marvel Zephyr, Kharadi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 411045"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Describe Problem */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Describe the Issue or Requirements
                </label>
                <textarea
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Please describe symptoms, unusual sounds, error codes, or how long the issue has persisted..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-900">
                <span className="font-bold block mb-0.5">Tip for Faster Resolution:</span>
                Providing clear details helps our Smart Assignment Algorithm pick the technician with
                exact matching tools and spare parts.
              </div>
            </div>
          )}

          {/* STEP 5: Upload Images */}
          {step === 5 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Attach Diagnostic Photos (Optional)
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  uploadingImages
                    ? 'border-purple-400 bg-purple-50/40'
                    : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 bg-slate-50/50'
                }`}
              >
                {uploadingImages ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-xs font-bold text-purple-700">Uploading and processing photos...</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Please wait a moment</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Click or drag and drop photos here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WEBP up to 5MB each</p>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {uploadError}
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Attached Photos ({uploadedImages.length}):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {uploadedImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(i);
                          }}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition shadow-xs"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Price Breakdown & Payment Mode */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{selectedService?.name}</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard GST (18%)</span>
                  <span>₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Special Promo Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount Payable</span>
                  <span className="text-purple-700">₹{total}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'ONLINE'
                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Online Payment</span>
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Razorpay / UPI / Cards / NetBanking
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'CASH'
                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Pay on Service</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Pay after technician completes work
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Confirmation Result */}
          {step === 7 && confirmedBooking && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Booking Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your booking #{confirmedBooking.bookingNumber} has been logged into the dispatch pool.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedBooking.scheduledDate} ({confirmedBooking.scheduledTimeSlot})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{confirmedBooking.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold text-purple-700">₹{confirmedBooking.totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 && step < 7 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-full shadow-sm transition"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : step === 6 ? (
            <button
              onClick={handleSubmitBooking}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-purple-600/30 transition active:scale-95"
            >
              {loading ? (
                <span>Creating Dispatch...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Book Now</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-full transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
