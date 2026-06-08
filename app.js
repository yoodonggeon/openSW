// ==========================================
// 1. 전역 변수 및 샘플 데이터 설정
// ==========================================
let currentMap = null; // Leaflet 지도 객체를 담을 변수
let selectedBuilding = "";
let selectedClassroom = "";

// 단국대 빌딩별 강의실 데이터
const campusData = {
    "소프트웨어관": ["204호(실습실)", "301호","516호"],
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
    "제1공학관_101호": [ // 캠퍼스 데이터 매칭을 위해 명칭 통일
        { id: "eng101-1", name: "칠판 왼쪽 구석", coords: [850, 150], status: 0 },
        { id: "eng101-2", name: "뒷문 옆 기둥", coords: [200, 850], status: 0 },
        { id: "eng101-3", name: "창가 중간 자리", coords: [500, 50], status: 1 } // 고장
    ],
    "제1공학관_102호": [
        { id: "eng102-1", name: "교탁 아래", coords: [800, 500], status: 0 }
    ],
    "인문관_301호": [
        { id: "hum301-1", name: "중앙 통로 바닥", coords: [450, 500], status: 2 } // 신고됨
    ],
    "소프트웨어관_516호" : [
        { id: "sw516-1", name: "책상 옆에", coords: [771, 616], status: 0 },
        { id: "sw516-2", name: "책상 옆에", coords: [701, 308], status: 0 },
        { id: "sw516-3", name: "책상 옆에", coords: [695, 490], status: 0 },
        { id: "sw516-4", name: "책상 옆에", coords: [689, 650], status: 0 },
        { id: "sw516-5", name: "책상 옆에", coords: [637, 306], status: 0 },
        { id: "sw516-6", name: "책상 옆에", coords: [613, 490], status: 0 },
        { id: "sw516-7", name: "벽면", coords: [603, 648], status: 0 },
        { id: "sw516-8", name: "책상 옆에", coords: [581, 150], status: 0 },
        { id: "sw516-9", name: "책상 옆에", coords: [575, 306], status: 0 },
        { id: "sw516-10", name: "책상 옆에", coords: [519, 312], status: 0 },
        { id: "sw516-11", name: "책상 옆에", coords: [527, 488], status: 0 },
        { id: "sw516-12", name: "책상 옆에", coords: [527, 644], status: 0 },
        { id: "sw516-13", name: "책상 옆에", coords: [487, 707], status: 0 },
        { id: "sw516-14", name: "책상 옆에", coords: [393, 262], status: 0 },
        { id: "sw516-15", name: "책상 위에", coords: [421, 476], status: 0 },
        { id: "sw516-16", name: "책상 옆에", coords: [367, 476], status: 0 },
        { id: "sw516-17", name: "책상 옆에", coords: [377, 683], status: 0 },
        { id: "sw516-18", name: "책상 옆에", coords: [299, 158], status: 0 },
        { id: "sw516-19", name: "책상 옆에", coords: [311, 258], status: 0 },
        { id: "sw516-20", name: "책상 위에", coords: [335, 478], status: 0 },
        { id: "sw516-21", name: "책상 옆에", coords: [281, 677], status: 0 },
        { id: "sw516-22", name: "책상 옆에", coords: [225, 272], status: 0 },
        { id: "sw516-23", name: "책상 옆에", coords: [209, 474], status: 0 },
        { id: "sw516-24", name: "책상 옆에", coords: [209, 677], status: 0 },
        { id: "sw516-25", name: "책상 옆에", coords: [121, 262], status: 0 },
        { id: "sw516-26", name: "책상 위에", coords: [155, 482], status: 0 },
        { id: "sw516-27", name: "책상 옆에", coords: [129, 683], status: 0 }
    ]
};

// ==========================================
// 2. 탭 전환 및 메뉴 제어 로직
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    if (tabId === 'map-view' && currentMap) {
        setTimeout(() => { currentMap.invalidateSize(); }, 100);
    }
}

// HOME에서 건물 선택 시 강의실 리스트 등장
function selectBuilding(buildingName) {
    selectedBuilding = buildingName;
    document.getElementById('selected-building-title').innerText = `${buildingName} - 강의실 선택`;
    
    const classroomListDiv = document.getElementById('classroom-list');
    classroomListDiv.innerHTML = ""; 
    
    if (campusData[buildingName]) {
        campusData[buildingName].forEach(room => {
            const btn = document.createElement('button');
            btn.innerText = room;
            btn.onclick = () => loadMapPage(buildingName, room);
            classroomListDiv.appendChild(btn);
        });
    }
    
    document.getElementById('classroom-section').classList.remove('hidden');
}

// ==========================================
// 3. Leaflet.js 실내 지도 구현 (핵심)
// ==========================================
function loadMapPage(building, room) {
    selectedBuilding = building; // 상태 업데이트를 위한 동기화
    selectedClassroom = room;
    switchTab('map-view');
    document.getElementById('map-title').innerText = `${building} ${room} 콘센트 도면`;

    if (currentMap) {
        currentMap.remove();
        currentMap = null;
    }

    currentMap = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2
    });

    const bounds = [[0, 0], [1000, 1000]];
    const imagePath = `images/${building}_${room}.jpg`; 
    
    L.imageOverlay(imagePath, bounds).addTo(currentMap);
    currentMap.fitBounds(bounds); 

    const dataKey = `${building}_${room}`;
    if (outletData[dataKey]) {
        outletData[dataKey].forEach(outlet => {
            let markerColor = "#5cb85c"; // 정상 (Green)
            let statusText = "🟢 사용 가능";
            let buttonHtml = ""; // 💡 블록 스코프 안전 선언
            
            if (outlet.status === 1) {
                markerColor = "#d9534f"; // 고장 (Red)
                statusText = "🔴 고장 (사용 불가)";

                // ❌ 고장 확정 상태 시 노출할 안내 문구 (클릭 원천 차단)
                buttonHtml = `
                    <div style="text-align:center; color:#d9534f; font-weight:bold; margin-top:10px; padding:6px; border:1px dashed #d9534f; border-radius:4px; font-size:12px; background-color:#fff5f5;">
                        🔧 수리 진행 중인 콘센트입니다.
                    </div>
                `;
            } else if (outlet.status === 2) {
                markerColor = "#f0ad4e"; // 신고됨 (Yellow)
                statusText = "🟡 고장 신고 접수됨";

                // ⏳ 대기 상태 시 중복 신고를 막기 위해 비활성화(disabled) 처리
                buttonHtml = `
                    <button disabled 
                            style="padding:5px 10px; font-size:12px; background-color:#ccc; color:#666; border:none; border-radius:4px; width:100%; cursor:not-allowed;">
                        ⏰ 고장 신고 검토 중입니다
                    </button>
                `;
            } else {
                // 🟢 정상 상태일 때만 신고하기 버튼 활성화
                buttonHtml = `
                    <button onclick="goToReport('${building}', '${room}', '${outlet.name}')" 
                            style="padding:5px 10px; font-size:12px; background-color:#d9534f; color:white; border:none; border-radius:4px; cursor:pointer; width:100%;">
                        이 콘센트 고장 신고하기
                    </button>
                `;
            }   

            // 마커 생성 및 지도 추가
            const marker = L.circleMarker(outlet.coords, {
                radius: 10,
                fillColor: markerColor,
                color: "#fff",
                weight: 2,
                fillOpacity: 0.8
            }).addTo(currentMap);

            // 🛠️ [버그 수정 완료] 하드코딩 버튼을 제거하고 동적으로 가공된 ${buttonHtml} 삽입
            const popupContent = `
                <div style="font-size:14px; font-family: sans-serif; min-width: 170px;">
                    <b>위치:</b> ${outlet.name}<br>
                    <b>상태:</b> ${statusText}<br><br>
                    ${buttonHtml}
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }
}

function goToReport(building, room, locationName) {
    document.getElementById('report-building').value = building;
    document.getElementById('report-classroom').value = room;
    document.getElementById('report-location').value = locationName;
    switchTab('report');
}

// ==========================================
// 4. Report (고장 신고) 처리 로직
// ==========================================
function handleReportSubmit(event) {
    event.preventDefault(); 

    const building = document.getElementById('report-building').value;
    const classroom = document.getElementById('report-classroom').value;
    const location = document.getElementById('report-location').value;

    const dataKey = `${building}_${classroom}`;

    if (outletData[dataKey]) {
        const outlet = outletData[dataKey].find(o => o.name === location);
        
        if (outlet) {
            outlet.status = 2; 
            alert(`[신고 접수] ${building} ${classroom}의 '${location}' 콘센트가 고장 신고 처리되었습니다.`);
            
            loadMapPage(building, classroom);
            updateAdminDashboard(); 
            switchTab('map-view');
        } else {
            alert("선택하신 위치의 콘센트 정보가 존재하지 않습니다. 지도에서 핀을 먼저 클릭해주세요.");
        }
    }
}

// ==========================================
// 5. 관리자 모드 (인증 및 대시보드 상태 변경)
// ==========================================
const ADMIN_PASSWORD = "dku1234"; 

function checkAdminPassword() {
    const passwordInput = document.getElementById('admin-password').value;
    
    if (passwordInput === ADMIN_PASSWORD) {
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        updateAdminDashboard(); 
    } else {
        alert("비밀번호가 틀렸습니다. 다시 시도하세요.");
    }
}

function updateAdminDashboard() {
    const tbody = document.getElementById('admin-report-list');
    if(!tbody) return;
    tbody.innerHTML = ""; 

    let hasReports = false;

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
                                style="background-color:#5cb85c; color:white; padding:5px; font-size:12px; border:none; border-radius:4px; cursor:pointer;">
                            정상(0) 처리
                        </button>
                        <button onclick="changeOutletStatus('${building}', '${classroom}', '${outlet.id}', 1)" 
                                style="background-color:#d9534f; color:white; padding:5px; font-size:12px; margin-left:5px; border:none; border-radius:4px; cursor:pointer;">
                            고장(1) 확정
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        });
    }

    if (!hasReports) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999; padding:15px;">현재 접수된 고장 신고가 없습니다.</td></tr>`;
    }
}

function changeOutletStatus(building, classroom, outletId, newStatus) {
    const dataKey = `${building}_${classroom}`;
    const outlet = outletData[dataKey].find(o => o.id === outletId);

    if (outlet) {
        outlet.status = newStatus;
        const statusText = newStatus === 0 ? "정상(사용가능)" : "고장(사용불가)";
        alert(`해당 콘센트가 [${statusText}] 상태로 변경되었습니다.`);
        
        updateAdminDashboard(); 
        if (currentMap && selectedBuilding === building && selectedClassroom === classroom) {
            loadMapPage(building, classroom); 
        }
    }
}

// ==========================================
// 6. 좌표 추출 디버거 리스너
// ==========================================
window.addEventListener('click', function(e) {
    if (!currentMap) return;

    const mapCont = document.getElementById('map');
    if (mapCont && mapCont.contains(e.target)) {
        if (e.target.classList.contains('leaflet-interactive') && e.target.tagName === 'path') {
            return;
        }

        const point = currentMap.mouseEventToLatLng(e);
        const y = Math.round(point.lat);
        const x = Math.round(point.lng);

        console.log(`%c📍 찾았다 콘센트 좌표 -> coords: [${y}, ${x}]`, "color: #002f6c; font-weight: bold; font-size: 14px;");
    }
});