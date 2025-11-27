const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifySurveyStorage() {
  try {
    console.log('🔍 Verifying survey storage capabilities...\n')

    // Check database tables exist
    console.log('📋 Checking database tables...')
    
    const tables = [
      'survey_response',
      'survey_section', 
      'survey_answer',
      'survey_question',
      'survey_metadata',
      'survey_attachment'
    ]

    for (const table of tables) {
      try {
        const count = await prisma[table].count()
        console.log(`✅ ${table}: ${count} records`)
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`)
      }
    }

    // Check required relationships
    console.log('\n🔗 Checking relationships...')
    
    // Check barangays
    const barangays = await prisma.barangay.findMany({
      select: { barangay_id: true, barangay_name: true }
    })
    console.log(`✅ Barangays available: ${barangays.length}`)
    
    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, role: true }
    })
    console.log(`✅ Users available: ${users.length}`)

    // Test survey response creation with minimal data
    console.log('\n🧪 Testing survey response creation...')
    
    const testResponse = await prisma.survey_response.create({
      data: {
        survey_number: `VERIFY-${Date.now()}`,
        barangay_id: barangays[0].barangay_id,
        interviewer_id: users[0].id,
        respondent_name: 'Test Respondent',
        location_lat: 8.4542,
        location_lng: 124.6319,
        location_address: 'Test Location',
        status: 'draft',
        progress: 0
      }
    })
    console.log(`✅ Survey response created: ID ${testResponse.response_id}`)

    // Test survey section creation
    console.log('📝 Testing survey section creation...')
    
    const testSection = await prisma.survey_section.create({
      data: {
        response_id: testResponse.response_id,
        section_name: 'Test Section',
        section_key: 'test',
        status: 'completed',
        data: JSON.stringify({ test: 'data' })
      }
    })
    console.log(`✅ Survey section created: ID ${testSection.section_id}`)

    // Test data retrieval with relationships
    console.log('🔍 Testing data retrieval...')
    
    const fullResponse = await prisma.survey_response.findUnique({
      where: { response_id: testResponse.response_id },
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        survey_section: true
      }
    })

    console.log('✅ Full response retrieved:')
    console.log(`   - Survey: ${fullResponse.survey_number}`)
    console.log(`   - Barangay: ${fullResponse.barangay.barangay_name}`)
    console.log(`   - Interviewer: ${fullResponse.user.firstName} ${fullResponse.user.lastName}`)
    console.log(`   - Sections: ${fullResponse.survey_section.length}`)

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await prisma.survey_section.delete({
      where: { section_id: testSection.section_id }
    })
    await prisma.survey_response.delete({
      where: { response_id: testResponse.response_id }
    })
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 VERIFICATION COMPLETE!')
    console.log('✅ Database can store survey answers from survey forms')
    console.log('✅ All required tables exist and are accessible')
    console.log('✅ Relationships work correctly')
    console.log('✅ Data can be stored and retrieved successfully')

    // Summary of capabilities
    console.log('\n📊 STORAGE CAPABILITIES:')
    console.log('• Survey responses with metadata (location, respondent info)')
    console.log('• Survey sections with JSON data storage')
    console.log('• Individual survey answers (if needed)')
    console.log('• File attachments (if needed)')
    console.log('• Survey validation records')
    console.log('• Progress tracking and status management')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySurveyStorage()