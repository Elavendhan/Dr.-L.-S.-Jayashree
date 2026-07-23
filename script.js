/**
 * Dr. L.S. Jayashree Portfolio Website Script
 * Interactive features, Light/Dark theme, Modal manager, Lightbox,
 * and Dynamic Publication Database Search and Pagination.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // THEME MANAGER (DARK / LIGHT MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyEl = document.body;
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        bodyEl.classList.remove('dark-theme');
        bodyEl.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        bodyEl.classList.remove('light-theme');
        bodyEl.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        if (bodyEl.classList.contains('dark-theme')) {
            bodyEl.classList.remove('dark-theme');
            bodyEl.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('portfolio-theme', 'light');
        } else {
            bodyEl.classList.remove('light-theme');
            bodyEl.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('portfolio-theme', 'dark');
        }
    });

    // ==========================================
    // MOBILE NAVIGATION MENU
    // ==========================================
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileToggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        mobileToggleBtn.innerHTML = isExpanded ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    
    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    // ==========================================
    // SCROLL PROGRESS & STICKY HEADER
    // ==========================================
    const scrollProgress = document.getElementById('scroll-progress');
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
        
        // Sticky Header class addition
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // SCROLL SPY ACTIVE SECTION LINK HIGHLIGHT
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -60% 0px' // Trigger active state when section takes up the middle of viewport
    });
    
    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });

    // ==========================================
    // PRODUCT SECTIONS FILTERS
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const commercializedBanner = document.getElementById('commercialized-intro-text');
    
    function applyProductFilter(filterValue) {
        productCards.forEach(card => {
            const status = card.getAttribute('data-status');
            if (filterValue === 'all' || status === filterValue) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        if (commercializedBanner) {
            if (filterValue === 'commercialized') {
                commercializedBanner.style.display = 'block';
            } else {
                commercializedBanner.style.display = 'none';
            }
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            applyProductFilter(filterValue);
        });
    });

    // Initialize default filter state on DOM load
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    if (activeFilterBtn) {
        applyProductFilter(activeFilterBtn.getAttribute('data-filter'));
    }

    // ==========================================
    // PRODUCT MODALS CONTROLLER
    // ==========================================
    const modalTriggers = document.querySelectorAll('.product-modal-trigger');
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock body scroll
            }
        });
    });
    
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock body scroll
    };
    
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal by clicking outside content card
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Dynamic thumbnails in modal
    const thumbnails = document.querySelectorAll('.modal-thumb');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            const parentModal = thumb.closest('.modal');
            const mainImg = parentModal.querySelector('.modal-main-img');
            
            // Remove active class from sibling thumbnails
            const siblingThumbs = parentModal.querySelectorAll('.modal-thumb');
            siblingThumbs.forEach(t => t.classList.remove('active'));
            
            thumb.classList.add('active');
            mainImg.src = thumb.src;
        });
    });

    // ==========================================
    // LIGHTBOX GALLERY FOR CERTIFICATES
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const href = trigger.getAttribute('src') || trigger.getAttribute('href');
            
            // Verify if link points to image
            if (href && (href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.png'))) {
                lightboxImg.src = href;
                lightboxTitle.textContent = trigger.getAttribute('data-title') || 'Certificate View';
                lightboxDesc.textContent = trigger.getAttribute('data-desc') || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => closeModal(m));
            closeLightbox();
        }
    });

    // ==========================================
    // PUBLICATIONS SEARCH & PAGINATION ENGINE
    // ==========================================
    const searchInput = document.getElementById('pub-search');
    const yearFilter = document.getElementById('pub-year-filter');
    const typeFilter = document.getElementById('pub-type-filter');
    const pubListContainer = document.getElementById('pub-list-container');
    const visibleCountText = document.getElementById('visible-pubs-count');
    const totalCountText = document.getElementById('total-pubs-count');
    const paginationContainer = document.getElementById('pub-pagination');
    
    let allPublications = [];
    let filteredPublications = [];
    let currentPage = 1;
    const itemsPerPage = 8;
    
    // Classification heuristic for publications
    const getPublicationType = (pub) => {
        const publicationField = (pub.Publication || '').toLowerCase();
        const titleField = (pub.Title || '').toLowerCase();
        const publisherField = (pub.Publisher || '').toLowerCase();
        
        if (publicationField.includes('journal') || 
            publicationField.includes('transactions') || 
            publicationField.includes('letters') || 
            publicationField.includes('ieee access') || 
            publicationField.includes('mdpi') || 
            publicationField.includes('elsevier') || 
            publicationField.includes('springer') ||
            publicationField.includes('wiley') ||
            publicationField.includes('neural computing') ||
            publicationField.includes('science') ||
            publicationField.includes('biomedicine') ||
            publicationField.includes('rehabilitation') ||
            publicationField.includes('technology') ||
            publicationField.includes('forecasting') ||
            publicationField.includes('studies')) {
            return 'journal';
        }
        
        if (publicationField.includes('conference') || 
            publicationField.includes('proceedings') || 
            publicationField.includes('wocn') || 
            publicationField.includes('tencon') || 
            publicationField.includes('congress') || 
            publicationField.includes('symposium') || 
            publicationField.includes('workshop') ||
            publicationField.includes('aisgsc')) {
            return 'conference';
        }
        
        if (publicationField.includes('chapter') || 
            publicationField.includes('book') || 
            titleField.includes('getting started with enterprise internet of things') ||
            titleField.includes('artificial intelligence, smart grid and smart city applications')) {
            return 'book';
        }
        
        // Default based on publisher or standard index
        if (publisherField.includes('ieee') || publisherField.includes('springer')) {
            return 'conference'; // typical default for raw computer science publications
        }
        
        return 'journal';
    };

    // Heuristic helper to categorize publications for the donut chart index breakdown
    const getChartCategory = (pub) => {
        const q = pub.Quartile || 'Others';
        const type = getPublicationType(pub);
        
        if (q.includes('Q1') || q.includes('Q2') || q.includes('Q3') || q.includes('Q4')) {
            return 'Quartile Journals (Q1-Q4)';
        }
        
        const pubName = (pub.Publication || '').toLowerCase();
        const publisher = (pub.Publisher || '').toLowerCase();
        
        const isScopus = pubName.includes('springer') || pubName.includes('ieee') || 
                        pubName.includes('elsevier') || pubName.includes('scopus') ||
                        publisher.includes('ieee') || publisher.includes('springer') ||
                        publisher.includes('elsevier') || publisher.includes('acm');
                        
        if (type === 'journal') {
            return isScopus ? 'Scopus Indexed Journals' : 'Google Scholar Indexed Journals';
        } else {
            return isScopus ? 'Scopus Indexed Conferences' : 'Google Scholar Indexed Conferences';
        }
    };

    // Dynamic Donut Chart Recalculation Engine
    const updateDonutChart = () => {
        const total = filteredPublications.length;
        
        // Count occurrences
        let counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Others: 0 };
        filteredPublications.forEach(pub => {
            const q = pub.Quartile || 'Others';
            if (q.includes('Q1')) counts.Q1++;
            else if (q.includes('Q2')) counts.Q2++;
            else if (q.includes('Q3')) counts.Q3++;
            else if (q.includes('Q4')) counts.Q4++;
            else counts.Others++;
        });
        
        const denom = total || 1;
        const p = {
            Q1: counts.Q1 / denom,
            Q2: counts.Q2 / denom,
            Q3: counts.Q3 / denom,
            Q4: counts.Q4 / denom,
            Others: counts.Others / denom
        };
        
        // Circumference (2 * PI * 30)
        const C = 188.496;
        
        const w = {
            Q1: p.Q1 * C,
            Q2: p.Q2 * C,
            Q3: p.Q3 * C,
            Q4: p.Q4 * C,
            Others: p.Others * C
        };
        
        const offset = {
            Q1: 0,
            Q2: -w.Q1,
            Q3: -(w.Q1 + w.Q2),
            Q4: -(w.Q1 + w.Q2 + w.Q3),
            Others: -(w.Q1 + w.Q2 + w.Q3 + w.Q4)
        };
        
        // Update circle slices
        const updateSlice = (id, width, off, count) => {
            const slice = document.getElementById(id);
            if (slice) {
                if (count === 0 || total === 0) {
                    slice.setAttribute('stroke-dasharray', `0 ${C}`);
                } else {
                    slice.setAttribute('stroke-dasharray', `${width.toFixed(2)} ${C}`);
                    slice.setAttribute('stroke-dashoffset', off.toFixed(2));
                }
            }
        };
        
        updateSlice('donut-q1', w.Q1, offset.Q1, counts.Q1);
        updateSlice('donut-q2', w.Q2, offset.Q2, counts.Q2);
        updateSlice('donut-q3', w.Q3, offset.Q3, counts.Q3);
        updateSlice('donut-q4', w.Q4, offset.Q4, counts.Q4);
        updateSlice('donut-others', w.Others, offset.Others, counts.Others);
        
        // Update Legend
        const updateLegendItem = (countId, pctId, count, percentage) => {
            const cntSpan = document.getElementById(countId);
            const pctSpan = document.getElementById(pctId);
            if (cntSpan) cntSpan.textContent = count;
            if (pctSpan) pctSpan.textContent = total > 0 ? `(${(percentage * 100).toFixed(1)}%)` : '(0.0%)';
        };
        
        updateLegendItem('leg-cnt-q1', 'leg-pct-q1', counts.Q1, p.Q1);
        updateLegendItem('leg-cnt-q2', 'leg-pct-q2', counts.Q2, p.Q2);
        updateLegendItem('leg-cnt-q3', 'leg-pct-q3', counts.Q3, p.Q3);
        updateLegendItem('leg-cnt-q4', 'leg-pct-q4', counts.Q4, p.Q4);
        updateLegendItem('leg-cnt-others', 'leg-pct-others', counts.Others, p.Others);
        
        // Update Center Value
        const centerVal = document.getElementById('donut-center-val');
        const centerLbl = document.getElementById('donut-center-lbl');
        if (centerVal) centerVal.textContent = total;
        
        // Setup Hover Behaviors
        const setupHover = (sliceId, labelText, countVal) => {
            const slice = document.getElementById(sliceId);
            if (slice) {
                slice.onmouseenter = () => {
                    if (centerVal) {
                        centerVal.textContent = countVal;
                        centerVal.style.fill = slice.getAttribute('stroke');
                    }
                    if (centerLbl) {
                        centerLbl.textContent = labelText;
                        centerLbl.style.fontSize = '2.8px'; // Slightly larger for better readability
                    }
                    slice.style.strokeWidth = '21px';
                };
                slice.onmouseleave = () => {
                    if (centerVal) {
                        centerVal.textContent = total;
                        centerVal.style.fill = 'var(--text-primary)';
                    }
                    if (centerLbl) {
                        centerLbl.textContent = 'Publications';
                        centerLbl.style.fontSize = '3.8px'; // Matches default inlined value
                    }
                    slice.style.strokeWidth = '16px';
                };
            }
        };
        
        setupHover('donut-q1', 'Q1 Journals', counts.Q1);
        setupHover('donut-q2', 'Q2 Journals', counts.Q2);
        setupHover('donut-q3', 'Q3 Journals', counts.Q3);
        setupHover('donut-q4', 'Q4 Journals', counts.Q4);
        setupHover('donut-others', 'Others (Conf/Unranked)', counts.Others);
    };

   // Inline publications database (prevents CORS fetch blocks when index.html is opened directly via file://)
    const publicationsDb = [
  {
    "Authors": "Jayashree, LS; Arumugam, S; Rajathi, N;",
    "Title": "E/sup 2/LBC: an energy efficient load balanced clustering technique for heterogeneous wireless sensor networks",
    "Publication": "2006 IFIP International Conference on Wireless and Optical Communications Networks",
    "Volume": "",
    "Number": "",
    "Pages": "7 pp.-7",
    "Year": "2006",
    "Publisher": "IEEE",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, LS; Arumugam, S; Anusha, M; Hariny, AB;",
    "Title": "On the accuracy of centroid based multilateration procedure for location discovery in wireless sensor networks",
    "Publication": "2006 IFIP international conference on wireless and optical communications networks",
    "Volume": "",
    "Number": "",
    "Pages": "6 pp.-6",
    "Year": "2006",
    "Publisher": "IEEE",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, LS; Arumugam, S; Vijayalakshmi, K;",
    "Title": "A robust outlier detection scheme for collaborative sensor networks",
    "Publication": "Journal of Digital Information Management",
    "Volume": "5",
    "Number": "1",
    "Pages": "12",
    "Year": "2007",
    "Publisher": "Digital Information Research Foundation",
    "Quartile": "Q4"
  },
  {
    "Authors": "Jayashree, LS; Arumugam, S;",
    "Title": "Design challenges for optimizing the performance of energy constrained wireless sensor networks",
    "Publication": "\"2007 International Conference on Signal Processing\",\" Communications and Networking\"",
    "Volume": "",
    "Number": "",
    "Pages": "537-540",
    "Year": "2007",
    "Publisher": "IEEE",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, LS; Yamini, VK; Priya, R Manju;",
    "Title": "A Communication Efficient Framework for Soil Moisture Monitoring using Wireless Sensor Networks",
    "Publication": "International Journal of Computer Applications",
    "Volume": "975",
    "Number": "",
    "Pages": "8887",
    "Year": "2010",
    "Publisher": "\"International Journal of Computer Applications\", 244 5 th Avenue,# 1526,\" New\"",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Jayashree, LS; Arumugam, S; Meenakshi, AR;",
    "Title": "A communication?efficient framework for outlier?free data reporting in data?gathering sensor networks",
    "Publication": "International Journal of Network Management",
    "Volume": "18",
    "Number": "5",
    "Pages": "437-445",
    "Year": "2008",
    "Publisher": "\"John Wiley & Sons\", Ltd. Chichester,\" UK\"",
    "Quartile": "Q2"
  },
  {
    "Authors": "Akila, K; Jayashree, LS; Vasuki, A;",
    "Title": "Mammographic image enhancement using indirect contrast enhancement techniquesa comparative study",
    "Publication": "Procedia Computer Science",
    "Volume": "47",
    "Number": "",
    "Pages": "255-261",
    "Year": "2015",
    "Publisher": "Elsevier",
    "Quartile": "Q2"
  },
  {
    "Authors": "Elpiniki I. Papageorgiou, Jayashree Subramanian, Akila Karmegam, Nikolaos Papandrianos;",
    "Title": "A Risk Management Model for Familial Breast Cancer: A New Application using Fuzzy Cognitive Map method",
    "Publication": "Computer Methods and Programmes in Bio-medicine",
    "Volume": "122",
    "Number": "2",
    "Pages": "123135",
    "Year": "2015",
    "Publisher": "Elsevier",
    "Quartile": "Q1"
  },
  {
    "Authors": "5. Jayashree Subramanian a, Akila Karmegam b, Elpiniki Papageorgiou c, Nikolaos Papandrianosd, A. Vasukie;",
    "Title": "An Integrated breast cancer risk assessment and Risk Management model based on Fuzzy Cognitive Maps",
    "Publication": "Computer Methods and Programmes in Bio-medicine",
    "Volume": "118",
    "Number": "3",
    "Pages": "280297",
    "Year": "2015",
    "Publisher": "Elsevier",
    "Quartile": "Q1"
  },
  {
    "Authors": "L. S. Jayashree, Nidhil Palakkal, Elpiniki I. Papageorgiou, Konstantinos Papageorgiou;",
    "Title": "Application of Fuzzy Cognitive Maps for Coconut yield management in Malabar region of Southern India",
    "Publication": "Neural Computing and Application",
    "Volume": "26",
    "Number": "8",
    "Pages": "1963-1978",
    "Year": "2015",
    "Publisher": "Springer",
    "Quartile": "Q1"
  },
  {
    "Authors": "L.S Jayashree, Lakshmi Devi.R, Dinesh.R;",
    "Title": "Early Warning System  for Dengue outbreak- a preliminary approach using time series forecasting",
    "Publication": "International Journal of Applied Engineering Research",
    "Volume": "10",
    "Number": "4",
    "Pages": "",
    "Year": "2015",
    "Publisher": "",
    "Quartile": "Q4"
  },
  {
    "Authors": "Jayashree, C. Padmavathy and L.S.;",
    "Title": "A Computer-assisted Crack Predicting System for Oil and Gas Pipelines Using Fuzzy Cognitive Map",
    "Publication": "European Journal of Applied Science",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2015",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "M.Soundaryadevi, Dr.L.S.Jayashree;",
    "Title": "Clustering of Data with Mixed Attributes based on Unified Similarity Metric",
    "Publication": "International Journal of Innovative Research in Computer and Communication Engineering",
    "Volume": "2",
    "Number": "1",
    "Pages": "",
    "Year": "2014",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "L.S.Jayashree V.K.Yamini, R.Manju Priya;",
    "Title": "Communication Efficient Spatial-Temporal Correlation aware Soil Moisture Monitoring Framework using Wireless Sensor Networks",
    "Publication": "\"International Journal of Computer Applications (0975-8887)\",\" electrical & Telecommunication Engineering\"",
    "Volume": "1",
    "Number": "",
    "Pages": "",
    "Year": "2013",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree L.S., Arumugam S.and Vijayalakshmi K;",
    "Title": "An Efficient and Fault Tolerant Aggregation Scheme for Distributed Sensor Networks using Modified Z-Score Method",
    "Publication": "\"International Journal of Systemics\",\" Cybernetics and Informatics\"",
    "Volume": "",
    "Number": "",
    "Pages": "76-81",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Jayashree L.S., Arumugam S.and Rajathi N;",
    "Title": "ESAC: An Energy and Stability Aware Clustering for Heterogeneous Wireless Sensor Networks",
    "Publication": "Journal of Computer Science",
    "Volume": "1",
    "Number": "",
    "Pages": "421-429",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Q4"
  },
  {
    "Authors": "Arumugam S, Jayashree L.S. and;",
    "Title": "Design Optimizations in Clustered Wireless Sensor Networks: A Survey",
    "Publication": "Indian Journal of Computing Technology",
    "Volume": "1",
    "Number": "2",
    "Pages": "Jan-14",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "N.Rajathi, Dr.L.S.Jayashree;",
    "Title": "Soil Moisture Forecasting using Ensembles of Classifiers",
    "Publication": "International Conference on Information and Communication Technology for Intelligent Systems(ICTIS 2015)",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2015",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "N.Rajathi Dr.L.S.Jayashree, R.Vijayakumari;",
    "Title": "Communication  Efficient  Spatial-Temporal  Correlation  aware  Soil  Moisture Monitoring Framework using Wireless Sensor Networks",
    "Publication": "\"National Ground Water Conference on Problems\",\" Challenges and Management of Groundwater in Agriculture\"",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2014",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "N.Rajathi Dr.L.S.Jayashree, R.Vijayakumari;",
    "Title": "Spatial-Temporal Correlation Aware Soil Moisture monitoring Framework using Wireless Sensor networks",
    "Publication": "23rd edition of Indian Engineering Congress",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2014",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, L S;",
    "Title": "Home Energy Management for Energy Conservation using Wireless Sensor Networks",
    "Publication": "23rd edition of Indian Engineering Congress",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2014",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Arumugam S, Vijayalakshmi and Jayashree L.S. and;",
    "Title": "Robust Data Aggregation Techniques in Wireless Sensor Networks",
    "Publication": "RTCNC 2006",
    "Volume": "",
    "Number": "",
    "Pages": "120-127",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Rajathi N., Jayashree L.S. and Arumugam S;",
    "Title": "Clustering Techniques in Wireless Sensor Networks",
    "Publication": "Proceedings of RTCNC 2006",
    "Volume": "",
    "Number": "",
    "Pages": "149-157",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Roopa Chandrika, Jayashree L.S.and Arumugam S;",
    "Title": "Coverage Problem in Wireless Sensor Networks",
    "Publication": "RTCNC 2006",
    "Volume": "",
    "Number": "",
    "Pages": "252-258",
    "Year": "2006",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree L.S., Arumugam S. and Vijayalakshmi K;",
    "Title": "A Report on Secure Information Processing in Wireless Sensor Networks",
    "Publication": "International Conference on Information Security (ICIS05)",
    "Volume": "",
    "Number": "",
    "Pages": "192-198",
    "Year": "2005",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Livinsa, Z Mary; Jayashri, S;",
    "Title": "LS and MMSE based Localization Algorithm for WSNs amid obstacles",
    "Publication": "Indian Journal of Computer Science and Engineering",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2014",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Suganya, R; Jayashree, LS;",
    "Title": "Measuring Various Conflict Decision Policies in Mobile Ad Hoc Networks",
    "Publication": "International Journal of Applied Engineering Research",
    "Volume": "11",
    "Number": "2",
    "Pages": "927-933",
    "Year": "2016",
    "Publisher": "",
    "Quartile": "Q4"
  },
  {
    "Authors": "Jayashree, LS; Palakkal, Nidhil; Papageorgiou, Elpiniki I; Papageorgiou, Konstantinos;",
    "Title": "Application of fuzzy cognitive maps in precision agriculture: a case study on coconut yield management of southern Indias Malabar region",
    "Publication": "Neural Computing and Applications",
    "Volume": "26",
    "Number": "8",
    "Pages": "1963-1978",
    "Year": "2015",
    "Publisher": "Springer London London",
    "Quartile": "Q1"
  },
  {
    "Authors": "Sennipppan, Jayashree Subramanian  Vijayalakshmi;",
    "Title": "Application of fuzzy cognitive maps for crack categorization in columns of reinforced concrete structures",
    "Publication": "Neural Computing   & Applications",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2016",
    "Publisher": "Springer",
    "Quartile": "Q1"
  },
  {
    "Authors": "Padmavathy, C; Jayashree, LS;",
    "Title": "An enhanced delay sensitive data packet scheduling algorithm to maximizing the network lifetime",
    "Publication": "Wireless Personal Communications",
    "Volume": "94",
    "Number": "4",
    "Pages": "2213-2227",
    "Year": "2017",
    "Publisher": "Springer US New York",
    "Quartile": "Q2"
  },
  {
    "Authors": "C. Padmavathy, L.S. Jayashree;",
    "Title": "A Computer-assisted Crack Predicting System for Oil and Gas Pipelines Using Fuzzy Cognitive Map",
    "Publication": "European Journal of Applied Sciences",
    "Volume": "7",
    "Number": "3",
    "Pages": "145-151",
    "Year": "2015",
    "Publisher": "European Journal of Applied Sciences",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Rajathi Natarajan , Jayashree Subramanian, Elpiniki I. Papageorgiou;",
    "Title": "Hybrid learning of fuzzy cognitive maps for sugarcane yield classification",
    "Publication": "Computers and Electronics in Agriculture",
    "Volume": "127",
    "Number": "",
    "Pages": "147-157",
    "Year": "2016",
    "Publisher": "Elsevier",
    "Quartile": "Q1"
  },
  {
    "Authors": "vijayalakhmi, Jayashree Subramanian;",
    "Title": "Application of fuzzy cognitive maps for crack categorization in columns of reinforced concrete structures",
    "Publication": "Neural Computing & Applications DOI 10.1007/s00521-016-2313-9",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2016",
    "Publisher": "Springer",
    "Quartile": "Q1"
  },
  {
    "Authors": "Rajathi, N; Jayashree, LS;",
    "Title": "Energy efficient grid clustering based data aggregation in wireless sensor networks",
    "Publication": "2016 IEEE region 10 conference (TENCON)",
    "Volume": "",
    "Number": "",
    "Pages": "488-492",
    "Year": "2016",
    "Publisher": "IEEE",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, LS; Rajathi, N; Thirumal, Athish;",
    "Title": "Precision agriculture: On the accuracy of multilevel and clustered ANFIS models for sugarcane yield categorization",
    "Publication": "2016 IEEE Region 10 Conference (TENCON)",
    "Volume": "",
    "Number": "",
    "Pages": "1983-1987",
    "Year": "2016",
    "Publisher": "IEEE",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Akila, K; Jayashree, LS; Vasuki, A;",
    "Title": "A hybrid image enhancement scheme for mammographic images",
    "Publication": "Advances in Natural and Applied Sciences",
    "Volume": "10",
    "Number": "6 SE",
    "Pages": "26-30",
    "Year": "2016",
    "Publisher": "American-Eurasian Network for Scientific Information",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Suganya, R; Jayashree, LS;",
    "Title": "An Erlang Factor integrated channel allocation method for boosting quality of services in mobile ad hoc networks",
    "Publication": "Computers & Electrical Engineering",
    "Volume": "66",
    "Number": "",
    "Pages": "139-148",
    "Year": "2018",
    "Publisher": "Pergamon",
    "Quartile": "Q1"
  },
  {
    "Authors": "Jayashree, LS; Lakshmi Devi, R; Papandrianos, Nikolaos; Papageorgiou, Elpiniki I;",
    "Title": "Application of Fuzzy Cognitive Map for geospatial dengue outbreak risk prediction of tropical regions of Southern India",
    "Publication": "Intelligent Decision Technologies",
    "Volume": "12",
    "Number": "2",
    "Pages": "231-250",
    "Year": "2018",
    "Publisher": "\"SAGE Publications Sage UK: London\",\" England\"",
    "Quartile": "Q4"
  },
  {
    "Authors": "Suganya, R; Jayashree, LS;",
    "Title": "Fuzzy rough set inspired rate adaptation and resource allocation using Hidden Markov Model (FRSIRA-HMM) in mobile ad hoc networks",
    "Publication": "Cluster Computing",
    "Volume": "22",
    "Number": "Suppl 4",
    "Pages": "9875-9888",
    "Year": "2019",
    "Publisher": "Springer US New York",
    "Quartile": "Q2"
  },
  {
    "Authors": "Anthony, L Britto; Jayashree, LS;",
    "Title": "Comfort Management and Energy Conservation for Smart Home Environment Using Reinforcement Learning Technique",
    "Publication": "Conference on Big Data and Cloud Computing 2017",
    "Volume": "",
    "Number": "",
    "Pages": "65",
    "Year": "",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Lakshmi Devi, R; Jayashree, LS;",
    "Title": "Grey Wolf Optimization-Based Big Data Analytics for Dengue Outbreak Prediction",
    "Publication": "Advances in Big Data and Cloud Computing",
    "Volume": "",
    "Number": "",
    "Pages": "385-393",
    "Year": "2018",
    "Publisher": "Springer Singapore Singapore",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Padmavathy, C; Jayashree, LS; Rosario, A;",
    "Title": "Combined vibration and RF harvester technique for energy management in sensor device",
    "Publication": "International Journal of Networking and Virtual Organisations",
    "Volume": "19",
    "Number": "02-Apr",
    "Pages": "196-208",
    "Year": "2018",
    "Publisher": "Inderscience Publishers (IEL)",
    "Quartile": "Q4"
  },
  {
    "Authors": "Ammal, S Meenakshi; Jayashree, LS;",
    "Title": "A Risk Assessment Model for Alzheimers Disease Using Fuzzy Cognitive Map",
    "Publication": "Advances in Computerized Analysis in Clinical and Medical Imaging",
    "Volume": "",
    "Number": "",
    "Pages": "209-220",
    "Year": "2019",
    "Publisher": "Chapman and Hall/CRC",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Ammal, S Meenakshi; Jayashree, LS;",
    "Title": "Early detection of cognitive impairment of elders using wearable sensors",
    "Publication": "Systems Simulation and Modeling for Cloud Computing and Big Data Applications",
    "Volume": "",
    "Number": "",
    "Pages": "147-159",
    "Year": "2020",
    "Publisher": "Academic Press",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Selvakumar, G; Jayashree, LS;",
    "Title": "Agile supply chain management enabled by the internet of things and microservices",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "449-456",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Swathi, S; Jayashree, LS;",
    "Title": "Machine translation using deep learning: A comparison",
    "Publication": "\"International conference on artificial intelligence\",\" smart grid and smart city applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "389-395",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Iswarya, N; Jayashree, LS;",
    "Title": "Spectrum Sensing Based on Cascaded Approach for Cognitive Radios",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "467-479",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Anand Prabu, P; Jayashree, LS;",
    "Title": "\"A smart agricultural model using iot\", mobile,\" and cloud-based predictive data analytics\"",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "383-387",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Priya, MC Shunmuga; Jayashree, LS;",
    "Title": "A Survey on Medical Image Registration Using Deep Learning Techniques",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "505-511",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "Safest Secure and Consistent Data Services in the Storage of Cloud Computing",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "433-447",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jaswanth, S; Jayashree, LS;",
    "Title": "Agent-Based Temperature Monitoring System",
    "Publication": "\"International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications\"",
    "Volume": "",
    "Number": "",
    "Pages": "513-520",
    "Year": "2019",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2020",
    "Publisher": "Springer International Publishing",
    "Quartile": "Book Publication"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "The Internet of Things: Connectivity Standards",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "Jan-30",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Enterprise IoT development platforms",
    "Publication": "Getting started with enterprise Internet of Things: design approaches and software architecture models",
    "Volume": "",
    "Number": "",
    "Pages": "129-142",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Architecture for an Enterprise IoT",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "97-110",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Design and Implementation of Enterprise IoT Solutions",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "111-128",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Cloud Solutions for IoT",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "31-48",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Introduction to Enterprise IoT",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "71-96",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Jayashree, LS; Selvakumar, G;",
    "Title": "Edge computing in IoT",
    "Publication": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
    "Volume": "",
    "Number": "",
    "Pages": "49-69",
    "Year": "2020",
    "Publisher": "Springer International Publishing Cham",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Kumar, L Ashok; Jayashree, LS; Manimegalai, R;",
    "Title": "\"Proceedings of international conference on artificial intelligence\",\" smart grid and smart city applications: AISGSC 2019\"",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2020",
    "Publisher": "Springer",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "\"Impact of AI\",\" BC and IoT for Smart Cities\"",
    "Publication": "\"Blockchain\", Internet of Things,\" and Artificial Intelligence\"",
    "Volume": "",
    "Number": "",
    "Pages": "179-204",
    "Year": "2021",
    "Publisher": "Chapman and Hall/CRC",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Madhana, K; Jayashree, LS;",
    "Title": "Role of Edge Computing to Leverage IoT-Assisted AAL Ecosystem",
    "Publication": "\"Research Anthology on Edge Computing Protocols\", Applications,\" and Integration\"",
    "Volume": "",
    "Number": "",
    "Pages": "594-618",
    "Year": "2022",
    "Publisher": "IGI Global Scientific Publishing",
    "Quartile": "Book Chapter / Series"
  },
  {
    "Authors": "Soundaryadevi, M; Jayashree, LS;",
    "Title": "Forecasting Energy Demands based on Ensemble of Classifiers",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2015",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Iswarya, N; Jayashree, LS;",
    "Title": "A survey on successive interference cancellation schemes in non-orthogonal multiple access for future radio access",
    "Publication": "Wireless Personal Communications",
    "Volume": "120",
    "Number": "2",
    "Pages": "1057-1078",
    "Year": "2021",
    "Publisher": "Springer US",
    "Quartile": "Q2"
  },
  {
    "Authors": "Akila, K; Jayashree, LS; Vasuki, A;",
    "Title": "AUTOMATED INTEGRATED CLUSTERING ALGORITHM FOR MAMMOGRAPHIC MASS SEGMENTATION",
    "Publication": "Pakistan Journal of Biotechnology",
    "Volume": "14",
    "Number": "Special II",
    "Pages": "06-Sep",
    "Year": "2017",
    "Publisher": "",
    "Quartile": "Q4"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "A survey on user privacy preserving blockchain for health insurance using Ethereum smart contract",
    "Publication": "\"International Journal of Information Privacy\",\" Security and Integrity\"",
    "Volume": "5",
    "Number": "2",
    "Pages": "111-137",
    "Year": "2021",
    "Publisher": "Inderscience Publishers (IEL)",
    "Quartile": "Q4"
  },
  {
    "Authors": "Vijayalakshmi, S; Jayashree, LS;",
    "Title": "Application of soft computing techniques for intelligent sensor data aggregation in structural health monitoring",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2017",
    "Publisher": "ANNA UNIVERSITY",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Akila, K; Jayashree, LS;",
    "Title": "Early detection of breast cancer Using image processing algorithms And estimation of overall risk",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2017",
    "Publisher": "Anna University",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Rajathi, N; Jayashree, LS;",
    "Title": "Certain investigations on application of soft computing techniques for sensor data processing in precision agriculture applications",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2017",
    "Publisher": "ANNA UNIVERSITY",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "Ethereum blockchain-based authentication approach for Data Sharing in Cloud Storage Model",
    "Publication": "Cybernetics and Systems",
    "Volume": "54",
    "Number": "6",
    "Pages": "961-984",
    "Year": "2023",
    "Publisher": "Taylor & Francis",
    "Quartile": "Q2"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "Fusion of Blockchain-IoT network to improve supply chain traceability using E thermint Smart chain: A Review.",
    "Publication": "KSII Transactions on Internet & Information Systems",
    "Volume": "16",
    "Number": "11",
    "Pages": "",
    "Year": "2022",
    "Publisher": "",
    "Quartile": "Q3"
  },
  {
    "Authors": "Kumar, V; Troussas, C;",
    "Title": "Springer: Cham",
    "Publication": "Proceedings of the International Conference on Industrial and Manufacturing Systems (CIMS-",
    "Volume": "",
    "Number": "",
    "Pages": "409-419",
    "Year": "2020",
    "Publisher": "",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "Selvakumar, G; Jayashree, LS; Arumugam, S;",
    "Title": "Latency Minimization Using an Adaptive Load Balancing Technique in Microservices Applications.",
    "Publication": "Comput. Syst. Sci. Eng.",
    "Volume": "46",
    "Number": "1",
    "Pages": "1215-1231",
    "Year": "2023",
    "Publisher": "",
    "Quartile": "Q2"
  },
  {
    "Authors": "Madhana, K; Jayashree, LS; Perumal, Kalaivani;",
    "Title": "System for classification of human gaits using markerless motion capture sensor",
    "Publication": "Journal of Enabling Technologies",
    "Volume": "17",
    "Number": "2",
    "Pages": "41-53",
    "Year": "2023",
    "Publisher": "Emerald Publishing Limited",
    "Quartile": "Q2"
  },
  {
    "Authors": "Jayashree, LS; Madhana, K; Kumar, V Preethish; Swathi, S; Soundharyan, P;",
    "Title": "A Quantitative Gait Assessment Approach Using a Wearable Device and Its Validation for Different Neurological Disorder Conditions",
    "Publication": "Topics in Geriatric Rehabilitation",
    "Volume": "40",
    "Number": "1",
    "Pages": "19-36",
    "Year": "2024",
    "Publisher": "LWW",
    "Quartile": "Q4"
  },
  {
    "Authors": "Malarvizhi, K; Jayashree, LS;",
    "Title": "RETRACTED ARTICLE: Dynamic scheduling and congestion control for minimizing delay in multihop wireless networks",
    "Publication": "Journal of Ambient Intelligence and Humanized Computing",
    "Volume": "12",
    "Number": "3",
    "Pages": "3949-3957",
    "Year": "2021",
    "Publisher": "Springer Nature BV",
    "Quartile": "Q1 (Retracted)"
  },
  {
    "Authors": "Kumar, L Ashok; Jayashree, LS; Manimegalai, R;",
    "Title": "AISGSC 2019",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "",
    "Publisher": "",
    "Quartile": "Others"
  },
  {
    "Authors": "George, Geethu Mary; Jayashree, LS;",
    "Title": "in the Storage of Cloud Computing",
    "Publication": "\"Proceedings of International Conference on Artificial Intelligence\",\" Smart Grid and Smart City Applications: AISGSC 2019\"",
    "Volume": "",
    "Number": "",
    "Pages": "433",
    "Year": "2020",
    "Publisher": "Springer Nature",
    "Quartile": "Conference Proceedings"
  },
  {
    "Authors": "MICHAEL GNANARAJ, SHERLIN JENIFER; Jayashree, LS;",
    "Title": "Advancing Cardiac Assessment Through Computational Synthesis in Seismocardiography",
    "Publication": "Available at SSRN 5153389",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "",
    "Publisher": "",
    "Quartile": "Preprint Server"
  },
  {
    "Authors": "Jayashree, LS;",
    "Title": "Longitudinal Study of Mitral Valve Stenosis Prognosis using Deep Learning Techniques",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "2025",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  },
  {
    "Authors": "Lakshman Prabhu, B; Jayashree, LS;",
    "Title": "Medical Image Enhancement for Improved Diagnostic Accuracy Using Generative Adversarial Network",
    "Publication": "",
    "Volume": "",
    "Number": "",
    "Pages": "",
    "Year": "",
    "Publisher": "",
    "Quartile": "Unranked / Non-indexed"
  }
];


        
    const renderPublications = () => {
        pubListContainer.innerHTML = '';
        visibleCountText.textContent = filteredPublications.length;
        
        if (filteredPublications.length === 0) {
            pubListContainer.innerHTML = `
                <div class="pub-loading">
                    <i class="fa-solid fa-magnifying-glass-minus"></i> No publications found matching your search and filter criteria.
                </div>`;
            paginationContainer.innerHTML = '';
            return;
        }
        
        // Calculate items for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredPublications.length);
        const pageItems = filteredPublications.slice(startIndex, endIndex);
        
        // Render cards
        pageItems.forEach(pub => {
            const pubType = getPublicationType(pub);
            const pubCard = document.createElement('article');
            pubCard.className = 'pub-card';
            
            // Format authors list for citation style (bolding Jayashree L S)
            let authorsFormatted = pub.Authors || 'Jayashree, L. S.';
            authorsFormatted = authorsFormatted.replace(/(Jayashree,\s*L\.?\s*S\.?|Jayashree,\s*LS|Jayashree\s*L\s*S|Jayashree\s*Subramanian)/g, '<strong>$1</strong>');
            
            // Build publication details text
            let detailParts = [];
            if (pub.Publication) detailParts.push(pub.Publication);
            if (pub.Volume) detailParts.push(`vol. ${pub.Volume}`);
            if (pub.Number) detailParts.push(`no. ${pub.Number}`);
            if (pub.Pages) detailParts.push(`pp. ${pub.Pages}`);
            if (pub.Publisher) detailParts.push(pub.Publisher);
            
            const typeLabelClass = pubType === 'journal' ? 'journal' : (pubType === 'conference' ? 'conference' : 'journal');
            const typeLabelText = pubType === 'journal' ? 'Journal' : (pubType === 'conference' ? 'Conference' : 'Book Chapter');
            
            pubCard.innerHTML = `
                <div class="pub-title-row">
                    <span class="pub-meta-tag ${typeLabelClass}">${typeLabelText}</span>
                    <span class="pub-meta-tag year">${pub.Year || 'N/A'}</span>
                    <h3 class="pub-card-title">${pub.Title || 'Untitled Research'}</h3>
                </div>
                <p class="pub-authors">${authorsFormatted}</p>
                <p class="pub-details">${detailParts.join(', ')}</p>
                <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                    <a href="https://scholar.google.com/scholar?q=${encodeURIComponent('L S Jayashree ' + pub.Title)}" target="_blank" style="font-size: 0.8rem; font-weight: 600; color: var(--accent-color); display: inline-flex; align-items: center; gap: 4px;" class="pub-scholar-link">
                        <i class="fa-solid fa-square-arrow-up-right"></i> View on Google Scholar
                    </a>
                </div>
            `;
            
            pubListContainer.appendChild(pubCard);
        });
        
        renderPagination();
    };
    
    const renderPagination = () => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
        
        if (totalPages <= 1) return;
        
        // Helper button
        const createPageButton = (page, text, isActive = false) => {
            const button = document.createElement('button');
            button.className = `page-btn ${isActive ? 'active' : ''}`;
            button.textContent = text || page;
            button.addEventListener('click', () => {
                currentPage = page;
                renderPublications();
                // Scroll to top of publications section
                document.getElementById('publications').scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(button);
        };
        
        // Prev button
        if (currentPage > 1) {
            createPageButton(currentPage - 1, '<');
        }
        
        // Page buttons (smart range sizing)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i, null, i === currentPage);
        }
        
        // Next button
        if (currentPage < totalPages) {
            createPageButton(currentPage + 1, '>');
        }
    };
    
    // Event listeners for search and filters
    const filterAndSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        const yearVal = yearFilter.value;
        const typeVal = typeFilter.value;
        
        filteredPublications = allPublications.filter(pub => {
            // Check Search query
            const matchesQuery = !query || 
                (pub.Title || '').toLowerCase().includes(query) ||
                (pub.Authors || '').toLowerCase().includes(query) ||
                (pub.Publication || '').toLowerCase().includes(query) ||
                (pub.Publisher || '').toLowerCase().includes(query);
                
            // Check Year filter
            const matchesYear = yearVal === 'all' || pub.Year === yearVal;
            
            // Check Type filter
            const pubType = getPublicationType(pub);
            const matchesType = typeVal === 'all' || pubType === typeVal;
            
            return matchesQuery && matchesYear && matchesType;
        });
        
        currentPage = 1; // Reset to page 1
        renderPublications();
        updateDonutChart();
    };
    
    searchInput.addEventListener('input', filterAndSearch);
    yearFilter.addEventListener('change', filterAndSearch);
    typeFilter.addEventListener('change', filterAndSearch);

    // Sort publications by year descending (Executed after all functions are initialized to prevent hoisting ReferenceError)
    allPublications = publicationsDb.sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return yearB - yearA;
    });
    
    filteredPublications = [...allPublications];
    totalCountText.textContent = allPublications.length;
    
    // Populate Year Filter dropdown dynamically
    const years = [...new Set(allPublications.map(p => p.Year).filter(Boolean))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Initial render
    renderPublications();
    updateDonutChart();

    // ==========================================
    // CONTACT FORM INTERACTION
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show sending state
            formFeedback.className = 'form-feedback';
            formFeedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending message...';
            
            // Mock network call
            setTimeout(() => {
                formFeedback.className = 'form-feedback success';
                formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully.';
                contactForm.reset();
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    formFeedback.innerHTML = '';
                }, 5000);
            }, 1200);
        });
    }


    // ==========================================
    // SCROLL REVEAL OBSERVER (ADDED)
    // ==========================================
    const revealSections = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters the viewport
    });
    
    revealSections.forEach(sec => {
        revealObserver.observe(sec);
    });

    // ==========================================
    // COUNT-UP ANIMATION FOR METRICS (ADDED)
    // ==========================================
    const counterElements = document.querySelectorAll('.counter-animate');
    
    const animateCounter = (el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
        const duration = 1500; // 1.5s animation duration
        let startTime = null;
        
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quad formula
            const easedProgress = progress * (2 - progress);
            const currentVal = easedProgress * target;
            
            el.textContent = currentVal.toFixed(decimals) + suffix;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals) + suffix;
            }
        };
        
        window.requestAnimationFrame(step);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.2
    });
    
    counterElements.forEach(el => {
        counterObserver.observe(el);
    });


    // ==========================================
    // PDF MODAL VIEW ENGINE (ADDED)
    // ==========================================
    const pdfModal = document.getElementById('pdf-viewer-modal');
    const pdfIframe = document.getElementById('pdf-viewer-iframe');
    const pdfTitle = document.getElementById('pdf-viewer-title');
    const pdfClose = document.getElementById('pdf-viewer-close');
    
    // Intercept clicks on links pointing to PDF files
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href') || '';
        if (href.toLowerCase().endsWith('.pdf')) {
            // Check if mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (!isMobile) {
                e.preventDefault();
                // Get human readable title
                let title = link.getAttribute('data-title') || link.textContent.trim() || 'PDF Document';
                // Remove extra whitespace or icon characters
                title = title.replace(/\s+/g, ' ');
                
                pdfTitle.textContent = title;
                pdfIframe.src = href;
                pdfModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
    
    const closePdfModal = () => {
        if (pdfModal) {
            pdfModal.classList.remove('active');
            pdfIframe.src = ''; // Clear source to stop load
            document.body.style.overflow = '';
        }
    };
    
    if (pdfClose) pdfClose.addEventListener('click', closePdfModal);
    if (pdfModal) {
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                closePdfModal();
            }
        });
    }


    // ==========================================
    // HERO BACKGROUND PARALLAX/ROLLOVER EFFECT (ADDED)
    // ==========================================
    const heroSection = document.getElementById('hero');
    const backgroundOrbs = document.querySelectorAll('.orb');
    
    if (heroSection && backgroundOrbs.length > 0) {
        heroSection.addEventListener('mousemove', (e) => {
            const { width, height } = heroSection.getBoundingClientRect();
            // Calculate distance from center (range: -0.5 to 0.5)
            const mouseX = (e.clientX / width) - 0.5;
            const mouseY = (e.clientY / height) - 0.5;
            
            backgroundOrbs.forEach((orb, index) => {
                // Different depth multipliers for parallax layering
                const depth = (index + 1) * 22;
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;
                orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
        
        // Reset orb positions smoothly when mouse leaves hero bounds
        heroSection.addEventListener('mouseleave', () => {
            backgroundOrbs.forEach(orb => {
                orb.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                orb.style.transform = 'translate(0, 0)';
            });
        });
        
        // Disable transitions on mouse enter to avoid drag lag
        heroSection.addEventListener('mouseenter', () => {
            backgroundOrbs.forEach(orb => {
                orb.style.transition = 'transform 0.1s ease-out';
            });
        });
    }



});
