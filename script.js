const airtableApiKey = "YOUR_API_KEY";
const baseId = "YOUR_BASE_ID";
const tableName = "診所預約";
const limitTable = "每日上限";

const sessionOptions = {
  1: ["早上診", "下午診"],
  2: ["早上診", "晚上診"],
  3: ["早上診", "下午診"],
  4: ["早上診", "晚上診"],
  5: ["早上診", "下午診"],
  6: ["早上診"],
  0: []
};

const weekdayMap = ["日", "一", "二", "三", "四", "五", "六"];
const dateInput = document.getElementById("date");
const sessionSelect = document.getElementById("session");
const visitTypeSelect = document.getElementById("visitType");
const idLabel = document.getElementById("idLabel");

const today = new Date();
const minDate = new Date(today);
minDate.setDate(minDate.getDate() + 1);
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate() + 14);
dateInput.min = minDate.toISOString().split("T")[0];
dateInput.max = maxDate.toISOString().split("T")[0];

dateInput.addEventListener("change", () => {
  const day = new Date(dateInput.value).getDay();
  const options = sessionOptions[day] || [];
  sessionSelect.innerHTML = "<option value=''>請選擇</option>" +
    options.map(s => `<option value="\${s}">\${s}</option>`).join("");
});

visitTypeSelect.addEventListener("change", () => {
  const isFirstVisit = visitTypeSelect.value === "初診";
  idLabel.style.display = isFirstVisit ? "block" : "none";
  document.getElementById("idNumber").required = isFirstVisit;
});

function validateInput(data) {
  const today = new Date();
  const birthday = new Date(data["出生年月日"]);
  const age = today.getFullYear() - birthday.getFullYear();

  if (birthday > today) return "生日不能在未來";
  if (age > 150) return "年齡不可超過150歲";

  if (!/^[0-9]+$/.test(data["聯絡電話"])) return "電話請輸入數字";
  if (/[0-9]/.test(data["姓名"])) return "姓名不可包含數字";

  if (data["初診或複診"] === "初診") {
    if (!/^[A-Z][0-9]{9}$/.test(data["身分證字號"])) return "身分證格式錯誤";
  }
  return "";
}

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const record = {};
  formData.forEach((value, key) => record[key] = value);

  const error = validateInput(record);
  if (error) {
    alert("❌ " + error);
    return;
  }

  const weekday = weekdayMap[new Date(record["預約日期"]).getDay()];

  const dupCheck = await fetch(`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(tableName)}?filterByFormula=\${encodeURIComponent(`AND({姓名}='\${record["姓名"]}', {出生年月日}='\${record["出生年月日"]}')`)}`, {
    headers: { Authorization: `Bearer \${airtableApiKey}` }
  });
  const dupData = await dupCheck.json();
  if (dupData.records.length > 0) {
    alert("❌ 此人已預約過");
    return;
  }

  const countRes = await fetch(`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(tableName)}?filterByFormula=\${encodeURIComponent(`AND({預約日期}='\${record["預約日期"]}', {預約診別}='\${record["預約診別"]}')`)}`, {
    headers: { Authorization: `Bearer \${airtableApiKey}` }
  });
  const countData = await countRes.json();
  const currentCount = countData.records.length;

  const limitRes = await fetch(`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(limitTable)}?filterByFormula=\${encodeURIComponent(`AND({星期幾}='\${weekday}', {時段}='\${record["預約診別"]}')`)}`, {
    headers: { Authorization: `Bearer \${airtableApiKey}` }
  });
  const limitData = await limitRes.json();
  const limit = limitData.records[0]?.fields["上限人數"] || 0;

  if (currentCount >= limit) {
    alert("❌ 該時段已額滿！");
    return;
  }

  const response = await fetch(`https://api.airtable.com/v0/\${baseId}/\${encodeURIComponent(tableName)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer \${airtableApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: record })
  });

  if (response.ok) {
    alert("✅ 預約成功！");
    e.target.reset();
  } else {
    const err = await response.json();
    alert("❌ 預約失敗：" + err.error.message);
  }
});
