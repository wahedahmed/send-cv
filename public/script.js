const form = document.getElementById("cvForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "⏳ جاري الإرسال...";
  status.style.color = "#999";

  const formData = new FormData(form);

  try {
    const res = await fetch("/send", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    const success = text.includes("✅");

    status.textContent = text;
    status.style.color = success ? "green" : "red";

    if (success) {
      setTimeout(() => {
        status.textContent = "";
        form.reset();
      }, 5000);
    }

  } catch (err) {
    status.textContent = "❌ فشل الاتصال بالخادم.";
    status.style.color = "red";
  }
});
