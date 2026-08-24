'use strict';

const CONFIG_PATH = './assets/config.json';
const FALLBACK_IMAGE = './assets/images/fallback.svg';
const FALLBACK_AVATAR = './assets/images/avatar-placeholder.svg';

const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

const select = document.querySelector('[data-select]');
const selectValue = document.querySelector('[data-selecct-value]');
const filterList = document.getElementById('filter-list');
const selectList = document.getElementById('select-list');
const projectList = document.getElementById('project-list');

const previewOverlay = document.getElementById('image-preview-overlay');
const previewImage = document.getElementById('image-preview-image');
const previewClose = document.getElementById('image-preview-close');
const previewPrevBtn = document.getElementById('preview-prev-btn');
const previewNextBtn = document.getElementById('preview-next-btn');
const previewTitle = document.getElementById('preview-title');
const previewCounter = document.getElementById('preview-counter');
const previewCaption = document.getElementById('preview-caption');
const previewThumbnails = document.getElementById('preview-thumbnails');

let filterButtons = [];
let selectButtons = [];
let projectItems = [];
let allProjectsData = [];
let activeProjectIndex = -1;
let activePhotoIndex = 0;

function elementToggleFunc(elem) {
  if (elem) {
    elem.classList.toggle('active');
  }
}

if (sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    elementToggleFunc(sidebar);
  });
}

function openPreview(projectIdx, photoIdx = 0) {
  if (!previewOverlay || !previewImage) {
    return;
  }

  if (projectIdx < 0 || projectIdx >= allProjectsData.length) {
    return;
  }

  activeProjectIndex = projectIdx;
  const project = allProjectsData[projectIdx];
  const photos = (project.photos && project.photos.length > 0)
    ? project.photos
    : [{ src: FALLBACK_IMAGE, alt: project.title || 'Project preview' }];

  if (photoIdx < 0) {
    activePhotoIndex = photos.length - 1;
  } else if (photoIdx >= photos.length) {
    activePhotoIndex = 0;
  } else {
    activePhotoIndex = photoIdx;
  }

  const currentPhoto = photos[activePhotoIndex];
  const photoSrc = sanitizeUrl(currentPhoto.src, FALLBACK_IMAGE);
  const photoAlt = currentPhoto.alt || project.title || 'Project photo';

  previewImage.src = photoSrc;
  previewImage.alt = photoAlt;

  if (previewTitle) {
    previewTitle.textContent = project.title || 'Project Preview';
  }

  if (previewCounter) {
    previewCounter.textContent = `${activePhotoIndex + 1} / ${photos.length}`;
  }

  if (previewCaption) {
    previewCaption.textContent = photoAlt;
  }

  // Handle Multi-Image Controls
  if (photos.length > 1) {
    if (previewPrevBtn) previewPrevBtn.style.display = 'flex';
    if (previewNextBtn) previewNextBtn.style.display = 'flex';

    if (previewThumbnails) {
      previewThumbnails.style.display = 'flex';
      previewThumbnails.innerHTML = '';
      photos.forEach((p, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `preview-thumb ${idx === activePhotoIndex ? 'active' : ''}`;
        thumbBtn.setAttribute('aria-label', `View photo ${idx + 1}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = sanitizeUrl(p.src, FALLBACK_IMAGE);
        thumbImg.alt = p.alt || `Thumbnail ${idx + 1}`;
        thumbImg.onerror = function () {
          thumbImg.src = FALLBACK_IMAGE;
        };

        thumbBtn.append(thumbImg);
        thumbBtn.addEventListener('click', function () {
          openPreview(activeProjectIndex, idx);
        });

        previewThumbnails.append(thumbBtn);
      });
    }
  } else {
    if (previewPrevBtn) previewPrevBtn.style.display = 'none';
    if (previewNextBtn) previewNextBtn.style.display = 'none';
    if (previewThumbnails) {
      previewThumbnails.style.display = 'none';
      previewThumbnails.innerHTML = '';
    }
  }

  previewOverlay.classList.add('active');
  previewOverlay.setAttribute('aria-hidden', 'false');
}

function closePreview() {
  if (!previewOverlay) {
    return;
  }
  previewOverlay.classList.remove('active');
  previewOverlay.setAttribute('aria-hidden', 'true');
  activeProjectIndex = -1;
  activePhotoIndex = 0;
}

function showNextPhoto() {
  if (activeProjectIndex === -1) return;
  const project = allProjectsData[activeProjectIndex];
  const photos = (project && project.photos) ? project.photos : [];
  if (photos.length <= 1) return;
  openPreview(activeProjectIndex, activePhotoIndex + 1);
}

function showPrevPhoto() {
  if (activeProjectIndex === -1) return;
  const project = allProjectsData[activeProjectIndex];
  const photos = (project && project.photos) ? project.photos : [];
  if (photos.length <= 1) return;
  openPreview(activeProjectIndex, activePhotoIndex - 1);
}

if (previewClose) {
  previewClose.addEventListener('click', closePreview);
}

if (previewPrevBtn) {
  previewPrevBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    showPrevPhoto();
  });
}

if (previewNextBtn) {
  previewNextBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    showNextPhoto();
  });
}

if (previewOverlay) {
  previewOverlay.addEventListener('click', function (event) {
    if (event.target === previewOverlay) {
      closePreview();
    }
  });
}

document.addEventListener('keydown', function (event) {
  if (!previewOverlay || !previewOverlay.classList.contains('active')) {
    return;
  }

  if (event.key === 'Escape') {
    closePreview();
  } else if (event.key === 'ArrowRight') {
    showNextPhoto();
  } else if (event.key === 'ArrowLeft') {
    showPrevPhoto();
  }
});

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener('click', function () {
    for (let j = 0; j < pages.length; j++) {
      if (this.innerHTML.toLowerCase() === pages[j].dataset.page) {
        pages[j].classList.add('active');
        navigationLinks[j].classList.add('active');
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove('active');
        navigationLinks[j].classList.remove('active');
      }
    }
  });
}

if (select) {
  select.addEventListener('click', function () {
    elementToggleFunc(this);
  });
}

function sanitizeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }
  return url;
}

function normalizeCategory(value) {
  return String(value || 'all').trim().toLowerCase();
}

function applyFilter(selectedValue) {
  const normalized = normalizeCategory(selectedValue);

  for (let i = 0; i < projectItems.length; i++) {
    const category = projectItems[i].dataset.category;
    if (normalized === 'all' || normalized === category) {
      projectItems[i].classList.add('active');
    } else {
      projectItems[i].classList.remove('active');
    }
  }

  for (let i = 0; i < filterButtons.length; i++) {
    const active = normalizeCategory(filterButtons[i].innerText) === normalized;
    filterButtons[i].classList.toggle('active', active);
  }
}

function bindFilterEvents() {
  selectButtons = document.querySelectorAll('[data-select-item]');
  filterButtons = document.querySelectorAll('[data-filter-btn]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const selectedCategory = this.innerText;
      if (selectValue) {
        selectValue.innerText = selectedCategory;
      }
      applyFilter(selectedCategory);
    });
  });

  selectButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const selectedCategory = this.innerText;
      if (selectValue) {
        selectValue.innerText = selectedCategory;
      }
      elementToggleFunc(select);
      applyFilter(selectedCategory);
    });
  });
}

function createContactItem(label, value, href) {
  const li = document.createElement('li');
  li.className = 'contact-item';

  const iconBox = document.createElement('div');
  iconBox.className = 'icon-box';
  const icon = document.createElement('ion-icon');
  icon.setAttribute('name', label === 'Email' ? 'mail-outline' : label === 'Phone' ? 'phone-portrait-outline' : 'location-outline');
  iconBox.append(icon);

  const info = document.createElement('div');
  info.className = 'contact-info';

  const title = document.createElement('p');
  title.className = 'contact-title';
  title.textContent = label;

  let valueNode;
  if (href) {
    valueNode = document.createElement('a');
    valueNode.className = 'contact-link';
    valueNode.href = href;
    valueNode.textContent = value;
  } else {
    valueNode = document.createElement('address');
    valueNode.textContent = value;
  }

  info.append(title, valueNode);
  li.append(iconBox, info);
  return li;
}

function createSocialItem(label, url) {
  const li = document.createElement('li');
  li.className = 'social-item';

  const link = document.createElement('a');
  link.className = 'social-link';
  link.href = sanitizeUrl(url, '#');
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const icon = document.createElement('ion-icon');
  const lower = String(label || '').toLowerCase();
  if (lower.includes('github')) {
    icon.setAttribute('name', 'logo-github');
  } else if (lower.includes('linkedin')) {
    icon.setAttribute('name', 'logo-linkedin');
  } else if (lower.includes('instagram')) {
    icon.setAttribute('name', 'logo-instagram');
  } else {
    icon.setAttribute('name', 'link-outline');
  }

  link.append(icon);
  li.append(link);
  return li;
}

function renderSidebar(site, contact) {
  document.getElementById('sidebar-name').textContent = site.title || 'Portfolio';
  document.getElementById('sidebar-title').textContent = site.tagline || 'Engineering Portfolio';

  const avatar = document.getElementById('sidebar-avatar');
  avatar.src = sanitizeUrl(site.avatar, FALLBACK_AVATAR);
  avatar.onerror = function () {
    avatar.src = FALLBACK_AVATAR;
  };

  const contactsList = document.getElementById('contacts-list');
  contactsList.innerHTML = '';
  contactsList.append(
    createContactItem('Email', site.email || contact.email || 'azzamujahid214@gmail.com', `mailto:${site.email || contact.email || ''}`),
    createContactItem('Phone', site.phone || '+62 8222-9469-179', `tel:${(site.phone || '').replace(/[^+\d]/g, '')}`),
    createContactItem('Location', site.location || 'Surabaya, Indonesia')
  );

  const socialList = document.getElementById('social-list');
  socialList.innerHTML = '';
  (site.socialLinks || []).forEach((social) => {
    socialList.append(createSocialItem(social.label, social.url));
  });
}

function renderAbout(about, site) {
  const aboutText = document.getElementById('about-text');
  aboutText.innerHTML = '';

  const summaryParagraph = document.createElement('p');
  summaryParagraph.textContent = site.summary || '';

  const introParagraph = document.createElement('p');
  introParagraph.textContent = about.intro || '';

  aboutText.append(summaryParagraph, introParagraph);

  const highlightsList = document.getElementById('highlights-list');
  highlightsList.innerHTML = '';

  (about.highlights || []).forEach((text) => {
    const item = document.createElement('li');
    item.className = 'service-item';

    const iconBox = document.createElement('div');
    iconBox.className = 'service-icon-box';

    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', 'hardware-chip-outline');
    icon.style.fontSize = '40px';
    icon.style.color = 'hsl(45, 100%, 72%)';
    iconBox.append(icon);

    const contentBox = document.createElement('div');
    contentBox.className = 'service-content-box';
    const title = document.createElement('h4');
    title.className = 'h4 service-item-title';
    title.textContent = text;

    contentBox.append(title);
    item.append(iconBox, contentBox);
    highlightsList.append(item);
  });
}

function renderTimeline(listId, entries, titleKey) {
  const list = document.getElementById(listId);
  if (!list) {
    return;
  }

  list.innerHTML = '';

  (entries || []).forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'timeline-item';

    const title = document.createElement('h4');
    title.className = 'h4 timeline-item-title';
    title.textContent = entry[titleKey] || 'Entry';

    const period = document.createElement('span');
    period.textContent = entry.period || '';

    const org = document.createElement('p');
    org.className = 'timeline-org';
    const locText = entry.location ? ` (${entry.location})` : '';
    org.textContent = `${entry.organization || ''}${locText}`;

    item.append(title, period, org);

    if (entry.bullets && Array.isArray(entry.bullets) && entry.bullets.length > 0) {
      const bulletList = document.createElement('ul');
      bulletList.className = 'timeline-bullets';
      entry.bullets.forEach((bText) => {
        const li = document.createElement('li');
        li.textContent = bText;
        bulletList.append(li);
      });
      item.append(bulletList);
    } else if (entry.details) {
      const text = document.createElement('p');
      text.className = 'timeline-text';
      text.textContent = entry.details;
      item.append(text);
    }

    list.append(item);
  });
}

function getSkillIconName(categoryName) {
  const name = String(categoryName || '').toLowerCase();
  if (name.includes('automation') || name.includes('control')) {
    return 'hardware-chip-outline';
  }
  if (name.includes('cad') || name.includes('design')) {
    return 'cube-outline';
  }
  if (name.includes('manufacturing') || name.includes('machining')) {
    return 'construct-outline';
  }
  if (name.includes('programming') || name.includes('software')) {
    return 'code-slash-outline';
  }
  if (name.includes('language') || name.includes('bahasa')) {
    return 'chatbubble-outline';
  }
  return 'ribbon-outline';
}

function renderSkills(skillsData) {
  const container = document.getElementById('skills-container');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!skillsData) return;

  const categories = Array.isArray(skillsData)
    ? skillsData
    : Object.keys(skillsData).map((key) => ({ category: key, items: skillsData[key] }));

  categories.forEach((group) => {
    const sec = document.createElement('section');
    sec.className = 'skill';

    const h3 = document.createElement('h3');
    h3.className = 'h3 skills-title';
    h3.textContent = group.category || group.domain || 'Skills';

    const ul = document.createElement('ul');
    ul.className = 'skills-list content-card';

    const iconName = getSkillIconName(group.category || group.domain);

    (group.items || []).forEach((skillName) => {
      const item = document.createElement('li');
      item.className = 'skills-item';

      const iconBox = document.createElement('span');
      iconBox.className = 'skills-item-icon';
      const icon = document.createElement('ion-icon');
      icon.setAttribute('name', iconName);
      iconBox.append(icon);

      const text = document.createElement('span');
      text.className = 'skills-item-text';
      text.textContent = skillName;

      item.append(iconBox, text);
      ul.append(item);
    });

    sec.append(h3, ul);
    container.append(sec);
  });
}

function renderResume(education, experience, skills) {
  renderTimeline('education-list', education, 'degree');
  renderTimeline('experience-list', experience, 'role');
  renderSkills(skills);
}

function renderPortfolio(projects) {
  allProjectsData = projects || [];
  const uniqueCategories = Array.from(new Set(allProjectsData.map((p) => p.category || 'General')));
  const categories = ['All', ...uniqueCategories];

  if (filterList) filterList.innerHTML = '';
  if (selectList) selectList.innerHTML = '';
  if (projectList) projectList.innerHTML = '';

  categories.forEach((category, idx) => {
    const filterItem = document.createElement('li');
    filterItem.className = 'filter-item';

    const filterBtn = document.createElement('button');
    filterBtn.setAttribute('data-filter-btn', '');
    filterBtn.textContent = category;
    if (idx === 0) {
      filterBtn.classList.add('active');
    }

    filterItem.append(filterBtn);
    if (filterList) filterList.append(filterItem);

    const selectItem = document.createElement('li');
    selectItem.className = 'select-item';
    const selectBtn = document.createElement('button');
    selectBtn.setAttribute('data-select-item', '');
    selectBtn.textContent = category;
    selectItem.append(selectBtn);
    if (selectList) selectList.append(selectItem);
  });

  allProjectsData.forEach((project, projectIdx) => {
    const photos = (project.photos && project.photos.length > 0) ? project.photos : [];
    const firstPhoto = photos[0] || null;
    const photoSrc = sanitizeUrl(firstPhoto ? firstPhoto.src : FALLBACK_IMAGE, FALLBACK_IMAGE);
    const photoAlt = firstPhoto && firstPhoto.alt ? firstPhoto.alt : `${project.title || 'Project'} preview`;

    const item = document.createElement('li');
    item.className = 'project-item active';
    item.setAttribute('data-filter-item', '');
    item.setAttribute('data-category', normalizeCategory(project.category || 'general'));
    item.setAttribute('data-project-index', projectIdx);

    const link = document.createElement('a');
    link.href = sanitizeUrl(project.githubUrl, '#');
    if (project.githubUrl && project.githubUrl !== '#') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const figure = document.createElement('figure');
    figure.className = 'project-img';
    figure.setAttribute('role', 'button');
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('data-project-index', projectIdx);

    const iconBox = document.createElement('div');
    iconBox.className = 'project-item-icon-box';
    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', 'eye-outline');
    iconBox.append(icon);

    const image = document.createElement('img');
    image.src = photoSrc;
    image.alt = photoAlt;
    image.loading = 'lazy';
    image.onerror = function () {
      image.src = FALLBACK_IMAGE;
    };

    figure.append(iconBox, image);

    // Multi-photo count badge on project card
    if (photos.length > 1) {
      const badge = document.createElement('span');
      badge.className = 'photo-count-badge';
      const imgIcon = document.createElement('ion-icon');
      imgIcon.setAttribute('name', 'images-outline');
      badge.append(imgIcon, document.createTextNode(` ${photos.length}`));
      figure.append(badge);
    }

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title || 'Untitled project';

    const category = document.createElement('p');
    category.className = 'project-category';
    category.textContent = project.category || 'General';

    link.append(figure, title, category);
    item.append(link);
    if (projectList) projectList.append(item);
  });

  projectItems = Array.from(document.querySelectorAll('[data-filter-item]'));
  bindFilterEvents();

  if (projectList) {
    projectList.addEventListener('click', function (event) {
      const figure = event.target.closest('.project-img');
      if (!figure) {
        return;
      }

      event.preventDefault();
      const pIdx = parseInt(figure.getAttribute('data-project-index'), 10);
      if (!isNaN(pIdx)) {
        openPreview(pIdx, 0);
      }
    });

    projectList.addEventListener('keydown', function (event) {
      const figure = event.target.closest('.project-img');
      if (!figure) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const pIdx = parseInt(figure.getAttribute('data-project-index'), 10);
        if (!isNaN(pIdx)) {
          openPreview(pIdx, 0);
        }
      }
    });
  }
}

function renderContact(contact, site) {
  const contactMsg = document.getElementById('contact-message');
  if (contactMsg) contactMsg.textContent = contact.message || '';
  const email = contact.email || site.email || 'azzam@example.com';
  const emailLink = document.getElementById('contact-email');
  if (emailLink) {
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
  }
}

async function init() {
  const response = await fetch(`${CONFIG_PATH}?v=${Date.now()}`, { cache: 'no-store' });
  const config = response.ok ? await response.json() : null;

  if (!config) {
    throw new Error('Failed to load assets/config.json');
  }

  renderSidebar(config.site || {}, config.contact || {});
  renderAbout(config.about || {}, config.site || {});
  renderResume(config.education || [], config.experience || [], config.skills || []);
  renderPortfolio(config.projects || []);
  renderContact(config.contact || {}, config.site || {});
}

init().catch((err) => {
  console.error(err);
});
