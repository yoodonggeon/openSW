// ==========================================
// 1. 전역 변수 및 샘플 데이터 설정
// ==========================================
let currentMap = null; // Leaflet 지도 객체를 담을 변수
let selectedBuilding = "";
let selectedClassroom = "";

// 단국대 빌딩별 강의실 데이터
const campusData = {
    "소프트웨어관": ["204호(실습실)", "301호"],
    "제1공학관": ["101호", "102호"],
    "제2공학관": ["201호", "202호"],
    "제3공학관": ["105호"],
    "인문관": ["301호", "302호"],
    "상경관": ["201호"],
    "사범관": ["401호"],
    "국제관": ["101호(글로벌라운지)"]
};

// 강의실별 콘센트 가상 좌표 및 상태 데이터 (Status -> 0: 정상, 1: 고장, 2: 신고됨)
// ※ 대피도 이미지 크기를 1000x1000 격자로 가정했을 때의 좌표 [Y축, X축]
const outletData = {
    "소프트웨어관_204호(실습실)": [
        { id: "sw204-1", name: "창가 해커톤 테이블 아래", coords: [300, 150], status: 0 },
        { id: "sw204-2", name: "중앙 분임조 좌석 A", coords: [500, 500], status: 0 },
        { id: "sw204-3", name: "강의 탁자 내부 멀티탭", coords: [850, 450], status: 2 } // 신고됨
    ],
    "소프트웨어관_301호": [
        { id: "sw301-1", name: "뒤편 사물함 옆", coords: [150, 800], status: 0 }
    ],
    
    "제2공학관_201호": [
        { id: "eng2-201-1", name: "중앙 기둥 콘센트", coords: [450, 450], status: 0 },
        { id: "eng2-201-2", name: "창측 맨 뒷자리", coords: [100, 100], status: 1 } // 고장
    ],
    
    "제3공학관_105호": [
        { id: "eng3-105-1", name: "복도측 벽면 4구", coords: [600, 900], status: 0 }
    ],
    
    "사범관_401호": [
        { id: "edu401-1", name: "교탁 옆 벽면", coords: [800, 200], status: 0 }
    ],
    
    "국제관_101호(글로벌라운지)": [
        { id: "int101-1", name: "원형 소파 아래 매립형", coords: [500, 500], status: 0 },
        { id: "int101-2", name: "창가 바 테이블 오른쪽", coords: [300, 950], status: 0 }
    ],
    "공학관_101호": [
        { id: "eng101-1", name: "칠판 왼쪽 구석", coords: [850, 150], status: 0 },
        { id: "eng101-2", name: "뒷문 옆 기둥", coords: [200, 850], status: 0 },
        { id: "eng101-3", name: "창가 중간 자리", coords: [500, 50], status: 1 } // 고장
    ],
    "공학관_102호": [
        { id: "eng102-1", name: "교탁 아래", coords: [800, 500], status: 0 }
    ],
    "인문관_301호": [
        { id: "hum301-1", name: "중앙 통로 바닥", coords: [450, 500], status: 2 } // 신고됨
    ]
};

// ==========================================
// 2. 탭 전환 및 메뉴 제어 로직
// ==========================================
function switchTab(tabId) {
    // 모든 탭 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // 선택한 탭 보이기
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Leaflet 지도는 화면에 나타날 때 크기를 재계산해야 정상 출력됨
    if (tabId === 'map-view' && currentMap) {
        setTimeout(() => { currentMap.invalidateSize(); }, 100);
    }
}

// HOME에서 건물 선택 시 강의실 리스트 등장
function selectBuilding(buildingName) {
    selectedBuilding = buildingName;
    document.getElementById('selected-building-title').innerText = `${buildingName} - 강의실 선택`;
    
    const classroomListDiv = document.getElementById('classroom-list');
    classroomListDiv.innerHTML = ""; // 기존 리스트 초기화
    
    // 해당하는 강의실 버튼 동적 생성
    campusData[buildingName].forEach(room => {
        const btn = document.createElement('button');
        btn.innerText = room;
        btn.onclick = () => loadMapPage(buildingName, room);
        classroomListDiv.appendChild(btn);
    });
    
    document.getElementById('classroom-section').classList.remove('hidden');
}

// ==========================================
// 3. Leaflet.js 실내 지도 구현 (핵심)
// ==========================================
function loadMapPage(building, room) {
    selectedClassroom = room;
    switchTab('map-view');
    document.getElementById('map-title').innerText = `${building} ${room} 콘센트 도면`;

    // 1) 기존 지도가 있다면 초기화 (메모리 누수 및 충돌 방지)
    if (currentMap) {
        currentMap.remove();
    }

    // 2) 가상 좌표계(Simple CRS)로 지도 생성
    currentMap = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2
    });

    // 3) 대피도 이미지 매핑 (가상의 가로세로 1000px 공간 설정)
    const bounds = [[0, 0], [1000, 1000]];
    
    // 실제 이미지 경로 지정 (본인 이미지 파일명에 맞게 수정)
    // 예: 이미지 없으면 작동 확인용 가상 이미지 주소 사용
    const imagePath = `images/${building}_${room}.jpg`; 
    
    L.imageOverlay(imagePath, bounds).addTo(currentMap);
    currentMap.fitBounds(bounds); // 이미지 크기에 화면 맞추기

    // 4) 콘센트 데이터 불러와서 핀(Marker) 찍기
    const dataKey = `${building}_${room}`;
    if (outletData[dataKey]) {
        outletData[dataKey].forEach(outlet => {
            // 상태별 마커 색상 구분 (원형 마커 사용, 이미지 핀으로 대체 가능)
            let markerColor = "#5cb85c"; // 정상 (Green)
            let statusText = "🟢 사용 가능";
            
            if (outlet.status === 1) {
                markerColor = "#d9534f"; // 고장 (Red)
                statusText = "🔴 고장 (사용 불가)";
            } else if (outlet.status === 2) {
                markerColor = "#f0ad4e"; // 신고됨 (Yellow)
                statusText = "🟡 고장 신고 접수됨";
            }

            // 마커 생성 및 지도 추가
            const marker = L.circleMarker(outlet.coords, {
                radius: 10,
                fillColor: markerColor,
                color: "#fff",
                weight: 2,
                fillOpacity: 0.8
            }).addTo(currentMap);

            // 마커 클릭 시 나타날 팝업창 디자인 및 신고 연동 버튼
            const popupContent = `
                <div style="font-size:14px;">
                    <b>위치:</b> ${outlet.name}<br>
                    <b>상태:</b> ${statusText}<br><br>
                    <button onclick="goToReport('${building}', '${room}', '${outlet.name}')" 
                            style="padding:5px 10px; font-size:12px; background-color:#d9534f; color:white; border:none; border-radius:4px; cursor:pointer;">
                        이 콘센트 고장 신고하기
                    </button>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }
}

// 팝업 안에서 신고 버튼 누르면 Report 탭으로 데이터 자동 전달
function goToReport(building, room, locationName) {
    document.getElementById('report-building').value = building;
    document.getElementById('report-classroom').value = room;
    document.getElementById('report-location').value = locationName;
    switchTab('report');
}

// ==========================================
// 4. Report (고장 신고) 처리 로직
// ==========================================

// 사용자가 신고 폼을 제출했을 때 실행되는 함수
function handleReportSubmit(event) {
    event.preventDefault(); // 페이지 새로고침 방지

    const building = document.getElementById('report-building').value;
    const classroom = document.getElementById('report-classroom').value;
    const location = document.getElementById('report-location').value;

    const dataKey = `${building}_${classroom}`;

    if (outletData[dataKey]) {
        // 해당 강의실에서 이름이 일치하는 콘센트 찾기
        const outlet = outletData[dataKey].find(o => o.name === location);
        
        if (outlet) {
            outlet.status = 2; // 상태를 2(신고됨)로 변경
            alert(`[신고 접수] ${building} ${classroom}의 '${location}' 콘센트가 고장 신고 처리되었습니다.`);
            
            // 데이터가 변경되었으므로 지도를 새로 불러오고 홈으로 이동
            loadMapPage(building, classroom);
            updateAdminDashboard(); // 관리자 화면도 업데이트
            switchTab('map-view');
        } else {
            alert("선택하신 위치의 콘센트 정보가 존재하지 않습니다. 지도에서 핀을 먼저 클릭해주세요.");
        }
    }
}

// ==========================================
// 5. 관리자 모드 (인증 및 대시보드 상태 변경)
// ==========================================

const ADMIN_PASSWORD = "dku1234"; // 과제용 기본 관리자 비밀번호

// 관리자 로그인 확인
function checkAdminPassword() {
    const passwordInput = document.getElementById('admin-password').value;
    
    if (passwordInput === ADMIN_PASSWORD) {
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        updateAdminDashboard(); // 신고 리스트 갱신
    } else {
        alert("비밀번호가 틀렸습니다. 다시 시도하세요.");
    }
}

// 관리자 대시보드에 신고된 콘센트 리스트(Status: 2)를 띄우는 함수
function updateAdminDashboard() {
    const tbody = document.getElementById('admin-report-list');
    tbody.innerHTML = ""; // 기존 리스트 초기화

    let hasReports = false;

    // 모든 강의실 데이터를 순회하며 status가 2인 항목 찾기
    for (const key in outletData) {
        const [building, classroom] = key.split('_');
        
        outletData[key].forEach(outlet => {
            if (outlet.status === 2) {
                hasReports = true;
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${building}</td>
                    <td>${classroom}</td>
                    <td>${outlet.name}</td>
                    <td>
                        <button onclick="changeOutletStatus('${building}', '${classroom}', '${outlet.id}', 0)" 
                                style="background-color:#5cb85c; color:white; padding:5px; font-size:12px;">
                            정상(0) 처리
                        </button>
                        <button onclick="changeOutletStatus('${building}', '${classroom}', '${outlet.id}', 1)" 
                                style="background-color:#d9534f; color:white; padding:5px; font-size:12px; margin-left:5px;">
                            고장(1) 확정
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        });
    }

    if (!hasReports) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">현재 접수된 고장 신고가 없습니다.</td></tr>`;
    }
}

// 관리자가 버튼을 눌러 상태를 0(정상) 또는 1(고장)로 변경하는 함수
function changeOutletStatus(building, classroom, outletId, newStatus) {
    const dataKey = `${building}_${classroom}`;
    const outlet = outletData[dataKey].find(o => o.id === outletId);

    if (outlet) {
        outlet.status = newStatus;
        const statusText = newStatus === 0 ? "정상(사용가능)" : "고장(사용불가)";
        alert(`해당 콘센트가 [${statusText}] 상태로 변경되었습니다.`);
        
        updateAdminDashboard(); // 대시보드 갱신
        if (currentMap && selectedBuilding === building && selectedClassroom === classroom) {
            loadMapPage(building, classroom); // 지도 화면이 켜져있다면 지도 핀 색상도 즉시 갱신
        }
    }
}