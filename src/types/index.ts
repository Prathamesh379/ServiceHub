export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ITechnician {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  skills: string[];
  experienceYears: number;
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  activeJobs: number;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
  todayEarnings: number;
  totalEarnings: number;
  createdAt: string;
}

export interface IService {
  _id: string;
  name: string;
  description: string;
  category: 'AC Repair' | 'Plumbing' | 'Electrical' | 'Laptop Repair' | 'Cleaning' | 'Appliance' | 'Other';
  price: number;
  durationMinutes: number;
  requiredSkills: string[];
  imageUrl: string;
  isActive: boolean;
  bookingsCount: number;
}

export type BookingStatus =
  | 'PENDING'
  | 'TECHNICIAN_ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IBookingTimeline {
  status: BookingStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface IBookingStatusHistoryItem {
  status: BookingStatus;
  timestamp: string;
  updatedBy?: string;
  note?: string;
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianAvatar?: string;
  location: string;
  address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  scheduledDate: string;
  scheduledTimeSlot: string;
  problemDescription: string;
  uploadedImages?: string[];
  beforeImages?: string[];
  afterImages?: string[];
  serviceNotes?: string;
  partsUsed?: Array<{ name: string; cost: number }>;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: BookingStatus;
  timeline: IBookingTimeline[];
  statusHistory?: IBookingStatusHistoryItem[];
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComplaint {
  _id: string;
  complaintId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  technicianId?: string;
  technicianName?: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  internalNotes?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  role: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'BOOKING' | 'TECHNICIAN' | 'PAYMENT' | 'COMPLAINT' | 'SYSTEM';
  bookingId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IDashboardStats {
  totalCustomers: number;
  totalCustomersGrowth: string;
  monthlyRevenue: number;
  monthlyRevenueGrowth: string;
  totalBookings: number;
  totalBookingsGrowth: string;
  completedServices: number;
  completedServicesGrowth: string;
}

export interface ITechnicianRecommendation {
  technician: ITechnician;
  score: number;
  breakdown: {
    skillMatchScore: number;
    availabilityScore: number;
    distanceScore: number;
    ratingScore: number;
    workloadScore: number;
  };
  distanceKm: number;
  skillMatchPercentage: number;
}

export interface IDiagnosisResult {
  service: string;
  serviceId?: string;
  possibleProblem: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  recommendedAction: string;
  recommendedService: string;
  estimatedCostRange: string;
  suggestedDuration: string;
}
