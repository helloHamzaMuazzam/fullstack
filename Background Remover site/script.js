document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadContainer = document.getElementById('uploadContainer');
    const previewSection = document.getElementById('previewSection');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadBtn = document.getElementById('downloadBtn');
    const tryAnotherBtn = document.getElementById('tryAnotherBtn');
    const faqItems = document.querySelectorAll('.faq-item');

    // API configuration
    const API_KEY = 'KRkGxGCWwCEu2teNEeU2DBMN'; // Replace with your actual API key
    const API_URL = 'https://api.remove.bg/v1.0/removebg';

    // FAQ functionality
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // Upload area click event
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    // Try another button event
    tryAnotherBtn.addEventListener('click', () => {
        previewSection.style.display = 'none';
        uploadContainer.style.display = 'block';
        fileInput.value = '';
    });

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, or WEBP).');
            return;
        }
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }
        
        // Display the original image
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            
            // Show preview section
            uploadContainer.style.display = 'none';
            previewSection.style.display = 'block';
            
            // Process the image
            processImage(file);
        };
        reader.readAsDataURL(file);
    }

    // Process image with API
    function processImage(file) {
        loadingSpinner.style.display = 'block';
        resultImage.style.display = 'none';
        downloadBtn.disabled = true;
        
        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto');
        
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('API request failed');
            }
            return response.blob();
        })
        .then(blob => {
            const resultUrl = URL.createObjectURL(blob);
            resultImage.src = resultUrl;
            
            loadingSpinner.style.display = 'none';
            resultImage.style.display = 'block';
            downloadBtn.disabled = false;
            
            // Set up download button
            downloadBtn.onclick = function() {
                const a = document.createElement('a');
                a.href = resultUrl;
                a.download = 'no-bg-' + file.name.replace(/\.[^/.]+$/, '') + '.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.innerHTML = '<p style="color: #e74c3c;">Error processing image. Please try again.</p>';
        });
    }

    // Enhanced Comparison Slider with Progressive Reveal
    const comparisonSlider = document.querySelector('.comparison-slider');
    const imageAfterContainer = document.querySelector('.image-after-container');
    const resizeHandle = document.querySelector('.resize-handle');
    const handleCircle = document.querySelector('.handle-circle');

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let sliderWidth = comparisonSlider.offsetWidth;

    // Update slider width on resize
    window.addEventListener('resize', () => {
        sliderWidth = comparisonSlider.offsetWidth;
        updateSliderPosition();
    });

    // Mouse events for desktop
    resizeHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events for mobile
    resizeHandle.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0]);
        e.preventDefault();
    });
    document.addEventListener('touchmove', (e) => {
        drag(e.touches[0]);
        e.preventDefault();
    });
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        currentX = startX;
        document.body.style.cursor = 'ew-resize';
        comparisonSlider.style.userSelect = 'none';
        handleCircle.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }

    function drag(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        updateSliderPosition();
    }

    function endDrag() {
        isDragging = false;
        document.body.style.cursor = '';
        comparisonSlider.style.userSelect = '';
        handleCircle.style.transform = 'translate(-50%, -50%)';
    }

    function updateSliderPosition() {
        const rect = comparisonSlider.getBoundingClientRect();
        let position = currentX - rect.left;
        position = Math.max(0, Math.min(position, sliderWidth));
        const percentage = (position / sliderWidth) * 100;
        
        imageAfterContainer.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        resizeHandle.style.left = `${percentage}%`;
        
        if (!isDragging) {
            imageAfterContainer.style.transition = 'clip-path 0.3s ease';
            resizeHandle.style.transition = 'left 0.3s ease';
        } else {
            imageAfterContainer.style.transition = 'none';
            resizeHandle.style.transition = 'none';
        }
    }

    comparisonSlider.addEventListener('click', (e) => {
        if (isDragging) return;
        const rect = comparisonSlider.getBoundingClientRect();
        currentX = e.clientX;
        updateSliderPosition();
    });

    // Simulate API call for demo purposes (remove in production)
    function simulateApiCall(file) {
        loadingSpinner.style.display = 'block';
        resultImage.style.display = 'none';
        downloadBtn.disabled = true;
        
        setTimeout(() => {
            resultImage.src = 'https://i.ibb.co/Kpstz6p/after-bg.png';
            
            loadingSpinner.style.display = 'none';
            resultImage.style.display = 'block';
            downloadBtn.disabled = false;
            
            downloadBtn.onclick = function() {
                const a = document.createElement('a');
                a.href = resultImage.src;
                a.download = 'no-bg-image.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        }, 3000);
    }
});