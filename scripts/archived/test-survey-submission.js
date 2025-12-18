const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSurveySubmission() {
  try {
    console.log('🧪 Testing survey response submission...')

    // Test data
    const testSurveyData = {
      survey_number: `TEST-${Date.now()}`,
      barangay_id: 26, // Use Katipunan barangay ID
      interviewer_id: 1, // Use Admin User ID
      respondent_name: 'Test Respondent',
      location_lat: 8.4542,
      location_lng: 124.6319,
      location_address: 'Test Address, Butuan City',
      location_accuracy: 10.5,
      location_timestamp: new Date(),
      location_barangay: 'Test Barangay',
      location_municipality: 'Butuan City',
      location_province: 'Agusan del Norte',
      status: 'completed',
      progress: 100,
      completed_at: new Date(),
      submitted_at: new Date()
    }

    // Create survey response
    console.log('📝 Creating survey response...')
    const surveyResponse = await prisma.survey_response.create({
      data: testSurveyData
    })
    console.log('✅ Survey response created:', surveyResponse.response_id)

    // Create survey sections
    const sections = [
      { key: 'financial', name: 'Financial Administration', data: { q1: 'Satisfied', q2: 'Good' } },
      { key: 'disaster', name: 'Disaster Preparedness', data: { q1: 'Very Satisfied', q2: 'Excellent' } },
      { key: 'safety', name: 'Safety & Peace Order', data: { q1: 'Satisfied', q2: 'Good' } },
      { key: 'business', name: 'Business Friendliness', data: { q1: 'Neutral', q2: 'Fair' } },
      { key: 'environmental', name: 'Environmental Management', data: { q1: 'Dissatisfied', q2: 'Poor' } },
      { key: 'social', name: 'Social Protection', data: { q1: 'Very Satisfied', q2: 'Excellent' } }
    ]

    console.log('📋 Creating survey sections...')
    for (const section of sections) {
      const surveySection = await prisma.survey_section.create({
        data: {
          response_id: surveyResponse.response_id,
          section_name: section.name,
          section_key: section.key,
          status: 'completed',
          data: JSON.stringify(section.data),
          started_at: new Date(),
          completed_at: new Date()
        }
      })
      console.log(`✅ Section created: ${section.name} (ID: ${surveySection.section_id})`)
    }

    // Test retrieval
    console.log('🔍 Testing data retrieval...')
    const retrievedResponse = await prisma.survey_response.findUnique({
      where: { response_id: surveyResponse.response_id },
      include: {
        barangay: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        survey_section: true
      }
    })

    console.log('📊 Retrieved survey response:')
    console.log('- Survey Number:', retrievedResponse.survey_number)
    console.log('- Barangay:', retrievedResponse.barangay.barangay_name)
    console.log('- Interviewer:', `${retrievedResponse.user.firstName} ${retrievedResponse.user.lastName}`)
    console.log('- Sections:', retrievedResponse.survey_section.length)
    console.log('- Status:', retrievedResponse.status)
    console.log('- Progress:', retrievedResponse.progress + '%')

    // Test section data parsing
    console.log('🔧 Testing section data parsing...')
    retrievedResponse.survey_section.forEach(section => {
      const parsedData = JSON.parse(section.data)
      console.log(`- ${section.section_name}:`, parsedData)
    })

    console.log('✅ All tests passed! Database can store and retrieve survey responses.')

    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    await prisma.survey_section.deleteMany({
      where: { response_id: surveyResponse.response_id }
    })
    await prisma.survey_response.delete({
      where: { response_id: surveyResponse.response_id }
    })
    console.log('✅ Test data cleaned up.')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSurveySubmission()