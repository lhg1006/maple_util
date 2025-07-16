const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'https://maplestory.io/api';
const DEFAULT_REGION = 'KMS';
const DEFAULT_VERSION = '389';

// 대륙별 분류 함수 (대폭 개선)
function getContinentByStreetName(streetName, mapName = '') {
  if (!streetName && !mapName) return '기타 지역';
  
  const fullText = `${streetName || ''} ${mapName || ''}`.toLowerCase();
  
  // 초보자 지역
  if (['메이플로드', '레인보우스트리트'].includes(streetName)) {
    return '메이플 로드';
  }
  
  // 빅토리아 아일랜드
  if (['빅토리아로드', '헤네시스', '엘리니아', '페리온', '슬리피우드', '습지', '드레이크의 동굴'].includes(streetName)) {
    return '빅토리아 아일랜드';
  }
  
  // 엘나스 (눈 지역)
  if (streetName === '엘나스' || streetName === '엘나스산맥' || fullText.includes('엘나스')) {
    return '엘나스';
  }
  
  // 오르비스 (하늘 도시)
  if (['오르비스', '스카이로드'].includes(streetName) || fullText.includes('오르비스')) {
    return '오르비스';
  }
  
  // 루디브리엄 (시계탑)
  if (['루타비스', '루디브리엄', '루디브리엄성', '헬리오스 탑', '에오스 탑'].includes(streetName) || 
      fullText.includes('루디브리엄') || fullText.includes('루타비스')) {
    return '루디브리엄';
  }
  
  // 아쿠아로드 (바다)
  if (['아쿠아로드', '미나르숲', '포트로드'].includes(streetName)) {
    return '아쿠아로드';
  }
  
  // 리프레 (용의 대륙)
  if (['리프레', '엘린숲', '아랫마을', '킹덤로드', '퀸스로드'].includes(streetName)) {
    return '리프레';
  }
  
  // 무릉도원 & 무릉도장
  if (['무릉도원', '무릉도장', '무릉', '백초마을', '상산'].includes(streetName) || 
      fullText.includes('무릉')) {
    return '무릉 지역';
  }
  
  // 니할사막 & 아리안트
  if (streetName === '아리안트' || streetName === '버닝로드' || 
      fullText.includes('아리안트') || fullText.includes('니할') || fullText.includes('사막')) {
    return '니할사막';
  }
  
  // 마가티아 (연금술의 도시)
  if (streetName === '마가티아' || streetName === '선셋로드' || fullText.includes('마가티아')) {
    return '마가티아';
  }
  
  // 에델슈타인 (저항군 본거지)
  if (streetName === '에델슈타인' || fullText.includes('에델슈타인')) {
    return '에델슈타인';
  }
  
  // 아르카나 (고레벨 사냥터)
  if (streetName === '아르카나' || fullText.includes('아르카나')) {
    return '아르카나';
  }
  
  // 모라스 (고레벨 사냥터)
  if (streetName === '모라스' || fullText.includes('모라스')) {
    return '모라스';
  }
  
  // 에스페라 (고레벨 사냥터)
  if (streetName === '에스페라' || fullText.includes('에스페라')) {
    return '에스페라';
  }
  
  // 레헬른 (고레벨 사냥터)
  if (streetName === '레헬른' || fullText.includes('레헬른')) {
    return '레헬른';
  }
  
  // 츄츄아일랜드 (고레벨 사냥터)
  if (streetName === '츄츄 아일랜드' || streetName === '츄츄아일랜드' || 
      streetName === '에르밸리' || streetName === '외로운 츄츄섬' ||
      fullText.includes('츄츄')) {
    return '츄츄 아일랜드';
  }
  
  // 얌얌아일랜드 (고레벨 사냥터)
  if (streetName === '얌얌 아일랜드' || fullText.includes('얌얌')) {
    return '얌얌 아일랜드';
  }
  
  // 세르니움 (최신 고레벨)
  if (streetName === '세르니움' || fullText.includes('세르니움')) {
    return '세르니움';
  }
  
  // 호텔 아르크스 (최신 고레벨)
  if (streetName === '호텔 아르크스' || fullText.includes('호텔') && fullText.includes('아르크스')) {
    return '호텔 아르크스';
  }
  
  // 오디움 (최신 고레벨)
  if (streetName === '오디움' || fullText.includes('오디움')) {
    return '오디움';
  }
  
  // 도원경 (최신 고레벨)
  if (streetName === '도원경' || fullText.includes('도원경')) {
    return '도원경';
  }
  
  // 카르시온 (최신 고레벨)
  if (streetName === '카르시온' || fullText.includes('카르시온')) {
    return '카르시온';
  }
  
  // 크리티아스 (특별 지역)
  if (streetName === '크리티아스' || fullText.includes('크리티아스')) {
    return '크리티아스';
  }
  
  // 지구방위본부 (특별 지역)
  if (streetName === '리에나 해협' || fullText.includes('지구방위') || fullText.includes('본부')) {
    return '지구방위본부';
  }
  
  // 에레브 (시그너스 기사단)
  if (streetName === '에레브' || fullText.includes('에레브')) {
    return '에레브';
  }
  
  // 커닝시티
  if (['커닝타워', '커닝시티', '커닝 스퀘어', '커닝시티지하철', '커닝스퀘어'].includes(streetName)) {
    return '커닝시티';
  }
  
  // 요정 지역
  if (['요정의 숲', '요정학원 엘리넬', '엘리넬 호수', '엘로딘'].includes(streetName)) {
    return '요정계';
  }
  
  // 버섯 왕국
  if (['버섯의 성', '버섯노래숲'].includes(streetName)) {
    return '버섯 왕국';
  }
  
  // 테마파크 및 이벤트
  if (['판타스틱 테마파크', 'UFO 내부', '폐기지 잔해', '헌티드 맨션', '스타플래닛', 
       '메이플 크로니클', '몬스터 카니발'].includes(streetName) ||
      fullText.includes('테마파크') || fullText.includes('크로니클')) {
    return '테마파크 & 이벤트';
  }
  
  // 던전 지역
  if (['던전', '골렘사원', '발록의 신전', '저주받은신전', '타락한 세계수', '폐광',
       '고통의 미궁', '샤레니안의 지하 수로', '샤레니안 어딘가', '기계무덤'].includes(streetName) ||
      fullText.includes('던전') || fullText.includes('미궁') || fullText.includes('샤레니안')) {
    return '던전 & 미궁';
  }
  
  // 항해 지역
  if (['항해중', '배틀 호라이즌', '노틸러스'].includes(streetName)) {
    return '해상 지역';
  }
  
  // 스토리 & 퀘스트
  if (['히어로즈 오브 메이플', '블랙헤븐', '블랙헤븐 내부', '갓 오브 컨트롤', 
       '스토리 월드공유', '직업 갈무리'].includes(streetName) ||
      fullText.includes('히어로즈') || fullText.includes('블랙헤븐')) {
    return '스토리 & 퀘스트';
  }
  
  // 특수 지역
  if (['히든스트리트', '히든 스트리트', '미니던전', '해저의 탑 "더 시드"'].includes(streetName) ||
      fullText.includes('히든') || fullText.includes('시드')) {
    return '히든 & 특수';
  }
  
  // 학교 & 도시
  if (['신수국제학교', '신수국제학교대로', '툴렌시티', '리버스 시티'].includes(streetName) ||
      fullText.includes('학교') || fullText.includes('시티')) {
    return '도시 & 학교';
  }
  
  return '기타 지역';
}

// 맵 카테고리 분류
function getMapCategory(streetName) {
  if (!streetName) return 'other';
  
  if (['메이플로드', '레인보우스트리트'].includes(streetName)) return 'beginner';
  if (['빅토리아로드', '헤네시스', '엘리니아', '페리온'].includes(streetName)) return 'victoria';
  if (streetName === '루타비스') return 'ludibrium';
  if (['버섯의 성', '버섯노래숲'].includes(streetName)) return 'mushroom';
  if (streetName.includes('커닝')) return 'kerning';
  if (['던전', '골렘사원', '발록의 신전', '저주받은신전'].includes(streetName)) return 'dungeon';
  if (streetName.includes('히든')) return 'hidden';
  
  return 'other';
}

async function generateMapsData() {
  console.log('🗺️ 맵 데이터 생성 시작...');
  
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const allMaps = [];
  let startPosition = 0;
  const batchSize = 5000;
  let batchCount = 0;

  try {
    while (true) {
      batchCount++;
      console.log(`📦 배치 ${batchCount} 처리 중... (위치: ${startPosition})`);
      
      const url = `/${DEFAULT_REGION}/${DEFAULT_VERSION}/map?startPosition=${startPosition}&count=${batchSize}`;
      const response = await apiClient.get(url);
      const maps = response.data || [];
      
      console.log(`✅ 배치 ${batchCount} 완료: ${maps.length}개 맵 수신`);
      
      if (!Array.isArray(maps) || maps.length === 0) {
        console.log(`🏁 더 이상 맵이 없습니다. 배치 ${batchCount}에서 종료`);
        break;
      }

      // 필요한 정보만 추출하여 저장
      const processedMaps = maps.map(map => ({
        id: map.id,
        name: map.name || `맵 ${map.id}`,
        streetName: map.streetName || '',
        displayName: map.streetName ? `${map.streetName} - ${map.name}` : (map.name || `맵 ${map.id}`),
        continent: getContinentByStreetName(map.streetName, map.name),
        category: getMapCategory(map.streetName),
        // NPC 수 정보 (성능을 위해 개수만 저장)
        npcCount: Array.isArray(map.npcs) ? map.npcs.length : 0,
        hasNPCs: Array.isArray(map.npcs) && map.npcs.length > 0
      }));

      allMaps.push(...processedMaps);
      
      console.log(`📊 누적 맵 수: ${allMaps.length}개`);
      
      // API에서 반환된 맵의 수가 요청한 수보다 적으면 마지막 배치
      if (maps.length < batchSize) {
        console.log(`🏁 전체 맵 크롤링 완료: ${allMaps.length}개 맵`);
        break;
      }
      
      startPosition += batchSize;
      
      // 무한 루프 방지
      if (startPosition >= 100000) {
        console.warn('⚠️ 안전 제한에 도달하여 크롤링 중단');
        break;
      }

      // API 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 대륙별 통계 생성
    const continentStats = {};
    allMaps.forEach(map => {
      const continent = map.continent || '기타';
      continentStats[continent] = (continentStats[continent] || 0) + 1;
    });

    console.log('\n📊 대륙별 맵 통계:');
    Object.entries(continentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([continent, count]) => {
        console.log(`  ${continent}: ${count}개 맵`);
      });

    // NPC가 있는 맵 통계
    const mapsWithNPCs = allMaps.filter(map => map.hasNPCs);
    console.log(`\n🏘️ NPC가 있는 맵: ${mapsWithNPCs.length}개 (${(mapsWithNPCs.length/allMaps.length*100).toFixed(1)}%)`);

    // JSON 파일로 저장
    const outputPath = path.join(__dirname, '..', 'public', 'maps.json');
    fs.writeFileSync(outputPath, JSON.stringify(allMaps, null, 2), 'utf-8');
    
    console.log(`\n💾 맵 데이터 저장 완료: ${outputPath}`);
    console.log(`📈 총 ${allMaps.length}개 맵 데이터 생성`);
    console.log(`📁 파일 크기: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    // 요약 통계 파일도 생성
    const summaryPath = path.join(__dirname, '..', 'public', 'maps-summary.json');
    const summary = {
      totalMaps: allMaps.length,
      mapsWithNPCs: mapsWithNPCs.length,
      continentStats,
      lastUpdated: new Date().toISOString(),
      version: DEFAULT_VERSION
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`📊 요약 통계 저장: ${summaryPath}`);

  } catch (error) {
    console.error('❌ 맵 데이터 생성 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  generateMapsData();
}

module.exports = { generateMapsData };