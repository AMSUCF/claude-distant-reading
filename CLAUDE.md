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

## Development Workflow

Since this is a text corpus without build/test infrastructure:
1. Create analysis scripts in the repository root or a dedicated directory (e.g., `scripts/`, `analysis/`)
2. Use virtual environments for Python dependencies: `python -m venv venv && source venv/bin/activate`
3. Document analysis results in markdown files or Jupyter notebooks
4. Consider adding a `requirements.txt` for any analysis dependencies

## File Naming Convention

When adding analysis code or results:
- Scripts: Use descriptive names like `word_frequency.py`, `topic_modeling.py`
- Results: Use prefixes like `results_`, `analysis_`, or organize in subdirectories
- Keep the original `pg*.txt` files unchanged to preserve the source corpus
