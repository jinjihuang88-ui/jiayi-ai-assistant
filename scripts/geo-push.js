const https = require('https');

const urls = [
  'https://www.jiayi.co/',
  'https://www.jiayi.co/risk-compass',
  'https://www.jiayi.co/about',
  'https://www.jiayi.co/blog',
  'https://www.jiayi.co/blog/risk-compass-guide',
  'https://www.jiayi.co/blog/study-permit-2026',
  'https://www.jiayi.co/blog/ee-immigration-score',
  'https://www.jiayi.co/blog/pnp-immigration',
  'https://www.jiayi.co/blog/immigration-mistakes',
  'https://www.jiayi.co/blog/lmia-work-permit'
];

// Bing IndexNow
const pushToBing = () => {
  const data = JSON.stringify({
    host: 'www.jiayi.co',
    key: '672a8848b78941788649830545938592',
    keyLocation: 'https://www.jiayi.co/672a8848b78941788649830545938592.txt',
    urlList: urls
  });

  const options = {
    hostname: 'www.bing.com',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Bing status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error('Bing error:', error);
  });

  req.write(data);
  req.end();
};

// Google Sitemap Ping
const pushToGoogle = () => {
  https.get('https://www.google.com/ping?sitemap=https://www.jiayi.co/sitemap.xml', (res) => {
    console.log(`Google status: ${res.statusCode}`);
  });
};

pushToBing();
pushToGoogle();
