// Add server listen at the end
const fs = require('fs');
let s = fs.readFileSync('/opt/neural-os/server.js', 'utf8');

const listenCode = `

const PORT = process.env.PORT || 3077;
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Neural-OS v2.078 running on port \${PORT}\`);
});
`;

s = s.replace("module.exports = app;", "module.exports = app;" + listenCode);
fs.writeFileSync('/opt/neural-os/server.js', s);
console.log('Added listen');