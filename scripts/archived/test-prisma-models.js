const { PrismaClient } = require('@prisma/client');

async function testPrismaModels() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('Available models:');
    console.log(Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaModels();