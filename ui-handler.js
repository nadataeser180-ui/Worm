// ===================================
// معالج الواجهة الرسومية
// ===================================

class UIHandler {
    constructor() {
        this.analyzer = null;
        this.currentResults = null;
        this.initializeEventListeners();
    }

    /**
     * تهيئة مستمعي الأحداث
     */
    initializeEventListeners() {
        // زر التحليل الرئيسي
        document.getElementById('analyzeBtn').addEventListener('click', () => this.handleAnalyze());
        
        // حقل الإدخال
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAnalyze();
        });

        // الروابط السريعة
        document.querySelectorAll('.quick-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                document.getElementById('urlInput').value = url;
                this.handleAnalyze();
            });
        });

        // التبويبات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // أزرار التصدير
        document.getElementById('copyResults')?.addEventListener('click', () => this.copyResults());
        document.getElementById('downloadPDF')?.addEventListener('click', () => this.downloadPDF());
        document.getElementById('shareResults')?.addEventListener('click', () => this.shareResults());
        document.getElementById('downloadJSON')?.addEventListener('click', () => this.downloadJSON());
    }

    /**
     * معالج زر التحليل
     */
    async handleAnalyze() {
        const url = document.getElementById('urlInput').value.trim();

        if (!url) {
            this.showError('الرجاء إدخال رابط صحيح');
            return;
        }

        if (!this.isValidURL(url)) {
            this.showError('الرابط غير صحيح. الرجاء التحقق');
            return;
        }

        this.showLoading();
        
        try {
            this.analyzer = new ComprehensiveURLAnalyzer(url);
            const results = await this.analyzer.analyze();

            this.currentResults = results;
            this.displayResults(results);
            this.hideLoading();
            this.showResults();

        } catch (error) {
            this.showError(`خطأ في التحليل: ${error.message}`);
            this.hideLoading();
        }
    }

    /**
     * التحقق من صحة الرابط
     */
    isValidURL(url) {
        try {
            const urlToCheck = url.startsWith('http') ? url : `https://${url}`;
            new URL(urlToCheck);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * عرض نتائج التحليل
     */
    displayResults(results) {
        const analysis = results.fullAnalysis;

        // تحديث الملخص السريع
        this.updateSummary(analysis);

        // تحديث التبويبات
        this.updateOverviewTab(analysis);
        this.updateURLDetailsTab(analysis);
        this.updateTechnologiesTab(analysis);
        this.updateSecurityTab(analysis);
        this.updateMetadataTab(analysis);
        this.updateLinksTab(analysis);
        this.updateContactTab(analysis);
        this.updateMediaTab(analysis);
        this.updateAdvancedTab(results);
    }

    /**
     * تحديث الملخص السريع
     */
    updateSummary(analysis) {
        document.getElementById('summaryURL').textContent = analysis.urlInfo.hostname;
        document.getElementById('summarySecure').textContent = analysis.urlInfo.isSecure ? '🔒 آمن' : '🔓 غير آمن';
        document.getElementById('summaryTechs').textContent = Object.values(analysis.technologies).reduce((a, b) => a + b.length, 0);
        document.getElementById('summaryAPIs').textContent = analysis.apis.length;
    }

    /**
     * تحديث تبويب نظرة عامة
     */
    updateOverviewTab(analysis) {
        const content = document.getElementById('overviewContent');
        const items = [
            { label: '🔗 الرابط الكامل', value: analysis.urlInfo.fullURL },
            { label: '🏠 اسم المضيف', value: analysis.urlInfo.hostname },
            { label: '🌐 البروتوكول', value: analysis.urlInfo.protocol.toUpperCase() },
            { label: '🔐 آمن', value: analysis.urlInfo.isSecure ? 'نعم ✅' : 'لا ❌' },
            { label: '⚙️ المنفذ', value: analysis.urlInfo.port },
            { label: '📝 العنوان', value: analysis.metadata.title || 'غير متاح' },
            { label: '📋 الوصف', value: analysis.metadata.description || 'غير متاح' }
        ];

        content.innerHTML = items.map(item => `
            <div class="grid-item">
                <div class="label">${item.label}</div>
                <div class="value">${this.escapeHTML(item.value)}</div>
            </div>
        `).join('');
    }

    /**
     * تحديث تبويب تفاصيل الرابط
     */
    updateURLDetailsTab(analysis) {
        const content = document.getElementById('urlDetailsContent');
        const urlInfo = analysis.urlInfo;

        const rows = [
            ['الرابط الأصلي', urlInfo.originalURL],
            ['الرابط الكامل', urlInfo.fullURL],
            ['النطاق', urlInfo.domain],
            ['النطاق الفرعي', urlInfo.subdomain || 'لا يوجد'],
            ['المسار', urlInfo.path || '/'],
            ['سلسلة الاستعلام', urlInfo.queryString || 'لا توجد'],
            ['الجزء (Fragment)', urlInfo.fragment || 'لا يوجد'],
            ['نوع العنوان', this.isIPAddress(urlInfo.hostname) ? 'عنوان IP' : 'نطاق'],
            ['المنفذ', urlInfo.port],
            ['عدد معاملات الاستعلام', Object.keys(urlInfo.queryParameters).length]
        ];

        content.innerHTML = `
            <table>
                <tr>
                    <th>المعلومة</th>
                    <th>القيمة</th>
                </tr>
                ${rows.map(([key, value]) => `
                    <tr>
                        <td><strong>${key}</strong></td>
                        <td>${this.escapeHTML(String(value))}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    /**
     * تحديث تبويب التكنولوجيات
     */
    updateTechnologiesTab(analysis) {
        const content = document.getElementById('technologiesContent');
        const techs = analysis.technologies;

        let html = '';

        const categories = [
            { key: 'frameworks', title: '🎨 الأطر والمكتبات', icon: '📦' },
            { key: 'cms', title: '📰 أنظمة إدارة المحتوى (CMS)', icon: '⚙️' },
            { key: 'analytics', title: '📊 أدوات التحليل', icon: '📈' },
            { key: 'servers', title: '🖥️ خوادم الويب', icon: '💾' },
            { key: 'databases', title: '🗄️ قواعد البيانات', icon: '📁' }
        ];

        for (let cat of categories) {
            if (techs[cat.key] && techs[cat.key].length > 0) {
                html += `
                    <div class="card">
                        <h3>${cat.title}</h3>
                        <div class="items-list">
                            ${techs[cat.key].map(tech => `
                                <div class="item">
                                    <span>${cat.icon} ${tech.name || tech}</span>
                                    <span style="color: #4caf50; font-weight: bold;">✓</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }

        if (!html) {
            html = '<div class="card"><p>لم يتم اكتشاف أي تكنولوجيات معروفة</p></div>';
        }

        content.innerHTML = html;
    }

    /**
     * تحديث تبويب الأمان
     */
    updateSecurityTab(analysis) {
        const content = document.getElementById('securityContent');
        const security = analysis.security;

        const items = [
            {
                name: 'SSL/TLS',
                status: security.isHTTPS,
                description: security.isHTTPS ? 'الموقع محمي بشهادة SSL' : 'الموقع غير محمي'
            },
            {
                name: 'HTTPS',
                status: security.isHTTPS,
                description: security.isHTTPS ? 'الاتصال مشفر' : 'الاتصال غير مشفر'
            },
            {
                name: 'Security Headers',
                status: security.headers.strictTransportSecurity,
                description: security.headers.strictTransportSecurity ? 'رؤوس الأمان موجودة' : 'رؤوس الأمان غير كاملة'
            }
        ];

        content.innerHTML = items.map(item => `
            <div class="security-item ${item.status ? 'secure' : 'insecure'}">
                <div class="security-icon">${item.status ? '🔒' : '⚠️'}</div>
                <div class="security-label">${item.name}</div>
                <div style="font-size: 0.9em; color: #666;">${item.description}</div>
            </div>
        `).join('');
    }

    /**
     * تحديث تبويب البيانات الوصفية
     */
    updateMetadataTab(analysis) {
        const content = document.getElementById('metadataContent');
        const metadata = analysis.metadata;

        const items = [
            { key: 'العنوان', value: metadata.title },
            { key: 'الوصف', value: metadata.description },
            { key: 'الكلمات المفتاحية', value: metadata.keywords },
            { key: 'المؤلف', value: metadata.author },
            { key: 'اللغة', value: metadata.language },
            { key: 'مجموعة الأحرف', value: metadata.charset },
        ];

        let html = items.map(item => item.value ? `
            <div class="metadata-item">
                <div class="key">${item.key}</div>
                <div class="value">${this.escapeHTML(item.value)}</div>
            </div>
        ` : '').join('');

        // إضافة Open Graph
        if (Object.keys(metadata.openGraph || {}).length > 0) {
            html += '<div class="metadata-item"><div class="key">Open Graph</div></div>';
            for (let [key, value] of Object.entries(metadata.openGraph || {})) {
                html += `
                    <div class="metadata-item" style="margin-right: 20px;">
                        <div class="key">og:${key}</div>
                        <div class="value">${this.escapeHTML(value)}</div>
                    </div>
                `;
            }
        }

        content.innerHTML = html || '<p>لم يتم العثور على بيانات وصفية</p>';
    }

    /**
     * تحديث تبويب الروابط
     */
    updateLinksTab(analysis) {
        const content = document.getElementById('linksContent');
        const links = analysis.links;

        let html = '';

        if (links.internal && links.internal.length > 0) {
            html += `
                <div class="card">
                    <h3>🔗 الروابط الداخلية (${links.internal.length})</h3>
                    <div class="items-list">
                        ${links.internal.slice(0, 20).map(link => `
                            <div class="item">
                                <div class="item-content">
                                    <strong>${this.escapeHTML(link.text || 'بدون نص')}</strong><br>
                                    <small style="color: #999;">${this.escapeHTML(link.url)}</small>
                                </div>
                                <button class="item-copy" onclick="navigator.clipboard.writeText('${link.url}'); alert('تم النسخ!')">📋</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (links.external && links.external.length > 0) {
            html += `
                <div class="card">
                    <h3>🌐 الروابط الخارجية (${links.external.length})</h3>
                    <div class="items-list">
                        ${links.external.slice(0, 20).map(link => `
                            <div class="item">
                                <div class="item-content">
                                    <strong>${this.escapeHTML(link.text || 'بدون نص')}</strong><br>
                                    <small style="color: #999;">${this.escapeHTML(link.url)}</small>
                                </div>
                                <a href="${link.url}" target="_blank" class="item-copy" style="text-decoration: none;">🔗</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        content.innerHTML = html || '<p>لم يتم العثور على روابط</p>';
    }

    /**
     * تحديث تبويب جهات الاتصال
     */
    updateContactTab(analysis) {
        const content = document.getElementById('contactContent');

        let html = '';

        if (analysis.emailAddresses && analysis.emailAddresses.length > 0) {
            html += `
                <div class="card">
                    <h3>📧 عناوين البريد الإلكتروني (${analysis.emailAddresses.length})</h3>
                    <div class="items-list">
                        ${analysis.emailAddresses.map(email => `
                            <div class="item">
                                <div class="item-content">${this.escapeHTML(email)}</div>
                                <button class="item-copy" onclick="navigator.clipboard.writeText('${email}'); alert('تم النسخ!')">📋</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (analysis.phoneNumbers && analysis.phoneNumbers.length > 0) {
            html += `
                <div class="card">
                    <h3>📱 أرقام الهاتف (${analysis.phoneNumbers.length})</h3>
                    <div class="items-list">
                        ${analysis.phoneNumbers.map(phone => `
                            <div class="item">
                                <div class="item-content">${this.escapeHTML(phone)}</div>
                                <button class="item-copy" onclick="navigator.clipboard.writeText('${phone}'); alert('تم النسخ!')">📋</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (analysis.socialLinks && analysis.socialLinks.length > 0) {
            html += `
                <div class="card">
                    <h3>📱 وسائل التواصل الاجتماعي (${analysis.socialLinks.length})</h3>
                    <div class="items-list">
                        ${analysis.socialLinks.map(social => `
                            <div class="item">
                                <div class="item-content">
                                    <strong>${social.platform}</strong><br>
                                    <small style="color: #999;">${this.escapeHTML(social.url)}</small>
                                </div>
                                <a href="${social.url}" target="_blank" class="item-copy" style="text-decoration: none;">🔗</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        content.innerHTML = html || '<p>لم يتم العثور على معلومات اتصال</p>';
    }

    /**
     * تحديث تبويب الوسائط
     */
    updateMediaTab(analysis) {
        const content = document.getElementById('mediaContent');

        if (analysis.images && analysis.images.length > 0) {
            const html = `
                <div class="card">
                    <h3>🖼️ الصور (${analysis.images.length})</h3>
                    <div class="images-grid">
                        ${analysis.images.slice(0, 30).map(img => `
                            <div class="image-card">
                                <img src="${img.url}" alt="${img.alt}" onerror="this.src='https://via.placeholder.com/150?text=Image'">
                                <div class="image-card-info">${this.escapeHTML(img.alt || 'بدون وصف')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            content.innerHTML = html;
        } else {
            content.innerHTML = '<p>لم يتم العثور على صور</p>';
        }
    }

    /**
     * تحديث التبويب المتقدم
     */
    updateAdvancedTab(results) {
        const content = document.getElementById('advancedContent');
        content.textContent = JSON.stringify(results, null, 2);
    }

    /**
     * التبديل بين التبويبات
     */
    switchTab(tabName) {
        // إخفاء جميع التبويبات
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // إزالة الفئة active من جميع الأزرار
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // عرض التبويب المحدد
        document.getElementById(tabName).classList.add('active');

        // تفعيل زر التبويب
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    /**
     * عرض رسالة الخطأ
     */
    showError(message) {
        document.getElementById('errorSection').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('resultsSection').style.display = 'none';
    }

    /**
     * إخفاء رسالة الخطأ
     */
    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    /**
     * عرض مؤشر التحميل
     */
    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    /**
     * إخفاء مؤشر التحميل
     */
    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
    }

    /**
     * عرض قسم النتائج
     */
    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('errorSection').style.display = 'none';
    }

    /**
     * نسخ النتائج
     */
    copyResults() {
        const text = JSON.stringify(this.currentResults, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ تم نسخ النتائج بنجاح!');
        });
    }

    /**
     * تحميل JSON
     */
    downloadJSON() {
        const text = JSON.stringify(this.currentResults, null, 2);
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-${new Date().getTime()}.json`;
        a.click();
    }

    /**
     * تحميل PDF
     */
    downloadPDF() {
        alert('📄 ميزة تحميل PDF قريباً!');
    }

    /**
     * مشاركة النتائج
     */
    shareResults() {
        const text = `تحليل الرابط: ${this.currentResults.fullAnalysis.urlInfo.hostname}`;
        if (navigator.share) {
            navigator.share({
                title: 'محلل الروابط',
                text: text
            });
        } else {
            alert('📤 ' + text);
        }
    }

    /**
     * تنظيف HTML من الخصوصية
     */
    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * التحقق من عنوان IP
     */
    isIPAddress(hostname) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    }
}

// تهيئة معالج الواجهة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.uiHandler = new UIHandler();
    console.log('✅ تم تهيئة محلل الروابط بنجاح');
});
