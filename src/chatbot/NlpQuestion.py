#!/usr/bin/env python3
"""
NlpQuestion.py - A module for tokenizing and analyzing questions using NLP techniques.
This module uses spaCy to extract parts of speech, entities, and subjects from questions.

Installation:
    pip install spacy
    python -m spacy download en_core_web_sm
"""

from typing import Dict, List, Tuple, Any, Optional
from nlpmodel import db_configsystems
# Global flag to check if spaCy is available
SPACY_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    print("spaCy is not installed. Please install it using:")
    print("pip install spacy")
    print("python -m spacy download en_core_web_sm")

class NlpQuestionAnalyzer:
    """
    A class for analyzing questions using NLP techniques.
    """
    
    def __init__(self, model: str = "en_core_web_sm"):
        """
        Initialize the NLP question analyzer with a spaCy model.
        
        Args:
            model (str): The spaCy model to use for NLP processing.
        """
        if not SPACY_AVAILABLE:
            raise ImportError(
                "spaCy is required for this module. Please install it using:\n"
                "pip install spacy\n"
                "python -m spacy download en_core_web_sm"
            )
            
        try:
            self.nlp = spacy.load(model)
        except OSError:
            # If the model is not installed, provide instructions
            print(f"Model '{model}' not found. Please install it using:")
            print(f"python -m spacy download {model}")
            raise
    
    def analyze_question(self, question: str) -> Dict[str, Any]:
        """
        Analyze a question and extract linguistic information.
        
        Args:
            question (str): The question to analyze.
            
        Returns:
            Dict[str, Any]: A dictionary containing the analysis results.
        """
        doc = self.nlp(question)
        
        # Extract parts of speech
        tokens = []
        for token in doc:
            tokens.append({
                'text': token.text,
                'lemma': token.lemma_,
                'pos': token.pos_,
                'tag': token.tag_,
                'dep': token.dep_,
                'is_stop': token.is_stop,
                'is_punct': token.is_punct,
                'is_alpha': token.is_alpha,
                'is_digit': token.is_digit,
                'is_lower': token.is_lower,
                'is_title': token.is_title,
                'is_OOV': token.is_oov
            })
        
        # Extract named entities
        entities = []
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'label': ent.label_
            })
        
        # Extract noun chunks (potential subjects)
        noun_chunks = []
        for chunk in doc.noun_chunks:
            noun_chunks.append({
                'text': chunk.text,
                'root_text': chunk.root.text,
                'root_dep': chunk.root.dep_,
                'root_head_text': chunk.root.head.text
            })
        
        # Extract subject specifically
        subjects = []
        for token in doc:
            if "subj" in token.dep_:
                # Get the full subject phrase
                subject_phrase = self._get_subtree_span(token)
                subjects.append({
                    'text': subject_phrase,
                    'root': token.text,
                    'dep': token.dep_
                })
        
        # Extract product/version information (e.g., "Informix 12.1")
        product_versions = self._extract_product_versions(doc)
        
        return {
            'tokens': tokens,
            'entities': entities,
            'noun_chunks': noun_chunks,
            'subjects': subjects,
            'product_versions': product_versions,
            'full_doc': doc
        }
    
    def _get_entity_description(self, label: str) -> str:
        """
        Get a human-readable description of an entity label.
        
        Args:
            label (str): The entity label.
            
        Returns:
            str: A description of the entity type.
        """
        # Common spaCy entity types and their descriptions
        descriptions = {
            "PERSON": "People, including fictional",
            "NORP": "Nationalities or religious or political groups",
            "FAC": "Buildings, airports, highways, bridges, etc.",
            "ORG": "Companies, agencies, institutions, etc.",
            "GPE": "Countries, cities, states",
            "LOC": "Non-GPE locations, mountain ranges, bodies of water",
            "PRODUCT": "Objects, vehicles, foods, etc. (not services)",
            "EVENT": "Named hurricanes, battles, wars, sports events, etc.",
            "WORK_OF_ART": "Titles of books, songs, etc.",
            "LAW": "Named documents made into laws",
            "LANGUAGE": "Any named language",
            "DATE": "Absolute or relative dates or periods",
            "TIME": "Times smaller than a day",
            "PERCENT": "Percentage, including '%'",
            "MONEY": "Monetary values, including unit",
            "QUANTITY": "Measurements, as of weight or distance",
            "ORDINAL": "First, second, etc.",
            "CARDINAL": "Numerals that do not fall under another type",
            # Custom entity types
            "DATABASE_SYSTEM": "Database management system",
            "SECURITY_SYSTEM": "Security or monitoring system",
            "MONITORING_METHOD": "Method used for database monitoring",
            "VERSION": "Software version number"
        }
        
        return descriptions.get(label, f"Entity type: {label}")
    
    def get_named_entities(self, question: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from a question.
        
        Args:
            question (str): The question to analyze.
            
        Returns:
            List[Dict[str, Any]]: A list of named entities with their types and positions.
        """
        doc = self.nlp(question)
        
        entities = []
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'label': ent.label_,
                'description': self._get_entity_description(ent.label_)
            })
        
        # Add custom database entity recognition
        db_entities = self._extract_database_entities(doc)
        entities.extend(db_entities)
        
        return entities
    
    def _extract_database_entities(self, doc) -> List[Dict[str, Any]]:
        """
        Extract database-related entities that might not be recognized by the standard NER.
        
        Args:
            doc: A spaCy Doc object.
            
        Returns:
            List[Dict[str, Any]]: A list of database-related entities.
        """
        # Common database systems and related terms
        db_systems = db_configsystems
        
        entities = []
        
        # Check for database systems in the text
        for term, entity_type in db_systems.items():
            if term.lower() in doc.text.lower():
                # Find the exact position
                start_pos = doc.text.lower().find(term.lower())
                if start_pos >= 0:
                    entities.append({
                        'text': doc.text[start_pos:start_pos + len(term)],
                        'start': start_pos,
                        'end': start_pos + len(term),
                        'label': entity_type,
                        'description': f"Custom {entity_type.replace('_', ' ').title()} Entity"
                    })
        
        # Extract version patterns that might be missed
        version_pattern = r"\d+\.\d+(?:\.\d+)?"
        import re
        for match in re.finditer(version_pattern, doc.text):
            # Check if this version is already part of a product-version entity
            is_part_of_existing = False
            for entity in entities:
                if match.start() >= entity['start'] and match.end() <= entity['end']:
                    is_part_of_existing = True
                    break
            
            if not is_part_of_existing:
                entities.append({
                    'text': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'label': "VERSION",
                    'description': "Software Version Number"
                })
        
        return entities
    
    def _get_subtree_span(self, token) -> str:
        """
        Get the text span of a token's subtree.
        
        Args:
            token: A spaCy token.
            
        Returns:
            str: The text of the subtree.
        """
        return ' '.join([t.text for t in sorted(token.subtree, key=lambda t: t.i)])
    
    def _extract_product_versions(self, doc) -> List[Dict[str, str]]:
        """
        Extract product and version information from the document.
        
        Args:
            doc: A spaCy Doc object.
            
        Returns:
            List[Dict[str, str]]: A list of product-version pairs.
        """
        results = []
        
        # Pattern: Product followed by version number
        for i, token in enumerate(doc):
            if token.pos_ == "PROPN" and i + 1 < len(doc) and doc[i+1].is_digit:
                version = doc[i+1].text
                # Check if there's more to the version (e.g., 12.1)
                j = i + 2
                while j < len(doc) and (doc[j].text == "." or doc[j].is_digit):
                    version += doc[j].text
                    j += 1
                
                results.append({
                    'product': token.text,
                    'version': version,
                    'full': f"{token.text} {version}"
                })
        
        return results
    
    def get_parts_of_speech(self, question: str) -> Dict[str, List[str]]:
        """
        Extract words by their parts of speech from a question.
        
        Args:
            question (str): The question to analyze.
            
        Returns:
            Dict[str, List[str]]: A dictionary mapping POS categories to lists of words.
        """
        doc = self.nlp(question)
        
        pos_dict = {
            'nouns': [],
            'verbs': [],
            'adjectives': [],
            'adverbs': [],
            'proper_nouns': [],
            'numbers': []
        }
        
        for token in doc:
            if token.pos_ == "NOUN":
                pos_dict['nouns'].append(token.text)
            elif token.pos_ == "VERB":
                pos_dict['verbs'].append(token.text)
            elif token.pos_ == "ADJ":
                pos_dict['adjectives'].append(token.text)
            elif token.pos_ == "ADV":
                pos_dict['adverbs'].append(token.text)
            elif token.pos_ == "PROPN":
                pos_dict['proper_nouns'].append(token.text)
            elif token.pos_ == "NUM":
                pos_dict['numbers'].append(token.text)
        
        return pos_dict
    
    def extract_subject_object_pairs(self, question: str) -> List[Dict[str, str]]:
        """
        Extract subject-verb-object triplets from a question.
        
        Args:
            question (str): The question to analyze.
            
        Returns:
            List[Dict[str, str]]: A list of subject-verb-object triplets.
        """
        doc = self.nlp(question)
        
        # Find all subject-verb-object triplets
        triplets = []
        
        for token in doc:
            if "subj" in token.dep_:
                subject = self._get_subtree_span(token)
                verb = token.head.text
                
                # Find objects connected to the verb
                obj = None
                for child in token.head.children:
                    if "obj" in child.dep_:
                        obj = self._get_subtree_span(child)
                
                triplets.append({
                    'subject': subject,
                    'verb': verb,
                    'object': obj
                })
        
        return triplets


def main():
    """
    Example usage of the NlpQuestionAnalyzer class.
    """
    if not SPACY_AVAILABLE:
        print("\nERROR: spaCy is not installed. Please install it using:")
        print("pip install spacy")
        print("python -m spacy download en_core_web_sm")
        return
    
    try:
        # Create an instance of the analyzer
        analyzer = NlpQuestionAnalyzer()
        
        # Example questions
        questions = [
            "Does Guardium supports Informix 12.1 version?",
            "Can I monitor Oracle 19c with Guardium using STAP?",
            "Is MongoDB 4.2 compatible with Guardium on AWS?",
            "Does IBM Guardium support Microsoft SQL Server 2019 on Azure?"
        ]
        
        for question in questions:
            print(f"\n{'='*60}")
            print(f"Analyzing question: '{question}'")
            print(f"{'='*60}")
            
            # Get parts of speech
            pos_dict = analyzer.get_parts_of_speech(question)
            print("\nParts of Speech:")
            for pos, words in pos_dict.items():
                if words:
                    print(f"  {pos.capitalize()}: {', '.join(words)}")
            
            # Extract subject-verb-object triplets
            print("\nSubject-Verb-Object Triplets:")
            triplets = analyzer.extract_subject_object_pairs(question)
            for triplet in triplets:
                print(f"  Subject: {triplet['subject']}")
                print(f"  Verb: {triplet['verb']}")
                if triplet['object']:
                    print(f"  Object: {triplet['object']}")
                print()
            
            # Named Entity Recognition
            print("Named Entities (NER):")
            entities = analyzer.get_named_entities(question)
            if entities:
                for entity in entities:
                    print(f"  {entity['text']} - {entity['label']} ({entity['description']})")
            else:
                print("  No named entities found")
            
            # Product-Version Information
            analysis = analyzer.analyze_question(question)
            print("\nProduct-Version Information:")
            if analysis['product_versions']:
                for item in analysis['product_versions']:
                    print(f"  {item['product']} {item['version']}")
            else:
                print("  No product-version information found")
            
            print("\n")
            
    except ImportError as e:
        print(f"\nERROR: {e}")
    except Exception as e:
        print(f"\nERROR: An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()

# Made with Bob
