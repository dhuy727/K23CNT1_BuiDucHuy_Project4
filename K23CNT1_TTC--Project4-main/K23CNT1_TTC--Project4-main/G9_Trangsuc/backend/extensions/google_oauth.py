from authlib.integrations.flask_client import OAuth

from config import Config

oauth = OAuth()
google = None


def init_google_oauth(app):
    global google

    client_id = (Config.GOOGLE_CLIENT_ID or "").strip()
    client_secret = (Config.GOOGLE_CLIENT_SECRET or "").strip()
    if not client_id or not client_secret:
        print("[Google OAuth] Chua cau hinh - kiem tra GOOGLE_CLIENT_ID/SECRET trong backend/.env")
        return

    oauth.init_app(app)
    google = oauth.register(
        name="google",
        client_id=client_id,
        client_secret=client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )



def get_google_client():
    """Luôn lấy client từ module — tránh import `google` bị kẹt giá trị None."""
    return google


def google_oauth_enabled():
    return get_google_client() is not None
