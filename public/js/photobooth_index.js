window.photobooth = function() {
    return {
        stream: null,
        photos: [],
        stripCount: 3,
        lastStripDataURL: null,
        currentPhoto: 0,
        isCapturing: false,
        currentFilter: 'none',
        isLoading: false,
        setStripCount(count) {
            this.stripCount = count;
            this.resetStrip();
        },
        async startCamera() {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
                document.getElementById('video').srcObject = this.stream;
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Error accessing camera. Please allow camera access.');
            }
        },
        startCapture() {
            if (!this.stream) {
                alert('Please start the camera first.');
                return;
            }
            this.isCapturing = true;
            this.photos = [];
            this.currentPhoto = 0;
            this.captureNextPhoto();
        },
        async captureNextPhoto() {
            const video = document.getElementById('video');
            const countdown = document.getElementById('countdown');

            countdown.classList.remove('hidden');
            countdown.textContent = '3';
            countdown.style.transform = 'scale(1)';

            // Countdown
            setTimeout(() => {
                countdown.textContent = '2';
                countdown.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    countdown.textContent = '1';
                    countdown.style.transform = 'scale(1.4)';
                    setTimeout(() => {
                        countdown.classList.add('hidden');
                        // Capture
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0);

                        // Apply current filter
                        if (this.currentFilter !== 'none') {
                            const img = new Image();
                            img.src = canvas.toDataURL();
                            img.onload = () => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.filter = this.getFilterString(this.currentFilter);
                                ctx.drawImage(img, 0, 0);
                                ctx.filter = 'none';
                                this.photos.push(canvas.toDataURL());
                                this.currentPhoto++;
                                this.updateStripDisplay();
                                if (this.currentPhoto < this.stripCount) {
                                    setTimeout(() => this.captureNextPhoto(), 1000);
                                } else {
                                    this.isCapturing = false;
                                    this.generateStrip();
                                }
                            };
                        } else {
                            this.photos.push(canvas.toDataURL());
                            this.currentPhoto++;
                            this.updateStripDisplay();
                            if (this.currentPhoto < this.stripCount) {
                                setTimeout(() => this.captureNextPhoto(), 1000);
                            } else {
                                this.isCapturing = false;
                                this.generateStrip();
                            }
                        }
                    }, 1000);
                }, 1000);
            }, 1000);
        },
        getFilterString(filter) {
            switch (filter) {
                case 'grayscale': return 'grayscale(100%)';
                case 'sepia': return 'sepia(100%)';
                case 'brightness': return 'brightness(120%)';
                case 'contrast': return 'contrast(120%)';
                case 'hue-rotate': return 'hue-rotate(90deg)';
                case 'blur': return 'blur(2px)';
                case 'invert': return 'invert(100%)';
                default: return 'none';
            }
        },
        applyFilter(filter) {
            this.currentFilter = filter;
            if (this.photos.length > 0) {
                this.generateStrip();
            }
        },
        updateStripDisplay() {
            const stripDiv = document.getElementById('photo-strip');
            if (this.photos.length === 0) {
                stripDiv.innerHTML = '<p class="text-gray-500">No photos captured yet. Start capturing!</p>';
                return;
            }
            let html = '<div class="grid gap-2" style="grid-template-columns: repeat(' + this.photos.length + ', 1fr);">';
            this.photos.forEach((photo, index) => {
                html += '<img src="' + photo + '" class="w-full h-auto rounded-lg shadow-md" alt="Photo ' + (index + 1) + '" />';
            });
            html += '</div>';
            stripDiv.innerHTML = html;
        },
        generateStrip() {
            if (this.photos.length !== this.stripCount) return;

            const stripCanvas = document.createElement('canvas');
            const ctx = stripCanvas.getContext('2d');

            const photoWidth = 200;
            const photoHeight = 200;
            const margin = 10;

            stripCanvas.width = (photoWidth + margin) * this.stripCount - margin;
            stripCanvas.height = photoHeight;

            this.photos.forEach((photoSrc, index) => {
                const img = new Image();
                img.src = photoSrc;
                img.onload = () => {
                    ctx.filter = this.getFilterString(this.currentFilter);
                    ctx.drawImage(img, index * (photoWidth + margin), 0, photoWidth, photoHeight);
                    ctx.filter = 'none';
                    if (index === this.photos.length - 1) {
                        const stripDiv = document.getElementById('photo-strip');
                        const dataUrl = stripCanvas.toDataURL();
                        this.lastStripDataURL = dataUrl;

                        // Polaroid-like preview + actions (download / upload)
                        stripDiv.innerHTML = `
                            <div class="strip-wrapper strip-appear">
                                <div class="polaroid" style="width:100%; max-width:520px; margin:0 auto;">
                                    <img src="${dataUrl}" alt="Photo Strip">
                                    <div class="caption">Your Photo Strip</div>
                                </div>
                                <div class="strip-actions">
                                    <a id="download-strip" class="btn download" href="${dataUrl}" download="photostrip.png">Download</a>
                                    <button id="upload-strip" class="btn upload">Upload</button>
                                    <button id="reset-strip" class="btn muted">Reset</button>
                                </div>
                            </div>`;

                        // Attach action listeners
                        const self = this;
                        const uploadBtn = document.getElementById('upload-strip');
                        const resetBtn = document.getElementById('reset-strip');
                        if (uploadBtn) uploadBtn.addEventListener('click', function(){
                            uploadBtn.disabled = true; uploadBtn.textContent = 'Uploading...';
                            self.uploadStripFromDataURL(dataUrl).then(() => {
                                uploadBtn.textContent = 'Uploaded';
                                setTimeout(() => { uploadBtn.textContent = 'Upload'; uploadBtn.disabled = false; }, 1200);
                                self.resetStrip();
                            }).catch(() => {
                                uploadBtn.textContent = 'Error';
                                uploadBtn.disabled = false;
                            });
                        });
                        if (resetBtn) resetBtn.addEventListener('click', () => { this.resetStrip(); });
                    }
                };
            });
        },
        // Convert dataURL to blob and upload to server
        uploadStripFromDataURL(dataUrl) {
            return fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const formData = new FormData();
                    formData.append('photo', blob, 'photostrip.png');
                    return fetch('/photobooth', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) throw new Error('Upload failed');
                        return data;
                    });
                });
        },
        saveStrip() {
            // If we have a generated strip data URL, reuse it to upload quickly
            if (this.lastStripDataURL) {
                return this.uploadStripFromDataURL(this.lastStripDataURL).then(() => {
                    alert('Photo strip saved successfully!');
                    this.resetStrip();
                }).catch(err => {
                    console.error(err);
                    alert('Error saving photo strip.');
                });
            }

            // Fallback: rebuild canvas (shouldn't usually be needed)
            if (this.photos.length !== this.stripCount) return;

            const stripCanvas = document.createElement('canvas');
            const ctx = stripCanvas.getContext('2d');

            const photoWidth = 200;
            const photoHeight = 200;
            const margin = 10;

            stripCanvas.width = (photoWidth + margin) * this.stripCount - margin;
            stripCanvas.height = photoHeight;

            let loadedCount = 0;
            this.photos.forEach((photoSrc, index) => {
                const img = new Image();
                img.src = photoSrc;
                img.onload = () => {
                    ctx.filter = this.getFilterString(this.currentFilter);
                    ctx.drawImage(img, index * (photoWidth + margin), 0, photoWidth, photoHeight);
                    ctx.filter = 'none';
                    loadedCount++;
                    if (loadedCount === this.photos.length) {
                        stripCanvas.toBlob((blob) => {
                            const formData = new FormData();
                            formData.append('photo', blob, 'photostrip.png');
                            fetch('/photobooth', {
                                method: 'POST',
                                headers: {
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                                },
                                body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Photo strip saved successfully!');
                                    this.resetStrip();
                                } else {
                                    alert('Error saving photo strip.');
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Error saving photo strip.');
                            });
                        }, 'image/png');
                    }
                };
            });
        },
        resetStrip() {
            this.photos = [];
            this.currentPhoto = 0;
            this.isCapturing = false;
            this.updateStripDisplay();
        }
    }
};
