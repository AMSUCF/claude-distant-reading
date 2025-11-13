// Distant Reading Explorer - Main Application
// Uses D3.js for visualizations and Bootstrap for UI

class DistantReadingApp {
    constructor() {
        this.corpusData = null;
        this.currentText = null;
        this.currentView = 'browse';
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupUI();
            this.attachEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to load corpus data. Please ensure corpus_analysis.json is available.');
        }
    }

    async loadData() {
        const response = await fetch('corpus_analysis.json');
        this.corpusData = await response.json();
        console.log(`Loaded ${this.corpusData.texts.length} texts`);
    }

    setupUI() {
        this.populateTextList();
        this.populateCompareSelects();
    }

    populateTextList() {
        const textList = document.getElementById('textList');
        textList.innerHTML = '';

        this.corpusData.texts.forEach(text => {
            const li = document.createElement('li');
            li.className = 'nav-item';

            const link = document.createElement('a');
            link.className = 'nav-link';
            link.href = '#';
            link.dataset.textId = text.id;

            link.innerHTML = `
                <div class="text-title">${text.metadata.title || 'Untitled'}</div>
                <div class="text-author">${text.metadata.author || 'Unknown'}</div>
            `;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showText(text.id);
            });

            li.appendChild(link);
            textList.appendChild(li);
        });
    }

    populateCompareSelects() {
        const select1 = document.getElementById('compareText1');
        const select2 = document.getElementById('compareText2');

        this.corpusData.texts.forEach(text => {
            const option1 = document.createElement('option');
            option1.value = text.id;
            option1.textContent = `${text.metadata.title} (${text.metadata.author})`;
            select1.appendChild(option1);

            const option2 = option1.cloneNode(true);
            select2.appendChild(option2);
        });
    }

    attachEventListeners() {
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.switchView('compare');
        });

        document.getElementById('browseBtn').addEventListener('click', () => {
            this.switchView('browse');
        });

        document.getElementById('compareText1').addEventListener('change', () => {
            this.updateComparison();
        });

        document.getElementById('compareText2').addEventListener('change', () => {
            this.updateComparison();
        });
    }

    switchView(view) {
        this.currentView = view;

        if (view === 'browse') {
            document.getElementById('browseView').style.display = 'block';
            document.getElementById('compareView').style.display = 'none';
            document.getElementById('browseBtn').classList.add('btn-primary');
            document.getElementById('browseBtn').classList.remove('btn-outline-secondary');
            document.getElementById('compareBtn').classList.remove('btn-primary');
            document.getElementById('compareBtn').classList.add('btn-outline-secondary');
        } else {
            document.getElementById('browseView').style.display = 'none';
            document.getElementById('compareView').style.display = 'block';
            document.getElementById('compareBtn').classList.add('btn-primary');
            document.getElementById('compareBtn').classList.remove('btn-outline-secondary');
            document.getElementById('browseBtn').classList.remove('btn-primary');
            document.getElementById('browseBtn').classList.add('btn-outline-secondary');
        }
    }

    showText(textId) {
        const text = this.corpusData.texts.find(t => t.id === textId);
        if (!text) return;

        this.currentText = text;

        // Update active state in sidebar
        document.querySelectorAll('#textList .nav-link').forEach(link => {
            if (link.dataset.textId === textId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show analysis section
        document.getElementById('textContent').style.display = 'none';
        document.getElementById('textAnalysis').style.display = 'block';

        // Update title
        document.getElementById('textTitle').textContent = text.metadata.title || 'Untitled';

        // Render sections
        this.renderMetadata(text);
        this.renderWordCloud(text, 'wordcloud');
        this.renderSentiment(text, 'sentimentChart', 'sentimentStats');
        this.renderStyleMetrics(text);
        this.renderTopics(text);
    }

    renderMetadata(text) {
        const metadata = document.getElementById('metadata');
        metadata.innerHTML = `
            <dt class="col-sm-3">Project Gutenberg ID</dt>
            <dd class="col-sm-9">${text.id}</dd>
            <dt class="col-sm-3">Title</dt>
            <dd class="col-sm-9">${text.metadata.title || 'N/A'}</dd>
            <dt class="col-sm-3">Author</dt>
            <dd class="col-sm-9">${text.metadata.author || 'N/A'}</dd>
            <dt class="col-sm-3">Release Date</dt>
            <dd class="col-sm-9">${text.metadata.release_date || 'N/A'}</dd>
            <dt class="col-sm-3">Language</dt>
            <dd class="col-sm-9">${text.metadata.language || 'N/A'}</dd>
        `;
    }

    renderWordCloud(text, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 400;

        // Prepare word data
        const words = text.top_words.map(w => ({
            text: w.word,
            size: w.count
        }));

        // Create cloud layout
        const layout = d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => 0)
            .font('Arial')
            .fontSize(d => Math.sqrt(d.size) * 8)
            .on('end', (words) => this.drawWordCloud(words, container, width, height));

        layout.start();
    }

    drawWordCloud(words, container, width, height) {
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        g.selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', d => `${d.size}px`)
            .style('font-family', 'Arial')
            .style('fill', (d, i) => colorScale(i))
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text(d => d.text)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.7);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).style('opacity', 1);
            });
    }

    renderSentiment(text, chartId, statsId) {
        const sentiment = text.sentiment;

        // Render chart
        const chartContainer = document.getElementById(chartId);
        chartContainer.innerHTML = '';

        const width = chartContainer.clientWidth || 600;
        const height = 250;
        const margin = { top: 20, right: 30, bottom: 40, left: 100 };

        const data = [
            { label: 'Positive', value: sentiment.positive, color: '#198754' },
            { label: 'Neutral', value: sentiment.neutral, color: '#6c757d' },
            { label: 'Negative', value: sentiment.negative, color: '#dc3545' }
        ];

        const svg = d3.select(chartContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([margin.top, height - margin.bottom])
            .padding(0.2);

        // Bars
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'sentiment-bar')
            .attr('x', margin.left)
            .attr('y', d => y(d.label))
            .attr('width', d => x(d.value) - margin.left)
            .attr('height', y.bandwidth())
            .attr('fill', d => d.color);

        // Labels
        svg.selectAll('.sentiment-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'sentiment-label')
            .attr('x', margin.left - 10)
            .attr('y', d => y(d.label) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text(d => d.label);

        // Values
        svg.selectAll('.sentiment-value')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'sentiment-value')
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(d.label) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .text(d => d.value.toFixed(3));

        // Render stats
        const statsContainer = document.getElementById(statsId);
        const classification = sentiment.classification;
        const classColor = classification === 'positive' ? 'sentiment-positive' :
                          classification === 'negative' ? 'sentiment-negative' : 'sentiment-neutral';

        statsContainer.innerHTML = `
            <div class="sentiment-stats">
                <div class="stat-card ${classColor}">
                    <div class="stat-label">Classification</div>
                    <div class="stat-value">${classification.toUpperCase()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Compound Score</div>
                    <div class="stat-value">${sentiment.compound.toFixed(3)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Sentence Mean</div>
                    <div class="stat-value">${sentiment.sentence_sentiments.mean.toFixed(3)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Sentence Std Dev</div>
                    <div class="stat-value">${sentiment.sentence_sentiments.std.toFixed(3)}</div>
                </div>
            </div>
        `;
    }

    renderStyleMetrics(text) {
        const metrics = text.style_metrics;
        const container = document.getElementById('styleMetrics');

        container.innerHTML = `
            <table class="metrics-table">
                <tbody>
                    <tr>
                        <th>Type-Token Ratio</th>
                        <td>${metrics.type_token_ratio.toFixed(4)}</td>
                        <th>Vocabulary Richness</th>
                        <td>${metrics.vocabulary_richness.toFixed(4)}</td>
                    </tr>
                    <tr>
                        <th>Unique Words (Filtered)</th>
                        <td>${metrics.unique_words.toLocaleString()}</td>
                        <th>Total Words (Filtered)</th>
                        <td>${metrics.total_words.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th>Unique Words (All)</th>
                        <td>${metrics.unique_words_all.toLocaleString()}</td>
                        <th>Total Words (All)</th>
                        <td>${metrics.total_words_all.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th>Avg Word Length</th>
                        <td>${metrics.avg_word_length.toFixed(2)} characters</td>
                        <th>Avg Sentence Length</th>
                        <td>${metrics.avg_sentence_length.toFixed(2)} words</td>
                    </tr>
                    <tr>
                        <th>Total Sentences</th>
                        <td>${metrics.total_sentences.toLocaleString()}</td>
                        <th></th>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    renderTopics(text) {
        const container = document.getElementById('topics');

        if (!text.topics || text.topics.length === 0) {
            container.innerHTML = '<p class="text-muted">No topics extracted for this text.</p>';
            return;
        }

        container.innerHTML = text.topics.map(topic => `
            <div class="topic-card">
                <div class="topic-title">Topic ${topic.topic_id}</div>
                <div class="topic-words">
                    ${topic.words.map(word => `<span class="topic-word">${word}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    updateComparison() {
        const text1Id = document.getElementById('compareText1').value;
        const text2Id = document.getElementById('compareText2').value;

        if (!text1Id || !text2Id) {
            document.getElementById('comparisonContent').innerHTML =
                '<div class="alert alert-info">Please select two texts to compare.</div>';
            return;
        }

        if (text1Id === text2Id) {
            document.getElementById('comparisonContent').innerHTML =
                '<div class="alert alert-warning">Please select two different texts.</div>';
            return;
        }

        const text1 = this.corpusData.texts.find(t => t.id === text1Id);
        const text2 = this.corpusData.texts.find(t => t.id === text2Id);

        this.renderComparison(text1, text2);
    }

    renderComparison(text1, text2) {
        const container = document.getElementById('comparisonContent');

        container.innerHTML = `
            <!-- Word Clouds Comparison -->
            <div class="comparison-section">
                <h3>Word Clouds Comparison</h3>
                <div class="comparison-grid">
                    <div class="comparison-item">
                        <h4>${text1.metadata.title}</h4>
                        <div id="wordcloud-compare-1" class="wordcloud-container wordcloud-comparison"></div>
                    </div>
                    <div class="comparison-item">
                        <h4>${text2.metadata.title}</h4>
                        <div id="wordcloud-compare-2" class="wordcloud-container wordcloud-comparison"></div>
                    </div>
                </div>
            </div>

            <!-- Sentiment Comparison -->
            <div class="comparison-section">
                <h3>Sentiment Comparison</h3>
                <div id="sentiment-comparison-chart" class="comparison-chart"></div>
            </div>

            <!-- Style Metrics Comparison -->
            <div class="comparison-section">
                <h3>Style Metrics Comparison</h3>
                <div id="style-comparison-chart" class="comparison-chart"></div>
            </div>

            <!-- Vocabulary Overlap -->
            <div class="comparison-section">
                <h3>Vocabulary Overlap</h3>
                <div id="vocabulary-overlap"></div>
            </div>

            <!-- Topics Comparison -->
            <div class="comparison-section">
                <h3>Topics Comparison</h3>
                <div class="comparison-grid">
                    <div class="comparison-item">
                        <h4>${text1.metadata.title}</h4>
                        <div id="topics-compare-1"></div>
                    </div>
                    <div class="comparison-item">
                        <h4>${text2.metadata.title}</h4>
                        <div id="topics-compare-2"></div>
                    </div>
                </div>
            </div>
        `;

        // Render comparisons
        this.renderWordCloud(text1, 'wordcloud-compare-1');
        this.renderWordCloud(text2, 'wordcloud-compare-2');
        this.renderSentimentComparison(text1, text2);
        this.renderStyleComparison(text1, text2);
        this.renderVocabularyOverlap(text1, text2);
        this.renderTopicsComparison(text1, text2);
    }

    renderSentimentComparison(text1, text2) {
        const container = document.getElementById('sentiment-comparison-chart');
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };

        const data = [
            { metric: 'Positive', text1: text1.sentiment.positive, text2: text2.sentiment.positive },
            { metric: 'Neutral', text1: text1.sentiment.neutral, text2: text2.sentiment.neutral },
            { metric: 'Negative', text1: text1.sentiment.negative, text2: text2.sentiment.negative },
            { metric: 'Compound', text1: (text1.sentiment.compound + 1) / 2, text2: (text2.sentiment.compound + 1) / 2 }
        ];

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.metric))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['text1', 'text2'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal()
            .domain(['text1', 'text2'])
            .range(['#0d6efd', '#fd7e14']);

        // Bars
        const groups = svg.selectAll('g.metric-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'metric-group')
            .attr('transform', d => `translate(${x0(d.metric)},0)`);

        groups.selectAll('rect')
            .data(d => ['text1', 'text2'].map(key => ({ key, value: d[key], metric: d.metric })))
            .enter()
            .append('rect')
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => height - margin.bottom - y(d.value))
            .attr('fill', d => color(d.key));

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0));

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

        ['text1', 'text2'].forEach((key, i) => {
            const text = key === 'text1' ? text1.metadata.title : text2.metadata.title;
            const short = text.length > 20 ? text.substring(0, 20) + '...' : text;

            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 20)
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', color(key));

            legend.append('text')
                .attr('x', 20)
                .attr('y', i * 20 + 12)
                .text(short)
                .style('font-size', '12px');
        });
    }

    renderStyleComparison(text1, text2) {
        const container = document.getElementById('style-comparison-chart');
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 100, left: 60 };

        const metrics = [
            { label: 'TTR', key: 'type_token_ratio', scale: 1 },
            { label: 'Vocab Richness', key: 'vocabulary_richness', scale: 1 },
            { label: 'Avg Word Len', key: 'avg_word_length', scale: 0.1 },
            { label: 'Avg Sent Len', key: 'avg_sentence_length', scale: 0.05 }
        ];

        const data = metrics.map(m => ({
            metric: m.label,
            text1: text1.style_metrics[m.key] * m.scale,
            text2: text2.style_metrics[m.key] * m.scale
        }));

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.metric))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['text1', 'text2'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const maxValue = d3.max(data, d => Math.max(d.text1, d.text2));
        const y = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal()
            .domain(['text1', 'text2'])
            .range(['#0d6efd', '#fd7e14']);

        // Bars
        const groups = svg.selectAll('g.metric-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'metric-group')
            .attr('transform', d => `translate(${x0(d.metric)},0)`);

        groups.selectAll('rect')
            .data(d => ['text1', 'text2'].map(key => ({ key, value: d[key], metric: d.metric })))
            .enter()
            .append('rect')
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => height - margin.bottom - y(d.value))
            .attr('fill', d => color(d.key));

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

        ['text1', 'text2'].forEach((key, i) => {
            const text = key === 'text1' ? text1.metadata.title : text2.metadata.title;
            const short = text.length > 20 ? text.substring(0, 20) + '...' : text;

            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 20)
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', color(key));

            legend.append('text')
                .attr('x', 20)
                .attr('y', i * 20 + 12)
                .text(short)
                .style('font-size', '12px');
        });
    }

    renderVocabularyOverlap(text1, text2) {
        const container = document.getElementById('vocabulary-overlap');

        const vocab1 = new Set(Object.keys(text1.word_frequencies));
        const vocab2 = new Set(Object.keys(text2.word_frequencies));

        const overlap = new Set([...vocab1].filter(w => vocab2.has(w)));
        const unique1 = vocab1.size - overlap.size;
        const unique2 = vocab2.size - overlap.size;

        const overlapPercent1 = ((overlap.size / vocab1.size) * 100).toFixed(1);
        const overlapPercent2 = ((overlap.size / vocab2.size) * 100).toFixed(1);

        container.innerHTML = `
            <div class="vocabulary-stats">
                <div class="vocab-stat">
                    <div class="vocab-stat-value">${overlap.size}</div>
                    <div class="vocab-stat-label">Shared Words</div>
                </div>
                <div class="vocab-stat">
                    <div class="vocab-stat-value">${unique1}</div>
                    <div class="vocab-stat-label">Unique to ${text1.metadata.title}</div>
                </div>
                <div class="vocab-stat">
                    <div class="vocab-stat-value">${unique2}</div>
                    <div class="vocab-stat-label">Unique to ${text2.metadata.title}</div>
                </div>
            </div>
            <p class="text-center mt-3 text-muted">
                Overlap: ${overlapPercent1}% of "${text1.metadata.title}" vocabulary,
                ${overlapPercent2}% of "${text2.metadata.title}" vocabulary
            </p>
        `;
    }

    renderTopicsComparison(text1, text2) {
        const renderTopics = (text, containerId) => {
            const container = document.getElementById(containerId);
            if (!text.topics || text.topics.length === 0) {
                container.innerHTML = '<p class="text-muted">No topics available.</p>';
                return;
            }

            container.innerHTML = text.topics.map(topic => `
                <div class="topic-card">
                    <div class="topic-title">Topic ${topic.topic_id}</div>
                    <div class="topic-words">
                        ${topic.words.map(word => `<span class="topic-word">${word}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        };

        renderTopics(text1, 'topics-compare-1');
        renderTopics(text2, 'topics-compare-2');
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger">
                    <h4>Error</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DistantReadingApp();
});
