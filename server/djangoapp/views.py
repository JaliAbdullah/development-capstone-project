# Uncomment the required imports before adding the code

from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import login, authenticate
import logging
import json
import os
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import CarMake, CarModel
from .populate import initiate
from .restapis import get_request, analyze_review_sentiments, post_review


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create a view to serve the React app
def index(request):
    try:
        # Path to the index.html file
        index_path = os.path.join(
            settings.BASE_DIR, 'frontend', 'build', 'index.html'
        )
        
        # Debug logging for production
        logger.info(f"Looking for index.html at: {index_path}")
        logger.info(f"BASE_DIR is: {settings.BASE_DIR}")
        logger.info(f"Current working directory: {os.getcwd()}")
        
        # Check if directories exist
        frontend_dir = os.path.join(settings.BASE_DIR, 'frontend')
        build_dir = os.path.join(settings.BASE_DIR, 'frontend', 'build')
        
        logger.info(f"Frontend directory exists: {os.path.exists(frontend_dir)}")
        logger.info(f"Build directory exists: {os.path.exists(build_dir)}")
        
        if os.path.exists(build_dir):
            build_contents = os.listdir(build_dir)
            logger.info(f"Build directory contents: {build_contents}")

        # Check if the file exists
        if os.path.exists(index_path):
            logger.info("index.html found successfully")
            with open(index_path, 'r', encoding='utf-8') as file:
                return HttpResponse(file.read(), content_type='text/html')
        else:
            logger.error(f"index.html not found at {index_path}")
            
            # Try alternative paths
            alt_paths = [
                os.path.join(settings.BASE_DIR, 'build', 'index.html'),
                os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html'),
                os.path.join(os.getcwd(), 'frontend', 'build', 'index.html'),
                os.path.join(os.getcwd(), 'build', 'index.html'),
            ]
            
            for alt_path in alt_paths:
                logger.info(f"Checking alternative path: {alt_path}")
                if os.path.exists(alt_path):
                    logger.info(f"Found index.html at alternative path: {alt_path}")
                    with open(alt_path, 'r', encoding='utf-8') as file:
                        return HttpResponse(file.read(), content_type='text/html')
            
            return HttpResponse(
                f"""
                <html>
                <head><title>Debug Info</title></head>
                <body>
                    <h1>React App Not Found - Debug Information</h1>
                    <p><strong>Searched paths:</strong></p>
                    <ul>
                        <li>{index_path}</li>
                        {''.join(f'<li>{path}</li>' for path in alt_paths)}
                    </ul>
                    <p><strong>BASE_DIR:</strong> {settings.BASE_DIR}</p>
                    <p><strong>Current working directory:</strong> {os.getcwd()}</p>
                    <p><strong>Environment:</strong> {'Production' if not settings.DEBUG else 'Development'}</p>
                </body>
                </html>
                """,
                status=404
            )
    except Exception as e:
        logger.error(f"Error serving React app: {str(e)}")
        return HttpResponse(f"Error loading app: {str(e)}", status=500)


# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    try:
        # Get username and password from request.POST dictionary
        data = json.loads(request.body)
        username = data['userName']
        password = data['password']
        # Try to check if provide credential can be authenticated
        user = authenticate(username=username, password=password)
        data = {"userName": username}
        if user is not None:
            # If user is valid, call login method to login current user
            login(request, user)
            data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return JsonResponse(
            {"error": "Login failed", "message": str(e)}, status=500
        )


# Create a `logout_request` view to handle sign out request
def logout_request(request):
    logout(request)  # Terminate user session
    data = {"userName": ""}  # Return empty username
    return JsonResponse(data)


# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    try:
        # Load JSON data from the request body
        data = json.loads(request.body)
        username = data['userName']
        password = data['password']
        first_name = data['firstName']
        last_name = data['lastName']
        email = data['email']
        username_exist = False
        try:
            # Check if user already exists
            User.objects.get(username=username)
            username_exist = True
        except User.DoesNotExist:
            # If not, simply log this is a new user
            logger.debug("{} is new user".format(username))

        # If it is a new user
        if not username_exist:
            # Create user in auth_user table
            user = User.objects.create_user(
                username=username, first_name=first_name, last_name=last_name,
                password=password, email=email)
            # Login the user and redirect to list page
            login(request, user)
            data = {"userName": username, "status": "Authenticated"}
            return JsonResponse(data)
        else:
            data = {"userName": username, "error": "Already Registered"}
            return JsonResponse(data)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return JsonResponse(
            {"error": "Registration failed", "message": str(e)}, status=500
        )


# Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
# ...

# Update the `get_dealerships` render list of dealerships all by default,
# particular state if state is passed
def get_dealerships(request, state="All"):
    try:
        if state == "All":
            endpoint = "/fetchDealers"
        else:
            endpoint = "/fetchDealers/" + state
        dealerships = get_request(endpoint)
        return JsonResponse({"status": 200, "dealers": dealerships})
    except Exception as e:
        logger.error(f"Get dealerships error: {str(e)}")
        return JsonResponse(
            {"error": "Failed to fetch dealerships", "message": str(e)},
            status=500
        )


# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
# ...

def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            try:
                response = analyze_review_sentiments(review_detail['review'])
                print(f"Sentiment analysis for "
                      f"'{review_detail['review']}': {response}")
                if response and 'sentiment' in response:
                    review_detail['sentiment'] = response['sentiment']
                else:
                    review_detail['sentiment'] = 'neutral'
            except Exception as e:
                print(f"Sentiment analysis failed: {e}")
                review_detail['sentiment'] = 'neutral'
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
# ...

def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


# Create a `add_review` view to submit a review
# def add_review(request):
# ...

@csrf_exempt
def add_review(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as e:
            print(f"Error posting review: {e}")
            return JsonResponse({"status": 401,
                                "message": "Error in posting review"})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})


def get_cars(request):
    count = CarMake.objects.filter().count()
    print(count)
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({"CarModel": car_model.name,
                    "CarMake": car_model.car_make.name})
    return JsonResponse({"CarModels": cars})
