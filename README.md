# Distant Reading: Science Fiction Corpus Analysis

A computational literary analysis system for exploring Project Gutenberg science fiction texts through distant reading techniques.

## Overview

This project provides automated analysis and interactive visualization of a corpus of science fiction short stories from Project Gutenberg. It uses natural language processing to extract patterns, sentiment, style characteristics, and themes across the collection.

## Features

### Python Analysis Pipeline
- **Text Preprocessing**: Tokenization, lemmatization, and stopword filtering using NLTK
- **Word Frequency Analysis**: Bag-of-words representation with top 50 words per text
- **Sentiment Analysis**: VADER sentiment scoring with positive/negative/neutral classification
- **Stylometric Analysis**: Lexical diversity, vocabulary richness, sentence/word length metrics
- **Topic Modeling**: Latent Dirichlet Allocation (LDA) to extract themes from each text

### Interactive Web Interface
- **Browse View**: Explore individual texts with comprehensive visualizations
  - Word clouds showing frequency distributions
  - Sentiment charts and statistics
  - Style metrics tables
  - Extracted topics with keywords
- **Compare View**: Side-by-side comparison of any two texts
  - Dual word clouds
  - Sentiment comparison charts
  - Style metrics comparison
  - Vocabulary overlap analysis
  - Topic comparison

## Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd claude-distant-reading
   ```

2. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run the analysis**
   ```bash
   python analyze_corpus.py
   ```
   This will process all texts and generate `corpus_analysis.json`.

4. **View the web interface**
   ```bash
   python -m http.server 8000
   ```
   Then open your browser to: `http://localhost:8000`

## The Corpus

The corpus contains 9 science fiction short stories from Project Gutenberg:

1. **There Will Be School Tomorrow** by V. E. Thiessen
2. **Beside Still Waters** (Author TBD)
3. **Service with a Smile** (Author TBD)
4. **Robots of the World! Arise!** (Author TBD)
5. **Second Variety** by Philip K. Dick
6. **His Master's Voice** (Author TBD)
7. **The Miserly Robot** (Author TBD)
8. **Let's Get Together** (Author TBD)
9. **My robot** (Author TBD)

Total corpus size: ~11,446 lines

## Project Structure

```
claude-distant-reading/
├── pg*.txt                    # 9 Project Gutenberg source texts
├── analyze_corpus.py          # Python analysis script
├── corpus_analysis.json       # Generated analysis data (JSON)
├── index.html                 # Web interface (HTML)
├── styles.css                 # Custom styling (CSS)
├── app.js                     # Visualizations (JavaScript + D3.js)
├── requirements.txt           # Python dependencies
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # Developer guidance
└── README.md                  # This file
```

## Technologies Used

### Backend Analysis
- **Python 3**: Core programming language
- **NLTK**: Natural Language Toolkit for text processing
- **VADER Sentiment**: Rule-based sentiment analysis
- **scikit-learn**: Machine learning library for LDA topic modeling
- **NumPy**: Numerical computations

### Frontend Visualization
- **Bootstrap 5**: Responsive UI framework
- **D3.js**: Data visualization library
- **d3-cloud**: Word cloud layout algorithm
- **Vanilla JavaScript**: Application logic

## How It Works

### 1. Text Extraction
The analysis script reads each Project Gutenberg text file and:
- Extracts metadata (title, author, release date)
- Isolates the main text body (between START/END markers)
- Removes boilerplate header and footer content

### 2. Preprocessing
Each text undergoes NLP preprocessing:
- Tokenization into individual words
- Conversion to lowercase
- Lemmatization (reducing words to base forms)
- Stopword removal (common words like "the", "a", "is")
- Filtering to alphabetic tokens only

### 3. Analysis
Multiple analytical lenses are applied:
- **Frequency counting** to identify most common words
- **VADER sentiment** to measure emotional tone
- **Statistical metrics** for writing style characteristics
- **LDA topic modeling** to discover themes

### 4. Visualization
The web interface uses D3.js to render:
- Interactive word clouds (hover to see frequencies)
- Bar charts for sentiment scores
- Comparison charts for style metrics
- Formatted topic displays

## Customization

### Adjusting Analysis Parameters

Edit `analyze_corpus.py` to modify:
- Number of top words: Change `most_common(50)` on line ~108
- Number of topics: Change `n_topics=3` on line ~194
- Words per topic: Change `n_words=8` on line ~194
- Stopword list: Modify `self.stop_words` on line ~28

### Adding New Texts

1. Download Project Gutenberg texts in `.txt` format
2. Name them `pg[NUMBER].txt` (e.g., `pg99999.txt`)
3. Place in repository root
4. Rerun `python analyze_corpus.py`
5. Refresh web interface

## Distant Reading Methodology

This project implements **distant reading**, a literary analysis approach coined by Franco Moretti. Rather than close reading individual texts, distant reading uses computational methods to identify patterns across large collections. This enables:

- **Scale**: Analyzing entire genres or periods
- **Patterns**: Discovering trends invisible to close reading
- **Comparison**: Quantitative comparison of texts and authors
- **Objectivity**: Data-driven insights alongside interpretive analysis

## License

The Project Gutenberg texts included in this corpus are in the public domain in the United States and most other countries. Please check your local laws before use.

The analysis code and web interface in this project are available for educational and research purposes.

## Acknowledgments

- **Project Gutenberg** for providing free access to literary texts
- **VADER Sentiment** by Hutto & Gilbert (2014)
- **D3.js** by Mike Bostock and contributors
- **NLTK** by Bird, Klein & Loper

## Support

For issues or questions about the code, please refer to `CLAUDE.md` for technical documentation and development guidance.
