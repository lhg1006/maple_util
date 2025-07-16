const fs = require('fs');
const path = require('path');

// 맵 데이터 분석 스크립트
async function analyzeMapsData() {
  console.log('🔍 맵 데이터 분석 시작...');
  
  try {
    // maps.json 파일 읽기
    const mapsPath = path.join(__dirname, '..', 'public', 'maps.json');
    const mapsData = JSON.parse(fs.readFileSync(mapsPath, 'utf-8'));
    
    console.log(`📊 총 맵 수: ${mapsData.length}개`);
    
    // 기타 지역으로 분류된 맵들 필터링
    const miscMaps = mapsData.filter(map => map.continent === '기타 지역');
    console.log(`🔍 기타 지역 맵: ${miscMaps.length}개 (${(miscMaps.length/mapsData.length*100).toFixed(1)}%)`);
    
    // streetName 빈도 분석
    const streetNameCounts = {};
    miscMaps.forEach(map => {
      const streetName = map.streetName || 'null';
      streetNameCounts[streetName] = (streetNameCounts[streetName] || 0) + 1;
    });
    
    // 빈도 순으로 정렬
    const sortedStreetNames = Object.entries(streetNameCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50); // 상위 50개만
    
    console.log('\n🏆 기타 지역의 주요 streetName (상위 50개):');
    console.log('────────────────────────────────────────');
    sortedStreetNames.forEach(([streetName, count], index) => {
      const percentage = (count / miscMaps.length * 100).toFixed(1);
      console.log(`${(index + 1).toString().padStart(2)}. ${streetName.padEnd(30)} ${count.toString().padStart(5)}개 (${percentage}%)`);
    });
    
    // 특정 패턴 분석
    console.log('\n🔎 패턴 분석:');
    console.log('────────────────────────────────────────');
    
    const patterns = [
      { name: '아르카나', regex: /아르카나|arcana/i },
      { name: '모라스', regex: /모라스|morass/i },
      { name: '에스페라', regex: /에스페라|esfera/i },
      { name: '츄츄아일랜드', regex: /츄츄|chuchu/i },
      { name: '레헬른', regex: /레헬른|lacheln/i },
      { name: '얌얌아일랜드', regex: /얌얌|yum/i },
      { name: '에델슈타인', regex: /에델슈타인|edelstein/i },
      { name: '시간의 신전', regex: /시간의 신전|time|temple/i },
      { name: '엘나스', regex: /엘나스|elnath/i },
      { name: '오르비스', regex: /오르비스|orbis/i },
      { name: '지구방위본부', regex: /지구방위|본부/i },
      { name: '크리티아스', regex: /크리티아스|kritias/i },
      { name: '마가티아', regex: /마가티아|magatia/i },
      { name: '니할사막', regex: /니할|사막|nihal/i },
      { name: '세르니움', regex: /세르니움|cernium/i },
      { name: '버닝 세르니움', regex: /버닝.*세르니움|burning.*cernium/i },
      { name: '호텔 아르크스', regex: /호텔.*아르크스|hotel.*arcs/i },
      { name: '오디움', regex: /오디움|odium/i },
      { name: '도원경', regex: /도원경/i },
      { name: '카르시온', regex: /카르시온/i },
      { name: '프리우드', regex: /프리우드/i }
    ];
    
    patterns.forEach(pattern => {
      const matches = miscMaps.filter(map => 
        pattern.regex.test(map.streetName || '') || 
        pattern.regex.test(map.name || '')
      );
      
      if (matches.length > 0) {
        console.log(`${pattern.name}: ${matches.length}개 맵`);
        
        // 예시 몇 개 보여주기
        const examples = matches.slice(0, 3).map(m => m.streetName || m.name);
        console.log(`  예시: ${examples.join(', ')}`);
      }
    });
    
    // null이나 빈 streetName 분석
    const nullStreetNames = miscMaps.filter(map => !map.streetName || map.streetName.trim() === '');
    console.log(`\n❓ streetName이 없는 맵: ${nullStreetNames.length}개`);
    
    if (nullStreetNames.length > 0) {
      console.log('예시 맵 이름들:');
      nullStreetNames.slice(0, 20).forEach((map, index) => {
        console.log(`  ${index + 1}. ${map.name} (ID: ${map.id})`);
      });
    }
    
    // 결과를 JSON 파일로 저장
    const analysisResult = {
      totalMaps: mapsData.length,
      miscMaps: miscMaps.length,
      miscPercentage: (miscMaps.length/mapsData.length*100).toFixed(1),
      topStreetNames: sortedStreetNames.slice(0, 20),
      patternAnalysis: patterns.map(pattern => ({
        name: pattern.name,
        count: miscMaps.filter(map => 
          pattern.regex.test(map.streetName || '') || 
          pattern.regex.test(map.name || '')
        ).length
      })).filter(p => p.count > 0),
      nullStreetNameCount: nullStreetNames.length,
      timestamp: new Date().toISOString()
    };
    
    const analysisPath = path.join(__dirname, '..', 'maps-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisResult, null, 2), 'utf-8');
    console.log(`\n💾 분석 결과 저장: ${analysisPath}`);
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  analyzeMapsData();
}

module.exports = { analyzeMapsData };