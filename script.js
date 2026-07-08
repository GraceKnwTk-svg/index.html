// ฟังก์ชันสำหรับตั้งค่า วันที่ และ เวลา ปัจจุบันโดยอัตโนมัติเมื่อเปิดเว็บ
function initDateTime() {
    const now = new Date();
    
    // ดึงปี เดือน วัน ปัจจุบันของเครื่อง
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('date').value = `${year}-${month}-${day}`;
    
    // ดึงชั่วโมง และ นาที ปัจจุบันของเครื่อง
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').value = `${hours}:${minutes}`;
}

function generateReport() {
    // 1. ดึงค่าจากฟอร์มฝั่งซ้ายมาเก็บไว้
    const hub = document.getElementById('hub').value || '-';
    const dateInput = document.getElementById('date').value;
    const time = document.getElementById('time').value || '--:--';
    
    // แปลงค่าอินพุตให้เป็นตัวเลข (ถ้าไม่มีให้เป็น 0)
    const inHub = parseInt(document.getElementById('inHub').value) || 0;
    const assign = parseInt(document.getElementById('assign').value) || 0;
    const delivered = parseInt(document.getElementById('delivered').value) || 0;
    const actual2w = parseInt(document.getElementById('actual2w').value) || 0;
    const actual4w = parseInt(document.getElementById('actual4w').value) || 0;
    
    const issue = document.getElementById('issue').value || '-';
    const action = document.getElementById('action').value || '-';

    // 2. [สูตรคำนวณอัตโนมัติ] 
    const noAssign = inHub - assign; 
    const hcActive = actual2w + actual4w; 
    
    let deliveryRate = 0;
    if (assign > 0) {
        deliveryRate = ((delivered / assign) * 100).toFixed(1);
    }

    // คำนวณ Workload เฉลี่ย (WL เฉลี่ย 70:30)
    let wl2w = 0;
    let wl4w = 0;
    if (assign > 0) {
        wl2w = Math.round(assign * 0.7);
        wl4w = Math.round(assign * 0.3);
    }

    let pdtyAssign = 0;
    if (hcActive > 0) {
        pdtyAssign = Math.round(assign / hcActive);
    }

    // 3. จัดรูปแบบวันที่ให้ออกมาเป็น "08 Jul 2026"
    let formattedDate = '-';
    if(dateInput) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date(dateInput);
        formattedDate = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    // 4. แสดงผลลัพธ์ในช่องด้านขวา (Result)
    const textOutput = `Daily Report - ${formattedDate} (${time})
Hub : ${hub}

In Hub : ${inHub.toLocaleString()} Pcs.
Assign : ${assign.toLocaleString()} Pcs.
No Assign : ${noAssign.toLocaleString()} Pcs.
Normal : 0

HC Active : ${hcActive} คน
• 2W : ${actual2w}
• 4W : ${actual4w}

Delivered To Buyer : ${delivered.toLocaleString()} Pcs. (${deliveryRate}%)

WL เฉลี่ย 70:30
• 2W : ${wl2w.toLocaleString()}
• 4W : ${wl4w.toLocaleString()}

%2W (โดยประมาณ)
• 2W : 70%
• 4W : 30%

SLA : 96.00%
PDTY Assign : ${pdtyAssign} (Target: 197)

Issue หน้างาน : ${issue}
Action : ${action}`;

    document.getElementById('resultBox').value = textOutput;
}

function copyReport() {
    const resultBox = document.getElementById('resultBox');
    if(!resultBox.value) {
        alert("กรุณากด Generate Report ก่อนคัดลอกครับ");
        return;
    }
    resultBox.select();
    navigator.clipboard.writeText(resultBox.value).then(() => {
        alert("คัดลอกรายงานเรียบร้อยแล้ว!");
    });
}

function clearReport() {
    if(confirm("คุณต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มรายงานใหม่ใช่หรือไม่?")) {
        document.getElementById('inHub').value = '';
        document.getElementById('assign').value = '';
        document.getElementById('delivered').value = '';
        document.getElementById('actual2w').value = '';
        document.getElementById('actual4w').value = '';
        document.getElementById('issue').value = '';
        document.getElementById('action').value = '';
        document.getElementById('resultBox').value = '';
        
        // ล้างแล้วรีเซ็ตวันเวลาปัจจุบันให้ใหม่ทันที
        initDateTime();
        document.getElementById('hub').value = 'HBYAI-C';
    }
}
