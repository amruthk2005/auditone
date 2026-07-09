import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_api():
    print("1. Logging in as Company User...")
    login_data = {
        "username": "company@acme.com",
        "password": "demo"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Failed to log in: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Success! Received token: {token[:20]}...")

    print("\n2. Fetching active conversations...")
    conv_response = requests.get(f"{BASE_URL}/chat/conversations", headers=headers)
    if conv_response.status_code != 200:
        print(f"Failed to fetch conversations: {conv_response.text}")
        return
    
    conversations = conv_response.json()
    print(f"Found {len(conversations)} conversations:")
    for c in conversations:
        print(f" - Audit #{c['audit_id']}: {c['audit_name']} ({c['audit_status']}) with Auditor '{c['auditor_name']}'")

    if not conversations:
        print("No conversations found. Exiting.")
        return

    audit_id = conversations[0]['audit_id']
    print(f"\n3. Sending a test message to Audit #{audit_id}...")
    msg_data = {
        "audit_id": audit_id,
        "content": "Hello Auditor, this is a test message regarding Q1 warehouse audit. Please review.",
        "message_type": "text"
    }
    msg_response = requests.post(f"{BASE_URL}/chat/conversations/{audit_id}/messages", json=msg_data, headers=headers)
    if msg_response.status_code != 200:
        print(f"Failed to send message: {msg_response.text}")
        return
    
    msg = msg_response.json()
    print(f"Sent! Message details:")
    print(f" - ID: {msg['id']}")
    print(f" - Sender: {msg['sender_name']} ({msg['sender_role']})")
    print(f" - Content: '{msg['content']}'")
    print(f" - Status: {msg['status']}")

    print(f"\n4. Fetching messages list for Audit #{audit_id}...")
    history_response = requests.get(f"{BASE_URL}/chat/conversations/{audit_id}/messages", headers=headers)
    if history_response.status_code != 200:
        print(f"Failed to fetch messages: {history_response.text}")
        return
    
    messages = history_response.json()
    print(f"Log history has {len(messages)} messages:")
    for m in messages:
        print(f" [{m['sender_role']}] {m['sender_name']}: {m['content']}")

if __name__ == "__main__":
    test_api()
