// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
let spaceImages = [];
const NASA_API_KEY = "PFHHqz89mJbmDbNbhNChjNFWf7BW7CcrzfFpm9LW" ;

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch and display APOD images for the selected date range
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (startDate > endDate) {
		gallery.innerHTML = '<div class="placeholder"><p>Please choose a start date before the end date.</p></div>';
		return;
	}

	const millisecondsPerDay = 1000 * 60 * 60 * 24;
	const numberOfDays = Math.floor((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / millisecondsPerDay) + 1;

	if (numberOfDays > 100) {
		gallery.innerHTML = '<div class="placeholder"><p>Please choose a date range of 100 days or less.</p></div>';
		return;
	}

	const apiUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

	gallery.innerHTML = '<div class="placeholder"><p>Loading space images...</p></div>';
	getImagesButton.disabled = true;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA API request failed');
		}

		spaceImages = (await response.json()).filter((spaceImage) =>
    spaceImage.media_type === 'image' && spaceImage.hdurl
);

		gallery.innerHTML = spaceImages.map((spaceImage, index) => `
			<article class="gallery-item" data-index="${index}">
				<img src="${spaceImage.hdurl}" alt="${spaceImage.title}" />
				<h2>${spaceImage.title}</h2>
				<p>${spaceImage.date}</p>
				<p>${spaceImage.explanation}</p>
			</article>
		`).join('');
	} catch (error) {
		gallery.innerHTML = '<div class="placeholder"><p>We could not load the space images. Please try again.</p></div>';
	} finally {
		getImagesButton.disabled = false;
	}
}

getImagesButton.addEventListener('click', getSpaceImages);

// Show the selected APOD in the modal window
gallery.addEventListener('click', (event) => {
	const galleryItem = event.target.closest('.gallery-item');

	if (!galleryItem) {
		return;
	}

	const spaceImage = spaceImages[galleryItem.dataset.index];
	modalImage.src = spaceImage.hdurl;
	modalImage.alt = spaceImage.title;
	modalTitle.textContent = spaceImage.title;
	modalDate.textContent = spaceImage.date;
	modalExplanation.textContent = spaceImage.explanation;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
});

function closeModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
}

closeModalButton.addEventListener('click', closeModal);

imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeModal();
	}
});
