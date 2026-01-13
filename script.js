const API_URL = "https://open.er-api.com/v6/latest/USD";
let allRates = {};
let records = JSON.parse(localStorage.getItem('myTravelRecords')) || [];
let myChart = null;

async function initApp() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allRates = data.rates;
        
        // 換算邏輯設定
        document.getElementById('amount').addEventListener('input', calculate);
        document.getElementById('currencySelect').addEventListener('change', calculate);
        
        renderRecords();
        updateChart(); // 初始化圖表
    } catch (e) { console.error("API Error"); }
}

function calculate() {
    const amount = document.getElementById('amount').value || 0;
    const rateToTwd = (1 / allRates[document.getElementById('currencySelect').value]) * allRates.TWD;
    document.getElementById('result').innerText = (amount * rateToTwd).toLocaleString(undefined, {maximumFractionDigits: 2});
}

function addLog() {
    const note = document.getElementById('note').value;
    const cost = document.getElementById('cost').value;
    const category = document.getElementById('categorySelect').value;
    if (!note || !cost) return;

    const newRecord = {
        id: Date.now(), // 給每一筆資料唯一身分證，方便刪除
        note, cost: parseFloat(cost), category,
        time: new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    saveAndRender();
    document.getElementById('note').value = '';
    document.getElementById('cost').value = '';
}

// 刪除功能
function deleteRecord(id) {
    records = records.filter(r => r.id !== id); // 留下來「不是這個 ID」的資料
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('myTravelRecords', JSON.stringify(records));
    renderRecords();
    updateChart();
}

function renderRecords() {
    const list = document.getElementById('logList');
    list.innerHTML = records.map(r => `
        <li>
            <span>[${r.category}] ${r.note} <small>${r.time}</small></span>
            <b>-$${r.cost.toLocaleString()} <button onclick="deleteRecord(${r.id})" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;">✕</button></b>
        </li>
    `).join('');
}

// 圓餅圖邏輯
function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const categories = ["餐飲", "交通", "購物", "住宿", "其他"];
    const dataValues = categories.map(cat => {
        return records.filter(r => r.category === cat).reduce((sum, r) => sum + r.cost, 0);
    });

    if (myChart) myChart.destroy(); // 刪掉舊圖，畫新的
    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
            }]
        }
    });
}

initApp();
