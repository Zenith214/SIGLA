#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import logging
import pandas as pd
import numpy as np
import psycopg2
import json
from typing import Dict, List, Optional, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv

# Get logger for this module
logger = logging.getLogger(__name__)

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
            # Try service role key first, then fall back to anon key
            self.supabase_key = (
                os.getenv('SUPABASE_SERVICE_ROLE_KEY') or 
                os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') or
                os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
            )
        else:
            self.supabase_url = supabase_config.get('url')
            self.supabase_key = supabase_config.get('key')
            
        self.supabase: Client = None
        self.database_url = os.getenv('DATABASE_URL')
    
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
        """Extract survey responses from database.
        
        Args:
            filters (dict, optional): Filters to apply to the query.
                Example: {'barangay_id': 1, 'date_from': '2023-01-01'}
        
        Returns:
            pd.DataFrame: DataFrame containing survey responses.
        """
        # Try direct PostgreSQL connection first (more reliable)
        if self.database_url:
            return self._extract_survey_responses_postgres(filters)
        else:
            return self._extract_survey_responses_supabase(filters)
    
    def _extract_survey_responses_postgres(self, filters=None):
        """Extract survey responses using direct PostgreSQL connection."""
        try:
            conn = psycopg2.connect(self.database_url)
            
            # Build SQL query
            sql_query = """
                SELECT 
                    sr.response_id,
                    sr.barangay_id,
                    sr.interviewer_id,
                    sr.created_at,
                    sr.updated_at,
                    sr.status,
                    sr.progress,
                    ss.section_name,
                    ss.section_key,
                    ss.data as section_data,
                    ss.status as section_status,
                    b.barangay_name,
                    b.population,
                    b.households,
                    b.area
                FROM survey_response sr
                JOIN survey_section ss ON sr.response_id = ss.response_id
                LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
                WHERE sr.status IN ('completed', 'submitted')
            """
            
            params = []
            
            # Apply filters
            if filters:
                if 'barangay_id' in filters:
                    sql_query += " AND sr.barangay_id = %s"
                    params.append(filters['barangay_id'])
                
                if 'date_from' in filters:
                    sql_query += " AND sr.created_at >= %s"
                    params.append(filters['date_from'])
                
                if 'date_to' in filters:
                    sql_query += " AND sr.created_at <= %s"
                    params.append(filters['date_to'])
            
            sql_query += " ORDER BY sr.created_at DESC"
            
            # Execute query
            df = pd.read_sql_query(sql_query, conn, params=params)
            
            # Parse section_data JSON
            def parse_section_data(data_str):
                if pd.isna(data_str) or data_str is None:
                    return {}
                try:
                    return json.loads(data_str) if isinstance(data_str, str) else data_str
                except:
                    return {}
            
            df['section_data_parsed'] = df['section_data'].apply(parse_section_data)
            df['area_sqkm'] = pd.to_numeric(df['area'], errors='coerce').fillna(0)
            
            conn.close()
            return df
            
        except Exception as e:
            logger.error(f"Error extracting survey responses via PostgreSQL: {e}")
            return pd.DataFrame()
    
    def _extract_survey_responses_supabase(self, filters=None):
        """Extract survey responses using Supabase client (fallback)."""
        try:
            supabase = self._get_connection()
            
            # Build query for survey responses with related data (barangay-focused)
            query = supabase.table('survey_response').select(
                'response_id, barangay_id, interviewer_id, created_at, updated_at, status, progress, '
                'survey_section(section_name, section_key, data, status), '
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
            
            # Only get completed or submitted surveys
            query = query.in_('status', ['completed', 'submitted'])
            
            response = query.execute()
            
            # Flatten the nested data structure
            flattened_data = []
            for survey_response in response.data:
                barangay = survey_response.get('barangay', {})
                for section in survey_response.get('survey_section', []):
                    # Parse section data if it exists
                    section_data = {}
                    if section.get('data'):
                        try:
                            section_data = json.loads(section['data']) if isinstance(section['data'], str) else section['data']
                        except:
                            section_data = {}
                    
                    flattened_data.append({
                        'response_id': survey_response['response_id'],
                        'barangay_id': survey_response['barangay_id'],
                        'interviewer_id': survey_response['interviewer_id'],
                        'created_at': survey_response['created_at'],
                        'updated_at': survey_response['updated_at'],
                        'status': survey_response.get('status'),
                        'progress': survey_response.get('progress'),
                        'section_name': section.get('section_name'),
                        'section_key': section.get('section_key'),
                        'section_status': section.get('status'),
                        'section_data_parsed': section_data,
                        'barangay_name': barangay.get('barangay_name'),
                        'population': barangay.get('population'),
                        'households': barangay.get('households'),
                        'area_sqkm': float(barangay.get('area', 0)) if barangay.get('area') else 0
                    })
            
            return pd.DataFrame(flattened_data)
            
        except Exception as e:
            logger.error(f"Error extracting survey responses via Supabase: {e}")
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
        # Try direct PostgreSQL connection first
        if self.database_url:
            return self._extract_demographic_data_postgres(barangay_id)
        else:
            return self._extract_demographic_data_supabase(barangay_id)
    
    def _extract_demographic_data_postgres(self, barangay_id=None):
        """Extract demographic data using direct PostgreSQL connection."""
        try:
            conn = psycopg2.connect(self.database_url)
            
            sql_query = """
                SELECT 
                    barangay_id,
                    barangay_name,
                    population,
                    households,
                    area,
                    captain,
                    seal,
                    is_active,
                    description,
                    created_at,
                    updated_at
                FROM barangay
                WHERE 1=1
            """
            
            params = []
            if barangay_id:
                sql_query += " AND barangay_id = %s"
                params.append(barangay_id)
            
            df = pd.read_sql_query(sql_query, conn, params=params)
            
            # Process data
            df['area_sqkm'] = pd.to_numeric(df['area'], errors='coerce').fillna(0)
            df['population'] = pd.to_numeric(df['population'], errors='coerce').fillna(0)
            df['households'] = pd.to_numeric(df['households'], errors='coerce').fillna(0)
            
            conn.close()
            return df
            
        except Exception as e:
            logger.error(f"Error extracting demographic data via PostgreSQL: {e}")
            return pd.DataFrame()
    
    def _extract_demographic_data_supabase(self, barangay_id=None):
        """Extract demographic data using Supabase client (fallback)."""
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
            logger.error(f"Error extracting demographic data via Supabase: {e}")
            return pd.DataFrame()
    
    def process_survey_responses(self, responses_df):
        """Process survey responses to handle conditional skip logic and normalize data.
        
        Args:
            responses_df (pd.DataFrame): DataFrame containing survey responses.
        
        Returns:
            pd.DataFrame: Processed survey responses.
        """
        if responses_df.empty:
            return pd.DataFrame()
        
        # Group by response_id and section_name
        grouped = responses_df.groupby(['response_id', 'section_name'])
        
        processed_data = []
        
        for (response_id, section_name), group in grouped:
            # Extract demographic data (same for all rows in group)
            demographic = {
                'response_id': response_id,
                'barangay_id': group['barangay_id'].iloc[0],
                'barangay_name': group['barangay_name'].iloc[0] if 'barangay_name' in group.columns else '',
                'population': group['population'].iloc[0] if 'population' in group.columns else 0,
                'households': group['households'].iloc[0] if 'households' in group.columns else 0,
                'area_sqkm': group['area_sqkm'].iloc[0] if 'area_sqkm' in group.columns else 0,
                'section_name': section_name,
                'section_key': group['section_key'].iloc[0] if 'section_key' in group.columns else '',
                'created_at': group['created_at'].iloc[0]
            }
            
            # Process answers from section_data_parsed
            answers = {}
            for _, row in group.iterrows():
                section_data = row.get('section_data_parsed', {})
                if isinstance(section_data, dict):
                    # Add all key-value pairs from section data
                    for key, value in section_data.items():
                        answers[key] = value
            
            # Combine demographic and answers
            record = {**demographic, **answers}
            processed_data.append(record)
        
        # Convert to DataFrame
        processed_df = pd.DataFrame(processed_data)
        
        return processed_df