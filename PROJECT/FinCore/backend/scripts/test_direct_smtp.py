import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, make_msgid

username = 'vsktupakula05@gmail.com'
password = 'weyqzqvfslwbeutr'
target = 'venkatsaikrishnatupakula5@gmail.com'

msg = MIMEMultipart('alternative')
msg['Date'] = formatdate(localtime=True)
msg['Message-ID'] = make_msgid(domain='gmail.com')
msg['From'] = f'FinCore Authentication <{username}>'
msg['To'] = target
msg['Reply-To'] = username
msg['Subject'] = '849201 is your FinCore verification code'

text = 'Your FinCore security verification code is: 849201\n\nValid for 10 minutes.'
html = '<html><body style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#0284c7;">FinCore Verification Code</h2><p>Your one-time security code is:</p><div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0369a1;background:#f0f9ff;padding:15px;display:inline-block;border-radius:8px;">849201</div><p style="color:#64748b;font-size:12px;margin-top:20px;">Valid for 10 minutes. If you did not request this, please ignore this email.</p></body></html>'

msg.attach(MIMEText(text, 'plain'))
msg.attach(MIMEText(html, 'html'))

server = smtplib.SMTP('smtp.gmail.com', 587, timeout=15)
server.starttls()
server.login(username, password)
res = server.sendmail(username, [target], msg.as_string())
print('DIRECT SMTP RESULT:', res)
server.quit()
