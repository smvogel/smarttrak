// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create base client with optimized settings for serverless
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

// Global instance for development hot reload prevention
const basePrisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma
}

// Enhanced client with connection testing and recovery
export async function getPrismaClient(): Promise<PrismaClient> {
  try {
    // Test the connection with a simple query
    await basePrisma.$queryRaw`SELECT 1`
    return basePrisma
  } catch (error: any) {
    console.warn('Prisma connection test failed, attempting to reconnect:', error.message)

    // If connection test fails, try to disconnect and reconnect
    try {
      await basePrisma.$disconnect()
    } catch (disconnectError) {
      // Ignore disconnect errors
      console.warn('Disconnect error (ignored):', disconnectError)
    }

    // Create a new client instance
    const newClient = createPrismaClient()

    try {
      // Test the new connection
      await newClient.$queryRaw`SELECT 1`
      console.log('Prisma reconnection successful')

      // Update global reference for future requests
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = newClient
      }

      return newClient
    } catch (reconnectError) {
      console.error('Prisma reconnection failed:', reconnectError)
      // Return the new client anyway - let the actual query fail with a proper error
      return newClient
    }
  }
}

// Legacy export for backwards compatibility (but prefer getPrismaClient)
export const prisma = basePrisma

// Graceful shutdown helper
export async function disconnectPrisma() {
  try {
    await basePrisma.$disconnect()
    console.log('Prisma disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting Prisma:', error)
  }
}