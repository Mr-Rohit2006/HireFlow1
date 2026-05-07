const ctx = document.getElementById("jobChart");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Applications",
        data: [2, 5, 8, 6, 12],
        borderColor: "#6c5ce7",
        fill: false
      },
      {
        label: "Interviews",
        data: [0, 1, 2, 2, 3],
        borderColor: "#00b894",
        fill: false
      }
    ]
  }
});
