"""
InsureScan API - Vercel Serverless Function
This wraps the Flask app for Vercel deployment
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# API Keys from environment
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY', '')
BYTEZ_API_KEY = os.getenv('BYTEZ_API_KEY', '').strip()

# Model configurations
OPENROUTER_MODEL = "google/gemini-2.0-flash-exp:free"
GOOGLE_GEMINI_MODEL = "gemini-2.0-flash-lite"
BYTEZ_MODEL = "Qwen/Qwen3-4B"

# System prompt for AI
SYSTEM_PROMPT = """You are InsureScan AI, an expert insurance policy analyst specializing in Indian insurance policies.

Analyze the provided insurance policy document thoroughly. Return a JSON object with:
{
    "policy_type": "<health/life/motor/travel>",
    "insurer_name": "<extracted or 'Not specified'>",
    "sum_insured": "<extracted or 'Not specified'>",
    "safety_score": <0-100>,
    "risk_level": "<low/medium/high/critical>",
    "summary": "<50-word plain language summary>",
    "risk_breakdown": {
        "room_rent_risk": <0-10>,
        "waiting_period_risk": <0-10>,
        "exclusions_risk": <0-10>,
        "sublimits_risk": <0-10>,
        "copay_risk": <0-10>
    },
    "red_flags": [{"issue": "<issue>", "severity": "<high/medium/low>", "impact": "<explanation>"}],
    "good_features": [{"feature": "<feature>", "benefit": "<how it helps>"}],
    "coverage_gaps": ["<gap1>", "<gap2>"],
    "recommendations": ["<advice1>", "<advice2>"],
    "jargon_decoded": [{"term": "<jargon>", "meaning": "<simple explanation>"}]
}

IMPORTANT: Return ONLY valid JSON, no markdown."""


def analyze_with_openrouter(text):
    """Analyze using OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return None
    
    FREE_MODELS = [
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ]
    
    for model in FREE_MODELS:
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Analyze this insurance policy:\n\n{text[:10000]}"}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                # Clean markdown
                if content.startswith('```'):
                    content = content.split('\n', 1)[1] if '\n' in content else content[3:]
                if content.endswith('```'):
                    content = content[:-3]
                return json.loads(content.strip())
            elif response.status_code == 429:
                continue  # Try next model
        except:
            continue
    
    return None


def analyze_with_gemini(text):
    """Analyze using Google Gemini API"""
    if not GOOGLE_GEMINI_API_KEY:
        return None
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GOOGLE_GEMINI_MODEL}:generateContent?key={GOOGLE_GEMINI_API_KEY}"
        
        response = requests.post(
            url,
            json={
                "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\nAnalyze this policy:\n\n{text[:12000]}"}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2000}
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['candidates'][0]['content']['parts'][0]['text']
            if content.startswith('```'):
                content = content.split('\n', 1)[1] if '\n' in content else content[3:]
            if content.endswith('```'):
                content = content[:-3]
            parsed = json.loads(content.strip())
            parsed['processing_mode'] = 'gemini'
            return parsed
    except:
        pass
    
    return None


def analyze_with_bytez(text):
    """Analyze using Bytez API"""
    if not BYTEZ_API_KEY:
        return None
    
    try:
        import re
        response = requests.post(
            f"https://api.bytez.com/models/v2/{BYTEZ_MODEL}",
            headers={
                "Authorization": f"Bearer {BYTEZ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "messages": [
                    {"role": "system", "content": "You are an insurance analyst. Return JSON only."},
                    {"role": "user", "content": f"{SYSTEM_PROMPT}\n\nAnalyze:\n{text[:10000]}"}
                ],
                "stream": False,
                "params": {"max_length": 2000, "temperature": 0.3}
            },
            timeout=60
        )
        
        if response.status_code == 200:
            bytez_resp = response.json()
            content = bytez_resp.get('output', {}).get('content', '')
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
            if '{' in content:
                content = content[content.find('{'):content.rfind('}')+1]
            parsed = json.loads(content)
            parsed['processing_mode'] = 'bytez'
            return parsed
    except:
        pass
    
    return None


def get_mock_analysis():
    """Return mock data as fallback"""
    return {
        "policy_type": "health",
        "insurer_name": "Sample Insurance Co.",
        "sum_insured": "₹5,00,000",
        "safety_score": 62,
        "risk_level": "medium",
        "summary": "Standard health insurance with room rent limits and waiting periods.",
        "risk_breakdown": {"room_rent_risk": 7, "waiting_period_risk": 8, "exclusions_risk": 5, "sublimits_risk": 6, "copay_risk": 7},
        "red_flags": [
            {"issue": "Room Rent Capped", "severity": "high", "impact": "Proportionate deduction applies"},
            {"issue": "4-year waiting period", "severity": "high", "impact": "Pre-existing diseases not covered"}
        ],
        "good_features": [
            {"feature": "No Claim Bonus", "benefit": "10% increase yearly"},
            {"feature": "Day Care Coverage", "benefit": "500+ procedures covered"}
        ],
        "coverage_gaps": ["No maternity", "No dental"],
        "recommendations": ["Consider top-up plan", "Check room rent before admission"],
        "jargon_decoded": [
            {"term": "Sum Insured", "meaning": "Maximum yearly payout"},
            {"term": "Co-payment", "meaning": "Your share of each claim"}
        ],
        "processing_mode": "demo"
    }


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "InsureScan API"})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint"""
    # Demo mode
    if request.form.get('demo_mode') == 'true':
        return jsonify(get_mock_analysis())
    
    # Get text from request
    text = request.form.get('text', '')
    
    if not text and 'file' in request.files:
        file = request.files['file']
        # For serverless, we'll just read the file content as text
        # Full PDF/OCR processing requires more setup
        try:
            text = file.read().decode('utf-8', errors='ignore')
        except:
            text = ""
    
    if not text or len(text) < 50:
        return jsonify({"error": "No readable text found"}), 400
    
    # Try AI providers in order
    result = analyze_with_openrouter(text)
    if result:
        result['processing_mode'] = 'openrouter'
        return jsonify(result)
    
    result = analyze_with_gemini(text)
    if result:
        return jsonify(result)
    
    result = analyze_with_bytez(text)
    if result:
        return jsonify(result)
    
    # Fallback to mock
    return jsonify(get_mock_analysis())


@app.route('/api/demo', methods=['GET'])
def demo():
    return jsonify(get_mock_analysis())


# Vercel handler
def handler(request):
    """Vercel serverless function handler"""
    return app(request)
