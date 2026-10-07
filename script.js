const pages = [...document.querySelectorAll(".page")];
const navBtns = [...document.querySelectorAll(".nav-btn")];
let map = null;

function showPage(id) {
  pages.forEach(p => p.classList.toggle("active", p.id === id));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.page === id));
  window.scrollTo({top: 0, behavior: "smooth"});
  if (id === "design" && map) setTimeout(() => map.invalidateSize(), 200);
}
navBtns.forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));
document.querySelectorAll(".next-btn").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.target)));

/* ---------- 設施工具 ---------- */
const facilityData = [
  { id:"permeable", icon:"🧱", name:"透水磚", desc:"保水" },
  { id:"eco", icon:"🌱", name:"生態工法", desc:"生態" },
  { id:"tank", icon:"💧", name:"水撲滿", desc:"雨水" },
  { id:"ditch", icon:"🌾", name:"生態草溝", desc:"淨化" },
  { id:"box", icon:"▣", name:"箱涵", desc:"水安全" },
  { id:"rice", icon:"🍚", name:"米", desc:"在地文化" },
  { id:"cake", icon:"🥮", name:"餅", desc:"在地文化" },
  { id:"wood", icon:"🪵", name:"柴", desc:"在地文化" }
];

const toolsEl = document.getElementById("tools");
let selectedFacility = null;

facilityData.forEach(item => {
  const el = document.createElement("button");
  el.className = "tool";
  el.innerHTML = `<span class="tool-icon">${item.icon}</span><b>${item.name}</b><br><small>${item.desc}</small>`;
  el.addEventListener("click", () => {
    selectedFacility = item;
    document.querySelectorAll(".tool").forEach(x => x.classList.remove("selected"));
    el.classList.add("selected");
  });
  toolsEl.appendChild(el);
});

/* ---------- 地圖 ---------- */
/*
  教學座標中心來自臺中市水利局公開資料的 TWD97 位置換算。
  「水岸花都」與「後方尚未動工區」的多邊形是教學示意範圍，
  不是工程測量界線；若你們試教時有更精確的範圍，只要修改下面兩組座標即可。
*/
const center = [24.25655, 120.71455];

if (typeof L === "undefined") {
  document.getElementById("map").innerHTML =
    `<div style="height:100%;display:grid;place-items:center;padding:30px;text-align:center;background:#eef2ee;color:#52615b">
      <div><b>地圖目前無法載入</b><br><small>請確認電腦有連網，或用本資料夾啟動本機伺服器後再開啟。</small></div>
    </div>`;
} else {
map = L.map("map", { zoomControl:true }).setView(center, 17);

const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: '&copy; OpenStreetMap contributors'
});

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri'
}).addTo(map);

L.control.layers({
  "🗺️ 街道圖": street,
  "🛰️ 衛星圖": satellite
}, null, {collapsed:false}).addTo(map);

/*
  本頁不預設任何「正確」設計範圍。
  學生可直接在地圖上配置設施，由教師現場引導適合的位置，
  並在發表時說明自己的設計理由。
*/

const placed = [];

function addFacility(latlng, item) {
  const icon = L.divIcon({
    className:"",
    html:`<div class="custom-marker">${item.icon}</div>`,
    iconSize:[42,42],
    iconAnchor:[21,21]
  });

  const marker = L.marker(latlng, {icon, draggable:true}).addTo(map);
  marker.bindPopup(`<b>${item.icon} ${item.name}</b><br><span style="font-size:12px">拖曳圖示可以微調位置。</span>`);
  placed.push({marker, item});
}

map.on("click", (e) => {
  if (!selectedFacility) return;
  addFacility(e.latlng, selectedFacility);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  placed.forEach(x => map.removeLayer(x.marker));
  placed.length = 0;
  document.getElementById("resultPanel").classList.add("hidden");
});

document.getElementById("finishBtn").addEventListener("click", () => {
  const resultPanel = document.getElementById("resultPanel");
  const list = document.getElementById("resultList");
  list.innerHTML = "";

  if (placed.length === 0) {
    list.innerHTML = `<span class="result-chip">目前還沒有放置設施</span>`;
  } else {
    const counts = {};
    placed.forEach(x => counts[x.item.id] = (counts[x.item.id] || 0) + 1);
    Object.keys(counts).forEach(id => {
      const item = facilityData.find(x => x.id === id);
      const chip = document.createElement("span");
      chip.className = "result-chip";
      chip.textContent = `${item.icon} ${item.name} × ${counts[id]}`;
      list.appendChild(chip);
    });
  }
  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({behavior:"smooth", block:"nearest"});
});

/* 預設提示：學生進入第四頁後先看到工具箱 */

}
