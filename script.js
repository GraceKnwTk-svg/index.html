// ฟังก์ชันดึงวันเวลาปัจจุบันมาใส่ในช่อง input ทันที (อัปเดตแก้วิธีจัดการค่า String วันที่ให้เสถียรขึ้น)
function setCurrentDateTime() {
    try {
        const now = new Date();
        
        // แปลงเขตเวลาให้ตรงกับประเทศไทย (GMT+7)
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISODate = new Date(now.getTime() - tzOffset).toISOString();
        
        // ตั้งค่าวันที่ (YYYY-MM-DD)
        const todayDate = localISODate.split('T')[0];
        document.getElementById('date').value = todayDate;
        
        // ตั้งค่าเวลา (HH:MM)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('time').value = `${hours}:${minutes}`;
    } catch (e) {
        console.log("Error setting date/time:", e);
    }
}

// สั่งให้ระบบทำงานตั้งแต่วินาทีแรกที่หน้าเว็บเปิดขึ้นมา
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setCurrentDateTime);
} else {
    setCurrentDateTime();
}

function generateReport() {
    const hub = document.getElementById('hub').value || '-';
    const dateInput = document.getElementById('date').value;
    const time = document.getElementById('time').value || '--:--';
    
    const inHub = parseInt(document.getElementById('inHub').value) || 0;
    const assign = parseInt(document.getElementById('assign').value) || 0;
    const delivered = parseInt(document.getElementById('delivered').value) || 0;
    const actual2w = parseInt(document.getElementById('actual2w').value) || 0;
    const actual4w = parseInt(document.getElementById('actual4w').value) || 0;
    
    const issue = document.getElementById('issue').value || '-';
    const action = document.getElementById('action').value || '-';

    // คำนวณค่าพื้นฐานอัตโนมัติ
    const noAssign = inHub - assign; 
    const hcActive = actual2w + actual4w; 
    
    let deliveryRate = 0;
    if (assign > 0) {
        deliveryRate = ((delivered / assign) * 100).toFixed(1);
    }

    // [สูตรใหม่] คำนวณชิ้นงานรวมตามสัดส่วน 70:30 จากเป้า Assign ทั้งหมด ก่อนนำไปหาค่าเฉลี่ยรายบุคคล
    let wl2w = 0;
    let wl4w = 0;
    let wl2wPercent = 0;
    let wl4wPercent = 0;

    if (assign > 0) {
        const totalWl2wPieces = assign * 0.7; // ยอดงานรวมฝั่ง 2W (70%)
        const totalWl4wPieces = assign * 0.3; // ยอดงานรวมฝั่ง 4W (30%)

        // หารเฉลี่ยแยกตามจำนวนคนขับจริงในแต่ละกลุ่ม (ถ้าไม่มีคนขับในกลุ่มนั้นให้ตั้งค่าเป็น 0)
        wl2w = actual2w > 0 ? Math.round(totalWl2wPieces / actual2w) : 0;
        wl4w = actual4w > 0 ? Math.round(totalWl4wPieces / actual4w) : 0;
        
        // คำนวณเปอร์เซ็นต์สัดส่วนภาระงานจริง (เทียบจากผลลัพธ์เฉลี่ยชิ้นต่อคน)
        const totalWlPerHead = wl2w + wl4w;
        if (totalWlPerHead > 0) {
            wl2wPercent = Math.round((wl2w / totalWlPerHead) * 100);
            wl4wPercent = Math.round((wl4w / totalWlPerHead) * 100);
        }
    }

    let pdtyAssign = 0;
    if (hcActive > 0) {
        pdtyAssign = Math.round(assign / hcActive);
    }

    let formattedDate = '-';
    if(dateInput) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date(dateInput);
        formattedDate = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    // ประกอบข้อความโครงสร้างรายงานประจำวัน (จับกลุ่มและเว้นวรรคตามฟอร์แมตคลังอื่นเป๊ะๆ)
    const textOutput = `Daily Report - ${formattedDate} (${time})
Hub : ${hub}

In Hub : ${inHub.toLocaleString()} Pcs.
Assign : ${assign.toLocaleString()} Pcs.
No Assign : ${noAssign <= 0 ? '-' : noAssign.toLocaleString()} Pcs.
Normal : 0

HC Active : ${hcActive} คน
 • 2W : ${actual2w}
 • 4W : ${actual4w}

Delivered To Buyer : ${delivered.toLocaleString()} Pcs. (${deliveryRate}%)

WL เฉลี่ย 70:30
 • 2W : ${wl2w.toLocaleString()}
 • 4W : ${wl4w.toLocaleString()}

%2W (โดยประมาณ)
 • 2W : ${wl2wPercent}%
 • 4W : ${wl4wPercent}%

SLA : 96.00%
PDTY Assign : ${pdtyAssign} (Target: 170)

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
        
        setCurrentDateTime();
        document.getElementById('hub').value = 'ABYAI-B';
    }
}
