let currentFilter = 'all';

// معالجة البحث
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchQuery = document.getElementById('searchInput').value;
    await performSearch(searchQuery);
});

// تغيير الفلاتر
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
    });
});

async function performSearch(query) {
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    const errorEl = document.getElementById('error');

    // إعادة تعيين
    resultsEl.innerHTML = '';
    errorEl.style.display = 'none';
    loadingEl.style.display = 'block';

    try {
        // جلب البيانات من APIs متعددة
        const results = await fetchResults(query);
        
        loadingEl.style.display = 'none';

        if (results.length === 0) {
            errorEl.textContent = 'لم نجد نتائج لبحثك. حاول بكلمات مفتاحية أخرى.';
            errorEl.style.display = 'block';
            return;
        }

        displayResults(results);
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = 'حدث خطأ: ' + error.message;
        errorEl.style.display = 'block';
    }
}

async function fetchResults(query) {
    const results = [];

    // نموذج البيانات (يمكن استبدالها بـ API حقيقي)
    const mockData = [
        {
            id: 1,
            title: 'مورد تعليمي',
            description: 'محتوى تعليمي عن ' + query,
            type: 'resource',
            image: 'https://via.placeholder.com/300x200?text=Resource',
            link: '#'
        },
        {
            id: 2,
            title: 'صورة توضيحية',
            description: 'صورة متعلقة بـ ' + query,
            type: 'image',
            image: 'https://via.placeholder.com/300x200?text=Image',
            link: '#'
        },
        {
            id: 3,
            title: 'مقالة',
            description: 'مقالة حول ' + query,
            type: 'resource',
            image: 'https://via.placeholder.com/300x200?text=Article',
            link: '#'
        }
    ];

    // تصفية حسب النوع
    if (currentFilter === 'images') {
        return mockData.filter(item => item.type === 'image');
    } else if (currentFilter === 'resources') {
        return mockData.filter(item => item.type === 'resource');
    }

    return mockData;
}

function displayResults(results) {
    const resultsEl = document.getElementById('results');
    
    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${result.image}" alt="${result.title}" class="result-image">
            <div class="result-content">
                <div class="result-type">${result.type === 'image' ? '📷 صورة' : '📄 مورد'}</div>
                <h3 class="result-title">${result.title}</h3>
                <p class="result-description">${result.description}</p>
                <a href="${result.link}" class="result-link">اطلع على المزيد →</a>
            </div>
        `;
        resultsEl.appendChild(card);
    });
}
