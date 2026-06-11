import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  prismaConnectionRetries: number;
}

// Initialize connection retry counter
if (!globalForPrisma.prismaConnectionRetries) {
  globalForPrisma.prismaConnectionRetries = 0;
}

// Skip Prisma init during build if DATABASE_URL missing (Railway build phase)
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, Prisma client not initialized (build phase)');
    return null as any; // Return mock during build
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle prepared statement errors by reconnecting
export async function handlePrismaError(error: any) {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Check if it's a prepared statement error
  if (errorMessage.includes('prepared statement') && errorMessage.includes('does not exist')) {
    console.warn('Prepared statement error detected, attempting to reconnect...');
    
    // Disconnect and reconnect
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log('Successfully reconnected to database');
      globalForPrisma.prismaConnectionRetries = 0;
    } catch (reconnectError) {
      console.error('Failed to reconnect:', reconnectError);
      globalForPrisma.prismaConnectionRetries++;
      
      // If too many retries, throw error
      if (globalForPrisma.prismaConnectionRetries > 3) {
        throw new Error('Database connection failed after multiple retries');
      }
    }
  }
  
  throw error;
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}