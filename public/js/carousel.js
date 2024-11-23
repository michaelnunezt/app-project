document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const closeButton = document.querySelector(".close-button");

  // Card data
  const cardData = [
    {
      title: "Rome, Italy",
      description: "Rome, the Eternal City, is famous for its ancient landmarks like the Colosseum and the Roman Forum.",
      img: "stylsheets/images/Colosseum-Exterior-Tour-4.jpg"
    },
    {
      title: "Kerry, Ireland",
      description: "Kerry is known for its stunning landscapes, including the Ring of Kerry and Killarney National Park.",
      img: "stylsheets/images/Kerry.png"
    },
    {
      title: "Sydney, Australia",
      description: "Sydney is famous for its Opera House, beautiful beaches, and vibrant cultural scene.",
      img: "stylsheets/images/Sydney.png"
    },
    {
      title: "Paris, France",
      description: "Paris, the City of Light, is known for its iconic Eiffel Tower, art, and romantic ambiance.",
      img: "stylsheets/images/Paris.png"
    },
  ];

  // Open modal function
  function openModal(index) {
    const data = cardData[index];
    modalImg.src = data.img;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modal.classList.remove("hidden");
  }

  // Close modal function
  function closeModal() {
    modal.classList.add("hidden");
  }

  // Add click event listeners to cards
  document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("click", () => openModal(index));
  });

  // Close modal when clicking the close button
  closeButton.addEventListener("click", closeModal);

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});
