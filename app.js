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

let filterButtons = [];
let selectButtons = [];
let projectItems = [];

function elementToggleFunc(elem) {
  elem.classList.toggle('active');
}

if (sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    elementToggleFunc(sidebar);
  });
}

if (previewClose) {
  previewClose.addEventListener('click', closePreview);
}

if (previewOverlay) {
  previewOverlay.addEventListener('click', function (event) {
    if (event.target === previewOverlay) {
      closePreview();
    }
  });
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closePreview();
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

function openPreview(src, alt) {
  if (!previewOverlay || !previewImage) {
    return;
  }

  previewImage.src = src || FALLBACK_IMAGE;
  previewImage.alt = alt || 'Project image preview';
  previewOverlay.classList.add('active');
  previewOverlay.setAttribute('aria-hidden', 'false');
}

function closePreview() {
  if (!previewOverlay) {
    return;
  }
  previewOverlay.classList.remove('active');
  previewOverlay.setAttribute('aria-hidden', 'true');
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

  for (let i = 0; i < selectButtons.length; i++) {
    selectButtons[i].addEventListener('click', function () {
      const selectedText = this.innerText;
      selectValue.innerText = selectedText;
      select.classList.remove('active');
      applyFilter(selectedText);
    });
  }

  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener('click', function () {
      const selectedText = this.innerText;
      selectValue.innerText = selectedText;
      applyFilter(selectedText);
    });
  }
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
  document.getElementById('sidebar-title').textContent = site.tagline || 'Student';

  const avatar = document.getElementById('sidebar-avatar');
  const avatarSrc = sanitizeUrl(site.avatar, FALLBACK_AVATAR);
  avatar.src = avatarSrc;
  avatar.alt = `${site.title || 'Profile'} avatar`;
  avatar.onerror = function () {
    if (avatarSrc && !avatarSrc.startsWith('./')) {
      avatar.onerror = function () {
        avatar.src = FALLBACK_AVATAR;
      };
      avatar.src = `./${avatarSrc}`;
      return;
    }
    avatar.src = FALLBACK_AVATAR;
  };

  const contactsList = document.getElementById('contacts-list');
  contactsList.innerHTML = '';
  contactsList.append(
    createContactItem('Email', site.email || contact.email || 'Not set', `mailto:${site.email || contact.email || ''}`),
    createContactItem('Phone', site.phone || 'Not set', `tel:${String(site.phone || '').replace(/\s+/g, '')}`),
    createContactItem('Location', site.location || 'Not set', null)
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

  const p1 = document.createElement('p');
  p1.textContent = about.intro || '';

  const p2 = document.createElement('p');
  p2.textContent = site.summary || '';

  aboutText.append(p1, p2);

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

    const text = document.createElement('p');
    text.className = 'timeline-text';
    text.textContent = `${entry.organization || ''} - ${entry.details || ''}`;

    item.append(title, period, text);
    list.append(item);
  });
}

function getSkillIconName(listId) {
  if (listId.includes('technical')) {
    return 'hardware-chip-outline';
  }

  if (listId.includes('software')) {
    return 'code-slash-outline';
  }

  if (listId.includes('language')) {
    return 'chatbubble-outline';
  }

  return 'ribbon-outline';
}

function renderSkillGroup(listId, items) {
  const skillsList = document.getElementById(listId);
  if (!skillsList) {
    return;
  }

  skillsList.innerHTML = '';

  const iconName = getSkillIconName(listId);

  (items || []).forEach((skillName) => {
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
    skillsList.append(item);
  });
}

function normalizeSkills(skills) {
  if (!skills) {
    return {
      technical: [],
      software: [],
      languages: [],
      certifications: []
    };
  }

  if (!Array.isArray(skills)) {
    return {
      technical: skills.technical || [],
      software: skills.software || [],
      languages: skills.languages || [],
      certifications: skills.certifications || []
    };
  }

  const grouped = {
    technical: [],
    software: [],
    languages: [],
    certifications: []
  };

  (skills || []).forEach((group) => {
    const domain = String(group.domain || '').toLowerCase();
    if (domain.includes('technical') || domain.includes('teknis')) {
      grouped.technical = group.items || [];
    } else if (domain.includes('software')) {
      grouped.software = group.items || [];
    } else if (domain.includes('language') || domain.includes('bahasa')) {
      grouped.languages = group.items || [];
    } else if (domain.includes('certification') || domain.includes('training')) {
      grouped.certifications = group.items || [];
    }
  });

  return grouped;
}

function renderResume(education, experience, skills) {
  renderTimeline('education-list', education, 'degree');

  const experienceList = document.getElementById('experience-list');
  experienceList.innerHTML = '';

  (experience || []).forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'timeline-item';

    const title = document.createElement('h4');
    title.className = 'h4 timeline-item-title';
    title.textContent = entry.role || 'Role';

    const period = document.createElement('span');
    period.textContent = entry.period || '';

    const text = document.createElement('p');
    text.className = 'timeline-text';
    text.textContent = `${entry.organization || ''} - ${entry.details || ''}`;

    item.append(title, period, text);
    experienceList.append(item);
  });

  const groupedSkills = normalizeSkills(skills);
  renderSkillGroup('technical-skills-list', groupedSkills.technical);
  renderSkillGroup('software-skills-list', groupedSkills.software);
  renderSkillGroup('language-skills-list', groupedSkills.languages);
  renderSkillGroup('certification-skills-list', groupedSkills.certifications);
}

function renderPortfolio(projects) {
  const uniqueCategories = Array.from(new Set((projects || []).map((p) => p.category || 'General')));
  const categories = ['All', ...uniqueCategories];

  filterList.innerHTML = '';
  selectList.innerHTML = '';
  projectList.innerHTML = '';

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
    filterList.append(filterItem);

    const selectItem = document.createElement('li');
    selectItem.className = 'select-item';
    const selectBtn = document.createElement('button');
    selectBtn.setAttribute('data-select-item', '');
    selectBtn.textContent = category;
    selectItem.append(selectBtn);
    selectList.append(selectItem);
  });

  (projects || []).forEach((project) => {
    const firstPhoto = (project.photos && project.photos[0]) ? project.photos[0] : null;
    const photoSrc = sanitizeUrl(firstPhoto ? firstPhoto.src : FALLBACK_IMAGE, FALLBACK_IMAGE);
    const photoAlt = firstPhoto && firstPhoto.alt ? firstPhoto.alt : `${project.title || 'Project'} preview`;

    const item = document.createElement('li');
    item.className = 'project-item active';
    item.setAttribute('data-filter-item', '');
    item.setAttribute('data-category', normalizeCategory(project.category || 'general'));

    const link = document.createElement('a');
    link.href = sanitizeUrl(project.githubUrl, '#');
    if (project.githubUrl) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const figure = document.createElement('figure');
    figure.className = 'project-img';
    figure.setAttribute('data-preview-src', photoSrc);
    figure.setAttribute('data-preview-alt', photoAlt);
    figure.setAttribute('role', 'button');
    figure.setAttribute('tabindex', '0');

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

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.textContent = project.title || 'Untitled project';

    const category = document.createElement('p');
    category.className = 'project-category';
    category.textContent = project.category || 'General';

    link.append(figure, title, category);
    item.append(link);
    projectList.append(item);
  });

  projectItems = Array.from(document.querySelectorAll('[data-filter-item]'));
  bindFilterEvents();

  projectList.addEventListener('click', function (event) {
    const figure = event.target.closest('.project-img');
    if (!figure) {
      return;
    }

    event.preventDefault();
    openPreview(figure.getAttribute('data-preview-src'), figure.getAttribute('data-preview-alt'));
  });

  projectList.addEventListener('keydown', function (event) {
    const figure = event.target.closest('.project-img');
    if (!figure) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPreview(figure.getAttribute('data-preview-src'), figure.getAttribute('data-preview-alt'));
    }
  });
}

function renderContact(contact, site) {
  document.getElementById('contact-message').textContent = contact.message || '';
  const email = contact.email || site.email || 'azzam@example.com';
  const emailLink = document.getElementById('contact-email');
  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;
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

init().catch((error) => {
  console.error(error);
});
