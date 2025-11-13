#!/usr/bin/env python3
"""
Distant Reading Analysis Script
Analyzes Project Gutenberg texts for word frequencies, sentiment, style, and topics.
"""

import json
import re
import glob
from collections import Counter
from pathlib import Path

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import numpy as np


class ProjectGutenbergText:
    """Represents a single Project Gutenberg text with analysis."""

    def __init__(self, filepath):
        self.filepath = Path(filepath)
        self.pg_id = self.filepath.stem
        self.raw_content = self.filepath.read_text(encoding='utf-8')

        # Extract components
        self.metadata = self._extract_metadata()
        self.body_text = self._extract_body()

        # Initialize analyzers
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def _extract_metadata(self):
        """Extract title, author, release date from header."""
        metadata = {
            'pg_id': self.pg_id,
            'title': None,
            'author': None,
            'release_date': None,
            'language': None
        }

        title_match = re.search(r'Title:\s*(.+)', self.raw_content)
        if title_match:
            metadata['title'] = title_match.group(1).strip()

        author_match = re.search(r'Author:\s*(.+)', self.raw_content)
        if author_match:
            metadata['author'] = author_match.group(1).strip()

        date_match = re.search(r'Release date:\s*(.+?)(?:\[|$)', self.raw_content)
        if date_match:
            metadata['release_date'] = date_match.group(1).strip()

        lang_match = re.search(r'Language:\s*(.+)', self.raw_content)
        if lang_match:
            metadata['language'] = lang_match.group(1).strip()

        return metadata

    def _extract_body(self):
        """Extract the main text between START and END markers."""
        start_marker = '*** START OF THE PROJECT GUTENBERG EBOOK'
        end_marker = '*** END OF THE PROJECT GUTENBERG EBOOK'

        start_idx = self.raw_content.find(start_marker)
        end_idx = self.raw_content.find(end_marker)

        if start_idx != -1 and end_idx != -1:
            # Skip to end of start marker line
            start_idx = self.raw_content.find('\n', start_idx) + 1
            body = self.raw_content[start_idx:end_idx].strip()
            # Remove BOM if present
            body = body.lstrip('\ufeff')
            return body

        return ""

    def preprocess(self):
        """Tokenize, lemmatize, and filter text."""
        # Tokenize
        tokens = word_tokenize(self.body_text.lower())

        # Filter: only alphabetic, not stopwords, length > 2
        filtered_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token.isalpha() and token not in self.stop_words and len(token) > 2
        ]

        return filtered_tokens

    def build_bag_of_words(self, tokens):
        """Create word frequency dictionary."""
        word_counts = Counter(tokens)
        total_words = len(tokens)

        # Create list of word objects with frequencies
        bag_of_words = [
            {
                'word': word,
                'count': count,
                'frequency': count / total_words if total_words > 0 else 0
            }
            for word, count in word_counts.most_common(50)
        ]

        # Also return full frequency dict for comparisons
        word_frequencies = dict(word_counts)

        return bag_of_words, word_frequencies

    def analyze_sentiment(self):
        """Analyze sentiment using VADER."""
        # Analyze full text
        scores = self.sentiment_analyzer.polarity_scores(self.body_text)

        # Analyze by sentence for more granular data
        sentences = sent_tokenize(self.body_text)
        sentence_sentiments = [
            self.sentiment_analyzer.polarity_scores(sent)['compound']
            for sent in sentences if sent.strip()
        ]

        return {
            'compound': scores['compound'],
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu'],
            'classification': self._classify_sentiment(scores['compound']),
            'sentence_sentiments': {
                'mean': float(np.mean(sentence_sentiments)) if sentence_sentiments else 0,
                'std': float(np.std(sentence_sentiments)) if sentence_sentiments else 0,
                'min': float(np.min(sentence_sentiments)) if sentence_sentiments else 0,
                'max': float(np.max(sentence_sentiments)) if sentence_sentiments else 0
            }
        }

    def _classify_sentiment(self, compound_score):
        """Classify sentiment based on compound score."""
        if compound_score >= 0.05:
            return 'positive'
        elif compound_score <= -0.05:
            return 'negative'
        else:
            return 'neutral'

    def analyze_style(self, tokens):
        """Calculate lexical diversity and vocabulary richness metrics."""
        # Get all words for complete analysis
        all_tokens = word_tokenize(self.body_text.lower())
        all_words = [t for t in all_tokens if t.isalpha()]

        sentences = sent_tokenize(self.body_text)

        # Lexical diversity metrics
        unique_words = len(set(tokens))
        total_words = len(tokens)
        ttr = unique_words / total_words if total_words > 0 else 0

        # Vocabulary richness (using all words, not just filtered)
        unique_all = len(set(all_words))
        total_all = len(all_words)

        # Average word length
        avg_word_length = np.mean([len(word) for word in tokens]) if tokens else 0

        # Average sentence length
        avg_sentence_length = len(all_words) / len(sentences) if sentences else 0

        return {
            'type_token_ratio': round(ttr, 4),
            'unique_words': unique_words,
            'total_words': total_words,
            'unique_words_all': unique_all,
            'total_words_all': total_all,
            'avg_word_length': round(float(avg_word_length), 2),
            'avg_sentence_length': round(float(avg_sentence_length), 2),
            'total_sentences': len(sentences),
            'vocabulary_richness': round(unique_all / total_all if total_all > 0 else 0, 4)
        }

    def extract_topics(self, n_topics=3, n_words=8):
        """Extract topics using LDA."""
        # Prepare text for topic modeling
        sentences = sent_tokenize(self.body_text)

        # Need at least some sentences for topic modeling
        if len(sentences) < n_topics:
            return []

        # Vectorize
        vectorizer = CountVectorizer(
            max_features=1000,
            stop_words='english',
            min_df=2
        )

        try:
            doc_term_matrix = vectorizer.fit_transform(sentences)

            # LDA
            lda = LatentDirichletAllocation(
                n_components=n_topics,
                random_state=42,
                max_iter=20
            )
            lda.fit(doc_term_matrix)

            # Extract top words for each topic
            feature_names = vectorizer.get_feature_names_out()
            topics = []

            for topic_idx, topic in enumerate(lda.components_):
                top_indices = topic.argsort()[-n_words:][::-1]
                top_words = [feature_names[i] for i in top_indices]
                topics.append({
                    'topic_id': topic_idx + 1,
                    'words': top_words,
                    'weight': float(topic[top_indices[0]])
                })

            return topics
        except Exception as e:
            print(f"Warning: Topic modeling failed for {self.pg_id}: {e}")
            return []

    def analyze(self):
        """Run complete analysis and return results."""
        print(f"Analyzing {self.pg_id}: {self.metadata.get('title', 'Unknown')}")

        # Preprocess
        tokens = self.preprocess()

        # Build bag of words
        top_words, word_frequencies = self.build_bag_of_words(tokens)

        # Sentiment
        sentiment = self.analyze_sentiment()

        # Style
        style = self.analyze_style(tokens)

        # Topics
        topics = self.extract_topics()

        return {
            'id': self.pg_id,
            'metadata': self.metadata,
            'top_words': top_words,
            'word_frequencies': word_frequencies,
            'sentiment': sentiment,
            'style_metrics': style,
            'topics': topics
        }


def analyze_corpus(corpus_dir='.'):
    """Analyze all Project Gutenberg texts in the directory."""
    corpus_path = Path(corpus_dir)
    text_files = sorted(corpus_path.glob('pg*.txt'))

    if not text_files:
        print("No Project Gutenberg files (pg*.txt) found!")
        return

    print(f"Found {len(text_files)} texts to analyze\n")

    results = {
        'corpus_info': {
            'total_texts': len(text_files),
            'analysis_date': None
        },
        'texts': []
    }

    for filepath in text_files:
        try:
            pg_text = ProjectGutenbergText(filepath)
            analysis = pg_text.analyze()
            results['texts'].append(analysis)
        except Exception as e:
            print(f"Error analyzing {filepath}: {e}")

    # Save to JSON
    output_file = corpus_path / 'corpus_analysis.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Analysis complete! Results saved to {output_file}")
    print(f"  Analyzed {len(results['texts'])} texts")

    return results


if __name__ == '__main__':
    analyze_corpus()
