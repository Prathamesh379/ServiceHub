import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectMongo, isMongoConnected } from '../config/mongo.ts';
import {
  UserModel,
  ServiceModel,
  TechnicianModel,
  BookingModel,
  ComplaintModel,
  ReviewModel,
  NotificationModel,
} from '../models/index.ts';
import { getDb, saveDb } from '../config/db.ts';

dotenv.config();

export async function runSeed() {
  console.log('[ServiceHub Seed] Starting database seeding with realistic Pune context...');

  const mongoConnected = await connectMongo();

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const techHash = await bcrypt.hash('Tech@123', salt);
  const customerHash = await bcrypt.hash('Customer@123', salt);

  const seedUsers = [
    {
      _id: 'usr_admin_1',
      name: 'Prathamesh Deshmukh',
      email: 'admin@servicehub.com',
      password: adminHash,
      role: 'ADMIN',
      phone: '+91 98220 12345',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: 'Shivaji Nagar, Pune',
    },
    {
      _id: 'usr_tech_1',
      name: 'Rahul Sharma',
      email: 'technician@servicehub.com',
      password: techHash,
      role: 'TECHNICIAN',
      phone: '+91 98810 54321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      location: 'Baner, Pune',
    },
    {
      _id: 'usr_tech_2',
      name: 'Amit Patil',
      email: 'amit.patil@servicehub.com',
      password: techHash,
      role: 'TECHNICIAN',
      phone: '+91 98230 77889',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      location: 'Kothrud, Pune',
    },
    {
      _id: 'usr_tech_3',
      name: 'Sachin Jadhav',
      email: 'sachin.jadhav@servicehub.com',
      password: techHash,
      role: 'TECHNICIAN',
      phone: '+91 97654 33221',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      location: 'Wakad, Pune',
    },
    {
      _id: 'usr_tech_4',
      name: 'Vikram Deshmukh',
      email: 'vikram.d@servicehub.com',
      password: techHash,
      role: 'TECHNICIAN',
      phone: '+91 99231 44556',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      location: 'Viman Nagar, Pune',
    },
    {
      _id: 'usr_tech_5',
      name: 'Priya Kulkarni',
      email: 'priya.k@servicehub.com',
      password: techHash,
      role: 'TECHNICIAN',
      phone: '+91 98901 22334',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      location: 'Aundh, Pune',
    },
    {
      _id: 'usr_cust_1',
      name: 'Siddhant Patil',
      email: 'customer@servicehub.com',
      password: customerHash,
      role: 'CUSTOMER',
      phone: '+91 98224 88990',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      location: 'Baner, Pune',
    },
    {
      _id: 'usr_cust_2',
      name: 'Ananya Joshi',
      email: 'ananya.joshi@gmail.com',
      password: customerHash,
      role: 'CUSTOMER',
      phone: '+91 97665 44332',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      location: 'Aundh, Pune',
    },
    {
      _id: 'usr_cust_3',
      name: 'Rohan Kadam',
      email: 'rohan.kadam@outlook.com',
      password: customerHash,
      role: 'CUSTOMER',
      phone: '+91 98221 11223',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      location: 'Wakad, Pune',
    },
    {
      _id: 'usr_cust_4',
      name: 'Sneha Nair',
      email: 'sneha.nair@yahoo.com',
      password: customerHash,
      role: 'CUSTOMER',
      phone: '+91 99223 99887',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      location: 'Hinjewadi Phase 1, Pune',
    },
  ];

  if (mongoConnected && isMongoConnected()) {
    try {
      console.log('[ServiceHub Seed] Populating MongoDB collections...');
      await UserModel.deleteMany({});
      for (const u of seedUsers) {
        await UserModel.create(u);
      }
      console.log('[ServiceHub Seed] Seeded MongoDB collections successfully.');
    } catch (e: any) {
      console.error('[ServiceHub Seed] Error seeding MongoDB:', e.message);
    }
  }

  // Ensure persistent store is refreshed and saved
  const db = getDb();
  saveDb();
  console.log('[ServiceHub Seed] Seeding completed. Demo accounts ready:');
  console.log(' - Admin: admin@servicehub.com / Admin@123');
  console.log(' - Technician: technician@servicehub.com / Tech@123');
  console.log(' - Customer: customer@servicehub.com / Customer@123');
}

// Allow direct execution: `node server/src/scripts/seed.ts` or imported execution
if (process.argv[1]?.includes('seed')) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
