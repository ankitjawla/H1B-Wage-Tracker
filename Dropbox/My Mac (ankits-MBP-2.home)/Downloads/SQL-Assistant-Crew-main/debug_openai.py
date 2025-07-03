import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

def print_debug_info():
    print("\n=== Debug Information ===")
    print(f"OPENAI_API_KEY exists: {bool(os.getenv('OPENAI_API_KEY'))}")
    if os.getenv('OPENAI_API_KEY'):
        # Only show first and last 4 characters for security
        key = os.getenv('OPENAI_API_KEY')
        print(f"API Key format: {key[:4]}...{key[-4:]}")
    print(f"Current working directory: {os.getcwd()}")
    print(f".env file exists: {os.path.exists('.env')}")

def test_openai_connection():
    print("\n=== Testing OpenAI Connection ===")
    try:
        # Initialize the client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Try a simple completion
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": "Hello, this is a test!"}],
            max_tokens=10
        )
        print("OpenAI API test successful!")
        print("Response:", response.choices[0].message.content)
        return True
    except Exception as e:
        print("Error testing OpenAI connection:", str(e))
        return False

if __name__ == "__main__":
    print_debug_info()
    test_openai_connection() 