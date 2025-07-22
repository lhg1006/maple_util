# 🍃 MapleStory 데이터 뷰어

**메이플스토리 게임 데이터를 쉽게 검색하고 탐색할 수 있는 웹 애플리케이션**

메이플스토리의 아이템, NPC, 몬스터, 직업, 스킬 등 다양한 게임 정보를 편리하게 조회할 수 있는 웹 도구입니다. [maplestory.io](https://maplestory.io) API를 활용하여 실시간 데이터를 제공합니다.

## 🌐 라이브 데모

**👉 [https://maple-data-viewer.vercel.app/](https://maple-data-viewer.vercel.app/)**

실제 동작하는 데모를 확인하실 수 있습니다. 모든 기능이 구현되어 있으며, 반응형 디자인을 직접 체험해보세요!
<table>
  <tr>
    <td><img src="https://raw.githubusercontent.com/lhg1006/portfolio-images/f043cd42721ed3f6ed943e0c20920392ec022443/images/project/mdv-3.gif" width="100%" alt="아이템정보"></td>
    <td><img src="https://raw.githubusercontent.com/lhg1006/portfolio-images/f043cd42721ed3f6ed943e0c20920392ec022443/images/project/mdv-2.gif" width="100%" alt="몬스터정보"></td>
  </tr>
</table>

## ✨ 주요 기능

- **🔍 통합 검색**: 아이템, NPC, 몬스터를 한 번에 검색
- **📊 아이템 정보**: 카테고리별 아이템 조회 및 메이플 스타일 툴팁
- **🗺️ NPC 탐색**: 대륙별로 분류된 NPC 위치 및 상세 정보
- **👾 몬스터 데이터**: 레벨, 능력치, 경험치 등 상세 정보
- **💼 직업/스킬**: 모든 직업의 스킬 트리 및 상세 정보
- **⭐ 즐겨찾기**: 자주 찾는 항목 저장 기능
- **🌙 다크모드**: 라이트/다크 테마 지원
- **📱 반응형**: 모바일, 태블릿, 데스크탑 최적화

## 🚀 시작하기

### 필수 조건
- Node.js 18 이상
- npm 또는 yarn

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/lhg1006/maple_util.git
cd maple_util

# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인하세요.

### 사용 가능한 명령어

```bash
npm run dev              # 개발 서버 실행 (Turbopack)
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행
npm run lint             # ESLint 코드 검사
npm run generate-maps    # 맵 데이터 생성 (13,973개 맵)
```

## 🏗️ 기술 스택

### Frontend
- **Next.js 14** - App Router 기반 React 프레임워크
- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 정적 타입 검사
- **Tailwind CSS v4** - 유틸리티 우선 CSS 프레임워크
- **Ant Design v5** - UI 컴포넌트 라이브러리

### 상태 관리 & 데이터
- **React Query** (@tanstack/react-query) - 서버 상태 관리
- **React Context** - 전역 상태 관리

### 성능 최적화
- **Static JSON Files** - 맵, 직업, 스킬 데이터 사전 생성
- **React Query Caching** - 24시간 캐싱 전략
- **Image Lazy Loading** - 이미지 지연 로딩

## 📊 데이터 소스

이 프로젝트는 [maplestory.io](https://maplestory.io) API를 사용합니다.

### 데이터 최적화 전략
- **하이브리드 접근법**: 정적 파일 + API 호출 조합
- **정적 데이터**: 맵(13,973개), 직업, 스킬 → JSON 파일로 사전 생성
- **동적 데이터**: 아이템, NPC, 몬스터 → 실시간 API 호출
- **캐싱**: React Query로 24시간 캐싱

## 🔧 프로젝트 구조

```
src/
├── app/                    # Next.js 14 App Router
├── components/             # 재사용 가능한 컴포넌트
│   ├── items/             # 아이템 관련 컴포넌트
│   ├── npcs/              # NPC 관련 컴포넌트
│   ├── mobs/              # 몬스터 관련 컴포넌트
│   └── providers/         # Context 프로바이더
├── hooks/                 # 커스텀 React 훅
├── lib/                   # 유틸리티 및 API 클라이언트
└── types/                 # TypeScript 타입 정의
```

## 📄 라이선스 및 저작권

### 소스코드
- **MIT 라이선스** - 자유롭게 사용, 수정, 배포 가능

### 게임 데이터
- 모든 메이플스토리 관련 데이터, 이미지, 아이콘의 저작권은 **넥슨코리아(Nexon Korea)**에 있습니다
- 이 프로젝트는 **비상업적 목적**으로만 운영됩니다
- [maplestory.io](https://maplestory.io) API를 통해 제공되는 공개 데이터만 사용합니다

자세한 내용은 [LEGAL_NOTICE.md](./LEGAL_NOTICE.md)를 참고하세요.

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/new-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: 새로운 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/new-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- TypeScript와 ESLint 규칙을 준수해주세요
- 커밋 메시지는 [Conventional Commits](https://conventionalcommits.org/) 형식을 사용해주세요
- 새로운 기능은 테스트 코드와 함께 제출해주세요

---

**⚠️ 면책조항**: 이 프로젝트는 비공식 데이터 뷰어입니다. 넥슨코리아와는 무관하며, 모든 게임 데이터의 저작권은 해당 게임사에 있습니다.
