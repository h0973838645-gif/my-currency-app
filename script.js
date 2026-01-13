const API_URL = "https://open.er-api.com/v6/latest/USD";
let allRates = {};
let records = JSON.parse(localStorage.getItem('myTravelRecords')) || [];

async function initApp() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allRates = data.rates;
        const twdRate = data.rates.TWD;

        const amountInput = document.getElementById('amount');
        const currencySelect = document.getElementById('currencySelect');
        const resultDisplay = document.getElementById('result');

        const calculate = () => {
            const amount = amountInput.value || 0;
            const selectedCurrency = currencySelect.value;
            const rateToTwd = (1 / allRates[selectedCurrency]) * twdRate;
            const finalValue = amount * rateToTwd;
            resultDisplay.innerText = finalValue.toLocaleString(undefined, {maximumFractionDigits: 2});
        };

        amountInput.addEventListener('input', calculate);
        currencySelect.addEventListener('change', calculate);
        
        renderRecords();
    } catch (error) {
        console.error("匯率更新失敗");
    }
}

function addLog() {
    const note = document.getElementById('note').value;
    const cost = document.getElementById('cost').value;
    if (!note || !cost) return;

    const newRecord = {
        note: note,
        cost: parseFloat(cost).toLocaleString(),
        time: new Date().toLocaleString('zh-TW', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    localStorage.setItem('myTravelRecords', JSON.stringify(records));
    
    renderRecords();
    document.getElementById('note').value = '';
    document.getElementById('cost').value = '';
}

function renderRecords() {
    const list = document.getElementById('logList');
    list.innerHTML = records.map(r => `
        <li>
            <span>${r.note} <small>${r.time}</small></span>
            <b>-$${r.cost} TWD</b>
        </li>
    `).join('');
}

initApp();
