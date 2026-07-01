import base64
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# In production, load this from environment variables
AES_KEY = os.getenv("AES_SECRET_KEY", "0123456789abcdef0123456789abcdef").encode('utf-8')

def pad(text: str) -> bytes:
    block_size = 16
    padding_len = block_size - len(text) % block_size
    padding = bytes([padding_len] * padding_len)
    return text.encode('utf-8') + padding

def unpad(data: bytes) -> str:
    padding_len = data[-1]
    return data[:-padding_len].decode('utf-8')

def encrypt_message(plain_text: str) -> str:
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    padded_data = pad(plain_text)
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return base64.b64encode(iv + encrypted).decode('utf-8')

def decrypt_message(encrypted_b64: str) -> str:
    raw = base64.b64decode(encrypted_b64)
    iv = raw[:16]
    encrypted_data = raw[16:]
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()
    return unpad(decrypted_padded)
