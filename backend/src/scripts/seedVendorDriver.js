const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../../dist/models/User').default;
const Vehicle = require('../../dist/models/Vehicle').default;

const seedVendorDriver = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lezit-transports');
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $in: ['vendor@test.com', 'driver@test.com', 'driver2@test.com', 'driver3@test.com'] } });
    await Vehicle.deleteMany({ vendorId: { $exists: true } });
    console.log('🧹 Cleared existing test data');

    // Create test vendor
    const vendor = new User({
      name: 'Test Vendor Company',
      email: 'vendor@test.com',
      password: 'password123',
      phone: '9876543210',
      role: 'vendor',
      businessName: 'Premium Transport Services',
      businessType: 'car_rental',
      businessLicense: 'BL123456789',
      businessAddress: '123 Business Street, City, State - 12345',
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'Premium Transport Services'
      },
      documents: {
        aadhar: 'ADHAR123456789',
        pan: 'PAN123456789'
      },
      isActive: true
    });

    await vendor.save();
    console.log('✅ Created test vendor:', vendor.email);

    // Create test vehicles for vendor
    const vehicles = [
      {
        vendorId: vendor._id,
        name: 'Toyota Innova Crysta',
        type: 'suv',
        make: 'Toyota',
        vehicleModel: 'Innova Crysta',
        year: 2023,
        licensePlate: 'KA01AB1234',
        capacity: 7,
        features: ['AC', 'GPS', 'Bluetooth', 'USB Charging'],
        pricePerKm: 15,
        basePrice: 2000,
        isAvailable: true,
        isActive: true,
        images: ['https://example.com/innova1.jpg'],
        documents: {
          rc: 'RC123456789',
          insurance: 'INS123456789',
          permit: 'PER123456789'
        },
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'Bangalore, Karnataka'
        },
        rating: 4.5,
        totalBookings: 25
      },
      {
        vendorId: vendor._id,
        name: 'Maruti Swift',
        type: 'car',
        make: 'Maruti Suzuki',
        vehicleModel: 'Swift',
        year: 2022,
        licensePlate: 'KA02CD5678',
        capacity: 5,
        features: ['AC', 'Power Steering', 'Music System'],
        pricePerKm: 12,
        basePrice: 1500,
        isAvailable: true,
        isActive: true,
        images: ['https://example.com/swift1.jpg'],
        documents: {
          rc: 'RC987654321',
          insurance: 'INS987654321'
        },
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'Bangalore, Karnataka'
        },
        rating: 4.2,
        totalBookings: 18
      }
    ];

    for (const vehicleData of vehicles) {
      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();
      console.log('✅ Created vehicle:', vehicle.name);
    }

    // Create test driver
    const driver = new User({
      name: 'Rajesh Kumar',
      email: 'driver@test.com',
      password: 'password123',
      phone: '9876543211',
      role: 'driver',
      licenseNumber: 'DL1234567890123456',
      licenseExpiry: new Date('2026-12-31'),
      vehicleType: 'suv',
      experience: 5,
      rating: 4.7,
      bankDetails: {
        accountNumber: '0987654321',
        ifscCode: 'HDFC0000987',
        accountHolderName: 'Rajesh Kumar'
      },
      documents: {
        aadhar: 'ADHAR987654321',
        pan: 'PAN987654321',
        license: 'DL1234567890123456'
      },
      isActive: true,
      isAvailable: true
    });

    await driver.save();
    console.log('✅ Created test driver:', driver.email);

    // Create additional test drivers
    const additionalDrivers = [
      {
        name: 'Suresh Patel',
        email: 'driver2@test.com',
        password: 'password123',
        phone: '9876543212',
        role: 'driver',
        licenseNumber: 'DL2345678901234567',
        licenseExpiry: new Date('2027-06-30'),
        vehicleType: 'car',
        experience: 3,
        rating: 4.3,
        bankDetails: {
          accountNumber: '1122334455',
          ifscCode: 'ICIC0001122',
          accountHolderName: 'Suresh Patel'
        },
        isActive: true,
        isAvailable: true
      },
      {
        name: 'Amit Singh',
        email: 'driver3@test.com',
        password: 'password123',
        phone: '9876543213',
        role: 'driver',
        licenseNumber: 'DL3456789012345678',
        licenseExpiry: new Date('2025-09-15'),
        vehicleType: 'van',
        experience: 7,
        rating: 4.8,
        bankDetails: {
          accountNumber: '5566778899',
          ifscCode: 'AXIS0005566',
          accountHolderName: 'Amit Singh'
        },
        isActive: true,
        isAvailable: false
      }
    ];

    for (const driverData of additionalDrivers) {
      const newDriver = new User(driverData);
      await newDriver.save();
      console.log('✅ Created additional driver:', newDriver.email);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👤 Vendor: vendor@test.com / password123');
    console.log('👤 Driver 1: driver@test.com / password123');
    console.log('👤 Driver 2: driver2@test.com / password123');
    console.log('👤 Driver 3: driver3@test.com / password123');
    console.log('\n🚗 Vehicles: 2 vehicles created for the vendor');
    console.log('👨‍💼 Drivers: 3 drivers with different vehicle types and availability');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
};

// Run the seeding function
seedVendorDriver();
