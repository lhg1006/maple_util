#!/bin/bash

# GitHub Issues 자동 업데이트 스크립트
# 사용법: ./update-github-issues.sh <GITHUB_TOKEN>

GITHUB_TOKEN=$1
REPO_OWNER="lhg1006"
REPO_NAME="maple_util"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "사용법: ./update-github-issues.sh <GITHUB_TOKEN>"
    echo "GitHub Personal Access Token을 인자로 제공해주세요."
    exit 1
fi

# Issue #1 업데이트
echo "Updating Issue #1..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/1" \
  -d '{
    "body": "## 📋 개요\n메이플랜드/메이플스토리의 아이템, NPC, 몬스터, 직업, 스킬 등 게임 데이터를 조회할 수 있는 페이지들을 구현합니다.\n\n## 🎯 목표\n- 각 카테고리별 목록 페이지 구현\n- 상세 정보 조회 기능\n- 이미지 렌더링 및 데이터 표시\n\n## ✅ 세부 작업\n- [x] 아이템 목록 페이지 구현\n- [x] 아이템 상세 정보 모달/페이지 구현\n- [x] NPC 목록 및 상세 페이지 구현\n- [x] 몬스터 목록 및 상세 페이지 구현\n- [x] 직업 리스트 페이지 구현\n- [x] 스킬 트리 시각화 구현\n\n## 🔗 관련 API\n- Maplestory.io API 활용\n\n## 📊 현재 상태\n**100% 완료** - 모든 게임 데이터 조회 시스템이 구현되었습니다.\n- `/items` - 아이템 목록 및 상세 정보 (메이플 스타일 툴팁)\n- `/npcs` - NPC 목록 및 상세 정보 (대륙별 분류)\n- `/mobs` - 몬스터 목록 및 상세 정보\n- `/jobs` - 직업 목록 및 상세 정보\n- `/skills` - 스킬 목록 및 상세 정보"
  }'

# Issue #2 업데이트
echo "Updating Issue #2..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/2" \
  -d '{
    "body": "## 📋 개요\n사용자가 원하는 정보를 빠르게 찾을 수 있도록 검색 및 필터링 기능을 구현합니다.\n\n## 🎯 목표\n- 통합 검색 기능\n- 카테고리별 필터\n- 정렬 옵션\n- 검색 최적화\n\n## ✅ 세부 작업\n- [x] 통합 검색 기능 구현\n- [x] 카테고리별 필터 구현\n- [x] 정렬 기능 구현 (이름, 레벨, 가격 등)\n- [x] 검색 결과 하이라이팅\n- [x] 검색 기록 및 자동완성\n\n## 📊 현재 상태\n**100% 완료** - 통합 검색 및 필터링 시스템이 완성되었습니다.\n- `/search` - 통합 검색 페이지 (아이템, NPC, 몬스터 동시 검색)\n- 검색 기록 및 자동완성 기능\n- 각 페이지별 고급 필터링 옵션\n- 실시간 검색 결과 통계"
  }'

# Issue #3 업데이트
echo "Updating Issue #3..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/3" \
  -d '{
    "body": "## 📋 개요\n사용자가 편리하게 서비스를 이용할 수 있도록 UX를 개선합니다.\n\n## 🎯 목표\n- 로딩 및 에러 처리\n- 성능 최적화\n- 접근성 개선\n\n## ✅ 세부 작업\n- [x] 로딩 상태 및 스켈레톤 UI\n- [x] 에러 핸들링 및 재시도 기능\n- [x] 무한 스크롤 또는 페이지네이션\n- [ ] 즐겨찾기 기능\n- [x] 반응형 디자인 최적화\n- [x] 키보드 네비게이션\n\n## 📊 현재 상태\n**85% 완료** - 대부분의 UX 개선 사항이 구현되었습니다.\n- 완료: 로딩 상태, 에러 핸들링, 페이지네이션, 반응형 디자인, 키보드 네비게이션\n- 미완료: 즐겨찾기 기능 (localStorage 기반)"
  }'

# Issue #4 업데이트
echo "Updating Issue #4..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/4" \
  -d '{
    "body": "## 📋 개요\nMaplestory.io API와의 연동을 최적화하고 데이터 처리를 개선합니다.\n\n## 🎯 목표\n- API 호출 최적화\n- 데이터 캐싱\n- 에러 처리\n- 성능 모니터링\n\n## ✅ 세부 작업\n- [x] API 에러 핸들링 개선\n- [x] 데이터 캐싱 전략 구현\n- [x] 이미지 lazy loading\n- [x] API 호출 최적화 (배치 요청 등)\n- [ ] 오프라인 지원\n\n## 📊 현재 상태\n**90% 완료** - API 연동 및 데이터 최적화가 대부분 완료되었습니다.\n- 완료: React Query 캐싱, 에러 핸들링, 이미지 lazy loading, 배치 요청\n- 미완료: 오프라인 지원 (PWA)"
  }'

# Issue #5 업데이트
echo "Updating Issue #5..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/5" \
  -d '{
    "body": "## 📋 작업 내용\n아이템 정보를 조회할 수 있는 목록 페이지를 구현합니다.\n\n## ✅ 구현 사항\n- [x] `/items` 라우트 생성\n- [x] 아이템 목록 컴포넌트 구현\n- [x] 아이템 카드 디자인\n- [x] 기본 페이지네이션\n- [x] 아이템 이미지 표시\n- [x] 기본 정보 표시 (이름, 타입, 레벨 제한 등)\n\n## 🔗 관련 Epic\n- #1 [Epic] 게임 데이터 조회 시스템 구축\n\n## 📊 현재 상태\n**100% 완료** - 아이템 목록 페이지가 완전히 구현되었습니다.\n- 고급 필터링 시스템 (카테고리, 서브카테고리)\n- 메이플스토리 스타일 툴팁\n- 페이지네이션 및 검색 기능\n- 반응형 디자인"
  }'

echo "모든 GitHub Issues 업데이트가 완료되었습니다!"