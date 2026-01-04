"""
InsureScan Backend - Flask API for Insurance Policy Analysis
Hackathon MVP - Decode complex insurance documents using OCR and LLMs
"""

import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import pytesseract
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_MODEL = "google/gemini-2.0-flash-exp:free"

# Google Gemini API Configuration (fallback when OpenRouter is rate limited)
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY', '')
GOOGLE_GEMINI_MODEL = "gemini-2.0-flash-lite"

# Bytez API Configuration (tertiary fallback)
BYTEZ_API_KEY = os.getenv('BYTEZ_API_KEY', '').strip()
BYTEZ_MODEL = "Qwen/Qwen3-4B"


# Enhanced AI System Prompt for Smart Policy Report
SYSTEM_PROMPT = """You are InsureScan AI, an expert insurance policy analyst specializing in Indian insurance policies (health, life, motor, travel).

Analyze the provided insurance policy document thoroughly. Your goal is to help consumers understand their policy in plain language and identify hidden risks.

## Analysis Focus Areas:

### RED FLAGS to detect:
1. **Room Rent Capping** - Daily limits on hospital room charges (e.g., "1% of SI" or "₹5000/day max")
2. **Co-payment Clauses** - Percentage policyholder must pay out of pocket
3. **Pre-existing Disease Waiting Periods** - Waiting period before coverage (typically 2-4 years)
4. **Sub-limits** - Caps on specific treatments (cataract, knee replacement, maternity)
5. **Disease-specific Waiting Periods** - For hernia, piles, cataracts, etc.
6. **Proportionate Deductions** - If room rent exceeds limit, all expenses reduced proportionally
7. **Excluded Treatments** - What is NOT covered (dental, cosmetic, infertility, etc.)
8. **Network Restrictions** - Limited hospital network or geographical restrictions
9. **Junk Riders** - Unnecessary add-ons with high premiums
10. **Claim Limits** - Maximum claims per year or per illness

### GOOD FEATURES to highlight:
1. No Claim Bonus (NCB) accumulation
2. Restoration/Reinstatement benefits
3. Day care procedure coverage
4. Pre/Post hospitalization cover
5. Ambulance charges coverage
6. Annual health checkup
7. AYUSH treatment coverage
8. Domiciliary hospitalization
9. Maternity & newborn coverage
10. Critical illness cover
11. Cashless hospital network size

Return a strictly valid JSON object with this structure:
{
    "policy_type": "<health/life/motor/travel>",
    "insurer_name": "<extracted insurer name or 'Not specified'>",
    "sum_insured": "<extracted sum insured amount or 'Not specified'>",
    "safety_score": <integer 1-100>,
    "risk_level": "<low/medium/high/critical>",
    "summary": "<50-word plain language summary for a common person>",
    "risk_breakdown": {
        "room_rent_risk": <0-10>,
        "waiting_period_risk": <0-10>,
        "exclusions_risk": <0-10>,
        "sublimits_risk": <0-10>,
        "copay_risk": <0-10>
    },
    "red_flags": [
        {"issue": "<specific issue>", "severity": "<high/medium/low>", "impact": "<brief explanation>"}
    ],
    "good_features": [
        {"feature": "<feature name>", "benefit": "<how it helps>"}
    ],
    "coverage_gaps": ["<list any missing important coverages>"],
    "recommendations": ["<actionable advice for the policyholder>"],
    "jargon_decoded": [
        {"term": "<insurance jargon>", "meaning": "<simple explanation>"}
    ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown formatting or extra text
- Be specific with amounts and percentages found in the document
- If information is not found, indicate "Not specified" rather than guessing
- Focus on issues that affect claims in real-world scenarios"""


def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def clean_extracted_text(text):
    """
    Clean extracted text to fix common PDF extraction issues.
    Some PDFs have duplicate/overlapping characters for visual effects.
    Example: 'SSSSBBBBIIIII' should become 'SBI'
    """
    import re
    
    # Fix repeated characters (4+ same char in a row likely means duplication)
    # Pattern: find 4+ repeated chars and reduce to single
    def reduce_repeats(match):
        char = match.group(0)[0]
        return char
    
    # Reduce 4+ repeated characters to single
    cleaned = re.sub(r'(.)\1{3,}', reduce_repeats, text)
    
    # Also clean up multiple spaces
    cleaned = re.sub(r' {2,}', ' ', cleaned)
    
    # Clean up multiple newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    return cleaned


def extract_text_from_pdf(file_path):
    """Extract text from PDF using PyPDF2 (memory-efficient for free tier)"""
    import gc
    from PyPDF2 import PdfReader
    
    print(f"\n📄 [PDF EXTRACTION] Starting extraction from: {file_path}")
    text_parts = []
    MAX_PAGES = 10  # Limit pages for free tier
    
    try:
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        pages_to_process = min(total_pages, MAX_PAGES)
        print(f"📄 [PDF EXTRACTION] Found {total_pages} pages, processing first {pages_to_process}")
        
        for i in range(pages_to_process):
            try:
                page = reader.pages[i]
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                    print(f"📄 [PDF EXTRACTION] Page {i+1}: Extracted {len(page_text)} characters")
                else:
                    print(f"📄 [PDF EXTRACTION] Page {i+1}: No text found")
                # Force garbage collection
                gc.collect()
            except Exception as page_error:
                print(f"📄 [PDF EXTRACTION] Page {i+1}: Error - {page_error}")
                continue
                
        if total_pages > MAX_PAGES:
            print(f"⚠️ [PDF EXTRACTION] Skipped {total_pages - MAX_PAGES} pages to save memory")
            
    except Exception as e:
        print(f"❌ [PDF EXTRACTION] Error: {e}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    # Join text parts
    text = "\n".join(text_parts)
    
    # Clean the extracted text
    text = clean_extracted_text(text)
    
    print(f"📄 [PDF EXTRACTION] Total extracted: {len(text)} characters")
    print(f"📄 [PDF EXTRACTION] First 500 chars: {text[:500]}")
    return text.strip()


def extract_text_from_image(file_path):
    """Extract text from image using pytesseract OCR"""
    print(f"\n🖼️ [IMAGE OCR] Starting OCR on: {file_path}")
    try:
        image = Image.open(file_path)
        print(f"🖼️ [IMAGE OCR] Image size: {image.size}")
        text = pytesseract.image_to_string(image, lang='eng')
        print(f"🖼️ [IMAGE OCR] Extracted {len(text)} characters")
        print(f"🖼️ [IMAGE OCR] First 500 chars: {text[:500]}")
    except Exception as e:
        print(f"❌ [IMAGE OCR] Error: {e}")
        raise Exception(f"Failed to extract text from image: {str(e)}")
    return text.strip()


def extract_important_sections(text, max_chars=12000):
    """
    Extract the most important sections from a large insurance document.
    Looks for key sections like exclusions, waiting periods, room rent limits, etc.
    """
    print(f"\n📋 [SMART EXTRACT] Processing {len(text)} characters...")
    
    # Keywords that indicate important sections
    important_keywords = [
        # Red flag indicators
        'room rent', 'sub-limit', 'sublimit', 'co-pay', 'copay', 'co-payment',
        'waiting period', 'pre-existing', 'preexisting', 'exclusion',
        'not covered', 'not payable', 'limitation', 'cap', 'maximum limit',
        'deductible', 'proportionate', 'proportional deduction',
        # Good feature indicators  
        'no claim bonus', 'ncb', 'restoration', 'reinstatement',
        'cashless', 'network hospital', 'day care', 'domiciliary',
        'pre-hospitalization', 'post-hospitalization', 'ambulance',
        'health checkup', 'wellness', 'maternity', 'newborn',
        # Coverage terms
        'sum insured', 'coverage', 'benefit', 'claim', 'premium',
        'hospitalization', 'treatment', 'surgery', 'icu', 'critical illness'
    ]
    
    # Split text into paragraphs
    paragraphs = text.split('\n')
    
    # Score each paragraph based on keyword matches
    scored_paragraphs = []
    for i, para in enumerate(paragraphs):
        para_lower = para.lower()
        score = 0
        for keyword in important_keywords:
            if keyword in para_lower:
                score += 1
        if score > 0 and len(para.strip()) > 30:  # Must have some content
            scored_paragraphs.append((score, i, para))
    
    # Sort by score (highest first)
    scored_paragraphs.sort(key=lambda x: x[0], reverse=True)
    
    # Build the extracted text
    extracted = []
    total_chars = 0
    
    # Always include the first 1500 chars (usually has policy overview)
    intro = text[:1500]
    extracted.append("=== POLICY INTRODUCTION ===\n" + intro)
    total_chars += len(intro)
    
    # Add high-scoring paragraphs
    used_indices = set()
    for score, idx, para in scored_paragraphs:
        if total_chars >= max_chars:
            break
        if idx not in used_indices:
            # Include some context (previous and next paragraph if short)
            context = para
            if idx > 0 and len(paragraphs[idx-1]) < 200:
                context = paragraphs[idx-1] + "\n" + context
            if idx < len(paragraphs) - 1 and len(paragraphs[idx+1]) < 200:
                context = context + "\n" + paragraphs[idx+1]
            
            extracted.append(context)
            total_chars += len(context)
            used_indices.add(idx)
            if idx > 0:
                used_indices.add(idx - 1)
            if idx < len(paragraphs) - 1:
                used_indices.add(idx + 1)
    
    result = "\n\n".join(extracted)
    print(f"📋 [SMART EXTRACT] Extracted {len(result)} chars from {len(scored_paragraphs)} important paragraphs")
    
    return result[:max_chars]


def analyze_with_openrouter(text, retry_count=0):
    """Analyze policy text using OpenRouter API with multiple model fallbacks"""
    
    # List of free models to try (in order of preference) - updated Jan 2026
    FREE_MODELS = [
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1:free",
        "qwen/qwen3-14b:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ]
    
    model = FREE_MODELS[min(retry_count, len(FREE_MODELS) - 1)]
    
    print(f"\n🤖 [OPENROUTER] Starting AI analysis (attempt {retry_count + 1})...")
    print(f"🤖 [OPENROUTER] Text length to analyze: {len(text)} characters")
    print(f"🤖 [OPENROUTER] Using model: {model}")
    print(f"🤖 [OPENROUTER] API Key present: {bool(OPENROUTER_API_KEY)}")
    
    # For large documents, use smart extraction to get important sections
    if len(text) > 10000:
        print(f"🤖 [OPENROUTER] Large document detected! Using smart extraction...")
        text_to_analyze = extract_important_sections(text, max_chars=12000)
    else:
        text_to_analyze = text
    
    print(f"🤖 [OPENROUTER] Sending {len(text_to_analyze)} chars to AI...")
    
    try:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this insurance policy:\n\n{text_to_analyze}"}
            ],
            "temperature": 0.3,
            "max_tokens": 1500
        }
        
        print(f"🤖 [OPENROUTER] Sending request to API...")
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "InsureScan - Insurance Policy Analyzer",
            },
            json=payload,
            timeout=60
        )
        
        print(f"🤖 [OPENROUTER] Response status: {response.status_code}")
        
        # Handle rate limiting - try next model
        if response.status_code == 429:
            print(f"⚠️ [OPENROUTER] Rate limited! Trying next model...")
            if retry_count < len(FREE_MODELS) - 1:
                import time
                time.sleep(1)  # Brief pause before retry
                return analyze_with_openrouter(text, retry_count + 1)
            else:
                print(f"❌ [OPENROUTER] All models rate limited!")
                return None
        
        if response.status_code != 200:
            print(f"❌ [OPENROUTER] API error: {response.status_code}")
            print(f"❌ [OPENROUTER] Response body: {response.text}")
            # Try next model on error
            if retry_count < len(FREE_MODELS) - 1:
                return analyze_with_openrouter(text, retry_count + 1)
            return None
        
        result = response.json()
        print(f"🤖 [OPENROUTER] Raw API response: {json.dumps(result, indent=2)[:1000]}")
        
        result_text = result['choices'][0]['message']['content'].strip()
        print(f"🤖 [OPENROUTER] AI response content: {result_text[:500]}")
        
        # Clean up potential markdown code blocks
        if result_text.startswith("```"):
            print(f"🤖 [OPENROUTER] Cleaning markdown code blocks...")
            lines = result_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            result_text = "\n".join(lines)
        
        result_text = result_text.strip()
        
        parsed_result = json.loads(result_text)
        print(f"✅ [OPENROUTER] Successfully parsed JSON response!")
        print(f"✅ [OPENROUTER] Safety score: {parsed_result.get('safety_score')}")
        print(f"✅ [OPENROUTER] Red flags count: {len(parsed_result.get('red_flags', []))}")
        print(f"✅ [OPENROUTER] Good features count: {len(parsed_result.get('good_features', []))}")
        
        return parsed_result
        
    except json.JSONDecodeError as e:
        print(f"❌ [OPENROUTER] JSON parse error: {e}")
        print(f"❌ [OPENROUTER] Raw text that failed to parse: {result_text}")
        return None
    except requests.exceptions.Timeout:
        print(f"❌ [OPENROUTER] Request timed out after 60 seconds")
        return None
    except Exception as e:
        print(f"❌ [OPENROUTER] Unexpected error: {type(e).__name__}: {e}")
        return None


def analyze_with_gemini(text):
    """
    Analyze policy text using Google Gemini API (fallback when OpenRouter is rate limited).
    Uses the Gemini REST API directly.
    """
    print(f"\n{'='*50}")
    print(f"🔮 [GEMINI] Starting Google Gemini analysis...")
    print(f"{'='*50}")
    
    if not GOOGLE_GEMINI_API_KEY:
        print("❌ [GEMINI] No API key configured")
        return None
    
    try:
        # Smart extraction for large documents
        if len(text) > 10000:
            print(f"📋 [GEMINI] Large document detected! Using smart extraction...")
            text = extract_important_sections(text)
        
        text_to_analyze = text[:15000]  # Gemini can handle more text
        print(f"🔮 [GEMINI] Sending {len(text_to_analyze)} chars to Gemini...")
        
        # Google Gemini REST API endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GOOGLE_GEMINI_MODEL}:generateContent?key={GOOGLE_GEMINI_API_KEY}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"{SYSTEM_PROMPT}\n\nHere is the insurance policy document to analyze:\n\n{text_to_analyze}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 4096
            }
        }
        
        print(f"🔮 [GEMINI] Sending request to Google API...")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        print(f"🔮 [GEMINI] Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ [GEMINI] API error: {response.status_code}")
            print(f"❌ [GEMINI] Response: {response.text[:500]}")
            return None
        
        result = response.json()
        
        # Extract text from Gemini response
        if 'candidates' not in result or len(result['candidates']) == 0:
            print(f"❌ [GEMINI] No candidates in response")
            return None
        
        result_text = result['candidates'][0]['content']['parts'][0]['text']
        print(f"🔮 [GEMINI] Got response of {len(result_text)} characters")
        
        # Clean up the response - remove markdown code blocks if present
        result_text = result_text.strip()
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        # Parse JSON
        parsed_result = json.loads(result_text)
        parsed_result["processing_mode"] = "gemini"
        
        print(f"✅ [GEMINI] Analysis successful!")
        return parsed_result
        
    except json.JSONDecodeError as e:
        print(f"❌ [GEMINI] JSON parse error: {e}")
        return None
    except requests.exceptions.Timeout:
        print(f"❌ [GEMINI] Request timed out")
        return None
    except Exception as e:
        print(f"❌ [GEMINI] Unexpected error: {type(e).__name__}: {e}")
        return None


def analyze_with_bytez(text):
    """
    Analyze policy text using Bytez API (tertiary fallback).
    Uses Qwen model via Bytez.
    """
    print(f"\n{'='*50}")
    print(f"⚡ [BYTEZ] Starting Bytez Analysis...")
    print(f"{'='*50}")
    
    if not BYTEZ_API_KEY:
        print("❌ [BYTEZ] No API key configured")
        return None
    
    try:
        # Smart extraction for large documents
        if len(text) > 8000:
            print(f"📋 [BYTEZ] Large document detected! Using smart extraction...")
            text = extract_important_sections(text, max_chars=10000)
        
        text_to_analyze = text[:12000]
        print(f"⚡ [BYTEZ] Sending {len(text_to_analyze)} chars to Bytez...")
        
        url = f"https://api.bytez.com/models/v2/{BYTEZ_MODEL}"
        
        headers = {
            "Authorization": f"Bearer {BYTEZ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Simplified prompt for Qwen/Bytez 
        # (models sometimes struggle with very long system prompts via API)
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert insurance analyst. Analyze the policy and return a JSON object with: policy_type, risk_level, safety_score (0-100), red_flags (list with severity), good_features, coverage_gaps, and recommendations."
                },
                {
                    "role": "user",
                    "content": f"{SYSTEM_PROMPT}\n\nAnalyze this policy content:\n{text_to_analyze}"
                }
            ],
            "stream": False,
            "params": {
                "max_length": 4096,
                "temperature": 0.3
            }
        }
        
        print(f"⚡ [BYTEZ] Sending request to Bytez API...")
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        print(f"⚡ [BYTEZ] Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ [BYTEZ] API error: {response.status_code}")
            print(f"❌ [BYTEZ] Response: {response.text[:500]}")
            return None
        
        # Parse Bytez JSON response structure
        # Expected format: {"output": {"content": "..."}}
        bytez_resp = response.json()
        result_text = bytez_resp.get('output', {}).get('content', '')
        
        if not result_text:
            # Fallback if structure is different
            result_text = response.text
            
        print(f"⚡ [BYTEZ] Got content (first 200 chars): {result_text[:200]}")
        
        # Clean up <think> tags (common in reasoning models)
        import re
        result_text = re.sub(r'<think>.*?</think>', '', result_text, flags=re.DOTALL)
        
        # Clean up markdown code blocks
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
            
        # Extract JSON object if stuck amidst text
        if "{" in result_text:
            start_idx = result_text.find("{")
            end_idx = result_text.rfind("}") + 1
            result_text = result_text[start_idx:end_idx]

        parsed_result = json.loads(result_text)
        parsed_result["processing_mode"] = "bytez"
        
        print(f"✅ [BYTEZ] Analysis successful!")
        return parsed_result

    except Exception as e:
        print(f"❌ [BYTEZ] Unexpected error: {type(e).__name__}: {e}")
        return None


def get_mock_analysis():
    """Return enhanced mock analysis data matching the Smart Policy Report format"""
    print(f"⚠️ [MOCK DATA] Returning mock analysis (all AI providers failed)")
    return {
        "policy_type": "health",
        "insurer_name": "Sample Insurance Co.",
        "sum_insured": "₹5,00,000",
        "safety_score": 62,
        "risk_level": "medium",
        "summary": "A standard health insurance policy with decent coverage but has concerning limitations on room rent, long waiting periods for pre-existing diseases, and co-payment clauses that could significantly reduce claim payouts.",
        "risk_breakdown": {
            "room_rent_risk": 7,
            "waiting_period_risk": 8,
            "exclusions_risk": 5,
            "sublimits_risk": 6,
            "copay_risk": 7
        },
        "red_flags": [
            {"issue": "Room Rent Capped at ₹5,000/day", "severity": "high", "impact": "If you choose a room costing ₹8,000/day, all your expenses (surgery, medicines) will be reduced proportionally by 37.5%"},
            {"issue": "4-year waiting period for pre-existing diseases", "severity": "high", "impact": "Diabetes, BP, thyroid conditions won't be covered for 4 years from policy start"},
            {"issue": "20% co-payment for age 60+", "severity": "high", "impact": "Senior citizens must pay 20% of every claim from their own pocket"},
            {"issue": "Cataract surgery sub-limit: ₹40,000 per eye", "severity": "medium", "impact": "Modern cataract surgery costs ₹60,000-80,000; you'll pay the difference"},
            {"issue": "No OPD coverage", "severity": "medium", "impact": "Doctor consultations, medicines, and tests outside hospitalization not covered"},
            {"issue": "30-day initial waiting period", "severity": "low", "impact": "No claims for first 30 days except accidents"}
        ],
        "good_features": [
            {"feature": "No Claim Bonus (NCB) 10% yearly", "benefit": "Sum insured increases by 10% each claim-free year, up to 50% bonus"},
            {"feature": "Free Annual Health Checkup", "benefit": "Preventive health checkup worth ₹2,000 covered every year"},
            {"feature": "500+ Day Care Procedures", "benefit": "Procedures not requiring 24-hour hospitalization are covered"},
            {"feature": "Restoration Benefit", "benefit": "If sum insured exhausted, it gets restored once per year"},
            {"feature": "Pre-hospitalization: 60 days", "benefit": "Medical expenses 60 days before admission are covered"},
            {"feature": "Post-hospitalization: 90 days", "benefit": "Follow-up expenses up to 90 days after discharge covered"}
        ],
        "coverage_gaps": [
            "No maternity coverage",
            "No dental treatment coverage", 
            "No mental health/psychiatric coverage",
            "No AYUSH (Ayurveda, Yoga, Homeopathy) treatment coverage"
        ],
        "recommendations": [
            "Consider a top-up plan to increase coverage without high premium",
            "Check if employer insurance has room rent limits before choosing rooms",
            "For parents above 60, look for policies with lower co-payment",
            "Keep all medical records organized for pre-existing disease claims after waiting period"
        ],
        "jargon_decoded": [
            {"term": "Sum Insured", "meaning": "Maximum amount the insurer will pay in a year"},
            {"term": "Co-payment", "meaning": "Percentage you must pay from your pocket for every claim"},
            {"term": "Sub-limit", "meaning": "Maximum cap on specific treatments, even if sum insured is higher"},
            {"term": "Proportionate Deduction", "meaning": "If room rent exceeds limit, ALL expenses are reduced by the same percentage"},
            {"term": "NCB (No Claim Bonus)", "meaning": "Reward for not making claims - increases your coverage"}
        ],
        "processing_mode": "mock"
    }


def analyze_policy(text):
    """
    Analyze policy text using AI.
    Priority: OpenRouter free models -> Google Gemini -> Bytez (Qwen) -> Mock data
    """
    print(f"\n{'='*50}")
    print(f"🔍 [ANALYZE] Starting policy analysis...")
    print(f"{'='*50}")
    
    # Try OpenRouter first (free models)
    result = analyze_with_openrouter(text)
    if result:
        print(f"✅ [ANALYZE] OpenRouter analysis successful!")
        return result
    
    # Fallback to Google Gemini
    print(f"⚠️ [ANALYZE] OpenRouter failed. Trying Google Gemini...")
    result = analyze_with_gemini(text)
    if result:
        print(f"✅ [ANALYZE] Google Gemini analysis successful!")
        return result
    
    # Tertiary Fallback to Bytez
    print(f"⚠️ [ANALYZE] Google Gemini failed. Trying Bytez (Qwen)...")
    result = analyze_with_bytez(text)
    if result:
        print(f"✅ [ANALYZE] Bytez analysis successful!")
        return result
    
    # Final fallback to mock data
    print(f"⚠️ [ANALYZE] All AI providers failed. Falling back to mock data.")
    return get_mock_analysis()


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "InsureScan API",
        "version": "1.0.0",
        "ai_providers": ["OpenRouter (free)", "Google Gemini", "Bytez (Qwen)", "Mock fallback"]
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Main endpoint for analyzing insurance policy documents.
    """
    print(f"\n{'#'*60}")
    print(f"📥 [REQUEST] New analysis request received!")
    print(f"{'#'*60}")
    
    # Check for demo mode
    demo_mode = request.form.get('demo_mode')
    print(f"📥 [REQUEST] Demo mode: {demo_mode}")
    
    if demo_mode == 'true':
        print(f"🎯 [DEMO MODE] Returning Smart Policy Report demo response")
        demo_response = get_mock_analysis()
        demo_response["processing_mode"] = "demo"
        return jsonify(demo_response)
    
    # Check if file was uploaded
    print(f"📥 [REQUEST] Files in request: {list(request.files.keys())}")
    
    if 'file' not in request.files:
        print(f"❌ [REQUEST] No file in request!")
        return jsonify({"error": "No file provided. Please upload a PDF or image file."}), 400
    
    file = request.files['file']
    print(f"📥 [REQUEST] File name: {file.filename}")
    print(f"📥 [REQUEST] File content type: {file.content_type}")
    
    if file.filename == '':
        return jsonify({"error": "No file selected. Please choose a file to upload."}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400
    
    try:
        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        print(f"💾 [FILE] Saved to: {file_path}")
        print(f"💾 [FILE] File size: {os.path.getsize(file_path)} bytes")
        
        # Extract text based on file type
        file_extension = filename.rsplit('.', 1)[1].lower()
        print(f"📄 [FILE] Extension: {file_extension}")
        
        if file_extension == 'pdf':
            extracted_text = extract_text_from_pdf(file_path)
        else:
            extracted_text = extract_text_from_image(file_path)
        
        # Clean up - remove the uploaded file
        try:
            os.remove(file_path)
            print(f"🗑️ [FILE] Cleaned up temp file")
        except:
            pass
        
        # Validate extracted text
        print(f"📝 [TEXT] Extracted text length: {len(extracted_text)} characters")
        
        if not extracted_text or len(extracted_text) < 50:
            print(f"❌ [TEXT] Insufficient text extracted!")
            return jsonify({
                "error": "Could not extract sufficient text from the document. Please ensure the file is readable and contains text.",
                "hint": "For images, ensure the text is clear and not blurry. For PDFs, ensure they are not scanned images without OCR."
            }), 400
        
        # Analyze the policy with real AI
        analysis = analyze_policy(extracted_text)
        
        # Add metadata
        analysis['text_length'] = len(extracted_text)
        analysis['processing_mode'] = 'ai' if 'safety_score' in analysis else 'mock'
        
        print(f"\n✅ [RESPONSE] Sending analysis response!")
        print(f"✅ [RESPONSE] Processing mode: {analysis['processing_mode']}")
        
        return jsonify(analysis)
    
    except Exception as e:
        print(f"❌ [ERROR] {type(e).__name__}: {e}")
        return jsonify({
            "error": f"Error processing file: {str(e)}",
            "hint": "Please try again or use a different file format."
        }), 500


@app.route('/demo', methods=['GET'])
def demo():
    """Quick demo endpoint - returns mock analysis without file upload"""
    return jsonify(get_mock_analysis())


if __name__ == '__main__':
    print("=" * 60)
    print("🏥 InsureScan API Server - DEBUG MODE")
    print("=" * 60)
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"🤖 AI Provider: OpenRouter (Gemini 2.0 Flash - Free)")
    print(f"🔑 API Key: {OPENROUTER_API_KEY[:20]}...{OPENROUTER_API_KEY[-10:]}")
    print("")
    print("📍 Endpoints:")
    print("   GET  /         - Health check")
    print("   POST /analyze  - Analyze policy document")
    print("   GET  /demo     - Get demo analysis")
    print("")
    print("🔍 DEBUG LOGGING ENABLED - Watch console for detailed logs!")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
