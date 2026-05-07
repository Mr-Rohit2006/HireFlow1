const cards = [...document.querySelectorAll(".job-card")];

let currentPage = 1;
const perPage = 5;

// ===============================
// FILTER JOBS
// ===============================
function filterJobs() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const loc = document.getElementById("locationFilter").value.toLowerCase();
  const type = document.getElementById("typeFilter").value.toLowerCase();
  const salary = +document.getElementById("salaryFilter").value || 0;

  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const location = card.dataset.location.toLowerCase();
    const jobType = card.dataset.type.toLowerCase();

    const cardSalary = parseInt(card.dataset.salary) || 0;

    const ok =
      title.includes(keyword) &&
      location.includes(loc) &&
      jobType.includes(type) &&
      cardSalary >= salary;

    card.dataset.visible = ok ? "yes" : "no";
  });

  currentPage = 1;
  paginate();
}

// ===============================
// PAGINATION
// ===============================
function paginate() {
  const visibleCards = cards.filter(card => card.dataset.visible !== "no");

  cards.forEach(card => {
    card.style.display = "none";
  });

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  visibleCards.slice(start, end).forEach(card => {
    card.style.display = "flex";
  });

  const totalPages = Math.ceil(visibleCards.length / perPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  document.getElementById("pageNo").innerText = currentPage;
}

// ===============================
// NEXT PAGE
// ===============================
function nextPage() {
  const visibleCards = cards.filter(card => card.dataset.visible !== "no");

  const totalPages = Math.ceil(visibleCards.length / perPage) || 1;

  if (currentPage < totalPages) {
    currentPage++;
    paginate();
  }
}

// ===============================
// PREV PAGE
// ===============================
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    paginate();
  }
}

// ===============================
// JOB DETAILS
// ===============================
function toggleDetails(i) {
  const box = document.getElementById("details-" + i);

  if (box.style.display === "block") {
    box.style.display = "none";
  } else {
    box.style.display = "block";
  }
}

// ===============================
// DARK MODE
// ===============================
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// ===============================
// LOAD
// ===============================
window.onload = () => {

  // Dark mode
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Filters
  document.getElementById("searchInput").addEventListener("input", filterJobs);
  document.getElementById("locationFilter").addEventListener("input", filterJobs);
  document.getElementById("typeFilter").addEventListener("change", filterJobs);
  document.getElementById("salaryFilter").addEventListener("input", filterJobs);

  // Default visible
  cards.forEach(card => {
    card.dataset.visible = "yes";
  });

  paginate();
};

// ===============================
// REAL-TIME ATS CHECK
// ===============================
async function checkATS(input, jobId) {
  const resultArea = document.getElementById(`ats-result-${jobId}`);
  if (!resultArea) return;
  
  const scoreText = resultArea.querySelector(".ats-score");
  const loader = resultArea.querySelector(".ats-loader");
  const applyBtn = document.getElementById(`btn-${jobId}`);

  if (!input.files || input.files.length === 0) return;

  // Show result area and loader
  resultArea.style.display = "flex";
  scoreText.innerText = "Analyzing...";
  loader.style.display = "block";
  if (applyBtn) applyBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("resume", input.files[0]);

    const response = await fetch(`/api/check-ats/${jobId}`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      const score = data.score;
      scoreText.innerText = `${score}% Match`;
      
      // Color coding
      if (score >= 80) scoreText.style.color = "#16a34a";
      else if (score >= 50) scoreText.style.color = "#ca8a04";
      else scoreText.style.color = "#dc2626";

    } else {
      scoreText.innerText = "Analysis failed. Try another file.";
      scoreText.style.color = "#dc2626";
    }
  } catch (error) {
    console.error("ATS Check Error:", error);
    scoreText.innerText = "Network Error";
    scoreText.style.color = "#dc2626";
  } finally {
    loader.style.display = "none";
    if (applyBtn) applyBtn.disabled = false;
  }
}