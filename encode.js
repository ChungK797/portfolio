const fs = require('fs');
try {
    const ai = fs.readFileSync('ai-thumbnail.png', 'base64');
    fs.writeFileSync('ai-thumbnail.b64', ai);
    const nickel = fs.readFileSync('nickel-thumbnail.png', 'base64');
    fs.writeFileSync('nickel-thumbnail.b64', nickel);
    console.log('Success');
} catch (e) {
    console.error(e);
}