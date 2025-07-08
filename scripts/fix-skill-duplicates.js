const fs = require('fs');
const path = require('path');

async function fixSkillDuplicates() {
  console.log('🔧 스킬 중복 ID 수정 시작...');
  
  try {
    // skills.json 파일 읽기
    const skillsPath = path.join(__dirname, '..', 'public', 'skills.json');
    const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
    
    console.log(`📊 총 스킬 수: ${skills.length}개`);
    
    // ID 중복 확인
    const idCounts = {};
    const duplicateIds = [];
    
    skills.forEach((skill, index) => {
      const id = skill.id;
      if (!idCounts[id]) {
        idCounts[id] = [];
      }
      idCounts[id].push(index);
    });
    
    // 중복 ID 찾기
    Object.entries(idCounts).forEach(([id, indices]) => {
      if (indices.length > 1) {
        duplicateIds.push({ id: parseInt(id), indices });
      }
    });
    
    console.log(`🔍 중복 ID 발견: ${duplicateIds.length}개`);
    
    if (duplicateIds.length === 0) {
      console.log('✅ 중복 ID가 없습니다.');
      return;
    }
    
    // 가장 큰 ID 찾기
    let maxId = Math.max(...skills.map(skill => skill.id));
    console.log(`📈 현재 최대 ID: ${maxId}`);
    
    // 중복 ID 수정
    let fixCount = 0;
    duplicateIds.forEach(({ id, indices }) => {
      console.log(`\n🔄 ID ${id} 중복 수정 중... (${indices.length}개 중복)`);
      
      // 첫 번째는 유지하고, 나머지는 새로운 ID 할당
      for (let i = 1; i < indices.length; i++) {
        const index = indices[i];
        const oldId = skills[index].id;
        maxId++;
        skills[index].id = maxId;
        
        console.log(`  - ${skills[index].name} (인덱스 ${index}): ${oldId} → ${maxId}`);
        fixCount++;
      }
    });
    
    console.log(`\n✅ 총 ${fixCount}개 스킬 ID 수정 완료`);
    
    // 최종 검증
    const finalIds = skills.map(skill => skill.id);
    const uniqueIds = [...new Set(finalIds)];
    
    if (finalIds.length === uniqueIds.length) {
      console.log('✅ 모든 ID가 고유합니다.');
    } else {
      console.error('❌ 여전히 중복 ID가 존재합니다.');
      return;
    }
    
    // 수정된 파일 저장
    fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2), 'utf-8');
    console.log(`💾 수정된 스킬 데이터 저장 완료: ${skillsPath}`);
    
    // 통계 출력
    console.log('\n📊 수정 후 통계:');
    console.log(`  - 총 스킬 수: ${skills.length}개`);
    console.log(`  - 고유 ID 수: ${uniqueIds.length}개`);
    console.log(`  - 최소 ID: ${Math.min(...finalIds)}`);
    console.log(`  - 최대 ID: ${Math.max(...finalIds)}`);
    
  } catch (error) {
    console.error('❌ 스킬 중복 수정 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  fixSkillDuplicates();
}

module.exports = { fixSkillDuplicates };