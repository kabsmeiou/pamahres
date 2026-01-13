import datetime
import os
import requests
import jwt
import pytz
from django.contrib.auth import get_user_model
from django.core.cache import cache
from jwt.algorithms import RSAAlgorithm
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from dotenv import load_dotenv
from user.models import Profile, UserActivity

# Load .env file
load_dotenv()

User = get_user_model()

CLERK_API_URL = "https://api.clerk.com/v1"
CLERK_FRONTEND_API_URL = os.getenv("CLERK_FRONTEND_API_URL")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CACHE_KEY = "jwks_data"


import time
import logging

logger = logging.getLogger(__name__)

class ClerkSDK:
    """Handles Clerk-related API interactions."""
    def fetch_user_info(self, user_id: str):
        """Fetch user info from Clerk API."""
        user_info = cache.get(f"user_info_{user_id}")

        if user_info:
            return {
                "email_address": user_info["email_addresses"][0]["email_address"],
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "last_login": datetime.datetime.fromtimestamp(
                    user_info["last_sign_in_at"] / 1000, tz=pytz.UTC
                ),
            }, True

        response = requests.get(
            f"{CLERK_API_URL}/users/{user_id}",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        )

        if response.status_code == 200:
            data = response.json()
            # set cache
            cache.set(f"user_info_{user_id}", data, 60 * 60 * 24)
            return {
                "email_address": data["email_addresses"][0]["email_address"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "last_login": datetime.datetime.fromtimestamp(
                    data["last_sign_in_at"] / 1000, tz=pytz.UTC
                ),
            }, True
        else:
            return {
                "email_address": "",
                "first_name": "",
                "last_name": "",
                "last_login": None,
            }, False

    def get_jwks(self):
        """Get JWKS data for JWT verification."""
        jwks_data = cache.get(CACHE_KEY)
        if not jwks_data:
            response = requests.get(f"{CLERK_FRONTEND_API_URL}/.well-known/jwks.json")
            if response.status_code == 200:
                jwks_data = response.json()
                cache.set(CACHE_KEY, jwks_data)  # Cache indefinitely
            else:
                raise AuthenticationFailed("Failed to fetch JWKS.")
        return jwks_data
