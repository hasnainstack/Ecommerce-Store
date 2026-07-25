import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


def send_email(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: Optional[str] = None,
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    from_email: str,
    use_tls: bool = True,
) -> dict:
    """
    Send an email via SMTP. Returns dict with 'ok' (bool) and 'detail' (str).
    """
    if not smtp_host or not smtp_user or not smtp_password or not from_email:
        return {"ok": False, "detail": "SMTP not configured"}

    msg = MIMEMultipart("alternative")
    msg["From"] = from_email
    msg["To"] = to
    msg["Subject"] = subject

    msg.attach(MIMEText(body_text, "plain"))

    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    try:
        ctx = ssl.create_default_context()

        if use_tls:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls(context=ctx)
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to], msg.as_string())
        else:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15, context=ctx) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to], msg.as_string())

        return {"ok": True, "detail": "Email sent successfully"}

    except smtplib.SMTPAuthenticationError:
        return {"ok": False, "detail": "SMTP authentication failed — check username/password"}
    except smtplib.SMTPException as e:
        return {"ok": False, "detail": f"SMTP error: {e}"}
    except OSError as e:
        return {"ok": False, "detail": f"Connection error: {e}"}
