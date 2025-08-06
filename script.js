// ===== GLOBAL VARIABLES =====
let signaturePad = null;
let currentSignatureTarget = null;
let zoomLevel = 100;
let logoCounter = 1;
let signatureCounter = 1;

// Certificate data object
const certificateData = {
    title: 'Certificate of Completion',
    recipient: '',
    subheading: 'This is to certify that',
    body: 'has successfully completed the course and demonstrated exceptional skills in',
    course: '',
    date: '',
    logos: { logo1: null },
    signatures: { signature1: null },
    signeeNames: { signee1: '' },
    signeeTitles: { signee1: '' },
    stamp: null,
    qrEnabled: false,
    qrUrl: '',
    layout: 'classic',
    theme: 'gold',
    font: 'serif'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCertificatePreview();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cert-date').value = today;
    certificateData.date = formatDate(today);
});

function initializeApp() {
    console.log('Advanced Certificate Generator initialized');
    
    // Apply default theme and layout
    applyTheme('gold');
    applyLayout('classic');
    applyFont('serif');
    
    // Initialize signature canvas
    initializeSignatureCanvas();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Design options
    document.getElementById('layout-select').addEventListener('change', handleLayoutChange);
    document.getElementById('theme-select').addEventListener('change', handleThemeChange);
    document.getElementById('font-select').addEventListener('change', handleFontChange);
    
    // Text inputs
    document.getElementById('cert-title').addEventListener('input', handleTextInput);
    document.getElementById('recipient-name').addEventListener('input', handleTextInput);
    document.getElementById('subheading').addEventListener('input', handleTextInput);
    document.getElementById('body-text').addEventListener('input', handleTextInput);
    document.getElementById('course-name').addEventListener('input', handleTextInput);
    document.getElementById('cert-date').addEventListener('change', handleDateChange);
    
    // Signature inputs
    document.getElementById('signee1-name').addEventListener('input', handleSigneeInput);
    document.getElementById('signee1-title').addEventListener('input', handleSigneeInput);
    document.getElementById('signee2-name').addEventListener('input', handleSigneeInput);
    document.getElementById('signee2-title').addEventListener('input', handleSigneeInput);
    
    // File uploads
    document.getElementById('logo1').addEventListener('change', (e) => handleFileUpload(e, 'logo1'));
    document.getElementById('logo2').addEventListener('change', (e) => handleFileUpload(e, 'logo2'));
    document.getElementById('logo3').addEventListener('change', (e) => handleFileUpload(e, 'logo3'));
    document.getElementById('signature1').addEventListener('change', (e) => handleFileUpload(e, 'signature1'));
    document.getElementById('signature2').addEventListener('change', (e) => handleFileUpload(e, 'signature2'));
    document.getElementById('stamp').addEventListener('change', (e) => handleFileUpload(e, 'stamp'));
    
    // QR Code
    document.getElementById('qr-enabled').addEventListener('change', handleQRToggle);
    document.getElementById('qr-url').addEventListener('input', handleQRInput);
    
    // Action buttons
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('download-png').addEventListener('click', downloadPNG);
    document.getElementById('reset-all').addEventListener('click', resetAll);
    
    // Preview controls
    document.getElementById('zoom-in').addEventListener('click', () => adjustZoom(10));
    document.getElementById('zoom-out').addEventListener('click', () => adjustZoom(-10));
    
    // Signature modal
    document.getElementById('clear-signature').addEventListener('click', clearSignature);
    document.getElementById('save-signature').addEventListener('click', saveSignature);
}

// ===== DESIGN HANDLERS =====
function handleLayoutChange(e) {
    const layout = e.target.value;
    certificateData.layout = layout;
    applyLayout(layout);
    updateCertificatePreview();
}

function handleThemeChange(e) {
    const theme = e.target.value;
    certificateData.theme = theme;
    applyTheme(theme);
}

function handleFontChange(e) {
    const font = e.target.value;
    certificateData.font = font;
    applyFont(font);
}

function applyLayout(layout) {
    const container = document.getElementById('certificate-preview');
    container.className = `certificate-container layout-${layout}`;
}

function applyTheme(theme) {
    document.documentElement.className = `theme-${theme}`;
}

function applyFont(font) {
    const container = document.getElementById('certificate-preview');
    container.classList.add(`font-${font}`);
}

// ===== TEXT INPUT HANDLERS =====
function handleTextInput(e) {
    const field = e.target.id.replace('cert-', '').replace('-', '');
    let value = e.target.value;
    
    switch(field) {
        case 'title':
            certificateData.title = value;
            document.getElementById('display-title').textContent = value || 'Certificate of Completion';
            break;
        case 'recipientname':
            certificateData.recipient = value;
            document.getElementById('display-recipient').textContent = value || '[Recipient Name]';
            break;
        case 'subheading':
            certificateData.subheading = value;
            document.getElementById('display-subheading').textContent = value || 'This is to certify that';
            break;
        case 'bodytext':
            certificateData.body = value;
            document.getElementById('display-body').textContent = value || 'has successfully completed the course and demonstrated exceptional skills in';
            break;
        case 'coursename':
            certificateData.course = value;
            document.getElementById('display-course').textContent = value || '[Course/Event Name]';
            break;
    }
}

function handleDateChange(e) {
    const date = e.target.value;
    certificateData.date = formatDate(date);
    document.getElementById('display-date').textContent = certificateData.date || '[Date]';
}

function handleSigneeInput(e) {
    const field = e.target.id;
    const value = e.target.value;
    
    if (field.includes('signee1-name')) {
        certificateData.signeeNames.signee1 = value;
        document.getElementById('display-signee1-name').textContent = value;
        toggleSignatureDisplay('signature1', value || certificateData.signeeTitles.signee1);
    } else if (field.includes('signee1-title')) {
        certificateData.signeeTitles.signee1 = value;
        document.getElementById('display-signee1-title').textContent = value;
        toggleSignatureDisplay('signature1', certificateData.signeeNames.signee1 || value);
    }
}

function toggleSignatureDisplay(signatureId, hasContent) {
    const display = document.getElementById(`${signatureId}-display`);
    if (hasContent) {
        display.style.display = 'block';
    } else if (!certificateData.signatures[signatureId]) {
        display.style.display = 'none';
    }
}

// ===== FILE UPLOAD HANDLERS =====
function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        if (type.startsWith('logo')) {
            certificateData.logos[type] = imageData;
            updateLogoDisplay(type, imageData);
        } else if (type.startsWith('signature')) {
            certificateData.signatures[type] = imageData;
            updateSignatureDisplay(type, imageData);
        } else if (type === 'stamp') {
            certificateData.stamp = imageData;
            updateStampDisplay(imageData);
        }
        
        // Update preview
        updateFilePreview(type, imageData);
    };
    
    reader.readAsDataURL(file);
}

function updateFilePreview(type, imageData) {
    const preview = document.getElementById(`${type}-preview`);
    preview.innerHTML = `<img src="${imageData}" alt="${type} preview">`;
}

function updateLogoDisplay(logoType, imageData) {
    const display = document.getElementById(`${logoType}-display`);
    display.innerHTML = `<img src="${imageData}" alt="Logo">`;
    display.style.display = 'block';
}

function updateSignatureDisplay(signatureType, imageData) {
    const display = document.getElementById(`${signatureType}-display`);
    const signatureLine = display.querySelector('.signature-line');
    signatureLine.innerHTML = `<img src="${imageData}" alt="Signature">`;
    
    // Show signature if there's content
    const signatureNumber = signatureType.replace('signature', '');
    const hasName = certificateData[`signee${signatureNumber}Name`];
    const hasTitle = certificateData[`signee${signatureNumber}Title`];
    
    if (hasName || hasTitle || imageData) {
        display.style.display = 'block';
    }
    
    // Update control panel preview
    const controlPreview = document.getElementById(`${signatureType}-preview`);
    controlPreview.innerHTML = `<img src="${imageData}" alt="Signature preview">`;
}

function updateStampDisplay(imageData) {
    const display = document.getElementById('stamp-display');
    display.innerHTML = `<img src="${imageData}" alt="Stamp">`;
    display.style.display = 'block';
}

// ===== QR CODE HANDLERS =====
function handleQRToggle(e) {
    const enabled = e.target.checked;
    certificateData.qrEnabled = enabled;
    
    const options = document.getElementById('qr-options');
    options.style.display = enabled ? 'block' : 'none';
    
    if (enabled && certificateData.qrUrl) {
        generateQRCode(certificateData.qrUrl);
    } else {
        document.getElementById('qr-display').innerHTML = '';
        document.getElementById('qr-display').style.display = 'none';
    }
}

function handleQRInput(e) {
    const url = e.target.value;
    certificateData.qrUrl = url;
    
    if (certificateData.qrEnabled && url) {
        generateQRCode(url);
    }
}

function generateQRCode(text) {
    const qrDisplay = document.getElementById('qr-display');
    qrDisplay.innerHTML = '';
    
    if (text) {
        QRCode.toCanvas(text, { width: 80, height: 80 }, function(error, canvas) {
            if (error) {
                console.error('QR Code generation failed:', error);
                return;
            }
            qrDisplay.appendChild(canvas);
            qrDisplay.style.display = 'block';
        });
    } else {
        qrDisplay.style.display = 'none';
    }
}

// ===== SIGNATURE PAD =====
function initializeSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 2,
        maxWidth: 4,
    });
    
    // Resize canvas
    resizeCanvas();
}

function resizeCanvas() {
    const canvas = document.getElementById('signature-canvas');
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    
    signaturePad.clear();
}

function openSignaturePad(signatureNumber) {
    currentSignatureTarget = signatureNumber;
    document.getElementById('signature-modal').style.display = 'block';
    signaturePad.clear();
    
    // Load existing signature if available
    const existingSignature = certificateData.signatures[`signature${signatureNumber}`];
    if (existingSignature) {
        // Note: SignaturePad doesn't support loading from image, so we start fresh
    }
}

function closeSignaturePad() {
    document.getElementById('signature-modal').style.display = 'none';
    currentSignatureTarget = null;
}

function clearSignature() {
    signaturePad.clear();
}

function saveSignature() {
    if (signaturePad.isEmpty()) {
        alert('Please provide a signature first.');
        return;
    }
    
    const signatureData = signaturePad.toDataURL();
    const signatureType = `signature${currentSignatureTarget}`;
    
    certificateData.signatures[signatureType] = signatureData;
    updateSignatureDisplay(signatureType, signatureData);
    
    closeSignaturePad();
}

// ===== PREVIEW CONTROLS =====
function adjustZoom(delta) {
    zoomLevel = Math.max(50, Math.min(200, zoomLevel + delta));
    
    const container = document.getElementById('certificate-preview');
    container.style.transform = `scale(${zoomLevel / 100})`;
    
    document.getElementById('zoom-level').textContent = `${zoomLevel}%`;
}

function updateCertificatePreview() {
    // This function can be called to refresh the entire preview
    // Most updates happen in real-time through individual handlers
    console.log('Certificate preview updated');
}

// ===== EXPORT FUNCTIONS =====
function downloadPDF() {
    showLoadingOverlay();
    
    const element = document.getElementById('certificate-preview');
    const originalScale = element.style.transform;
    element.style.transform = 'scale(1)';
    
    html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const filename = generateFilename('pdf');
        pdf.save(filename);
        
        element.style.transform = originalScale;
        hideLoadingOverlay();
    }).catch(error => {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
        element.style.transform = originalScale;
        hideLoadingOverlay();
    });
}

function downloadPNG() {
    showLoadingOverlay();
    
    const element = document.getElementById('certificate-preview');
    const originalScale = element.style.transform;
    element.style.transform = 'scale(1)';
    
    html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = generateFilename('png');
        link.href = canvas.toDataURL('image/png');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        element.style.transform = originalScale;
        hideLoadingOverlay();
    }).catch(error => {
        console.error('PNG generation failed:', error);
        alert('Failed to generate PNG. Please try again.');
        element.style.transform = originalScale;
        hideLoadingOverlay();
    });
}

// ===== UTILITY FUNCTIONS =====
function generateFilename(extension) {
    const recipient = certificateData.recipient || 'Certificate';
    const course = certificateData.course || 'Course';
    const date = new Date().toISOString().split('T')[0];
    
    return `${recipient}_${course}_${date}.${extension}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
}

function showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function resetAll() {
    if (!confirm('Are you sure you want to reset all fields? This action cannot be undone.')) {
        return;
    }
    
    // Reset form fields
    document.getElementById('cert-title').value = 'Certificate of Completion';
    document.getElementById('recipient-name').value = '';
    document.getElementById('subheading').value = 'This is to certify that';
    document.getElementById('body-text').value = 'has successfully completed the course and demonstrated exceptional skills in';
    document.getElementById('course-name').value = '';
    document.getElementById('cert-date').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('signee1-name').value = '';
    document.getElementById('signee1-title').value = '';
    document.getElementById('signee2-name').value = '';
    document.getElementById('signee2-title').value = '';
    
    // Reset file inputs
    ['logo1', 'logo2', 'logo3', 'signature1', 'signature2', 'stamp'].forEach(id => {
        document.getElementById(id).value = '';
        document.getElementById(`${id}-preview`).innerHTML = '';
    });
    
    // Reset QR
    document.getElementById('qr-enabled').checked = false;
    document.getElementById('qr-url').value = '';
    document.getElementById('qr-options').style.display = 'none';
    
    // Reset selects
    document.getElementById('layout-select').value = 'classic';
    document.getElementById('theme-select').value = 'gold';
    document.getElementById('font-select').value = 'serif';
    
    // Reset dynamic elements
    resetDynamicElements();
    
    // Reset certificate data
    Object.assign(certificateData, {
        title: 'Certificate of Completion',
        recipient: '',
        subheading: 'This is to certify that',
        body: 'has successfully completed the course and demonstrated exceptional skills in',
        course: '',
        date: formatDate(new Date().toISOString().split('T')[0]),
        logos: { logo1: null },
        signatures: { signature1: null },
        signeeNames: { signee1: '' },
        signeeTitles: { signee1: '' },
        stamp: null,
        qrEnabled: false,
        qrUrl: '',
        layout: 'classic',
        theme: 'gold',
        font: 'serif'
    });
    
    // Reset preview displays
    resetPreviewDisplays();
    
    // Apply default styles
    applyTheme('gold');
    applyLayout('classic');
    applyFont('serif');
    
    // Reset zoom
    zoomLevel = 100;
    document.getElementById('certificate-preview').style.transform = 'scale(1)';
    document.getElementById('zoom-level').textContent = '100%';
}

function resetDynamicElements() {
    // Reset logos to just one
    const logoUploads = document.getElementById('logo-uploads');
    logoUploads.innerHTML = `
        <div class="upload-item dynamic-item" data-logo-id="1">
            <button type="button" class="remove-item-btn" onclick="removeLogo(1)" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
            <label for="logo1">Logo 1</label>
            <input type="file" id="logo1" accept="image/*" class="file-input">
            <div class="file-preview" id="logo1-preview"></div>
        </div>
    `;
    
    // Reset signatures to just one
    const signatureSection = document.getElementById('signature-section');
    signatureSection.innerHTML = `
        <div class="signature-item dynamic-item" data-signature-id="1">
            <button type="button" class="remove-item-btn" onclick="removeSignature(1)" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
            <h4>Signature 1</h4>
            <input type="text" id="signee1-name" class="form-control" placeholder="Signee Name">
            <input type="text" id="signee1-title" class="form-control" placeholder="Title/Position">
            <div class="signature-options">
                <button type="button" class="btn btn-outline" onclick="openSignaturePad(1)">
                    <i class="fas fa-pen"></i> Draw Signature
                </button>
                <input type="file" id="signature1" accept="image/*" class="file-input">
                <label for="signature1" class="btn btn-outline">
                    <i class="fas fa-upload"></i> Upload
                </label>
            </div>
            <div class="signature-preview" id="signature1-preview"></div>
        </div>
    `;
    
    // Reset preview containers
    const logosContainer = document.getElementById('logos-container');
    logosContainer.innerHTML = '<div id="logo1-display" class="logo-display"></div>';
    
    const signaturesContainer = document.getElementById('signatures-container');
    signaturesContainer.innerHTML = `
        <div id="signature1-display" class="signature-display">
            <div class="signature-line"></div>
            <div class="signature-info">
                <p class="signee-name" id="display-signee1-name"></p>
                <p class="signee-title" id="display-signee1-title"></p>
            </div>
        </div>
    `;
    
    // Reset counters
    logoCounter = 1;
    signatureCounter = 1;
    
    // Re-attach event listeners
    document.getElementById('logo1').addEventListener('change', (e) => handleFileUpload(e, 'logo1'));
    document.getElementById('signature1').addEventListener('change', (e) => handleFileUpload(e, 'signature1'));
    document.getElementById('signee1-name').addEventListener('input', handleSigneeInput);
    document.getElementById('signee1-title').addEventListener('input', handleSigneeInput);
}

function resetPreviewDisplays() {
    // Reset text displays
    document.getElementById('display-title').textContent = 'Certificate of Completion';
    document.getElementById('display-recipient').textContent = '[Recipient Name]';
    document.getElementById('display-subheading').textContent = 'This is to certify that';
    document.getElementById('display-body').textContent = 'has successfully completed the course and demonstrated exceptional skills in';
    document.getElementById('display-course').textContent = '[Course/Event Name]';
    document.getElementById('display-date').textContent = certificateData.date || '[Date]';
    
    // Reset signee displays
    document.getElementById('display-signee1-name').textContent = '';
    document.getElementById('display-signee1-title').textContent = '';
    
    // Reset stamp and QR displays
    document.getElementById('stamp-display').innerHTML = '';
    document.getElementById('stamp-display').style.display = 'none';
    
    document.getElementById('qr-display').innerHTML = '';
    document.getElementById('qr-display').style.display = 'none';
}

// ===== RESPONSIVE HANDLERS =====
window.addEventListener('resize', function() {
    if (signaturePad) {
        resizeCanvas();
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadPDF();
    }
    
    // Ctrl/Cmd + P to download PNG
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        downloadPNG();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('signature-modal');
        if (modal.style.display === 'block') {
            closeSignaturePad();
        }
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    hideLoadingOverlay();
});

// ===== ACCESSIBILITY IMPROVEMENTS =====
document.addEventListener('keydown', function(e) {
    // Tab navigation improvements
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Add visual focus indicators
        setTimeout(() => {
            focusableElements.forEach(el => {
                el.addEventListener('focus', () => {
                    el.style.outline = '3px solid var(--primary-color)';
                    el.style.outlineOffset = '2px';
                });
                
                el.addEventListener('blur', () => {
                    el.style.outline = '';
                    el.style.outlineOffset = '';
                });
            });
        }, 100);
    }
});

// ===== DYNAMIC LOGO FUNCTIONS =====
function addMoreLogo() {
    logoCounter++;
    const logoId = `logo${logoCounter}`;
    const logoUploads = document.getElementById('logo-uploads');
    
    const logoItem = document.createElement('div');
    logoItem.className = 'upload-item dynamic-item';
    logoItem.setAttribute('data-logo-id', logoCounter);
    
    logoItem.innerHTML = `
        <button type="button" class="remove-item-btn" onclick="removeLogo(${logoCounter})">
            <i class="fas fa-times"></i>
        </button>
        <label for="${logoId}">Logo ${logoCounter}</label>
        <input type="file" id="${logoId}" accept="image/*" class="file-input">
        <div class="file-preview" id="${logoId}-preview"></div>
    `;
    
    logoUploads.appendChild(logoItem);
    
    // Add event listener for the new file input
    document.getElementById(logoId).addEventListener('change', (e) => handleFileUpload(e, logoId));
    
    // Initialize logo data
    certificateData.logos[logoId] = null;
    
    // Create preview display element
    const logosContainer = document.getElementById('logos-container');
    const logoDisplay = document.createElement('div');
    logoDisplay.id = `${logoId}-display`;
    logoDisplay.className = 'logo-display';
    logoDisplay.style.display = 'none';
    logosContainer.appendChild(logoDisplay);
    
    // Show remove button for all logos when there are multiple
    updateRemoveButtonsVisibility('logo');
}

function removeLogo(logoId) {
    // Remove from DOM
    const logoItem = document.querySelector(`[data-logo-id="${logoId}"]`);
    if (logoItem) {
        logoItem.remove();
    }
    
    // Remove from preview
    const logoDisplay = document.getElementById(`logo${logoId}-display`);
    if (logoDisplay) {
        logoDisplay.remove();
    }
    
    // Remove from data
    delete certificateData.logos[`logo${logoId}`];
    
    // Update remove buttons visibility
    updateRemoveButtonsVisibility('logo');
}

// ===== DYNAMIC SIGNATURE FUNCTIONS =====
function addMoreSignature() {
    signatureCounter++;
    const signatureId = `signature${signatureCounter}`;
    const signeeId = `signee${signatureCounter}`;
    const signatureSection = document.getElementById('signature-section');
    
    const signatureItem = document.createElement('div');
    signatureItem.className = 'signature-item dynamic-item';
    signatureItem.setAttribute('data-signature-id', signatureCounter);
    
    signatureItem.innerHTML = `
        <button type="button" class="remove-item-btn" onclick="removeSignature(${signatureCounter})">
            <i class="fas fa-times"></i>
        </button>
        <h4>Signature ${signatureCounter}</h4>
        <input type="text" id="${signeeId}-name" class="form-control" placeholder="Signee Name">
        <input type="text" id="${signeeId}-title" class="form-control" placeholder="Title/Position">
        <div class="signature-options">
            <button type="button" class="btn btn-outline" onclick="openSignaturePad(${signatureCounter})">
                <i class="fas fa-pen"></i> Draw Signature
            </button>
            <input type="file" id="${signatureId}" accept="image/*" class="file-input">
            <label for="${signatureId}" class="btn btn-outline">
                <i class="fas fa-upload"></i> Upload
            </label>
        </div>
        <div class="signature-preview" id="${signatureId}-preview"></div>
    `;
    
    signatureSection.appendChild(signatureItem);
    
    // Add event listeners for the new elements
    document.getElementById(`${signeeId}-name`).addEventListener('input', (e) => handleDynamicSigneeInput(e, signatureCounter, 'name'));
    document.getElementById(`${signeeId}-title`).addEventListener('input', (e) => handleDynamicSigneeInput(e, signatureCounter, 'title'));
    document.getElementById(signatureId).addEventListener('change', (e) => handleFileUpload(e, signatureId));
    
    // Initialize signature data
    certificateData.signatures[signatureId] = null;
    certificateData.signeeNames[signeeId] = '';
    certificateData.signeeTitles[signeeId] = '';
    
    // Create preview display element
    const signaturesContainer = document.getElementById('signatures-container');
    const signatureDisplay = document.createElement('div');
    signatureDisplay.id = `${signatureId}-display`;
    signatureDisplay.className = 'signature-display';
    signatureDisplay.style.display = 'none';
    signatureDisplay.innerHTML = `
        <div class="signature-line"></div>
        <div class="signature-info">
            <p class="signee-name" id="display-${signeeId}-name"></p>
            <p class="signee-title" id="display-${signeeId}-title"></p>
        </div>
    `;
    signaturesContainer.appendChild(signatureDisplay);
    
    // Show remove button for all signatures when there are multiple
    updateRemoveButtonsVisibility('signature');
}

function removeSignature(signatureId) {
    // Remove from DOM
    const signatureItem = document.querySelector(`[data-signature-id="${signatureId}"]`);
    if (signatureItem) {
        signatureItem.remove();
    }
    
    // Remove from preview
    const signatureDisplay = document.getElementById(`signature${signatureId}-display`);
    if (signatureDisplay) {
        signatureDisplay.remove();
    }
    
    // Remove from data
    delete certificateData.signatures[`signature${signatureId}`];
    delete certificateData.signeeNames[`signee${signatureId}`];
    delete certificateData.signeeTitles[`signee${signatureId}`];
    
    // Update remove buttons visibility
    updateRemoveButtonsVisibility('signature');
}

// ===== UTILITY FUNCTIONS FOR DYNAMIC ELEMENTS =====
function updateRemoveButtonsVisibility(type) {
    const containerSelector = type === 'logo' ? '#logo-uploads' : '#signature-section';
    const items = document.querySelectorAll(`${containerSelector} .dynamic-item`);
    
    items.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-item-btn');
        if (removeBtn) {
            removeBtn.style.display = items.length > 1 ? 'flex' : 'none';
        }
    });
}

function handleDynamicSigneeInput(event, signatureNumber, type) {
    const value = event.target.value;
    const signeeId = `signee${signatureNumber}`;
    const signatureId = `signature${signatureNumber}`;
    
    if (type === 'name') {
        certificateData.signeeNames[signeeId] = value;
        const displayElement = document.getElementById(`display-${signeeId}-name`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    } else if (type === 'title') {
        certificateData.signeeTitles[signeeId] = value;
        const displayElement = document.getElementById(`display-${signeeId}-title`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    }
    
    // Show/hide signature display based on content
    const hasName = certificateData.signeeNames[signeeId];
    const hasTitle = certificateData.signeeTitles[signeeId];
    const hasSignature = certificateData.signatures[signatureId];
    
    const display = document.getElementById(`${signatureId}-display`);
    if (display) {
        display.style.display = (hasName || hasTitle || hasSignature) ? 'block' : 'none';
    }
}

console.log('Advanced Certificate Generator v1.0 - Ready!');