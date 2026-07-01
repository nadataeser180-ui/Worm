// ===================================
// معالج ومحلل الروابط
// ===================================

class URLParser {
    constructor(url) {
        this.originalUrl = url;
        this.urlObj = null;
        this.data = {};
        this.parse();
    }

    /**
     * تحليل الرابط إلى مكوناته الأساسية
     */
    parse() {
        try {
            // إضافة البروتوكول إذا لم يكن موجوداً
            let urlToParse = this.originalUrl;
            if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
                urlToParse = 'https://' + urlToParse;
            }

            this.urlObj = new URL(urlToParse);
            
            this.data = {
                original: this.originalUrl,
                full: this.urlObj.href,
                protocol: this.urlObj.protocol,
                hostname: this.urlObj.hostname,
                domain: this.extractDomain(),
                port: this.urlObj.port || (this.urlObj.protocol === 'https:' ? 443 : 80),
                path: this.urlObj.pathname,
                query: this.urlObj.search,
                hash: this.urlObj.hash,
                params: this.extractParams()
            };

            return true;
        } catch (error) {
            console.error('خطأ في تحليل الرابط:', error);
            return false;
        }
    }

    /**
     * استخراج النطاق الرئيسي
     */
    extractDomain() {
        const hostname = this.urlObj.hostname;
        const parts = hostname.split('.');
        
        // إذا كان النطاق فرعياً مثل sub.example.com
        if (parts.length > 2) {
            return parts.slice(-2).join('.');
        }
        
        return hostname;
    }

    /**
     * استخراج معاملات الاستعلام
     */
    extractParams() {
        const params = {};
        const searchParams = this.urlObj.searchParams;
        
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        return params;
    }

    /**
     * الحصول على جميع البيانات المحللة
     */
    getData() {
        return this.data;
    }

    /**
     * التحقق من صحة الرابط
     */
    isValid() {
        return this.urlObj !== null;
    }

    /**
     * الحصول على نوع الرابط
     */
    getType() {
        const path = this.data.path.toLowerCase();
        
        if (path.includes('api')) return 'API';
        if (path.includes('admin') || path.includes('dashboard')) return 'لوحة تحكم';
        if (path.includes('blog')) return 'مدونة';
        if (path.includes('shop') || path.includes('store')) return 'متجر';
        if (path.includes('forum')) return 'منتدى';
        
        return 'موقع عام';
    }

    /**
     * استخراج اسم الشركة من النطاق
     */
    getCompanyName() {
        const domain = this.data.domain;
        return domain.split('.')[0]
            .charAt(0)
            .toUpperCase() + domain.split('.')[0].slice(1);
    }

    /**
     * التحقق من نوع البروتوكول
     */
    getProtocol() {
        return {
            type: this.data.protocol.replace(':', '').toUpperCase(),
            isSecure: this.data.protocol === 'https:',
            icon: this.data.protocol === 'https:' ? '🔒' : '🔓'
        };
    }

    /**
     * الحصول على معلومات مفصلة
     */
    getDetails() {
        return {
            url: this.data,
            type: this.getType(),
            company: this.getCompanyName(),
            protocol: this.getProtocol(),
            subdomain: this.getSubdomain(),
            isIP: this.isIPAddress()
        };
    }

    /**
     * استخراج النطاق الفرعي
     */
    getSubdomain() {
        const parts = this.urlObj.hostname.split('.');
        if (parts.length > 2) {
            return parts.slice(0, -2).join('.');
        }
        return null;
    }

    /**
     * التحقق من كون الرابط عنوان IP
     */
    isIPAddress() {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipRegex.test(this.urlObj.hostname);
    }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLParser;
}
