# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **distant reading** corpus containing science fiction texts from Project Gutenberg. Distant reading is a literary analysis approach that uses computational methods to analyze patterns across large collections of texts, rather than close reading individual works.

## Corpus Structure

The repository contains 9 Project Gutenberg eBook files:
- All files follow the naming pattern `pg[NUMBER].txt` where the number is the Project Gutenberg catalog ID
- Files range from ~573 to ~2967 lines in length
- Total corpus size: ~11,446 lines

### Project Gutenberg Text Format

Each text file has a standard structure:
1. **Header section**: Copyright notice, title, author, release date, language, credits
2. **Start marker**: `*** START OF THE PROJECT GUTENBERG EBOOK [TITLE] ***`
3. **Body content**: The actual text of the work
4. **End marker**: `*** END OF THE PROJECT GUTENBERG EBOOK [TITLE] ***`
5. **Footer section**: License and Project Gutenberg information

When extracting text for analysis, you typically want to:
- Strip the header (before START marker) and footer (after END marker)
- Extract metadata from the header (title, author, date) for cataloging
- Handle the UTF-8 BOM character (﻿) at the start of files

Example extraction pattern:
```python
with open('pg12345.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract metadata
title_match = re.search(r'Title: (.+)', content)
author_match = re.search(r'Author: (.+)', content)

# Extract body text
start_marker = '*** START OF THE PROJECT GUTENBERG EBOOK'
end_marker = '*** END OF THE PROJECT GUTENBERG EBOOK'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)
if start_idx != -1 and end_idx != -1:
    # Skip to end of start marker line
    start_idx = content.find('\n', start_idx) + 1
    body_text = content[start_idx:end_idx].strip()
```

## Common Analytical Approaches

When working with this corpus, typical distant reading analyses include:

### Text Processing
- Tokenization and normalization
- Stop word removal
- Lemmatization or stemming
- N-gram extraction

### Computational Analysis
- Word frequency analysis across the corpus
- TF-IDF (term frequency-inverse document frequency) to identify distinctive vocabulary
- Topic modeling (LDA, NMF) to discover themes
- Sentiment analysis and emotional arcs
- Named entity recognition for characters and locations
- Comparative analysis between texts or authors
- Stylometric analysis (sentence length, vocabulary richness, etc.)

### Visualization
- Word clouds
- Frequency distributions
- Topic evolution over the course of narratives
- Network graphs of character interactions or concept relationships

## Working with the Corpus

### Loading All Texts
When building analysis scripts, you'll typically want to:
1. Iterate through all `pg*.txt` files
2. Extract metadata and body text from each
3. Store in a structured format (dict, DataFrame, or custom class)

### Genre Context
The texts in this corpus appear to be science fiction. Keep this genre in mind when:
- Building stop word lists (sci-fi specific terms may be significant)
- Interpreting themes and topics
- Comparing against other corpora or baseline language models

## Analysis System

This repository includes a complete distant reading analysis system:

### Python Analysis (`analyze_corpus.py`)
Automated analysis script that processes all texts and generates JSON output:
- **Dependencies**: spaCy, NLTK, VADER, scikit-learn (see `requirements.txt`)
- **Setup**: `python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- **Run**: `venv/bin/python analyze_corpus.py`
- **Output**: `corpus_analysis.json` with complete analysis for all texts

The script performs:
1. **Preprocessing**: Tokenization, lemmatization with NLTK, stopword filtering
2. **Bag of Words**: Top 50 words with frequencies for each text
3. **Sentiment Analysis**: VADER sentiment scores (compound, positive, negative, neutral)
4. **Style Metrics**: Type-token ratio, vocabulary richness, average word/sentence length
5. **Topic Modeling**: LDA to extract 3 topics per text with top 8 words each

### Web Interface (`index.html`)
Interactive visualization dashboard using D3.js and Bootstrap:
- **Access**: Open `index.html` in a web browser (requires local server for JSON loading)
- **Simple server**: `python3 -m http.server 8000` then visit `http://localhost:8000`

Features:
- **Browse View**: Explore individual texts with word clouds, sentiment charts, style metrics, and topics
- **Compare View**: Side-by-side comparison of any two texts with vocabulary overlap analysis
- **Visualizations**: D3.js word clouds, bar charts for sentiment, style comparison charts

### Project Structure
```
/
├── pg*.txt (9 files)           # Project Gutenberg source texts
├── analyze_corpus.py           # Python analysis script
├── corpus_analysis.json        # Generated analysis data
├── index.html                  # Web interface
├── styles.css                  # Custom styling
├── app.js                      # D3.js visualizations
├── requirements.txt            # Python dependencies
├── .gitignore                  # Python artifacts
├── venv/                       # Virtual environment (gitignored)
└── CLAUDE.md                   # This file
```

## Development Workflow

### Running Analysis
1. Activate virtual environment: `source venv/bin/activate`
2. Run analysis: `python analyze_corpus.py`
3. View results in web interface: `python -m http.server 8000`

### Modifying Analysis
- Edit `analyze_corpus.py` to change analysis parameters or add new metrics
- Update `app.js` to add new visualizations or modify existing ones
- Rerun analysis script to regenerate `corpus_analysis.json`

### Adding New Texts
1. Add new `pg*.txt` files to the root directory
2. Rerun `analyze_corpus.py` to include them in analysis
3. Web interface will automatically display new texts
