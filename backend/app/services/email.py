import httpx
from app.config import settings


class EmailService:
    @staticmethod
    async def send_email(to: str, subject: str, html_content: str, from_email: str = "noreply@commercev3.com"):
        """Send email via Netcore API"""
        payload = {
            "from": {"email": from_email, "name": "CommerceV3"},
            "subject": subject,
            "content": [{"type": "html", "value": html_content}],
            "personalizations": [{"to": [{"email": to}]}]
        }
        headers = {
            "api_key": settings.NETCORE_API_KEY,
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.NETCORE_API_URL,
                json=payload,
                headers=headers
            )
            return response.json()
