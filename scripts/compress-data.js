const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 데이터를 압축해서 저장
function compressData() {
    const dataDir = path.join(__dirname, '../src/data');
    
    // 각 데이터 파일을 읽어서 최소화하고 압축
    const files = [
        'complete-items.ts',
        'complete-monsters.ts', 
        'complete-maps.ts'
    ];
    
    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) {
            console.log(`${file} not found, skipping...`);
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // export const 부분 추출
        const match = content.match(/export const (\w+): Record<number, \w+> = ({[\s\S]*});/);
        if (!match) return;
        
        const varName = match[1];
        const dataStr = match[2];
        
        // JSON으로 파싱해서 불필요한 공백 제거
        try {
            const data = eval(`(${dataStr})`);
            
            // 데이터 최소화 - 필수 필드만 남기기
            const minifiedData = {};
            Object.entries(data).forEach(([key, value]) => {
                if (file.includes('items')) {
                    // 아이템: 필수 필드만
                    minifiedData[key] = {
                        id: value.id,
                        name: value.name,
                        category: value.category,
                        subcategory: value.subcategory,
                        description: value.description,
                        originalData: {
                            typeInfo: value.originalData?.typeInfo
                        }
                    };
                } else if (file.includes('monsters')) {
                    // 몬스터: 필수 필드만
                    minifiedData[key] = {
                        id: value.id,
                        name: value.name,
                        level: value.level,
                        hp: value.hp,
                        exp: value.exp
                    };
                } else if (file.includes('maps')) {
                    // 맵: 필수 필드만
                    minifiedData[key] = {
                        id: value.id,
                        name: value.name,
                        streetName: value.streetName,
                        region: value.region
                    };
                }
            });
            
            // JSON 문자열로 변환 (공백 없이)
            const jsonStr = JSON.stringify(minifiedData);
            
            // gzip으로 압축
            const compressed = zlib.gzipSync(jsonStr);
            
            // Base64로 인코딩해서 저장
            const base64 = compressed.toString('base64');
            
            // 압축된 데이터를 TypeScript 파일로 저장
            const compressedFileName = file.replace('.ts', '-compressed.ts');
            const compressedContent = `// 압축된 ${varName} 데이터
export const ${varName}_COMPRESSED = "${base64}";

// 압축 해제 함수
export function decompress${varName}(): Record<number, any> {
  if (typeof window === 'undefined') {
    // 서버 사이드
    const zlib = require('zlib');
    const compressed = Buffer.from(${varName}_COMPRESSED, 'base64');
    const decompressed = zlib.gunzipSync(compressed);
    return JSON.parse(decompressed.toString());
  } else {
    // 클라이언트 사이드 - pako 라이브러리 필요
    console.error('Client-side decompression requires pako library');
    return {};
  }
}

// 실제 데이터 (lazy loading)
let cached${varName}: Record<number, any> | null = null;
export function get${varName}() {
  if (!cached${varName}) {
    cached${varName} = decompress${varName}();
  }
  return cached${varName};
}
`;
            
            fs.writeFileSync(path.join(dataDir, compressedFileName), compressedContent);
            
            // 파일 크기 비교
            const originalSize = fs.statSync(filePath).size;
            const compressedSize = fs.statSync(path.join(dataDir, compressedFileName)).size;
            const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            
            console.log(`${file}:`);
            console.log(`  원본: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);
            console.log(`  압축: ${(compressedSize / 1024 / 1024).toFixed(1)}MB`);
            console.log(`  압축률: ${ratio}%`);
            console.log(`  ${Object.keys(minifiedData).length} items`);
            
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    });
}

compressData();