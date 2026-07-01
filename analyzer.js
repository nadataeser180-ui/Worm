// ===================================
// محلل الموقع والتطبيقات الشامل
// ===================================

class WebsiteAnalyzer {
    constructor(url) {
        this.url = url;
        this.urlParser = new URLParser(url);
        this.analysis = {
            url: this.urlParser.getDetails(),
            headers: {},
            technologies: [],
            security: {},
            performance: {},
            metadata: {},
            social: {},
            apis: []
        };
    }

    /**
     * تنفيذ التحليل الكامل
     */
    async analyze() {
        try {
            // جلب معلومات الصفحة
            const pageData = await this.fetchPageInfo();
            
            // تحليل HTML
            this.analyzeHTML(pageData);
            
            // كشف التكنولوجيات
            this.detectTechnologies(pageData);
            
            // تحليل الأمان
            this.analyzeSecurity();
            
            // استخراج البيانات الوصفية
            this.extractMetadata(pageData);
            
            // كشف الـ APIs
            this.detectAPIs(pageData);
            
            return this.analysis;
        } catch (error) {
            console.error('خطأ في التحليل:', error);
            return {
                error: error.message,
                analysis: this.analysis
            };
        }
    }

    /**
     * جلب معلومات الصفحة (محاكاة CORS)
     */
    async fetchPageInfo() {
        try {
            // في بيئة حقيقية، سيكون هناك API backend
            // هنا نحاكي البيانات
            const mockData = {
                html: await this.getMockHTML(),
                headers: this.getMockHeaders(),
                status: 200
            };
            return mockData;
        } catch (error) {
            console.warn('تعذر جلب البيانات الفعلية:', error);
            return this.generateMockData();
        }
    }

    /**
     * كشف التكنولوجيات المستخدمة
     */
    detectTechnologies(pageData) {
        const html = pageData.html.toLowerCase();
        const detectedTechs = [];

        // فحص Frameworks
        for (let framework of CONFIG.TECHNOLOGIES.frameworks) {
            if (framework.pattern.test(html)) {
                detectedTechs.push({
                    name: framework.name,
                    category: 'Framework',
                    icon: '🎨',
                    confidence: 'عالية'
                });
            }
        }

        // فحص Libraries
        for (let lib of CONFIG.TECHNOLOGIES.libraries) {
            if (lib.pattern.test(html)) {
                detectedTechs.push({
                    name: lib.name,
                    category: 'مكتبة',
                    icon: '📚',
                    confidence: 'عالية'
                });
            }
        }

        // فحص Analytics
        for (let analytics of CONFIG.TECHNOLOGIES.analytics) {
            if (analytics.pattern.test(html)) {
                detectedTechs.push({
                    name: analytics.name,
                    category: 'تتبع',
                    icon: '📊',
                    confidence: 'عالية'
                });
            }
        }

        this.analysis.technologies = detectedTechs;
        return detectedTechs;
    }

    /**
     * تحليل الأمان
     */
    analyzeSecurity() {
        const protocol = this.urlParser.getProtocol();
        const security = {
            ssl: protocol.isSecure,
            sslIcon: protocol.icon,
            headers: this.checkSecurityHeaders(),
            csp: false,
            xFrame: false,
            xContentType: false
        };

        this.analysis.security = security;
        return security;
    }

    /**
     * التحقق من رؤوس الأمان
     */
    checkSecurityHeaders() {
        return {
            'Strict-Transport-Security': false,
            'Content-Security-Policy': false,
            'X-Content-Type-Options': false,
            'X-Frame-Options': false,
            'X-XSS-Protection': false
        };
    }

    /**
     * استخراج البيانات الوصفية
     */
    extractMetadata(pageData) {
        const html = pageData.html;
        
        const metadata = {
            title: this.extractMeta(html, 'title'),
            description: this.extractMeta(html, 'description'),
            keywords: this.extractMeta(html, 'keywords'),
            author: this.extractMeta(html, 'author'),
            language: this.extractMeta(html, 'language') || 'ar',
            openGraph: this.extractOpenGraph(html),
            twitterCard: this.extractTwitterCard(html)
        };

        this.analysis.metadata = metadata;
        return metadata;
    }

    /**
     * استخراج قيمة meta tag
     */
    extractMeta(html, name) {
        const pattern = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i');
        const match = html.match(pattern);
        return match ? match[1] : null;
    }

    /**
     * استخراج Open Graph
     */
    extractOpenGraph(html) {
        const og = {};
        const ogPattern = /<meta\s+property=["']og:([^"']*)["']\s+content=["']([^"']*)["']/gi;
        
        let match;
        while ((match = ogPattern.exec(html)) !== null) {
            og[match[1]] = match[2];
        }
        
        return og;
    }

    /**
     * استخراج Twitter Card
     */
    extractTwitterCard(html) {
        const twitter = {};
        const twitterPattern = /<meta\s+name=["']twitter:([^"']*)["']\s+content=["']([^"']*)["']/gi;
        
        let match;
        while ((match = twitterPattern.exec(html)) !== null) {
            twitter[match[1]] = match[2];
        }
        
        return twitter;
    }

    /**
     * كشف الـ APIs
     */
    detectAPIs(pageData) {
        const apis = [];
        const html = pageData.html;

        // أنماط الـ APIs الشهيرة
        const apiPatterns = [
            { name: 'Google Maps API', pattern: /maps\.googleapis\.com/ },
            { name: 'Facebook SDK', pattern: /facebook\.com\/en_US\/sdk/ },
            { name: 'Stripe API', pattern: /stripe\.com/ },
            { name: 'PayPal API', pattern: /paypal\.com/ },
            { name: 'Twilio API', pattern: /twilio\.com/ },
            { name: 'AWS SDK', pattern: /aws\.amazon\.com/ },
            { name: 'Cloudinary', pattern: /cloudinary\.com/ }
        ];

        for (let api of apiPatterns) {
            if (api.pattern.test(html)) {
                apis.push({
                    name: api.name,
                    icon: '🔌',
                    type: 'Third-party'
                });
            }
        }

        this.analysis.apis = apis;
        return apis;
    }

    /**
     * الحصول على النتائج
     */
    getResults() {
        return this.analysis;
    }

    /**
     * توليد بيانات وهمية للاختبار
     */
    generateMockData() {
        return {
            html: this.getMockHTML(),
            headers: this.getMockHeaders(),
            status: 200,
            mocked: true
        };
    }

    /**
     * HTML وهمي للاختبار
     */
    getMockHTML() {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>موقع تجريبي</title>
                    <meta name="description" content="هذا موقع تجريبي">
                    <meta name="keywords" content="test, demo">
                    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-12345678-1"></script>
                </head>
                <body>
                    <h1>مرحبا بك</h1>
                </body>
            </html>
        `;
    }

    /**
     * رؤوس HTTP وهمية
     */
    getMockHeaders() {
        return {
            'Content-Type': 'text/html; charset=utf-8',
            'Server': 'nginx',
            'Cache-Control': 'public, max-age=3600',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        };
    }

    /**
     * الحصول على ملخص التحليل
     */
    getSummary() {
        return {
            url: this.analysis.url.url.hostname,
            secure: this.analysis.security.ssl,
            technologies: this.analysis.technologies.length,
            apis: this.analysis.apis.length,
            hasMetadata: Object.keys(this.analysis.metadata).length > 0
        };
    }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteAnalyzer;
}
