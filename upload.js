const fs = require('fs');
const https = require('https');

function uploadFileCatbox(filename) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filename);
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        let postData = '--' + boundary + '\r\n';
        postData += 'Content-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n';
        postData += '--' + boundary + '\r\n';
        postData += 'Content-Disposition: form-data; name="fileToUpload"; filename="' + filename + '"\r\n';
        postData += 'Content-Type: application/octet-stream\r\n\r\n';

        const payload = Buffer.concat([
            Buffer.from(postData, 'utf8'),
            fileData,
            Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8')
        ]);

        const req = https.request({
            hostname: 'catbox.moe',
            port: 443,
            path: '/user/api.php',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': payload.length
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    try {
        console.log("AI: " + await uploadFileCatbox('ai-thumbnail.png'));
        console.log("NICKEL: " + await uploadFileCatbox('nickel-thumbnail.png'));
    } catch (e) {
        console.error(e);
    }
}
run();