(function(){
    function getCsrf() {
        const m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.getAttribute('content') : '';
    }

    const config = window.PHOTOBOOTH || {};
    const storeUrl = config.storeRoute || '/photobooth';

    document.addEventListener('DOMContentLoaded', function(){
        const form = document.getElementById('photoForm');
        if (!form) return;

        form.addEventListener('submit', function(e){
            e.preventDefault();
            const formData = new FormData(this);
            fetch(storeUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': getCsrf()
                }
            })
            .then(response => response.json())
            .then(data => {
                const result = document.getElementById('result');
                if (!result) return;
                if (data.success) {
                    result.innerHTML = '<img src="' + data.url + '" class="img-fluid" alt="Uploaded Photo">';
                } else {
                    result.innerHTML = '<div class="alert alert-danger">Upload gagal.</div>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const result = document.getElementById('result');
                if (result) result.innerHTML = '<div class="alert alert-danger">Terjadi kesalahan.</div>';
            });
        });
    });
})();
