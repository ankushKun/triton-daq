#include <WiFi.h>
#include <WiFiUdp.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// UDP settings
WiFiUdp udp;
const char* webServerIP = "YOUR_WEB_SERVER_IP";
const int udpPort = 50001;
unsigned long lastSendTime = 0;
unsigned long packetCounter = 0;

void setup() {
  Serial.begin(115200);
  
  Serial.println("\n[ESP32] Starting UDP sender...");
  
  // Connect to WiFi
  Serial.printf("[ESP32] Connecting to WiFi: %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[ESP32] WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
  
  // Start UDP
  udp.begin(udpPort);
  Serial.printf("[ESP32] UDP initialized on port: %d\n", udpPort);
}

void loop() {
  unsigned long now = millis();
  if (now - lastSendTime > 100) {  // Send every 100ms
    lastSendTime = now;
    packetCounter++;
    
    // Sample sensor data
    float temperature = random(20, 30);
    float humidity = random(40, 60);
    
    // Create data packet
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "%.1f,%.1f", temperature, humidity);
    
    // Send UDP packet
    udp.beginPacket(webServerIP, udpPort);
    udp.write((uint8_t*)buffer, strlen(buffer));
    udp.endPacket();
    
    // Log packet details
    Serial.printf("[ESP32] Packet #%lu | Data: %s | Time: %lums\n", 
                 packetCounter, buffer, now);
  }
}