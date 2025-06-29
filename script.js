document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookingForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      fields: {
        "預約日期": document.getElementById("date").value,
        "姓名": document.getElementById("name").value,
        "初診或複診": document.getElementById("visitType").value,
        "出生年月日": document.getElementById("birthday").value,
        "聯絡電話": document.getElementById("phone").value,
        "身分證字號": document.getElementById("idNumber").value
      }
    };

    const token = "patKPwGQ3DhIsnkHO..."; // << 這裡換成你的 Airtable Token
    const baseId = "appFBOKgLylcGBUG7"; // << 你的 Base ID
    const tableName = "診所預約"; // << 你的表單名稱

    try {
      const response = await fetch(`https://api.airtable.com/v0/appFBOKgLylcGBUG7/%E8%A8%BA%E6%89%80%E9%A0%90%E7%B4%84}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        alert("預約失敗：" + (result.error?.message || "未知錯誤"));
        return;
      }

      alert("✅ 預約成功！");
      form.reset();
    } catch (error) {
      alert("❌ 發生錯誤：" + error.message);
    }
  });
});
