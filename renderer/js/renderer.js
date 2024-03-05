const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e){
    const file = e.target.files[0];
    if(!checkType(file)){
        return alertError('File type not supported');
    }
    // Get original dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function(){
        widthInput.value = img.width;
        heightInput.value = img.height;
    }
    form.style.display = 'block';
    filename.innerHTML = file.name;
    outputPath.innerHTML = path.join(os.homedir(), 'imageshrink');
}

function sendImage(e){
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;
    if(!img.files[0]){
        return alertError('Please select an image');
    }
    if (width === '' || height === ''){
        return alertError('Please enter valid dimensions');
    }
    // Send to main process
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    });
}

// Image Check
function checkType(file){
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return file && acceptedImageTypes.includes(file.type);
}

// Alerts
function alertError(message){
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center',
        }
    })
} 

function alertSucess(message){
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center',
        }
    })
} 

// Event Listeners
ipcRenderer.on('image:done', () => {
    alertSucess(`Image resized successfully to ${widthInput.value}x${heightInput.value}`);
})

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);