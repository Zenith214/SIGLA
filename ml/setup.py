#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

setup(
    name="sigla-ml",
    version="0.1.0",
    description="SIGLA Machine Learning Module for Survey Data Analysis",
    author="SIGLA Team",
    author_email="admin@sigla.ph",
    packages=find_packages(),
    install_requires=[
        "scikit-learn>=1.0.0",
        "pandas>=1.3.0",
        "numpy>=1.20.0",
        "matplotlib>=3.4.0",
        "seaborn>=0.11.0",
        "pymysql>=1.0.0",
        "python-dotenv>=0.19.0",
    ],
    python_requires=">=3.8",
)