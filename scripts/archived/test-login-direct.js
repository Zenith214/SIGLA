const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testLoginDirect() {
  console.log('🔐 Testing login functionality directly...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Find the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@sigla.com' }
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    
    // Test password
    const isPasswordValid = await bcrypt.compare('admin123', user.password);
    console.log('✅ Password test:', isPasswordValid ? 'Valid' : 'Invalid');
    
    if (isPasswordValid) {
      // Test update lastLogin
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      console.log('✅ LastLogin updated successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginDirect();