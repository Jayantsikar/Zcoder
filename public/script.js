// Toggle password visibility (optional enhancement)
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtns = document.querySelectorAll(".toggle-password");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });
});

// Prevent empty input submission (extra layer, optional)
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", (e) => {
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value.trim();

    if (!email || !password) {
      e.preventDefault();
      alert("Please fill in both fields.");
    }
  });
});

