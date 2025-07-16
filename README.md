# 🎮 게임 데이터 뷰어

**게임 데이터를 쉽게 검색하고 탐색할 수 있는 웹 도구**

게임 데이터 뷰어는 메이플스토리 게임 정보를 편리하게 검색하고 탐색할 수 있는 웹 애플리케이션입니다. 공개 API를 통해 게임 데이터를 제공하며, 사용자 친화적인 인터페이스로 정보를 제공합니다.

## 📋 주요 기능

- **아이템 검색**: 메이플스토리의 모든 아이템 정보 조회
- **NPC 정보**: 대륙별 NPC 위치 및 정보 확인
- **몬스터 데이터**: 몬스터 레벨, 능력치, 경험치 정보
- **직업/스킬**: 모든 직업의 스킬 정보
- **즐겨찾기**: 자주 찾는 항목을 즐겨찾기에 저장
- **PWA 지원**: 모바일 앱처럼 설치하여 사용 가능
- **오프라인 지원**: 인터넷이 없어도 캐시된 데이터 조회 가능

## 🚀 시작하기

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/lhg1006/maple_util.git
cd maple_util

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3001](http://localhost:3001)로 접속하여 확인하세요.

### 스크립트 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # 코드 품질 검사
```

## 🏗️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Library**: Ant Design
- **상태 관리**: React Query (@tanstack/react-query)
- **PWA**: Service Worker, Web App Manifest
- **배포**: Vercel

## 📊 데이터 출처

이 프로젝트는 [maplestory.io](https://maplestory.io) API를 사용합니다.

### 🗂️ CDN 데이터 정책

프로젝트에서 사용하는 CDN 데이터는 다음과 같은 정책을 준수합니다:

- **원본 데이터**: maplestory.io API에서 제공하는 공개 데이터
- **가공 데이터**: 검색 최적화 및 성능 개선을 위한 메타데이터만 저장
- **이미지 리소스**: 직접 저장하지 않고 원본 API 링크로 참조
- **사용 목적**: 비상업적 교육 및 연구 목적으로만 사용

자세한 CDN 데이터 정책은 [CDN_LEGAL_NOTICE.md](./CDN_LEGAL_NOTICE.md)를 참고하세요.

## ⚖️ 법적 고지사항

### 🚨 중요: 저작권 안내

- **이 프로젝트는 넥슨코리아와 무관한 개인 개발자가 운영하는 비공식 데이터 뷰어 도구입니다.**
- 모든 메이플스토리 관련 데이터, 이미지, 아이콘의 저작권은 **넥슨코리아(Nexon Korea)**에 있습니다.
- 이 서비스는 **비상업적 목적**으로만 운영되며, 메이플스토리 이용자들의 편의를 위한 정보 제공 목적입니다.
- 어떠한 수익 창출이나 상업적 이용도 목적으로 하지 않습니다.

### 📞 저작권 문제 신고

만약 저작권 침해 문제가 있다면:
1. [GitHub Issues](https://github.com/lhg1006/maple_util/issues)를 통해 신고
2. 문제가 되는 내용은 즉시 제거하겠습니다
3. 연락 후 신속한 대응을 약속드립니다

### 📄 라이선스

- **소스코드**: MIT 라이선스
- **게임 데이터**: 넥슨코리아 저작권 (별도 라이선스)

자세한 내용은 [LEGAL_NOTICE.md](./LEGAL_NOTICE.md)를 참고하세요.

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 개발자 노트

이 프로젝트는 메이플스토리 게임 데이터를 쉽게 탐색할 수 있는 뷰어 도구로 개발되었습니다. 
게임 데이터의 저작권은 넥슨에 있으며, 이를 존중하고 준수합니다.

---

**⚠️ 면책조항**: 이 프로젝트는 비공식 데이터 뷰어 도구입니다. 게임 공식 서비스와는 무관하며, 모든 게임 데이터의 저작권은 해당 게임사에 있습니다.