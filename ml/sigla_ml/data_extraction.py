#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv

class DataExtractor:
    """Class for extracting data from the SIGLA database."""
    
    def __init__(self, supabase_config: Optional[Dict] = None):
        """Initialize the DataExtractor with Supabase configuration.
        
        Args:
            supabase_config (dict, optional): Supabase configuration. If None, will load from environment variables.
        """
        load_dotenv()  # Load environment variables from .env file
        
        if supabase_config is None:
            self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            self.supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        else:
            self.supabase_url = supabase_config.get('url')
            self.supabase_key = supabase_config.get('key')
            
        self.supabase: Client = None
    
    def _get_connection(self):
        """Get a connection to Supabase.
        
        Returns:
            Client: Supabase client object.
        """
        if not self.supabase:
            if not self.supabase_url or not self.supabase_key:
                raise ValueError("Supabase URL and key are required")
            self.supabase = create_client(self.supabase_url, self.supabase_key)
        return self.supabase
    
    def extract_survey_responses(self, filters=None):
        """Extract survey responses from Supabase.
        
        Args:
            filters (dict, optional): Filters to apply to the query.
                Example: {'barangay_id': 1, 'date_from': '2023-01-01'}
        
        Returns:
            pd.DataFrame: DataFrame containing survey responses.
        """
        try:
            supabase = self._get_connection()
            
            # Build query for survey responses with related data (barangay-focused)
            query = supabase.table('survey_response').select(
                'response_id, barangay_id, interviewer_id, created_at, updated_at, '
                'survey_section(section_name, '
                'survey_answer(answer_value, answer_text, '
                'survey_question(question_text, question_type))), '
                'barangay(barangay_name, population, households, area)'
            )
            
            # Apply filters if provided
            if filters:
                if 'barangay_id' in filters:
                    query = query.eq('barangay_id', filters['barangay_id'])
                
                if 'date_from' in filters:
                    query = query.gte('created_at', filters['date_from'])
                
                if 'date_to' in filters:
                    query = query.lte('created_at', filters['date_to'])
            
            response = query.execute()
            
            # Flatten the nested data structure
            flattened_data = []
            for survey_response in response.data:
                barangay = survey_response.get('barangays', {})
                for section in survey_response.get('survey_section', []):
                    for answer in section.get('survey_answer', []):
                        question = answer.get('survey_question', {})
                        flattened_data.append({
                            'response_id': survey_response['response_id'],
                            'barangay_id': survey_response['barangay_id'],
                            'interviewer_id': survey_response['interviewer_id'],
                            'created_at': survey_response['created_at'],
                            'updated_at': survey_response['updated_at'],
                            'section_name': section.get('section_name'),
                            'question_text': question.get('question_text'),
                            'question_type': question.get('question_type'),
                            'answer_value': answer.get('answer_value'),
                            'answer_text': answer.get('answer_text'),
                            'barangay_name': barangay.get('barangay_name'),
                            'population': barangay.get('population'),
                            'households': barangay.get('households'),
                            'area_sqkm': float(barangay.get('area', 0)) if barangay.get('area') else 0
                        })
            
            return pd.DataFrame(flattened_data)
            
        except Exception as e:
            print(f"Error extracting survey responses: {e}")
            return pd.DataFrame()
    
    def extract_historical_performance(self, barangay_id=None):
        """Extract historical performance data for barangays.
        
        Args:
            barangay_id (int, optional): Filter by specific barangay ID.
        
        Returns:
            pd.DataFrame: DataFrame containing historical performance data.
        """
        try:
            supabase = self._get_connection()
            
            # Build query for historical performance with barangay data
            query = supabase.table('barangay_history').select(
                'history_id, barangay_id, year, status, score, notes, created_at, '
                'barangay(barangay_name)'
            )
            
            if barangay_id:
                query = query.eq('barangay_id', barangay_id)
            
            response = query.execute()
            
            # Flatten the data structure
            flattened_data = []
            for record in response.data:
                barangay = record.get('barangay', {})
                flattened_data.append({
                    'history_id': record['history_id'],
                    'barangay_id': record['barangay_id'],
                    'year': record['year'],
                    'status': record['status'],
                    'score': record['score'],
                    'notes': record['notes'],
                    'created_at': record['created_at'],
                    'barangay_name': barangay.get('barangay_name')
                })
            
            return pd.DataFrame(flattened_data)
            
        except Exception as e:
            # If table doesn't exist yet, return empty DataFrame with expected columns
            columns = ['history_id', 'barangay_id', 'year', 'status', 
                      'score', 'notes', 'created_at', 'barangay_name']
            return pd.DataFrame(columns=columns)
    
    def extract_demographic_data(self, barangay_id=None):
        """Extract demographic data for barangays (barangay-focused analysis).
        
        Args:
            barangay_id (int, optional): Filter by specific barangay ID.
        
        Returns:
            pd.DataFrame: DataFrame containing barangay demographic data.
        """
        try:
            supabase = self._get_connection()
            
            # Build query for barangay data only
            query = supabase.table('barangay').select(
                'barangay_id, barangay_name, population, households, area, '
                'captain, seal, is_active, description, created_at, updated_at'
            )
            
            if barangay_id:
                query = query.eq('barangay_id', barangay_id)
            
            response = query.execute()
            
            # Process the data structure
            flattened_data = []
            for record in response.data:
                flattened_data.append({
                    'barangay_id': record['barangay_id'],
                    'barangay_name': record['barangay_name'],
                    'population': record.get('population', 0),
                    'households': record.get('households', 0),
                    'area_sqkm': float(record.get('area', 0)) if record.get('area') else 0,
                    'captain': record.get('captain', ''),
                    'seal': record.get('seal', 'no'),
                    'is_active': record.get('is_active', True),
                    'description': record.get('description', ''),
                    'created_at': record.get('created_at'),
                    'updated_at': record.get('updated_at')
                })
            
            return pd.DataFrame(flattened_data)
            
        except Exception as e:
            print(f"Error extracting demographic data: {e}")
            return pd.DataFrame()
    
    def process_survey_responses(self, responses_df):
        """Process survey responses to handle conditional skip logic and normalize data.
        
        Args:
            responses_df (pd.DataFrame): DataFrame containing survey responses.
        
        Returns:
            pd.DataFrame: Processed survey responses.
        """
        # Group by response_id and section_name
        grouped = responses_df.groupby(['response_id', 'section_name'])
        
        processed_data = []
        
        for (response_id, section_name), group in grouped:
            # Extract demographic data (same for all rows in group)
            demographic = {
                'response_id': response_id,
                'barangay_id': group['barangay_id'].iloc[0],
                'barangay_name': group['barangay_name'].iloc[0],
                'population': group['population'].iloc[0],
                'households': group['households'].iloc[0],
                'area_sqkm': group['area_sqkm'].iloc[0],
                'section_name': section_name,
                'created_at': group['created_at'].iloc[0]
            }
            
            # Process answers
            answers = {}
            for _, row in group.iterrows():
                question_text = row['question_text']
                answer_value = row['answer_value']
                answer_text = row['answer_text']
                
                # Handle different question types
                if pd.notna(answer_value):
                    answers[question_text] = answer_value
                elif pd.notna(answer_text):
                    answers[question_text] = answer_text
                else:
                    answers[question_text] = None
            
            # Combine demographic and answers
            record = {**demographic, **answers}
            processed_data.append(record)
        
        # Convert to DataFrame
        processed_df = pd.DataFrame(processed_data)
        
        return processed_df