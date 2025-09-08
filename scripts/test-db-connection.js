#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Database Connection...');
    console.log('================================');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test barangay table
    const barangayCount = await prisma.barangay.count();
    console.log(`🏘️ Barangays in database: ${barangayCount}`);
    
    // Test a specific user lookup (admin)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sigla.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 This error suggests:');
      console.log('1. Supabase project might be paused or deleted');
      console.log('2. Database URL might be incorrect');
      console.log('3. Database credentials might be expired');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

