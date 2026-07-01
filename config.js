// ===================================
// إعدادات المشروع الرئيسية
// ===================================

const CONFIG = {
    // API endpoints
    APIS: {
        WHOIS: 'https://whois.api.test/api/',
        HEADER_CHECK: 'https://api.test/headers/',
        TECH_STACK: 'https://api.test/tech-stack/'
    },

    // قائمة التطبيقات والأدوات المعروفة
    TECHNOLOGIES: {
        frameworks: [
            { name: 'React', pattern: /_react|React|react\./ },
            { name: 'Vue.js', pattern: /Vue|vue\./ },
            { name: 'Angular', pattern: /Angular|angular\./ },
            { name: 'Svelte', pattern: /Svelte|svelte/ },
            { name: 'Next.js', pattern: /_next|next\.js/ },
            { name: 'Nuxt', pattern: /nuxt|__nuxt/ },
            { name: 'Django', pattern: /django/ },
            { name: 'Flask', pattern: /flask/ },
            { name: 'Laravel', pattern: /laravel/ },
            { name: 'WordPress', pattern: /wp-content|wordpress/ }
        ],
        libraries: [
            { name: 'jQuery', pattern: /jquery/ },
            { name: 'Bootstrap', pattern: /bootstrap/ },
            { name: 'Tailwind CSS', pattern: /tailwind/ },
            { name: 'Axios', pattern: /axios/ },
            { name: 'D3.js', pattern: /d3\.js|d3\.v/ },
            { name: 'Three.js', pattern: /three\.js|three\.min/ },
            { name: 'Lodash', pattern: /lodash/ },
            { name: 'Moment.js', pattern: /moment\.js/ }
        ],
        servers: [
            { name: 'Apache', header: 'Apache' },
            { name: 'Nginx', header: 'nginx' },
            { name: 'IIS', header: 'IIS' },
            { name: 'Node.js', header: 'node' },
            { name: 'Cloudflare', header: 'cloudflare' }
        ],
        analytics: [
            { name: 'Google Analytics', pattern: /ga\(|google-analytics|gtag\.js/ },
            { name: 'Facebook Pixel', pattern: /facebook\.com\/en_US\/fbevents/ },
            { name: 'Hotjar', pattern: /heatmap\.it/ },
            { name: 'Mixpanel', pattern: /mixpanel\.com/ }
        ]
    },

    // الألوان والرموز
    UI: {
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#4caf50',
            warning: '#ff9800',
            danger: '#f44336',
            info: '#2196f3'
        },
        icons: {
            url: '🔗',
            tech: '⚙️',
            security: '🔒',
            speed: '⚡',
            header: '📋',
            success: '✅',
            error: '❌',
            loading: '⏳'
        }
    },

    // الرسائل والنصوص
    MESSAGES: {
        ar: {
            analyzing: 'جاري تحليل الرابط...',
            success: 'تم التحليل بنجاح!',
            error: 'حدث خطأ أثناء التحليل',
            invalidUrl: 'الرابط غير صحيح',
            noData: 'لم يتم العثور على بيانات',
            copying: 'تم النسخ بنجاح! ✅'
        }
    }
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
