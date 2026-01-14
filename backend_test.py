import requests
import sys
import json
import base64
from datetime import datetime
import io
from PIL import Image

class PWABuilderAPITester:
    def __init__(self, base_url="https://pwa-studio.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_preset_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_preset(self):
        """Test creating a new preset"""
        test_config = {
            "app_name": "Test PWA App",
            "icon_color": "#FF5722",
            "text_color": "#FFFFFF",
            "background_color": "#000000",
            "background_images": [],
            "background_blend_mode": "screen",
            "gallery_images": [],
            "audio_tracks": [],
            "pages": [{"id": "home", "title": "Home"}],
            "transitions": {"duration": 7000, "fadeTime": 3500},
            "fx_settings": {"blur": False, "whiteTint": False},
            "animations": [
                {
                    "id": 1234567890,
                    "name": "fadeIn",
                    "keyframes": "0% { opacity: 0; }\n100% { opacity: 1; }",
                    "duration": 1000,
                    "timing": "ease",
                    "iteration": "infinite"
                }
            ],
            "custom_css": ".test-class { color: red; }\n#test-id { background: blue; }"
        }
        
        success, response = self.run_test(
            "Create Preset",
            "POST",
            "presets",
            200,
            data={"name": "Test Preset", "config": test_config}
        )
        
        if success and 'id' in response:
            self.created_preset_id = response['id']
            print(f"   Created preset ID: {self.created_preset_id}")
        
        return success

    def test_get_presets(self):
        """Test getting all presets"""
        success, response = self.run_test(
            "Get All Presets",
            "GET",
            "presets",
            200
        )
        
        if success:
            print(f"   Found {len(response)} presets")
        
        return success

    def test_get_preset_by_id(self):
        """Test getting a specific preset by ID"""
        if not self.created_preset_id:
            print("❌ Skipping - No preset ID available")
            return False
            
        success, response = self.run_test(
            "Get Preset by ID",
            "GET",
            f"presets/{self.created_preset_id}",
            200
        )
        
        if success:
            print(f"   Retrieved preset: {response.get('name', 'Unknown')}")
        
        return success

    def test_update_preset(self):
        """Test updating a preset"""
        if not self.created_preset_id:
            print("❌ Skipping - No preset ID available")
            return False
            
        update_data = {
            "name": "Updated Test Preset",
            "config": {
                "app_name": "Updated PWA App",
                "icon_color": "#4CAF50"
            }
        }
        
        success, response = self.run_test(
            "Update Preset",
            "PUT",
            f"presets/{self.created_preset_id}",
            200,
            data=update_data
        )
        
        return success

    def test_image_upload(self):
        """Test image upload functionality"""
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('test_image.png', img_bytes, 'image/png')}
        
        success, response = self.run_test(
            "Image Upload",
            "POST",
            "upload/image",
            200,
            files=files
        )
        
        if success:
            print(f"   Image uploaded: {response.get('name', 'Unknown')}")
            print(f"   URL length: {len(response.get('url', ''))}")
        
        return success

    def test_audio_upload(self):
        """Test audio upload functionality"""
        # Create a simple test audio file (empty MP3 header)
        audio_data = b'\xff\xfb\x90\x00' + b'\x00' * 100  # Simple MP3 header + data
        audio_bytes = io.BytesIO(audio_data)
        
        files = {'file': ('test_audio.mp3', audio_bytes, 'audio/mpeg')}
        
        success, response = self.run_test(
            "Audio Upload",
            "POST",
            "upload/audio",
            200,
            files=files
        )
        
        if success:
            print(f"   Audio uploaded: {response.get('name', 'Unknown')}")
            print(f"   URL length: {len(response.get('url', ''))}")
        
        return success

    def test_generate_pwa(self):
        """Test PWA generation"""
        test_config = {
            "app_name": "Generated PWA",
            "icon_color": "#2196F3",
            "text_color": "#FFFFFF",
            "background_color": "#000000",
            "background_images": [
                {"url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "name": "test.png"}
            ],
            "gallery_images": [],
            "pages": [{"id": "home", "title": "Home"}],
            "transitions": {"duration": 7000, "fadeTime": 3500},
            "fx_settings": {"blur": False, "whiteTint": False}
        }
        
        success, response = self.run_test(
            "Generate PWA",
            "POST",
            "generate-pwa",
            200,
            data=test_config
        )
        
        if success:
            files = response.get('files', {})
            print(f"   Generated {len(files)} files")
            expected_files = ['package.json', 'public/index.html', 'src/App.js', 'src/App.css']
            for file in expected_files:
                if file in files:
                    print(f"   ✅ {file} generated")
                else:
                    print(f"   ❌ {file} missing")
        
        return success

    def test_delete_preset(self):
        """Test deleting a preset"""
        if not self.created_preset_id:
            print("❌ Skipping - No preset ID available")
            return False
            
        success, response = self.run_test(
            "Delete Preset",
            "DELETE",
            f"presets/{self.created_preset_id}",
            200
        )
        
        return success

    def test_nonexistent_preset(self):
        """Test getting a non-existent preset"""
        success, response = self.run_test(
            "Get Non-existent Preset",
            "GET",
            "presets/nonexistent-id",
            404
        )
        
        return success

def main():
    print("🚀 Starting PWA Builder API Tests")
    print("=" * 50)
    
    tester = PWABuilderAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_create_preset,
        tester.test_get_presets,
        tester.test_get_preset_by_id,
        tester.test_update_preset,
        tester.test_image_upload,
        tester.test_audio_upload,
        tester.test_generate_pwa,
        tester.test_delete_preset,
        tester.test_nonexistent_preset
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())