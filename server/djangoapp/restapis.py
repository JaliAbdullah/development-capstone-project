# Uncomment the imports below before you add the function code
import requests
import os
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

# def get_request(endpoint, **kwargs):
# Add code for get requests to back end


def get_request(endpoint, **kwargs):
    params = ""
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + value + "&"
    request_url = backend_url + endpoint + "?" + params
    print("GET from {} ".format(request_url))
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        # If any error occurs
        print(f"Network exception occurred: {err}")


# def analyze_review_sentiments(text):
# request_url = sentiment_analyzer_url+"analyze/"+text
# Add code for retrieving sentiments


def analyze_review_sentiments(text):
    # Simple keyword-based sentiment analysis
    text_lower = text.lower()

    # Positive keywords
    positive_words = [
        'excellent', 'great', 'amazing', 'fantastic', 'wonderful',
        'awesome', 'good', 'best',
        'love', 'perfect', 'outstanding', 'superb', 'brilliant', 'nice',
        'satisfied', 'happy',
        'recommend', 'professional', 'friendly', 'helpful', 'fast',
        'quick', 'efficient',
        'clean', 'comfortable', 'smooth', 'easy', 'reliable',
        'trustworthy', 'quality'
    ]

    # Negative keywords
    negative_words = [
        'terrible', 'awful', 'bad', 'worst', 'horrible', 'disappointing',
        'poor', 'slow',
        'rude', 'unprofessional', 'dirty', 'expensive', 'overpriced',
        'broken', 'problem',
        'issue', 'complaint', 'angry', 'frustrated', 'disappointed',
        'unsatisfied', 'hate',
        'never', 'avoid', 'scam', 'fraud', 'cheated', 'waste', 'regret'
    ]

    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    if positive_count > negative_count:
        sentiment = 'positive'
    elif negative_count > positive_count:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    return {'sentiment': sentiment}


# Original function (fallback to external service)
def analyze_review_sentiments_external(text):
    request_url = sentiment_analyzer_url + "analyze/" + text
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")


# def post_review(data_dict):
# Add code for posting review


def post_review(data_dict):
    request_url = backend_url + "/reviews"
    try:
        response = requests.post(request_url, json=data_dict)
        print(response.json())
        return response.json()
    except Exception as err:
        print(f"Network exception occurred: {err}")
