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

