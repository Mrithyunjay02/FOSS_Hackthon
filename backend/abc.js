const QRCode = require('qrcode');

QRCode.toFile('car.jpg', 'hold on we are searching a parking slot for you', (err) => {
    if (err) {
        console.error('Error generating QR Code:', err);
    } else {
        console.log('QR Code generated successfully!');
    }
});

