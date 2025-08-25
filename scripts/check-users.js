const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('👥 Checking users in database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true
      }
    })
    
    console.log(`📊 Total users: ${users.length}`)
    
    if (users.length > 0) {
      console.log('\n👤 Users:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (ID: ${user.id}) - ${user.role} - ${user.email}`)
      })
    } else {
      console.log('❌ No users found in database')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()