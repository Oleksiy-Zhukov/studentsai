"""
reCAPTCHA integration module for the Student AI Toolkit.
Provides server-side verification of reCAPTCHA tokens.
"""

import requests
from typing import Tuple, Optional
from config import config


class RecaptchaVerifier:
    """Handles reCAPTCHA token verification."""

    def __init__(self):
        """Initialize the reCAPTCHA verifier."""
        self.secret_key = config.RECAPTCHA_SECRET_KEY
        self.verify_url = "https://www.google.com/recaptcha/api/siteverify"
        self.enabled = bool(self.secret_key)
        self.score_threshold = 0.5  # Adjust based on your risk tolerance
        self.expected_action = (
            "submit"  # Match the 'action' used in frontend (optional)
        )

    def verify_token(
        self, token: str, remote_ip: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Verify a reCAPTCHA token with Google's API.

        Args:
            token: The reCAPTCHA token from the frontend
            remote_ip: Optional client IP address

        Returns:
            Tuple of (success, error_message)
        """
        if not self.enabled:
            # If reCAPTCHA is not configured, allow all requests
            return True, None

        if not token:
            return False, "reCAPTCHA token is required"

        try:
            # Prepare the verification request
            data = {"secret": self.secret_key, "response": token}

            if remote_ip:
                data["remoteip"] = remote_ip

            # Send verification request to Google
            response = requests.post(self.verify_url, data=data, timeout=10)

            if response.status_code != 200:
                return (
                    False,
                    f"reCAPTCHA verification failed: HTTP {response.status_code}",
                )

            result = response.json()

            if result.get("success", False):
                # v3-specific checks
                score = result.get("score", 0.0)
                action = result.get("action", "")

                if score < self.score_threshold:
                    return (
                        False,
                        f"Low reCAPTCHA score ({score}). Potential bot or abuse.",
                    )

                # Optional: Verify action
                if action and action != self.expected_action:
                    return False, f"Unexpected reCAPTCHA action: {action}"

                return True, None
            else:
                error_codes = result.get("error-codes", [])
                error_message = self._get_error_message(error_codes)
                return False, error_message

        except requests.RequestException as e:
            return False, f"reCAPTCHA verification error: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error during reCAPTCHA verification: {str(e)}"

    def _get_error_message(self, error_codes: list) -> str:
        """
        Convert reCAPTCHA error codes to user-friendly messages.

        Args:
            error_codes: List of error codes from Google's API

        Returns:
            User-friendly error message
        """
        error_messages = {
            "missing-input-secret": "reCAPTCHA configuration error",
            "invalid-input-secret": "reCAPTCHA configuration error",
            "missing-input-response": "reCAPTCHA token is missing",
            "invalid-input-response": "reCAPTCHA token is invalid or expired",
            "bad-request": "reCAPTCHA request is malformed",
            "timeout-or-duplicate": "reCAPTCHA token has expired or been used already",
        }

        if not error_codes:
            return "reCAPTCHA verification failed"

        # Return the first known error message, or a generic one
        for code in error_codes:
            if code in error_messages:
                return error_messages[code]

        return f"reCAPTCHA verification failed: {', '.join(error_codes)}"

    def is_enabled(self) -> bool:
        """Check if reCAPTCHA verification is enabled."""
        return self.enabled


# Global instance
recaptcha_verifier = RecaptchaVerifier()
