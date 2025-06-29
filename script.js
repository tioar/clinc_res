document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  const visitType = document.getElementById("visitType");
  const idField = document.getElementById("idLabel");
  const idNumber = document.getElementById("idNumber");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const birthdayInput = document.getElementById("birthday");
  const dateInput = document.getElementById("date");
  const sessionSelect = document.getElementById("session");

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);
  dateInput.min = minDate.toISOString().split("T")[0];
  dateInput.max = maxDate.toISOString().split("T")[0];

  const sessionOptions = {
    0: [],
    1: ["早上診", "下午診"],
    2: ["早上診", "晚上診"],
    3: ["早上診", "下午診"],
    4: ["早上診", "晚上診"],
    5: ["早上診", "下午診"],
    6: ["早上診"]
  };

  dateInput.addEventListener("change", () => {
    const day = new Date(dateInput.value).getDay();
    const options = sessionOptions[day] || [];
    sessionSelect.innerHTML = "<option value=''>請選擇</option>" +
      options.map(o => `<option value="${o}">${o}</option>`).join("");
  });

  visitType.addEventListener("change", () => {
    const isFirst = visitType.value === "初診";
    idField.style.display = isFirst ? "block" : "none";
    idNumber.required = isFirst;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    if (/\d/.test(name)) return alert("姓名不能包含數字");

    const phone = phoneInput.value.trim();
    if (!/^\d+$/.test(phone)) return alert("電話只能是數字");

    const birthday = new Date(birthdayInput.value);
    if (birthday > today) return alert("生日不能是未來的日期");
    if (today.getFullYear() - birthday.getFullYear() > 150) return alert("請輸入合理的生日");

    if (visitType.value === "初診") {
      const id = idNumber.value.trim();
      if (!/^[A-Z][12]\d{8}$/.test(id)) return alert("身分證格式錯誤");
    }

    // 模擬重複預約查詢 (需實作 Airtable API 查詢)
    const duplicate = false;
    if (duplicate) return alert("您已預約，請勿重複預約");

    alert("✅ 驗證通過，請接續連接 Airtable 寫入程式碼");
  });
});
