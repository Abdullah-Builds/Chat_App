function toggleTheme() {
  document.body.classList.toggle("dark");
  const btn = document.querySelector(".theme-toggle");
  
  if (document.body.classList.contains("dark")) {
    btn.textContent = "☀️ Light";
    localStorage.setItem("theme", "dark");
  } else {
    btn.textContent = "🌙 Dark";
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.querySelector(".theme-toggle").textContent = "☀️ Light";
  } else {
    document.querySelector(".theme-toggle").textContent = "🌙 Dark";
  }
}

document.addEventListener("DOMContentLoaded", loadTheme);
