    const photos = document.querySelectorAll('.photo img');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    let currentIndex = 0;

    function openModal(index) {
      currentIndex = index;
      modal.style.display = 'flex';
      modalImg.src = photos[index].src;
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    function changePhoto(step) {
      currentIndex = (currentIndex + step + photos.length) % photos.length;
      modalImg.src = photos[currentIndex].src;
    }

    // Close modal when clicking outside image
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });