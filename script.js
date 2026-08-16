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
            if (filterValue === 'all' || status === filterValue || (filterValue === 'completed' && status === 'commercialized')) {
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
        "Title": "Mammographic image enhancement using indirect contrast enhancement techniques-a comparative study",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:vV6vV6tmYwMC",
        "Authors": "K Akila, LS Jayashree, A Vasuki",
        "Source": "Procedia Computer Science 47, 255-261, 2015",
        "Citations": 124,
        "Year": "2015",
        "Quartile": "Q2"
      },
      {
        "Title": "Hybrid learning of fuzzy cognitive maps for sugarcane yield classification",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:EUQCXRtRnyEC",
        "Authors": "EIP Rajathi Natarajan , Jayashree Subramanian",
        "Source": "Computers and Electronics in Agriculture 127, 147-157, 2016",
        "Citations": 93,
        "Year": "2016",
        "Quartile": "Q1"
      },
      {
        "Title": "An Integrated breast cancer risk assessment and Risk Management model based on Fuzzy Cognitive Maps",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:70eg2SAEIzsC",
        "Authors": "AV 5. Jayashree Subramanian a, Akila Karmegam b, Elpiniki Papageorgiou c ...",
        "Source": "Computer Methods and Programmes in Bio-medicine 118 (3), 280-297, 2015",
        "Citations": 86,
        "Year": "2015",
        "Quartile": "Q1"
      },
      {
        "Title": "A Risk Management Model for Familial Breast Cancer: A New Application using Fuzzy Cognitive Map method",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:35N4QoGY0k4C",
        "Authors": "Elpiniki I. Papageorgiou, Jayashree Subramanian, Akila Karmegam, Nikolaos ...",
        "Source": "Computer Methods and Programmes in Bio-medicine 122 (2), 123-135, 2015",
        "Citations": 84,
        "Year": "2015",
        "Quartile": "Q1"
      },
      {
        "Title": "A survey on successive interference cancellation schemes in non-orthogonal multiple access for future radio access",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:eJXPG6dFmWUC",
        "Authors": "N Iswarya, LS Jayashree",
        "Source": "Wireless Personal Communications 120 (2), 1057-1078, 2021",
        "Citations": 57,
        "Year": "2021",
        "Quartile": "Q2"
      },
      {
        "Title": "Application of fuzzy cognitive maps in precision agriculture: a case study on coconut yield management of southern India’s Malabar region",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:pyW8ca7W8N0C",
        "Authors": "LS Jayashree, N Palakkal, EI Papageorgiou, K Papageorgiou",
        "Source": "Neural Computing and Applications 26 (8), 1963-1978, 2015",
        "Citations": 46,
        "Year": "2015",
        "Quartile": "Q1"
      },
      {
        "Title": "Springer: Cham",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:WA5NYHcadZ8C",
        "Authors": "V Kumar, C Troussas",
        "Source": "Proceedings of the International Conference on Industrial and Manufacturing …, 2020",
        "Citations": 33,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Application of fuzzy cognitive maps for crack categorization in columns of reinforced concrete structures",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:f2IySw72cVMC",
        "Authors": "JSV Sennipppan",
        "Source": "Neural Computing   &amp; Applications, 2016",
        "Citations": 31,
        "Year": "2016",
        "Quartile": "Q1"
      },
      {
        "Title": "On the accuracy of centroid based multilateration procedure for location discovery in wireless sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:u-x6o8ySG0sC",
        "Authors": "LS Jayashree, S Arumugam, M Anusha, AB Hariny",
        "Source": "2006 IFIP international conference on wireless and optical communications …, 2006",
        "Citations": 24,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "Application of Fuzzy Cognitive Map for geospatial dengue outbreak risk prediction of tropical regions of Southern India",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:1sJd4Hv_s6UC",
        "Authors": "LS Jayashree, R Lakshmi Devi, N Papandrianos, EI Papageorgiou",
        "Source": "Intelligent Decision Technologies 12 (2), 231-250, 2018",
        "Citations": 23,
        "Year": "2018",
        "Quartile": "Q4"
      },
      {
        "Title": "E/sup 2/LBC: an energy efficient load balanced clustering technique for heterogeneous wireless sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:u5HHmVD_uO8C",
        "Authors": "LS Jayashree, S Arumugam, N Rajathi",
        "Source": "2006 IFIP International Conference on Wireless and Optical Communications …, 2006",
        "Citations": 19,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "Fusion of Blockchain-IoT network to improve supply chain traceability using E thermint Smart chain: A Review.",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:t6usbXjVLHcC",
        "Authors": "GM George, LS Jayashree",
        "Source": "KSII Transactions on Internet &amp; Information Systems 16 (11), 2022",
        "Citations": 16,
        "Year": "2022",
        "Quartile": "Q3"
      },
      {
        "Title": "Getting Started with Enterprise Internet of Things: Design Approaches and Software Architecture Models",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:08ZZubdj9fEC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Springer International Publishing, 2020",
        "Citations": 12,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Latency Minimization Using an Adaptive Load Balancing Technique in Microservices Applications.",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:Mojj43d5GZwC",
        "Authors": "G Selvakumar, LS Jayashree, S Arumugam",
        "Source": "Comput. Syst. Sci. Eng. 46 (1), 1215-1231, 2023",
        "Citations": 11,
        "Year": "2023",
        "Quartile": "Q2"
      },
      {
        "Title": "Agile supply chain management enabled by the internet of things and microservices",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:u9iWguZQMMsC",
        "Authors": "G Selvakumar, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 9,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "Ethereum blockchain-based authentication approach for Data Sharing in Cloud Storage Model",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:olpn-zPbct0C",
        "Authors": "GM George, LS Jayashree",
        "Source": "Cybernetics and Systems 54 (6), 961-984, 2023",
        "Citations": 8,
        "Year": "2023",
        "Quartile": "Q2"
      },
      {
        "Title": "Precision agriculture: On the accuracy of multilevel and clustered ANFIS models for sugarcane yield categorization",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:NhqRSupF_l8C",
        "Authors": "LS Jayashree, N Rajathi, A Thirumal",
        "Source": "2016 IEEE Region 10 Conference (TENCON), 1983-1987, 2016",
        "Citations": 8,
        "Year": "2016",
        "Quartile": "Others"
      },
      {
        "Title": "Machine translation using deep learning: A comparison",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:XiSMed-E-HIC",
        "Authors": "S Swathi, LS Jayashree",
        "Source": "International conference on artificial intelligence, smart grid and smart …, 2019",
        "Citations": 7,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "Proceedings of international conference on artificial intelligence, smart grid and smart city applications: AISGSC 2019",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:5Ul4iDaHHb8C",
        "Authors": "LA Kumar, LS Jayashree, R Manimegalai",
        "Source": "Springer, 2020",
        "Citations": 6,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "An enhanced delay sensitive data packet scheduling algorithm to maximizing the network lifetime",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:bFI3QPDXJZMC",
        "Authors": "C Padmavathy, LS Jayashree",
        "Source": "Wireless Personal Communications 94 (4), 2213-2227, 2017",
        "Citations": 6,
        "Year": "2017",
        "Quartile": "Q2"
      },
      {
        "Title": "Energy efficient grid clustering based data aggregation in wireless sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:abG-DnoFyZgC",
        "Authors": "N Rajathi, LS Jayashree",
        "Source": "2016 IEEE region 10 conference (TENCON), 488-492, 2016",
        "Citations": 6,
        "Year": "2016",
        "Quartile": "Others"
      },
      {
        "Title": "A communication‐efficient framework for outlier‐free data reporting in data‐gathering sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:qjMakFHDy7sC",
        "Authors": "LS Jayashree, S Arumugam, AR Meenakshi",
        "Source": "International Journal of Network Management 18 (5), 437-445, 2008",
        "Citations": 6,
        "Year": "2008",
        "Quartile": "Q2"
      },
      {
        "Title": "Early detection of cognitive impairment of elders using wearable sensors",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:p2g8aNsByqUC",
        "Authors": "SM Ammal, LS Jayashree",
        "Source": "Systems Simulation and Modeling for Cloud Computing and Big Data …, 2020",
        "Citations": 5,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Fuzzy rough set inspired rate adaptation and resource allocation using Hidden Markov Model (FRSIRA-HMM) in mobile ad hoc networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:P5F9QuxV20EC",
        "Authors": "R Suganya, LS Jayashree",
        "Source": "Cluster Computing 22 (Suppl 4), 9875-9888, 2019",
        "Citations": 5,
        "Year": "2019",
        "Quartile": "Q1"
      },
      {
        "Title": "An Erlang Factor integrated channel allocation method for boosting quality of services in mobile ad hoc networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:CHSYGLWDkRkC",
        "Authors": "R Suganya, LS Jayashree",
        "Source": "Computers &amp; Electrical Engineering 66, 139-148, 2018",
        "Citations": 5,
        "Year": "2018",
        "Quartile": "Q1"
      },
      {
        "Title": "Edge computing in IoT",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:8AbLer7MMksC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 4,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "A hybrid image enhancement scheme for mammographic images",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:xtRiw3GOFMkC",
        "Authors": "K Akila, LS Jayashree, A Vasuki",
        "Source": "Advances in Natural and Applied Sciences 10 (6 SE), 26-30, 2016",
        "Citations": 4,
        "Year": "2016",
        "Quartile": "Others"
      },
      {
        "Title": "A Communication Efficient Framework for Soil Moisture Monitoring using Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:2osOgNQ5qMEC",
        "Authors": "LS Jayashree, VK Yamini, RM Priya",
        "Source": "International Journal of Computer Applications 975, 8887, 2010",
        "Citations": 4,
        "Year": "2010",
        "Quartile": "Others"
      },
      {
        "Title": "Design challenges for optimizing the performance of energy constrained wireless sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:9yKSN-GCB0IC",
        "Authors": "LS Jayashree, S Arumugam",
        "Source": "2007 International Conference on Signal Processing, Communications and …, 2007",
        "Citations": 4,
        "Year": "2007",
        "Quartile": "Others"
      },
      {
        "Title": "System for classification of human gaits using markerless motion capture sensor",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:eMMeJKvmdy0C",
        "Authors": "K Madhana, LS Jayashree, K Perumal",
        "Source": "Journal of Enabling Technologies 17 (2), 41-53, 2023",
        "Citations": 3,
        "Year": "2023",
        "Quartile": "Q3"
      },
      {
        "Title": "Cloud Solutions for IoT",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:sSrBHYA8nusC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 3,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Enterprise IoT development platforms",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:tS2w5q8j5-wC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting started with enterprise Internet of Things: design approaches and …, 2020",
        "Citations": 3,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Grey Wolf Optimization-Based Big Data Analytics for Dengue Outbreak Prediction",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:KxtntwgDAa4C",
        "Authors": "R Lakshmi Devi, LS Jayashree",
        "Source": "Advances in Big Data and Cloud Computing, 385-393, 2018",
        "Citations": 3,
        "Year": "2018",
        "Quartile": "Others"
      },
      {
        "Title": "Soil Moisture Forecasting using Ensembles of Classifiers",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:3s1wT3WcHBgC",
        "Authors": "DLSJ N.Rajathi",
        "Source": "International Conference on Information and Communication Technology for …, 2015",
        "Citations": 3,
        "Year": "2015",
        "Quartile": "Others"
      },
      {
        "Title": "LS and MMSE based Localization Algorithm for WSNs amid obstacles",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:yD5IFk8b50cC",
        "Authors": "ZM Livinsa, S Jayashri",
        "Source": "Indian Journal of Computer Science and Engineering, 2014",
        "Citations": 3,
        "Year": "2014",
        "Quartile": "Others"
      },
      {
        "Title": "A robust outlier detection scheme for collaborative sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:d1gkVwhDpl0C",
        "Authors": "LS Jayashree, S Arumugam, K Vijayalakshmi",
        "Source": "Journal of Digital Information Management 5 (1), 12, 2007",
        "Citations": 3,
        "Year": "2007",
        "Quartile": "Q4"
      },
      {
        "Title": "A survey on user privacy preserving blockchain for health insurance using Ethereum smart contract",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:V3AGJWp-ZtQC",
        "Authors": "GM George, LS Jayashree",
        "Source": "International Journal of Information Privacy, Security and Integrity 5 (2 …, 2021",
        "Citations": 2,
        "Year": "2021",
        "Quartile": "Others"
      },
      {
        "Title": "Design and Implementation of Enterprise IoT Solutions",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:B3FOqHPlNUQC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 2,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Combined vibration and RF harvester technique for energy management in sensor device",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:UxriW0iASnsC",
        "Authors": "C Padmavathy, LS Jayashree, A Rosario",
        "Source": "International Journal of Networking and Virtual Organisations 19 (2-4), 196-208, 2018",
        "Citations": 2,
        "Year": "2018",
        "Quartile": "Q4"
      },
      {
        "Title": "A Computer-assisted Crack Predicting System for Oil and Gas Pipelines Using Fuzzy Cognitive Map",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:_xSYboBqXhAC",
        "Authors": "LSJ C. Padmavathy",
        "Source": "European Journal of Applied Sciences 7 (3), 145-151, 2015",
        "Citations": 0,
        "Year": "2015",
        "Quartile": "Others"
      },
      {
        "Title": "A Computer-assisted Crack Predicting System for Oil and Gas Pipelines Using Fuzzy Cognitive Map",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:M05iB0D1s5AC",
        "Authors": "CPLS Jayashree",
        "Source": "European Journal of Applied Science, 2015",
        "Citations": 2,
        "Year": "2015",
        "Quartile": "Others"
      },
      {
        "Title": "Clustering of Data with Mixed Attributes based on Unified Similarity Metric",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:g5m5HwL7SMYC",
        "Authors": "DLSJ M.Soundaryadevi",
        "Source": "International Journal of Innovative Research in Computer and Communication …, 2014",
        "Citations": 2,
        "Year": "2014",
        "Quartile": "Others"
      },
      {
        "Title": "A Quantitative Gait Assessment Approach Using a Wearable Device and Its Validation for Different Neurological Disorder Conditions",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:eq2jaN3J8jMC",
        "Authors": "LS Jayashree, K Madhana, VP Kumar, S Swathi, P Soundharyan",
        "Source": "Topics in Geriatric Rehabilitation 40 (1), 19-36, 2024",
        "Citations": 1,
        "Year": "2024",
        "Quartile": "Q3"
      },
      {
        "Title": "Role of Edge Computing to Leverage IoT-Assisted AAL Ecosystem",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:fQNAKQ3IYiAC",
        "Authors": "K Madhana, LS Jayashree",
        "Source": "Research Anthology on Edge Computing Protocols, Applications, and …, 2022",
        "Citations": 1,
        "Year": "2022",
        "Quartile": "Others"
      },
      {
        "Title": "Introduction to Enterprise IoT",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:geHnlv5EZngC",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 1,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "Safest Secure and Consistent Data Services in the Storage of Cloud Computing",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:K3LRdlH-MEoC",
        "Authors": "GM George, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 1,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "A smart agricultural model using iot, mobile, and cloud-based predictive data analytics",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:WbkHhVStYXYC",
        "Authors": "P Anand Prabu, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 1,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "Longitudinal Study of Mitral Valve Stenosis Prognosis using Deep Learning Techniques",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:N5tVd3kTz84C",
        "Authors": "LS Jayashree",
        "Source": "",
        "Citations": 0,
        "Year": "2025",
        "Quartile": "Others"
      },
      {
        "Title": "Impact of AI, BC and IoT for Smart Cities",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:LPZeul_q3PIC",
        "Authors": "GM George, LS Jayashree",
        "Source": "Blockchain, Internet of Things, and Artificial Intelligence, 179-204, 2021",
        "Citations": 0,
        "Year": "2021",
        "Quartile": "Others"
      },
      {
        "Title": "Architecture for an Enterprise IoT",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:4fKUyHm3Qg0C",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 0,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "The Internet of Things: Connectivity Standards",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:vRqMK49ujn8C",
        "Authors": "LS Jayashree, G Selvakumar",
        "Source": "Getting Started with Enterprise Internet of Things: Design Approaches and …, 2020",
        "Citations": 0,
        "Year": "2020",
        "Quartile": "Others"
      },
      {
        "Title": "in the Storage of Cloud Computing",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:ye4kPcJQO24C",
        "Authors": "GM George, LS Jayashree",
        "Source": "Proceedings of International Conference on Artificial Intelligence, Smart …, 2020",
        "Citations": 0,
        "Year": "2020",
        "Quartile": "Book Chapter / Series"
      },
      {
        "Title": "A Risk Assessment Model for Alzheimer’s Disease Using Fuzzy Cognitive Map",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:uWQEDVKXjbEC",
        "Authors": "SM Ammal, LS Jayashree",
        "Source": "Advances in Computerized Analysis in Clinical and Medical Imaging, 209-220, 2019",
        "Citations": 0,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "Agent-Based Temperature Monitoring System",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:l7t_Zn2s7bgC",
        "Authors": "S Jaswanth, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 0,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "A Survey on Medical Image Registration Using Deep Learning Techniques",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:738O_yMBCRsC",
        "Authors": "MCS Priya, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 0,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "Spectrum Sensing Based on Cascaded Approach for Cognitive Radios",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:Tiz5es2fbqcC",
        "Authors": "N Iswarya, LS Jayashree",
        "Source": "International Conference on Artificial Intelligence, Smart Grid and Smart …, 2019",
        "Citations": 0,
        "Year": "2019",
        "Quartile": "Others"
      },
      {
        "Title": "AUTOMATED INTEGRATED CLUSTERING ALGORITHM FOR MAMMOGRAPHIC MASS SEGMENTATION",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:kRWSkSYxWN8C",
        "Authors": "K Akila, LS Jayashree, A Vasuki",
        "Source": "Pakistan Journal of Biotechnology 14 (Special II), 6-9, 2017",
        "Citations": 0,
        "Year": "2017",
        "Quartile": "Q4"
      },
      {
        "Title": "Early detection of breast cancer Using image processing algorithms And estimation of overall risk",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:J-pR_7NvFogC",
        "Authors": "K Akila, LS Jayashree",
        "Source": "Anna University, 2017",
        "Citations": 0,
        "Year": "2017",
        "Quartile": "Others"
      },
      {
        "Title": "Certain investigations on application of soft computing techniques for sensor data processing in precision agriculture applications",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:wbdj-CoPYUoC",
        "Authors": "N Rajathi, LS Jayashree",
        "Source": "ANNA UNIVERSITY, 2017",
        "Citations": 0,
        "Year": "2017",
        "Quartile": "Others"
      },
      {
        "Title": "Application of soft computing techniques for intelligent sensor data aggregation in structural health monitoring",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:1qzjygNMrQYC",
        "Authors": "S Vijayalakshmi, LS Jayashree",
        "Source": "ANNA UNIVERSITY, 2017",
        "Citations": 0,
        "Year": "2017",
        "Quartile": "Others"
      },
      {
        "Title": "Application of fuzzy cognitive maps for crack categorization in columns of reinforced concrete structures",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:b0M2c_1WBrUC",
        "Authors": "JS vijayalakhmi",
        "Source": "Neural Computing &amp; Applications DOI 10.1007/s00521-016-2313-9, 2016",
        "Citations": 0,
        "Year": "2016",
        "Quartile": "Q1"
      },
      {
        "Title": "Measuring Various Conflict Decision Policies in Mobile Ad Hoc Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:a0OBvERweLwC",
        "Authors": "R Suganya, LS Jayashree",
        "Source": "International Journal of Applied Engineering Research 11 (2), 927-933, 2016",
        "Citations": 0,
        "Year": "2016",
        "Quartile": "Q3"
      },
      {
        "Title": "Application of Fuzzy Cognitive Maps for Coconut yield management in Malabar region of Southern India",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:2P1L_qKh6hAC",
        "Authors": "KP L. S. Jayashree, Nidhil Palakkal, Elpiniki I. Papageorgiou",
        "Source": "Neural Computing and Application 26 (8), 1963-1978, 2015",
        "Citations": 0,
        "Year": "2015",
        "Quartile": "Q1"
      },
      {
        "Title": "Early Warning System  for Dengue outbreak- a preliminary approach using time series forecasting",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:ldfaerwXgEUC",
        "Authors": "DR L.S Jayashree, Lakshmi Devi.R",
        "Source": "International Journal of Applied Engineering Research 10 (4), 2015",
        "Citations": 0,
        "Year": "2015",
        "Quartile": "Q3"
      },
      {
        "Title": "Forecasting Energy Demands based on Ensemble of Classifiers",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:VOx2b1Wkg3QC",
        "Authors": "M Soundaryadevi, LS Jayashree",
        "Source": "",
        "Citations": 0,
        "Year": "2015",
        "Quartile": "Others"
      },
      {
        "Title": "Home Energy Management for Energy Conservation using Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:u_35RYKgDlwC",
        "Authors": "LS Jayashree",
        "Source": "23rd edition of Indian Engineering Congress, 2014",
        "Citations": 0,
        "Year": "2014",
        "Quartile": "Others"
      },
      {
        "Title": "Spatial-Temporal Correlation Aware Soil Moisture monitoring Framework using Wireless Sensor networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:zA6iFVUQeVQC",
        "Authors": "RV N.Rajathi Dr.L.S.Jayashree",
        "Source": "23rd edition of Indian Engineering Congress, 2014",
        "Citations": 0,
        "Year": "2014",
        "Quartile": "Others"
      },
      {
        "Title": "Communication  Efficient  Spatial-Temporal  Correlation  aware  Soil  Moisture Monitoring Framework using Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:rO6llkc54NcC",
        "Authors": "RV N.Rajathi Dr.L.S.Jayashree",
        "Source": "National Ground Water Conference on Problems, Challenges and Management of …, 2014",
        "Citations": 0,
        "Year": "2014",
        "Quartile": "Others"
      },
      {
        "Title": "Communication Efficient Spatial-Temporal Correlation aware Soil Moisture Monitoring Framework using Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:pqnbT2bcN3wC",
        "Authors": "RMP L.S.Jayashree V.K.Yamini",
        "Source": "International Journal of Computer Applications (0975-8887), electrical …, 2013",
        "Citations": 0,
        "Year": "2013",
        "Quartile": "Others"
      },
      {
        "Title": "Coverage Problem in Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:dfsIfKJdRG4C",
        "Authors": "JLSAS Roopa Chandrika",
        "Source": "RTCNC 2006, 252-258, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "Clustering Techniques in Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:4OULZ7Gr8RgC",
        "Authors": "JLSAS Rajathi N.",
        "Source": "Proceedings of RTCNC 2006, 149-157, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "Robust Data Aggregation Techniques in Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:fPk4N6BV_jEC",
        "Authors": "VJLS Arumugam S",
        "Source": "RTCNC 2006, 120-127, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "Design Optimizations in Clustered Wireless Sensor Networks: A Survey",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:ZHo1McVdvXMC",
        "Authors": "JLS Arumugam S",
        "Source": "Indian Journal of Computing Technology 1 (2), 1-14, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "ESAC: An Energy and Stability Aware Clustering for Heterogeneous Wireless Sensor Networks’",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:SeFeTyx0c_EC",
        "Authors": "ASRN Jayashree L.S.",
        "Source": "Journal of Computer Science 1, 421-429, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Q4"
      },
      {
        "Title": "An Efficient and Fault Tolerant Aggregation Scheme for Distributed Sensor Networks using Modified Z-Score Method",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:HoB7MX3m0LUC",
        "Authors": "ASVK Jayashree L.S.",
        "Source": "International Journal of Systemics, Cybernetics and Informatics, 76-81, 2006",
        "Citations": 0,
        "Year": "2006",
        "Quartile": "Others"
      },
      {
        "Title": "A Report on Secure Information Processing in Wireless Sensor Networks",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:cFHS6HbyZ2cC",
        "Authors": "ASVK Jayashree L.S.",
        "Source": "International Conference on Information Security (ICIS’05), 192-198, 2005",
        "Citations": 0,
        "Year": "2005",
        "Quartile": "Others"
      },
      {
        "Title": "Medical Image Enhancement for Improved Diagnostic Accuracy Using Generative Adversarial Network",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:ZuybSZzF8UAC",
        "Authors": "B Lakshman Prabhu, LS Jayashree",
        "Source": "",
        "Citations": 0,
        "Year": "",
        "Quartile": "Others"
      },
      {
        "Title": "Advancing Cardiac Assessment Through Computational Synthesis in Seismocardiography",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:VL0QpB8kHFEC",
        "Authors": "SJ MICHAEL GNANARAJ, LS Jayashree",
        "Source": "Available at SSRN 5153389, 0",
        "Citations": 0,
        "Year": "",
        "Quartile": "Others"
      },
      {
        "Title": "AISGSC 2019",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:WqliGbK-hY8C",
        "Authors": "LA Kumar, LS Jayashree, R Manimegalai",
        "Source": "",
        "Citations": 0,
        "Year": "",
        "Quartile": "Book Chapter / Series"
      },
      {
        "Title": "Comfort Management and Energy Conservation for Smart Home Environment Using Reinforcement Learning Technique",
        "Link": "https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=mmNPmLoAAAAJ&amp;pagesize=100&amp;citation_for_view=mmNPmLoAAAAJ:nb7KW1ujOQ8C",
        "Authors": "LB Anthony, LS Jayashree",
        "Source": "Conference on Big Data and Cloud Computing 2017, 65, 0",
        "Citations": 0,
        "Year": "",
        "Quartile": "Others"
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

    // ==========================================
    // DYNAMIC FOOTER COPYRIGHT YEAR & IMAGE FALLBACKS
    // ==========================================
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }

    // Global SVG image fallback handler for missing external image assets
    const svgFallback = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23111827'/%3E%3Cpath d='M130 80 L170 80 L170 120 L130 120 Z' stroke='%234285F4' stroke-width='3' fill='none'/%3E%3Ccircle cx='150' cy='100' r='10' fill='%234285F4'/%3E%3Ctext x='150' y='150' font-size='12' fill='%239ca3af' text-anchor='middle' font-family='sans-serif'%3EImage Preview Unavailable%3C/text%3E%3C/svg%3E";

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = 'true';
                img.src = svgFallback;
                img.style.objectFit = 'cover';
            }
        });
    });

});

