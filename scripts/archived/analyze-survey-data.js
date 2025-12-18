const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeSurveyData() {
  console.log('📊 Analyzing Survey Data for Research Insights...\n');

  try {
    // Get all completed survey responses
    const responses = await prisma.survey_response.findMany({
      where: {
        status: 'completed'
      },
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
            lastName: true
          }
        },
        survey_section: true
      },
      orderBy: {
        completed_at: 'desc'
      }
    });

    console.log(`✅ Found ${responses.length} completed survey responses\n`);

    if (responses.length === 0) {
      console.log('ℹ️  No completed surveys found. Please complete some surveys first.');
      return;
    }

    // Analyze the data structure and content
    console.log('🔍 Data Analysis Results:\n');

    // 1. Basic Statistics
    console.log('1. BASIC STATISTICS:');
    console.log(`   Total Completed Surveys: ${responses.length}`);
    
    const barangays = [...new Set(responses.map(r => r.barangay?.barangay_name))];
    console.log(`   Barangays Covered: ${barangays.length} (${barangays.join(', ')})`);
    
    const interviewers = [...new Set(responses.map(r => `${r.user?.firstName} ${r.user?.lastName}`))];
    console.log(`   Interviewers: ${interviewers.length} (${interviewers.join(', ')})`);
    
    const avgProgress = responses.reduce((sum, r) => sum + (r.progress || 0), 0) / responses.length;
    console.log(`   Average Progress: ${avgProgress.toFixed(2)}%\n`);

    // 2. Section Analysis
    console.log('2. SECTION COMPLETION ANALYSIS:');
    const sectionStats = {};
    
    responses.forEach(response => {
      response.survey_section.forEach(section => {
        if (!sectionStats[section.section_key]) {
          sectionStats[section.section_key] = {
            name: section.section_name,
            total: 0,
            completed: 0,
            hasData: 0
          };
        }
        
        sectionStats[section.section_key].total++;
        if (section.status === 'completed') {
          sectionStats[section.section_key].completed++;
        }
        if (section.data) {
          sectionStats[section.section_key].hasData++;
        }
      });
    });

    Object.entries(sectionStats).forEach(([key, stats]) => {
      const completionRate = ((stats.completed / stats.total) * 100).toFixed(1);
      const dataRate = ((stats.hasData / stats.total) * 100).toFixed(1);
      console.log(`   ${stats.name}:`);
      console.log(`     Completion Rate: ${completionRate}% (${stats.completed}/${stats.total})`);
      console.log(`     Data Available: ${dataRate}% (${stats.hasData}/${stats.total})`);
    });
    console.log();

    // 3. Sample Data Analysis
    console.log('3. SAMPLE DATA ANALYSIS:');
    const sampleResponse = responses[0];
    console.log(`   Sample Survey: #${sampleResponse.survey_number}`);
    console.log(`   Barangay: ${sampleResponse.barangay?.barangay_name}`);
    console.log(`   Respondent: ${sampleResponse.respondent_name}`);
    console.log(`   Location: ${sampleResponse.location_address}`);
    console.log(`   Coordinates: ${sampleResponse.location_lat}, ${sampleResponse.location_lng}`);
    console.log();

    // Analyze section data
    console.log('   Section Data Sample:');
    sampleResponse.survey_section.forEach(section => {
      if (section.data) {
        try {
          const sectionData = JSON.parse(section.data);
          console.log(`     ${section.section_name} (${Object.keys(sectionData).length} questions):`);
          
          // Show first few questions and answers
          Object.entries(sectionData).slice(0, 3).forEach(([question, answer]) => {
            console.log(`       ${question}: ${answer}`);
          });
          
          if (Object.keys(sectionData).length > 3) {
            console.log(`       ... and ${Object.keys(sectionData).length - 3} more questions`);
          }
        } catch (e) {
          console.log(`     ${section.section_name}: Raw data (${section.data?.length} chars)`);
        }
      }
    });
    console.log();

    // 4. Question Response Analysis
    console.log('4. QUESTION RESPONSE ANALYSIS:');
    const questionAnalysis = {};
    
    responses.forEach(response => {
      response.survey_section.forEach(section => {
        if (section.data) {
          try {
            const sectionData = JSON.parse(section.data);
            Object.entries(sectionData).forEach(([question, answer]) => {
              const key = `${section.section_key}_${question}`;
              
              if (!questionAnalysis[key]) {
                questionAnalysis[key] = {
                  section: section.section_name,
                  question: question,
                  responses: [],
                  valueCount: {}
                };
              }
              
              questionAnalysis[key].responses.push(answer);
              
              // Count value occurrences
              if (questionAnalysis[key].valueCount[answer]) {
                questionAnalysis[key].valueCount[answer]++;
              } else {
                questionAnalysis[key].valueCount[answer] = 1;
              }
            });
          } catch (e) {
            // Skip non-JSON data
          }
        }
      });
    });

    // Show analysis for first few questions
    const questionKeys = Object.keys(questionAnalysis).slice(0, 5);
    questionKeys.forEach(key => {
      const analysis = questionAnalysis[key];
      console.log(`   ${key}:`);
      console.log(`     Section: ${analysis.section}`);
      console.log(`     Total Responses: ${analysis.responses.length}`);
      
      // Show value distribution
      const sortedValues = Object.entries(analysis.valueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      console.log('     Top Responses:');
      sortedValues.forEach(([value, count]) => {
        const percentage = ((count / analysis.responses.length) * 100).toFixed(1);
        console.log(`       "${value}": ${count} (${percentage}%)`);
      });
      
      // Calculate numeric statistics if applicable
      const numericValues = analysis.responses.filter(val => !isNaN(val) && val !== null && val !== '');
      if (numericValues.length > 0) {
        const numbers = numericValues.map(val => parseFloat(val));
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        
        console.log(`     Numeric Stats: Mean=${mean.toFixed(2)}, Min=${min}, Max=${max}`);
      }
      console.log();
    });

    // 5. Geographic Analysis
    console.log('5. GEOGRAPHIC ANALYSIS:');
    const locationData = responses.map(r => ({
      barangay: r.barangay?.barangay_name,
      lat: parseFloat(r.location_lat.toString()),
      lng: parseFloat(r.location_lng.toString()),
      address: r.location_address,
      municipality: r.location_municipality,
      province: r.location_province
    }));

    const municipalities = [...new Set(locationData.map(l => l.municipality))];
    const provinces = [...new Set(locationData.map(l => l.province))];
    
    console.log(`   Municipalities: ${municipalities.join(', ')}`);
    console.log(`   Provinces: ${provinces.join(', ')}`);
    
    // Calculate geographic bounds
    const lats = locationData.map(l => l.lat);
    const lngs = locationData.map(l => l.lng);
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
    
    console.log(`   Geographic Bounds:`);
    console.log(`     North: ${bounds.north.toFixed(6)}, South: ${bounds.south.toFixed(6)}`);
    console.log(`     East: ${bounds.east.toFixed(6)}, West: ${bounds.west.toFixed(6)}`);
    console.log();

    // 6. Data Quality Assessment
    console.log('6. DATA QUALITY ASSESSMENT:');
    let qualityScore = 0;
    let totalChecks = 0;

    // Check completion rates
    const overallCompletion = (responses.filter(r => r.progress === 100).length / responses.length) * 100;
    console.log(`   Overall Completion Rate: ${overallCompletion.toFixed(1)}%`);
    qualityScore += overallCompletion > 90 ? 25 : overallCompletion > 70 ? 15 : 5;
    totalChecks += 25;

    // Check location data quality
    const validLocations = responses.filter(r => r.location_lat && r.location_lng && r.location_address).length;
    const locationQuality = (validLocations / responses.length) * 100;
    console.log(`   Location Data Quality: ${locationQuality.toFixed(1)}%`);
    qualityScore += locationQuality > 95 ? 25 : locationQuality > 80 ? 15 : 5;
    totalChecks += 25;

    // Check respondent data
    const validRespondents = responses.filter(r => r.respondent_name).length;
    const respondentQuality = (validRespondents / responses.length) * 100;
    console.log(`   Respondent Data Quality: ${respondentQuality.toFixed(1)}%`);
    qualityScore += respondentQuality > 95 ? 25 : respondentQuality > 80 ? 15 : 5;
    totalChecks += 25;

    // Check section data completeness
    const sectionsWithData = Object.values(sectionStats).reduce((sum, stat) => sum + stat.hasData, 0);
    const totalSections = Object.values(sectionStats).reduce((sum, stat) => sum + stat.total, 0);
    const sectionDataQuality = (sectionsWithData / totalSections) * 100;
    console.log(`   Section Data Completeness: ${sectionDataQuality.toFixed(1)}%`);
    qualityScore += sectionDataQuality > 95 ? 25 : sectionDataQuality > 80 ? 15 : 5;
    totalChecks += 25;

    const finalQualityScore = (qualityScore / totalChecks) * 100;
    console.log(`   Overall Data Quality Score: ${finalQualityScore.toFixed(1)}%`);
    console.log();

    console.log('✅ ANALYSIS COMPLETE!\n');
    console.log('📋 SUMMARY FOR DATA ANALYSIS:');
    console.log(`   • ${responses.length} complete survey responses available`);
    console.log(`   • ${barangays.length} barangays covered`);
    console.log(`   • ${Object.keys(sectionStats).length} survey sections with data`);
    console.log(`   • ${Object.keys(questionAnalysis).length} individual questions analyzed`);
    console.log(`   • Geographic coverage across ${municipalities.length} municipalities`);
    console.log(`   • Data quality score: ${finalQualityScore.toFixed(1)}%`);
    console.log();
    console.log('🎯 READY FOR ADVANCED ANALYSIS:');
    console.log('   ✓ Statistical analysis and correlations');
    console.log('   ✓ Geographic mapping and spatial analysis');
    console.log('   ✓ Trend analysis and time series');
    console.log('   ✓ Cross-sectional comparisons');
    console.log('   ✓ Data export for external tools (R, Python, SPSS)');

    return {
      success: true,
      totalResponses: responses.length,
      barangaysCovered: barangays.length,
      questionsAnalyzed: Object.keys(questionAnalysis).length,
      qualityScore: finalQualityScore,
      sampleData: responses.slice(0, 1).map(r => ({
        surveyNumber: r.survey_number,
        barangay: r.barangay?.barangay_name,
        sections: r.survey_section.length,
        location: {
          lat: parseFloat(r.location_lat.toString()),
          lng: parseFloat(r.location_lng.toString())
        }
      }))
    };

  } catch (error) {
    console.error('❌ Error analyzing survey data:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeSurveyData()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Survey data analysis completed successfully!');
      console.log('   Your survey data is ready for research and analysis.');
    } else {
      console.log('\n❌ Survey data analysis failed:', result.error);
    }
  })
  .catch(console.error);