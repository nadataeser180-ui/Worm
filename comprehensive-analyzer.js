// ===================================
// محلل الرابط الشامل - جمع كل المعلومات
// ===================================

class ComprehensiveURLAnalyzer {
    constructor(url) {
        this.url = url;
        this.results = {
            urlInfo: {},
            domainInfo: {},
            serverInfo: {},
            technologies: [],
            security: {},
            dns: {},
            whois: {},
            seo: {},
            performance: {},
            socialLinks: [],
            emailAddresses: [],
            phoneNumbers: [],
            apis: [],
            subdomains: [],
            metadata: {},
            images: [],
            links: [],
            headers: {},
            ssl: {},
            location: {}
        };
    }

    /**
     * تنفيذ التحليل الكامل
     */
    async analyze() {
        console.log('🔍 بدء التحليل الشامل للرابط:', this.url);
        
        try {
            // 1. تحليل الرابط الأساسي
            this.analyzeBasicURL();
            
            // 2. جلب معلومات الصفحة
            const pageContent = await this.fetchPageContent();
            
            // 3. استخراج جميع المعلومات من الصفحة
            if (pageContent) {
                this.extractFromPageContent(pageContent);
            }
            
            // 4. جلب معلومات Domain/DNS
            await this.fetchDomainInfo();
            
            // 5. جلب معلومات Whois
            await this.fetchWhoisInfo();
            
            // 6. كشف التكنولوجيات
            this.detectAllTechnologies(pageContent);
            
            // 7. تحليل الأمان والشهادات
            this.analyzeSecurity();
            
            // 8. استخراج البيانات الوصفية المتقدمة
            this.extractAdvancedMetadata(pageContent);
            
            // 9. تجميع النتائج
            return this.compileResults();
            
        } catch (error) {
            console.error('❌ خطأ في التحليل:', error);
            return {
                error: error.message,
                partialResults: this.results
            };
        }
    }

    /**
     * 1. تحليل الرابط الأساسي
     */
    analyzeBasicURL() {
        try {
            let urlToAnalyze = this.url;
            if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
                urlToAnalyze = 'https://' + urlToAnalyze;
            }

            const urlObj = new URL(urlToAnalyze);
            
            this.results.urlInfo = {
                originalURL: this.url,
                fullURL: urlObj.href,
                protocol: urlObj.protocol.replace(':', ''),
                hostname: urlObj.hostname,
                domain: this.extractDomain(urlObj.hostname),
                subdomain: this.extractSubdomain(urlObj.hostname),
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname,
                queryString: urlObj.search,
                fragment: urlObj.hash,
                queryParameters: this.extractQueryParams(urlObj),
                isSecure: urlObj.protocol === 'https:',
                isIP: this.isIPAddress(urlObj.hostname),
                ipVersion: this.getIPVersion(urlObj.hostname)
            };

        } catch (error) {
            console.error('خطأ في تحليل الرابط:', error);
        }
    }

    /**
     * 2. جلب محتوى الصفحة
     */
    async fetchPageContent() {
        try {
            // استخدام CORS proxy للالتفاف حول قيود CORS
            const proxyURL = `https://cors-anywhere.herokuapp.com/`;
            const response = await fetch(proxyURL + this.results.urlInfo.fullURL, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('⚠️ تعذر جلب محتوى الصفحة مباشرة، سيتم محاولة طرق بديلة:', error);
            
            // محاولة بديلة باستخدام API أخرى
            return await this.fetchViaAlternativeAPI();
        }
    }

    /**
     * جلب المحتوى عبر API بديلة
     */
    async fetchViaAlternativeAPI() {
        try {
            // API لجلب معلومات الموقع
            const domain = this.results.urlInfo.domain;
            
            // محاولة استخدام APIs متعددة
            const apis = [
                `https://api.api-ninjas.com/v1/webscraper?url=${this.results.urlInfo.fullURL}`,
                `https://extraction.api.scrapehero.com/fetch?url=${this.results.urlInfo.fullURL}`,
            ];

            for (let apiUrl of apis) {
                try {
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.content) return data.content;
                    }
                } catch (e) {
                    // تجربة API التالية
                    continue;
                }
            }

            return null;
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            return null;
        }
    }

    /**
     * 3. استخراج البيانات من محتوى الصفحة
     */
    extractFromPageContent(html) {
        const parser = new DOMParser();
        
        try {
            // محاولة تحليل HTML
            const doc = parser.parseFromString(html, 'text/html');
            
            // استخراج العناوين
            this.results.metadata.title = doc.querySelector('title')?.textContent || '';
            
            // استخراج meta tags
            this.extractMetaTags(doc);
            
            // استخراج الروابط والصور
            this.extractLinks(doc);
            this.extractImages(doc);
            
            // استخراج جهات الاتصال
            this.extractContactInfo(html);
            
            // استخراج الأكواد والنصوص
            this.extractScriptInfo(doc);
            
        } catch (error) {
            // إذا فشل parsing، نحلل كـ text
            this.extractFromPlainText(html);
        }
    }

    /**
     * استخراج Meta Tags
     */
    extractMetaTags(doc) {
        const metas = {
            description: '',
            keywords: '',
            author: '',
            language: 'ar',
            charset: '',
            viewport: '',
            robots: '',
            openGraph: {},
            twitterCard: {},
            custom: {}
        };

        doc.querySelectorAll('meta').forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');

            if (name && content) {
                if (name === 'description') metas.description = content;
                else if (name === 'keywords') metas.keywords = content;
                else if (name === 'author') metas.author = content;
                else if (name === 'viewport') metas.viewport = content;
                else if (name === 'robots') metas.robots = content;
                else if (name.startsWith('og:')) metas.openGraph[name] = content;
                else if (name.startsWith('twitter:')) metas.twitterCard[name] = content;
                else metas.custom[name] = content;
            }
        });

        this.results.metadata = { ...this.results.metadata, ...metas };
    }

    /**
     * استخراج الروابط
     */
    extractLinks(doc) {
        const links = {
            external: [],
            internal: [],
            social: [],
            emails: [],
            phones: []
        };

        const domain = this.results.urlInfo.domain;

        doc.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();

            if (href) {
                // فحص نوع الرابط
                if (href.includes('mailto:')) {
                    links.emails.push(href.replace('mailto:', ''));
                } else if (href.includes('tel:')) {
                    links.phones.push(href.replace('tel:', ''));
                } else if (href.includes(domain)) {
                    links.internal.push({ url: href, text });
                } else if (href.startsWith('http') || href.startsWith('//')) {
                    links.external.push({ url: href, text });
                    
                    // فحص وسائل التواصل الاجتماعي
                    if (this.isSocialLink(href)) {
                        links.social.push({ platform: this.extractSocialPlatform(href), url: href });
                    }
                }
            }
        });

        this.results.links = links;
        this.results.socialLinks = links.social;
        this.results.emailAddresses = links.emails;
        this.results.phoneNumbers = links.phones;
    }

    /**
     * استخراج الصور
     */
    extractImages(doc) {
        const images = [];
        
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt');
            const title = img.getAttribute('title');

            if (src) {
                images.push({
                    url: this.resolveURL(src),
                    alt: alt || '',
                    title: title || '',
                    width: img.getAttribute('width'),
                    height: img.getAttribute('height')
                });
            }
        });

        // استخراج صور من CSS backgrounds
        doc.querySelectorAll('[style*="background-image"]').forEach(el => {
            const match = el.getAttribute('style').match(/url\((['"]?)([^)]+)\1\)/);
            if (match) {
                images.push({
                    url: this.resolveURL(match[2]),
                    type: 'background',
                    element: el.tagName
                });
            }
        });

        this.results.images = images;
    }

    /**
     * استخراج معلومات الاتصال
     */
    extractContactInfo(html) {
        const emails = [];
        const phones = [];

        // استخراج البريد الإلكتروني
        const emailRegex = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const foundEmails = html.match(emailRegex);
        if (foundEmails) {
            emails.push(...[...new Set(foundEmails)]);
        }

        // استخراج أرقام الهاتف (صيغ مختلفة)
        const phoneRegex = /(?:\+\d{1,3})?[\s.-]?\(?(?:\d{1,4})\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}/g;
        const foundPhones = html.match(phoneRegex);
        if (foundPhones) {
            phones.push(...[...new Set(foundPhones)].filter(p => p.length > 5));
        }

        this.results.emailAddresses = [...new Set([...this.results.emailAddresses, ...emails])];
        this.results.phoneNumbers = [...new Set([...this.results.phoneNumbers, ...phones])];
    }

    /**
     * استخراج معلومات Scripts و APIs
     */
    extractScriptInfo(doc) {
        const apis = [];
        const scripts = [];

        doc.querySelectorAll('script').forEach(script => {
            const src = script.getAttribute('src');
            const content = script.textContent;

            if (src) {
                scripts.push(src);
                
                // فحص الـ APIs المعروفة
                if (src.includes('googleapis.com')) apis.push({ name: 'Google APIs', url: src });
                if (src.includes('facebook.com')) apis.push({ name: 'Facebook SDK', url: src });
                if (src.includes('twitter.com')) apis.push({ name: 'Twitter API', url: src });
                if (src.includes('stripe.com')) apis.push({ name: 'Stripe', url: src });
                if (src.includes('gumroad.com')) apis.push({ name: 'Gumroad', url: src });
                if (src.includes('recaptcha')) apis.push({ name: 'reCAPTCHA', url: src });
            }

            // فحص محتوى الـ Script
            if (content) {
                if (content.includes('gtag') || content.includes('google-analytics')) {
                    apis.push({ name: 'Google Analytics', type: 'analytics' });
                }
            }
        });

        this.results.apis = apis;
    }

    /**
     * 4. جلب معلومات DNS و Domain
     */
    async fetchDomainInfo() {
        try {
            const domain = this.results.urlInfo.domain;
            
            // جلب معلومات DNS
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            if (dnsResponse.ok) {
                const dnsData = await dnsResponse.json();
                this.results.dns = dnsData;
            }

            // معلومات إضافية عن Domain
            this.results.domainInfo = {
                domain: domain,
                registrar: 'معلومة تتطلب API',
                registrationDate: 'معلومة تتطلب API',
                expiryDate: 'معلومة تتطلب API',
                nameServers: []
            };

        } catch (error) {
            console.warn('⚠️ تعذر جلب معلومات DNS:', error);
        }
    }

    /**
     * 5. جلب معلومات WHOIS
     */
    async fetchWhoisInfo() {
        try {
            const domain = this.results.urlInfo.domain;
            
            // جلب بيانات WHOIS من API عام
            const whoisResponse = await fetch(`https://whois.api.test/query?domain=${domain}`);
            if (whoisResponse.ok) {
                const whoisData = await whoisResponse.json();
                this.results.whois = whoisData;
            }

        } catch (error) {
            console.warn('⚠️ تعذر جلب بيانات WHOIS:', error);
        }
    }

    /**
     * 6. كشف التكنولوجيات
     */
    detectAllTechnologies(pageContent) {
        const technologies = {
            frameworks: [],
            cms: [],
            programming: [],
            servers: [],
            databases: [],
            caching: [],
            cdns: [],
            analytics: [],
            marketing: [],
            ecommerce: [],
            security: []
        };

        if (!pageContent) return;

        const content = pageContent.toLowerCase();

        // Frameworks وـ Libraries
        const frameworks = [
            { name: 'React', pattern: /_react|react\.js|\.jsx|create-react-app/ },
            { name: 'Vue.js', pattern: /vue\.js|vuex|\.vue/ },
            { name: 'Angular', pattern: /angular\.js|ng-app|\bng\b/ },
            { name: 'Next.js', pattern: /_next|next\.js/ },
            { name: 'Nuxt.js', pattern: /nuxt|__nuxt/ },
            { name: 'Svelte', pattern: /svelte/ },
            { name: 'jQuery', pattern: /jquery/ },
            { name: 'Bootstrap', pattern: /bootstrap/ },
            { name: 'Tailwind CSS', pattern: /tailwind/ }
        ];

        // CMS
        const cms = [
            { name: 'WordPress', pattern: /wp-content|wordpress|wp-json/ },
            { name: 'Joomla', pattern: /joomla/ },
            { name: 'Drupal', pattern: /drupal/ },
            { name: 'Magento', pattern: /magento/ },
            { name: 'Shopify', pattern: /shopify|myshopify/ }
        ];

        // خوادم
        const servers = [
            { name: 'Nginx', header: 'nginx' },
            { name: 'Apache', header: 'apache' },
            { name: 'IIS', header: 'microsoft-iis' },
            { name: 'Node.js', pattern: /node\.js/ }
        ];

        // تحليلات
        const analytics = [
            { name: 'Google Analytics', pattern: /ga\(|gtag\.js|google-analytics/ },
            { name: 'Mixpanel', pattern: /mixpanel/ },
            { name: 'Hotjar', pattern: /heatmap\.it/ },
            { name: 'Segment', pattern: /segment\.com/ }
        ];

        // فحص كل فئة
        for (let tech of frameworks) {
            if (tech.pattern.test(content)) {
                technologies.frameworks.push({ name: tech.name, confidence: 'عالية' });
            }
        }

        for (let c of cms) {
            if (c.pattern.test(content)) {
                technologies.cms.push({ name: c.name, confidence: 'عالية' });
            }
        }

        for (let anal of analytics) {
            if (anal.pattern.test(content)) {
                technologies.analytics.push({ name: anal.name, confidence: 'عالية' });
            }
        }

        this.results.technologies = technologies;
    }

    /**
     * 7. تحليل الأمان
     */
    analyzeSecurity() {
        this.results.security = {
            isHTTPS: this.results.urlInfo.isSecure,
            protocol: this.results.urlInfo.protocol,
            securityIcon: this.results.urlInfo.isSecure ? '🔒 آمن' : '🔓 غير آمن',
            ssl: {
                enabled: this.results.urlInfo.isSecure,
                issuer: 'معلومة تتطلب فحص الشهادة',
                expiryDate: 'معلومة تتطلب فحص الشهادة'
            },
            headers: {
                contentSecurityPolicy: false,
                xContentTypeOptions: false,
                xFrameOptions: false,
                strictTransportSecurity: this.results.urlInfo.isSecure
            }
        };
    }

    /**
     * 8. استخراج البيانات المتقدمة
     */
    extractAdvancedMetadata(pageContent) {
        if (!pageContent) return;

        // معلومات SEO
        this.results.seo = {
            robotsTxt: 'معلومة تتطلب طلب منفصل',
            sitemap: 'معلومة تتطلب طلب منفصل',
            structured_data: this.extractStructuredData(pageContent)
        };
    }

    /**
     * استخراج Structured Data (JSON-LD)
     */
    extractStructuredData(content) {
        const structuredData = [];
        const pattern = /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g;
        
        let match;
        while ((match = pattern.exec(content)) !== null) {
            try {
                const data = JSON.parse(match[1]);
                structuredData.push(data);
            } catch (e) {
                // تجاهل البيانات غير الصالحة
            }
        }

        return structuredData;
    }

    /**
     * 9. تجميع النتائج النهائية
     */
    compileResults() {
        return {
            timestamp: new Date().toISOString(),
            analysisComplete: true,
            summary: this.generateSummary(),
            fullAnalysis: this.results
        };
    }

    /**
     * توليد ملخص التحليل
     */
    generateSummary() {
        return {
            url: this.results.urlInfo.hostname,
            isSecure: this.results.urlInfo.isSecure,
            domainInfo: this.results.domainInfo,
            technologiesCount: Object.values(this.results.technologies).reduce((a, b) => a + b.length, 0),
            apisCount: this.results.apis.length,
            imagesCount: this.results.images.length,
            linksCount: this.results.links.external.length + this.results.links.internal.length,
            emailsFound: this.results.emailAddresses.length,
            phonesFound: this.results.phoneNumbers.length,
            socialMediaLinks: this.results.socialLinks.length
        };
    }

    // ===== دوال مساعدة =====

    extractDomain(hostname) {
        const parts = hostname.split('.');
        return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
    }

    extractSubdomain(hostname) {
        const parts = hostname.split('.');
        return parts.length > 2 ? parts.slice(0, -2).join('.') : null;
    }

    extractQueryParams(urlObj) {
        const params = {};
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    isIPAddress(hostname) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    }

    getIPVersion(hostname) {
        if (hostname.includes(':')) return 'IPv6';
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return 'IPv4';
        return 'Domain';
    }

    isSocialLink(url) {
        const socialPatterns = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'reddit', 'pinterest'];
        return socialPatterns.some(social => url.includes(social));
    }

    extractSocialPlatform(url) {
        if (url.includes('facebook')) return 'Facebook';
        if (url.includes('twitter')) return 'Twitter';
        if (url.includes('linkedin')) return 'LinkedIn';
        if (url.includes('instagram')) return 'Instagram';
        if (url.includes('youtube')) return 'YouTube';
        if (url.includes('tiktok')) return 'TikTok';
        return 'Unknown';
    }

    resolveURL(url) {
        try {
            if (url.startsWith('http')) return url;
            if (url.startsWith('//')) return 'https:' + url;
            if (url.startsWith('/')) {
                const baseURL = this.results.urlInfo.fullURL;
                return new URL(url, baseURL).href;
            }
            return url;
        } catch (e) {
            return url;
        }
    }

    extractFromPlainText(text) {
        // استخراج البيانات من نص عادي إذا فشل parsing
        const emails = text.match(/[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const urls = text.match(/https?:\/\/[^\s]+/g) || [];
        
        this.results.emailAddresses = [...new Set(emails)];
        this.results.links.external = urls.map(url => ({ url, text: url }));
    }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveURLAnalyzer;
}
