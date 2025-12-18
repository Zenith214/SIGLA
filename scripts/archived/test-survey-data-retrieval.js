const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSurveyDataRetrieval() {
  console.log('🔍 Testing Survey Data Retrieval for Analysis...\n');

  try {
    // 1. Get all survey responses with complete data
    console.log('1. Fetching all survey responses...');
    const allResponses = await prisma.survey_response.findMany({
      include: {
        barangay: {
          select: {
            barangay_name: true,
            population: true,
            households: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        survey_section: true,
        survey_answer: {
          include: {
            survey_question: true
          }
        },
        survey_metadata: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ Found ${allResponses.length} survey responses\n`);

    // 2. Analyze data structure
    if (allResponses.length > 0) {
      const sampleResponse = allResponses[0];
      console.log('2. Sample Response Structure:');
      console.log('   Response ID:', sampleResponse.response_id);
      console.log('   Survey Number:', sampleResponse.survey_number);
      console.log('   Barangay:', sampleResponse.barangay?.barangay_name);
      console.log('   Interviewer:', `${sampleResponse.user?.firstName} ${sampleResponse.user?.lastName}`);
      console.log('   Status:', sampleResponse.status);
      console.log('   Progress:', sampleResponse.progress + '%');
      console.log('   Sections:', sampleResponse.survey_section.length);
      console.log('   Answers:', sampleResponse.survey_answer.length);
      console.log('   Location:', {
        lat: sampleResponse.location_lat,
        lng: sampleResponse.location_lng,
        address: sampleResponse.location_address
      });
      console.log();

      // 3. Analyze section data
      console.log('3. Section Data Analysis:');
      sampleResponse.survey_section.forEach(section => {
        console.log(`   - ${section.section_name} (${section.section_key})`);
        console.log(`     Status: ${section.status}`);
        if (section.data) {
          try {
            const sectionData = JSON.parse(section.data);
            console.log(`     Questions: ${Object.keys(sectionData).length}`);
            console.log(`     Sample data:`, Object.keys(sectionData).slice(0, 3));
          } catch (e) {
            console.log('     Data: Raw text format');
          }
        }
      });
      console.log();
    }

    // 4. Get responses by barangay for analysis
    console.log('4. Responses by Barangay:');
    const responsesByBarangay = await prisma.survey_response.groupBy({
      by: ['barangay_id'],
      _count: {
        response_id: true
      }
    });

    for (const group of responsesByBarangay) {
      const barangay = await prisma.barangay.findUnique({
        where: { barangay_id: group.barangay_id },
        select: { barangay_name: true }
      });
      console.log(`   ${barangay?.barangay_name}: ${group._count.response_id} responses`);
    }
    console.log();

    // 5. Get completion status analysis
    console.log('5. Completion Status Analysis:');
    const statusCounts = await prisma.survey_response.groupBy({
      by: ['status'],
      _count: {
        response_id: true
      }
    });

    statusCounts.forEach(status => {
      console.log(`   ${status.status}: ${status._count.response_id} responses`);
    });
    console.log();

    // 6. Test data extraction for specific analysis
    console.log('6. Sample Data Extraction for Analysis:');
    const analysisData = [];
    
    for (const response of allResponses.slice(0, 3)) { // Sample first 3
      const responseData = {
        responseId: response.response_id,
        surveyNumber: response.survey_number,
        barangay: response.barangay?.barangay_name,
        interviewer: `${response.user?.firstName} ${response.user?.lastName}`,
        respondentName: response.respondent_name,
        location: {
          lat: parseFloat(response.location_lat),
          lng: parseFloat(response.location_lng),
          address: response.location_address,
          barangay: response.location_barangay
        },
        status: response.status,
        progress: response.progress,
        completedAt: response.completed_at,
        sections: {}
      };

      // Extract section data
      response.survey_section.forEach(section => {
        if (section.data) {
          try {
            responseData.sections[section.section_key] = JSON.parse(section.data);
          } catch (e) {
            responseData.sections[section.section_key] = section.data;
          }
        }
      });

      analysisData.push(responseData);
    }

    console.log('   Extracted data structure for analysis:');
    console.log('   Sample response keys:', Object.keys(analysisData[0] || {}));
    if (analysisData[0]?.sections) {
      console.log('   Available sections:', Object.keys(analysisData[0].sections));
    }
    console.log();

    // 7. Test aggregation capabilities
    console.log('7. Testing Aggregation Capabilities:');
    
    // Average progress
    const avgProgress = await prisma.survey_response.aggregate({
      _avg: {
        progress: true
      }
    });
    console.log(`   Average Progress: ${avgProgress._avg.progress?.toFixed(2)}%`);

    // Responses per day
    const responsesPerDay = await prisma.survey_response.groupBy({
      by: ['created_at'],
      _count: {
        response_id: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });
    
    console.log('   Recent daily responses:');
    responsesPerDay.forEach(day => {
      const date = new Date(day.created_at).toDateString();
      console.log(`     ${date}: ${day._count.response_id} responses`);
    });

    console.log('\n✅ Survey data retrieval test completed successfully!');
    console.log('\n📊 Data Analysis Capabilities Confirmed:');
    console.log('   ✓ Complete survey responses with metadata');
    console.log('   ✓ Section-wise data extraction');
    console.log('   ✓ Location data for mapping');
    console.log('   ✓ Interviewer and barangay information');
    console.log('   ✓ Progress and completion tracking');
    console.log('   ✓ Aggregation and grouping capabilities');
    console.log('   ✓ Time-series analysis potential');

    return {
      success: true,
      totalResponses: allResponses.length,
      sampleData: analysisData,
      aggregations: {
        averageProgress: avgProgress._avg.progress,
        responsesByBarangay: responsesByBarangay,
        statusDistribution: statusCounts
      }
    };

  } catch (error) {
    console.error('❌ Error testing survey data retrieval:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSurveyDataRetrieval()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 All survey data retrieval tests passed!');
    } else {
      console.log('\n❌ Survey data retrieval test failed:', result.error);
    }
  })
  .catch(console.error);